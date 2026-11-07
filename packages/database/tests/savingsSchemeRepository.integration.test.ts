import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  runAllMigrations,
  closePool,
  listSavingsSchemes,
  enrollCustomerInScheme,
  listCustomerSchemeAccounts,
  getSchemeAccountById,
  recordSchemeInstallment,
  listSchemeInstallments,
  redeemSchemeAccount,
  upsertVipLoyaltyProfile,
  getVipLoyaltyProfile,
  createCustomer,
} from "../src/index.js";

describe("Gold Savings Schemes (Swarna Nidhi / Monthly SIP) & VIP Loyalty (Pathway B)", () => {
  const defaultOrgId = "0192e300-0000-7000-8000-000000000001";
  let customerId: string;
  let valueSchemeId: string;
  let weightSchemeId: string;
  let valueAccountId: string;
  let weightAccountId: string;

  beforeAll(async () => {
    await runAllMigrations();

    // Create test customer
    const cust = await createCustomer({
      organizationId: defaultOrgId,
      customerCode: `CUST-SIP-${Date.now().toString().slice(-4)}`,
      firstName: "Meenakshi",
      lastName: "Sundaram",
      phone: "+91 98401 22334",
      email: "meenakshi.s@patron-atelier.com",
    });
    customerId = cust.id;
  });

  afterAll(async () => {
    await closePool();
  });

  it("lists pre-seeded luxury gold accumulation schemes", async () => {
    const schemes = await listSavingsSchemes(defaultOrgId);
    expect(schemes.length).toBeGreaterThanOrEqual(2);

    const swarnaNidhi = schemes.find((s) => s.code === "SWARNA-NIDHI-11");
    expect(swarnaNidhi).toBeDefined();
    expect(swarnaNidhi?.schemeType).toBe("VALUE_BASED_BONUS");
    valueSchemeId = swarnaNidhi!.id;

    const goldSip = schemes.find((s) => s.code === "GOLD-SIP-24K");
    expect(goldSip).toBeDefined();
    expect(goldSip?.schemeType).toBe("WEIGHT_BASED_LOCK");
    weightSchemeId = goldSip!.id;
  });

  it("enrolls a patron in Swarna Nidhi 11+1 Value Scheme with nominee and KYC verification", async () => {
    const account = await enrollCustomerInScheme({
      organizationId: defaultOrgId,
      schemeId: valueSchemeId,
      customerId,
      monthlyInstallmentInr: 10000.0,
      nomineeName: "Karthik Sundaram",
      nomineeRelationship: "SPOUSE",
      nomineePhone: "+91 98401 55667",
      kycStatus: "VERIFIED",
      panNumber: "MSUND5566K",
    });

    expect(account).toBeDefined();
    expect(account.accountNumber).toMatch(/^SCH-2026-/);
    expect(account.monthlyInstallmentInr).toBe(10000.0);
    expect(account.status).toBe("ACTIVE");
    expect(account.installmentsPaid).toBe(0);
    valueAccountId = account.id;

    const fetched = await getSchemeAccountById(account.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.customerName).toContain("Meenakshi");
  });

  it("enrolls a patron in 24K Gold SIP Weight-Locked Scheme", async () => {
    const account = await enrollCustomerInScheme({
      organizationId: defaultOrgId,
      schemeId: weightSchemeId,
      customerId,
      monthlyInstallmentInr: 15000.0,
      kycStatus: "VERIFIED",
    });

    expect(account).toBeDefined();
    expect(account.status).toBe("ACTIVE");
    weightAccountId = account.id;
  });

  it("records monthly installment deposits and locks gold weight at spot rate", async () => {
    // Deposit 15,000 INR when spot rate is 7,500/g -> should credit 2.0000 g 24K gold
    const { account, installment } = await recordSchemeInstallment(weightAccountId, {
      amountInr: 15000.0,
      goldSpotRatePerGram: 7500.0,
      paymentMethod: "UPI",
      transactionReference: "UPI-ICICI-8819284",
    });

    expect(installment.installmentNumber).toBe(1);
    expect(installment.creditedGoldGrams).toBeCloseTo(2.0, 4);
    expect(installment.receiptNumber).toMatch(/^RCP-2026-/);

    expect(account.installmentsPaid).toBe(1);
    expect(account.totalDepositedInr).toBe(15000.0);
    expect(account.accumulatedGoldGrams).toBeCloseTo(2.0, 4);
    expect(account.status).toBe("ACTIVE");

    const history = await listSchemeInstallments(weightAccountId);
    expect(history.length).toBe(1);
  });

  it("simulates full completion to maturity and awards bonus contribution", async () => {
    // Pay remaining installments 1 to 11 on the value scheme
    for (let i = 1; i <= 11; i++) {
      await recordSchemeInstallment(valueAccountId, {
        amountInr: 10000.0,
        goldSpotRatePerGram: 7450.0,
        paymentMethod: "NET_BANKING",
      });
    }

    const maturedAccount = await getSchemeAccountById(valueAccountId);
    expect(maturedAccount?.installmentsPaid).toBe(11);
    expect(maturedAccount?.totalDepositedInr).toBe(110000.0);
    expect(maturedAccount?.bonusAmountInr).toBe(10000.0); // 12th month bonus
    expect(maturedAccount?.status).toBe("MATURED");
  });

  it("redeems a matured savings scheme account", async () => {
    const redeemed = await redeemSchemeAccount(valueAccountId);
    expect(redeemed.status).toBe("REDEEMED");
  });

  it("upserts and retrieves VIP Patron Loyalty & Privilege Profile", async () => {
    const profile = await upsertVipLoyaltyProfile({
      organizationId: defaultOrgId,
      customerId,
      tier: "PLATINUM",
      rewardPointsBalance: 4250,
      lifetimePurchasesInr: 1850000,
      makingChargePrivilegePct: 25.0,
      personalConciergeAssigned: "Rachel R., Senior Private Client Director",
      specialPrivilegesJson: [
        "Complimentary Annual Ultrasonic Cleaning & Prongs Check",
        "Private VIP Salon Champagne Booking",
        "Priority First-Access to Haute Joaillerie Auctions",
      ],
    });

    expect(profile).toBeDefined();
    expect(profile.tier).toBe("PLATINUM");
    expect(profile.rewardPointsBalance).toBe(4250);
    expect(profile.specialPrivilegesJson.length).toBe(3);

    const fetched = await getVipLoyaltyProfile(customerId);
    expect(fetched).not.toBeNull();
    expect(fetched?.tier).toBe("PLATINUM");
  });
});
