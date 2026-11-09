import type { Request, Response, NextFunction } from "express";
import {
  createKarigar,
  listKarigars,
  createBom,
  listBoms,
  createManufacturingJobOrder,
  listManufacturingJobOrders,
  getManufacturingJobOrderById,
  updateJobOrderStage,
  recordJobOrderReturn,
  completeJobOrder,
} from "@jewelcore/database";
import { BadRequestError, NotFoundError } from "@jewelcore/shared";

const DEFAULT_ORG_ID = "0192e300-0000-7000-8000-000000000001";

export async function listKarigarsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId = req.user?.orgId ?? req.storeContext?.organizationId ?? DEFAULT_ORG_ID;
    const karigars = await listKarigars(orgId);

    res.status(200).json({
      success: true,
      data: karigars,
    });
  } catch (err) {
    next(err);
  }
}

export async function createKarigarHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId = req.user?.orgId ?? req.storeContext?.organizationId ?? DEFAULT_ORG_ID;
    const { code, name, specialization, lossTolerancePct, phone, panNumber, address } = req.body;

    if (!code || !name || !specialization) {
      throw new BadRequestError("code, name, and specialization are required fields");
    }

    const karigar = await createKarigar({
      organizationId: orgId,
      code,
      name,
      specialization,
      lossTolerancePct: lossTolerancePct !== undefined ? Number(lossTolerancePct) : undefined,
      phone,
      panNumber,
      address,
    });

    res.status(201).json({
      success: true,
      data: karigar,
      message: "Master Karigar artisan registered successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function listBomsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId = req.user?.orgId ?? req.storeContext?.organizationId ?? DEFAULT_ORG_ID;
    const boms = await listBoms(orgId);

    res.status(200).json({
      success: true,
      data: boms,
    });
  } catch (err) {
    next(err);
  }
}

export async function createBomHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId = req.user?.orgId ?? req.storeContext?.organizationId ?? DEFAULT_ORG_ID;
    const {
      bomCode,
      name,
      category,
      targetPurity,
      targetGrossWeightGrams,
      targetNetGoldGrams,
      targetDiamondCarats,
      targetGemstoneCarats,
      standardMakingChargeInr,
      componentsJson,
      skuId,
    } = req.body;

    if (!bomCode || !name || !category || !targetPurity || targetGrossWeightGrams === undefined) {
      throw new BadRequestError("bomCode, name, category, targetPurity and targetGrossWeightGrams are required");
    }

    const bom = await createBom({
      organizationId: orgId,
      skuId,
      bomCode,
      name,
      category,
      targetPurity,
      targetGrossWeightGrams: Number(targetGrossWeightGrams),
      targetNetGoldGrams: Number(targetNetGoldGrams ?? targetGrossWeightGrams),
      targetDiamondCarats: targetDiamondCarats !== undefined ? Number(targetDiamondCarats) : 0,
      targetGemstoneCarats: targetGemstoneCarats !== undefined ? Number(targetGemstoneCarats) : 0,
      standardMakingChargeInr: standardMakingChargeInr !== undefined ? Number(standardMakingChargeInr) : 0,
      componentsJson: componentsJson ?? [],
    });

    res.status(201).json({
      success: true,
      data: bom,
      message: "Bill of Materials recipe created successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function listJobOrdersHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId = req.user?.orgId ?? req.storeContext?.organizationId ?? DEFAULT_ORG_ID;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const karigarId = typeof req.query.karigarId === "string" ? req.query.karigarId : undefined;

    const jobs = await listManufacturingJobOrders(orgId, { status, karigarId });

    res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (err) {
    next(err);
  }
}

export async function createJobOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId = req.user?.orgId ?? req.storeContext?.organizationId ?? DEFAULT_ORG_ID;
    const {
      karigarId,
      bomId,
      title,
      category,
      dueDate,
      issuedPureGoldGrams,
      issuedAlloyGrams,
      issuedDiamondCarats,
      issuedGemstoneCarats,
      laborChargeInr,
      notes,
    } = req.body;

    if (!karigarId || !title || !category || !dueDate || issuedPureGoldGrams === undefined) {
      throw new BadRequestError("karigarId, title, category, dueDate, and issuedPureGoldGrams are required");
    }

    const job = await createManufacturingJobOrder({
      organizationId: orgId,
      karigarId,
      bomId,
      title,
      category,
      dueDate,
      issuedPureGoldGrams: Number(issuedPureGoldGrams),
      issuedAlloyGrams: issuedAlloyGrams !== undefined ? Number(issuedAlloyGrams) : 0,
      issuedDiamondCarats: issuedDiamondCarats !== undefined ? Number(issuedDiamondCarats) : 0,
      issuedGemstoneCarats: issuedGemstoneCarats !== undefined ? Number(issuedGemstoneCarats) : 0,
      laborChargeInr: laborChargeInr !== undefined ? Number(laborChargeInr) : 0,
      notes,
    });

    res.status(201).json({
      success: true,
      data: job,
      message: "Manufacturing job card issued to artisan successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function getJobOrderByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new BadRequestError("Job ID parameter is required");

    const job = await getManufacturingJobOrderById(id);
    if (!job) {
      throw new NotFoundError(`Manufacturing job order not found: ${id}`);
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateJobStageHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new BadRequestError("Job ID parameter is required");

    const { stage, status } = req.body;
    if (!stage) {
      throw new BadRequestError("stage is required");
    }

    const updated = await updateJobOrderStage(id, stage, status);

    res.status(200).json({
      success: true,
      data: updated,
      message: `Job stage updated to ${stage}`,
    });
  } catch (err) {
    next(err);
  }
}

export async function recordJobReturnHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new BadRequestError("Job ID parameter is required");

    const { returnedCraftedPieceGrams, returnedScrapMetalGrams, notes } = req.body;
    if (returnedCraftedPieceGrams === undefined || returnedScrapMetalGrams === undefined) {
      throw new BadRequestError("returnedCraftedPieceGrams and returnedScrapMetalGrams are required");
    }

    const updated = await recordJobOrderReturn(id, {
      returnedCraftedPieceGrams: Number(returnedCraftedPieceGrams),
      returnedScrapMetalGrams: Number(returnedScrapMetalGrams),
      notes,
    });

    res.status(200).json({
      success: true,
      data: updated,
      message: `Artisan return recorded: loss is ${updated.actualLossPct}% (${updated.lossStatus})`,
    });
  } catch (err) {
    next(err);
  }
}

export async function completeJobOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new BadRequestError("Job ID parameter is required");

    const { birthedInventoryItemId } = req.body;
    const completed = await completeJobOrder(id, birthedInventoryItemId);

    res.status(200).json({
      success: true,
      data: completed,
      message: "Manufacturing job order completed and verified",
    });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// Milestone 13: Form GST ITC-04 Statutory Delivery Challans & Karigar Settlement
// ============================================================================

export async function listItc04ChallansHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId = req.user?.orgId ?? req.storeContext?.organizationId ?? DEFAULT_ORG_ID;
    const { listItc04ChallansService } = await import("./itc04Service.js");
    const challans = await listItc04ChallansService(orgId);

    res.status(200).json({
      success: true,
      data: challans,
    });
  } catch (err) {
    next(err);
  }
}

export async function getItc04ChallanByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId = req.user?.orgId ?? req.storeContext?.organizationId ?? DEFAULT_ORG_ID;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new BadRequestError("Challan ID parameter is required");

    const { getItc04ChallanByIdService } = await import("./itc04Service.js");
    const challan = await getItc04ChallanByIdService(orgId, id);

    res.status(200).json({
      success: true,
      data: challan,
    });
  } catch (err) {
    next(err);
  }
}

export async function createItc04ChallanHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId = req.user?.orgId ?? req.storeContext?.organizationId ?? DEFAULT_ORG_ID;
    const storeId = req.storeContext?.storeId ?? "0192e300-0001-7000-8000-000000000001";
    const { createItc04ChallanSchema } = await import("@jewelcore/shared");
    const { createItc04ChallanService } = await import("./itc04Service.js");

    const parsed = createItc04ChallanSchema.parse(req.body);
    const challan = await createItc04ChallanService(orgId, storeId, parsed, req.user?.userId);

    res.status(201).json({
      success: true,
      data: challan,
      message: `Statutory Form GST ITC-04 Delivery Challan ${challan.challanNumber} issued successfully`,
    });
  } catch (err) {
    next(err);
  }
}

export async function settleKarigarLossHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId = req.user?.orgId ?? req.storeContext?.organizationId ?? DEFAULT_ORG_ID;
    const storeId = req.storeContext?.storeId ?? "0192e300-0001-7000-8000-000000000001";
    const { settleKarigarLossSchema } = await import("@jewelcore/shared");
    const { settleKarigarLossService } = await import("./itc04Service.js");

    const parsed = settleKarigarLossSchema.parse(req.body);
    const settlement = await settleKarigarLossService(orgId, storeId, parsed, req.user?.userId);

    res.status(200).json({
      success: true,
      data: settlement,
      message: `Artisan loss settled: ${settlement.lossStatus} (Net settlement ₹${settlement.netSettlementAmountInr})`,
    });
  } catch (err) {
    next(err);
  }
}

export async function listKarigarSettlementsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId = req.user?.orgId ?? req.storeContext?.organizationId ?? DEFAULT_ORG_ID;
    const { listKarigarSettlementsService } = await import("./itc04Service.js");
    const settlements = await listKarigarSettlementsService(orgId);

    res.status(200).json({
      success: true,
      data: settlements,
    });
  } catch (err) {
    next(err);
  }
}
