import type { Request, Response, NextFunction } from "express";
import { bullionFeedService } from "./bullionFeedService.js";

/**
 * Trigger immediate exchange spot feed sync (MCX / LBMA / IBJA / GoldAPI).
 * Computes duty-adjusted INR rates, updates database rate records, and broadcasts WebSocket ticks.
 */
export async function syncBullionFeedHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId =
      req.user?.orgId ??
      req.storeContext?.organizationId ??
      (req.body?.organizationId as string | undefined);

    const userId = req.user?.userId;

    const result = await bullionFeedService.syncExchangeFeed({
      sourceExchange: req.body?.sourceExchange,
      goldSpotUsdPerOz: req.body?.goldSpotUsdPerOz
        ? Number(req.body.goldSpotUsdPerOz)
        : undefined,
      usdInrExchangeRate: req.body?.usdInrExchangeRate
        ? Number(req.body.usdInrExchangeRate)
        : undefined,
      customsDutyPercent: req.body?.customsDutyPercent
        ? Number(req.body.customsDutyPercent)
        : undefined,
      refinerPremiumInr: req.body?.refinerPremiumInr
        ? Number(req.body.refinerPremiumInr)
        : undefined,
      storeId:
        req.body?.storeId ??
        req.storeContext?.storeId ??
        (req.headers["x-store-id"] as string | undefined),
      organizationId: orgId,
      userId,
    });

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieve real-time commodity exchange feed status and active market parameters.
 */
export async function getBullionFeedStatusHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const status = bullionFeedService.getStatus();
    res.status(200).json({
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieve historical sequence of ingested exchange ticks.
 */
export async function getBullionFeedHistoryHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const history = bullionFeedService.getHistory();
    res.status(200).json({
      success: true,
      data: history,
      count: history.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}
