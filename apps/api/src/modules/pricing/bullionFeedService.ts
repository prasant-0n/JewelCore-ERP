import { query, recordDailyMarketRate } from "@jewelcore/database";
import { MetalType, RateSource } from "@jewelcore/shared";
import { telemetryService } from "../telemetry/telemetryService.js";
import { randomUUID } from "crypto";

export interface BullionFeedParams {
  sourceExchange?: "MCX" | "LBMA" | "IBJA" | "GOLDAPI";
  goldSpotUsdPerOz?: number;
  usdInrExchangeRate?: number;
  customsDutyPercent?: number;
  refinerPremiumInr?: number;
  storeId?: string | null;
  organizationId?: string;
  userId?: string;
}

export interface BullionFeedResult {
  tickId: string;
  sourceExchange: "MCX" | "LBMA" | "IBJA" | "GOLDAPI";
  goldSpotUsdPerOz: number;
  usdInrExchangeRate: number;
  customsDutyPercent: number;
  refinerPremiumInr: number;
  pureGold24k: number; // INR / gram
  standardGold22k: number; // INR / gram
  artisanGold18k: number; // INR / gram
  silverInrPerKg: number; // INR / kg
  changePercent: string;
  effectiveDate: string;
  goldRateId?: string;
  silverRateId?: string;
}

export interface BullionFeedStatus {
  status: "ACTIVE" | "STANDBY" | "CONNECTING";
  activeExchange: "MCX" | "LBMA" | "IBJA" | "GOLDAPI";
  isMarketOpen: boolean;
  marketSession: string;
  lastSyncAt: string;
  currentRates: {
    pureGold24k: number;
    standardGold22k: number;
    artisanGold18k: number;
    silverInrPerKg: number;
  };
  macroFactors: {
    goldSpotUsdPerOz: number;
    usdInrExchangeRate: number;
    customsDutyPercent: number;
    refinerPremiumInr: number;
  };
  changePercent: string;
  totalTicksIngested: number;
}

export class BullionFeedService {
  private history: BullionFeedResult[] = [];
  private lastSyncAt: string = new Date().toISOString();
  private currentExchange: "MCX" | "LBMA" | "IBJA" | "GOLDAPI" = "MCX";
  private currentGoldUsd: number = 2685.50;
  private currentUsdInr: number = 84.45;
  private currentCustomsDuty: number = 6.0;
  private currentRefinerPremium: number = 45.0;
  private currentChangePercent: string = "+0.80%";

  constructor() {
    // Seed initial historical snapshot
    const initialCalc = this.calculateRates({
      goldSpotUsdPerOz: this.currentGoldUsd,
      usdInrExchangeRate: this.currentUsdInr,
      customsDutyPercent: this.currentCustomsDuty,
      refinerPremiumInr: this.currentRefinerPremium,
      sourceExchange: "MCX",
    });

    this.history.push({
      tickId: `tick-seed-${Date.now()}`,
      sourceExchange: "MCX",
      goldSpotUsdPerOz: this.currentGoldUsd,
      usdInrExchangeRate: this.currentUsdInr,
      customsDutyPercent: this.currentCustomsDuty,
      refinerPremiumInr: this.currentRefinerPremium,
      pureGold24k: initialCalc.pureGold24k,
      standardGold22k: initialCalc.standardGold22k,
      artisanGold18k: initialCalc.artisanGold18k,
      silverInrPerKg: initialCalc.silverInrPerKg,
      changePercent: "+0.80%",
      effectiveDate: new Date().toISOString(),
    });
  }

  public calculateRates(params: {
    goldSpotUsdPerOz: number;
    usdInrExchangeRate: number;
    customsDutyPercent: number;
    refinerPremiumInr: number;
    sourceExchange: string;
  }) {
    // 1 Troy Ounce = 31.1034768 grams
    const rawBaseInrPerGram =
      (params.goldSpotUsdPerOz * params.usdInrExchangeRate) / 31.1034768;
    const withDuty = rawBaseInrPerGram * (1 + params.customsDutyPercent / 100);
    const pureGold24k = Number((withDuty + params.refinerPremiumInr).toFixed(2));
    const standardGold22k = Number((pureGold24k * 0.9166).toFixed(2));
    const artisanGold18k = Number((pureGold24k * 0.75).toFixed(2));
    const silverInrPerKg = Number((pureGold24k * 11.8).toFixed(2));

    return {
      pureGold24k,
      standardGold22k,
      artisanGold18k,
      silverInrPerKg,
    };
  }

  public async syncExchangeFeed(
    params: BullionFeedParams = {},
  ): Promise<BullionFeedResult> {
    const sourceExchange = params.sourceExchange ?? this.currentExchange;
    const goldSpotUsdPerOz = params.goldSpotUsdPerOz ?? this.currentGoldUsd;
    const usdInrExchangeRate = params.usdInrExchangeRate ?? this.currentUsdInr;
    const customsDutyPercent =
      params.customsDutyPercent ?? this.currentCustomsDuty;
    const refinerPremiumInr =
      params.refinerPremiumInr ?? this.currentRefinerPremium;

    const rates = this.calculateRates({
      goldSpotUsdPerOz,
      usdInrExchangeRate,
      customsDutyPercent,
      refinerPremiumInr,
      sourceExchange,
    });

    // 1. Resolve Organization ID
    let orgId = params.organizationId;
    if (!orgId) {
      const orgRes = await query(
        "SELECT id FROM organizations WHERE code = 'JEWELCORE-ATELIER' LIMIT 1;",
      );
      if (orgRes.rows.length > 0) {
        orgId = orgRes.rows[0].id;
      } else {
        const fallbackOrg = await query("SELECT id FROM organizations LIMIT 1;");
        orgId = fallbackOrg.rows[0]?.id;
      }
    }

    // 2. Resolve User ID
    let recordedByUserId = params.userId;
    if (!recordedByUserId) {
      const userRes = await query(
        "SELECT id FROM users WHERE email = 'rachel.r@jewelcore.internal' LIMIT 1;",
      );
      if (userRes.rows.length > 0) {
        recordedByUserId = userRes.rows[0].id;
      } else {
        const fallbackUser = await query("SELECT id FROM users LIMIT 1;");
        recordedByUserId = fallbackUser.rows[0]?.id;
      }
    }

    let goldRateRecordId: string | undefined;
    let silverRateRecordId: string | undefined;

    // 3. Persist rates to daily_market_rates if org & user context available
    if (orgId && recordedByUserId) {
      try {
        const goldRate = await recordDailyMarketRate({
          organizationId: orgId,
          storeId: params.storeId ?? null,
          metalType: MetalType.GOLD,
          ratePerGramCad: rates.pureGold24k,
          currency: "INR",
          rateSource: RateSource.API_FEED,
          notes: `Live ${sourceExchange} Spot Fix: Au 24K (999.9) ₹${rates.pureGold24k}/g • Au 22K (916) ₹${rates.standardGold22k}/g [Duty: ${customsDutyPercent}%, FX: ${usdInrExchangeRate}]`,
          recordedByUserId,
        });
        goldRateRecordId = goldRate.id;

        const silverRate = await recordDailyMarketRate({
          organizationId: orgId,
          storeId: params.storeId ?? null,
          metalType: MetalType.SILVER,
          ratePerGramCad: Number((rates.silverInrPerKg / 1000).toFixed(4)),
          currency: "INR",
          rateSource: RateSource.API_FEED,
          notes: `Live ${sourceExchange} Spot Fix: Ag 999.0 ₹${rates.silverInrPerKg}/kg (₹${(rates.silverInrPerKg / 1000).toFixed(2)}/g)`,
          recordedByUserId,
        });
        silverRateRecordId = silverRate.id;
      } catch (err) {
        // Fallback gracefully without breaking live ticker broadcast
      }
    }

    // 4. Broadcast live tick via TelemetryService (SSE + WebSockets)
    const tick = telemetryService.updateBullionRates({
      goldSpotInrPerGram: rates.pureGold24k,
      silverInrPerKg: rates.silverInrPerKg,
      exchange: sourceExchange,
      customsDutyPercent,
      refinerPremiumInr,
      usdInrExchangeRate,
    });

    this.lastSyncAt = new Date().toISOString();
    this.currentExchange = sourceExchange;
    this.currentGoldUsd = goldSpotUsdPerOz;
    this.currentUsdInr = usdInrExchangeRate;
    this.currentCustomsDuty = customsDutyPercent;
    this.currentRefinerPremium = refinerPremiumInr;
    this.currentChangePercent = tick.changePercent;

    const result: BullionFeedResult = {
      tickId: randomUUID(),
      sourceExchange,
      goldSpotUsdPerOz,
      usdInrExchangeRate,
      customsDutyPercent,
      refinerPremiumInr,
      pureGold24k: rates.pureGold24k,
      standardGold22k: rates.standardGold22k,
      artisanGold18k: rates.artisanGold18k,
      silverInrPerKg: rates.silverInrPerKg,
      changePercent: tick.changePercent,
      effectiveDate: this.lastSyncAt,
      goldRateId: goldRateRecordId,
      silverRateId: silverRateRecordId,
    };

    this.history.unshift(result);
    if (this.history.length > 50) {
      this.history.pop();
    }

    return result;
  }

  public getStatus(): BullionFeedStatus {
    const currentTick = telemetryService.getBullionTick();
    const rates = this.calculateRates({
      goldSpotUsdPerOz: this.currentGoldUsd,
      usdInrExchangeRate: this.currentUsdInr,
      customsDutyPercent: this.currentCustomsDuty,
      refinerPremiumInr: this.currentRefinerPremium,
      sourceExchange: this.currentExchange,
    });

    return {
      status: "ACTIVE",
      activeExchange: this.currentExchange,
      isMarketOpen: true,
      marketSession: "MCX Continuous Spot Session (10:00 - 23:30 IST)",
      lastSyncAt: this.lastSyncAt,
      currentRates: {
        pureGold24k: currentTick.pureGold24k ?? rates.pureGold24k,
        standardGold22k: currentTick.standardGold22k ?? rates.standardGold22k,
        artisanGold18k: currentTick.artisanGold18k ?? rates.artisanGold18k,
        silverInrPerKg: currentTick.silverInrPerKg,
      },
      macroFactors: {
        goldSpotUsdPerOz: this.currentGoldUsd,
        usdInrExchangeRate: this.currentUsdInr,
        customsDutyPercent: this.currentCustomsDuty,
        refinerPremiumInr: this.currentRefinerPremium,
      },
      changePercent: this.currentChangePercent,
      totalTicksIngested: this.history.length,
    };
  }

  public getHistory(): BullionFeedResult[] {
    return [...this.history];
  }
}

export const bullionFeedService = new BullionFeedService();
