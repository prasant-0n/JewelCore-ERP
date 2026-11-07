import type { Request, Response, NextFunction } from "express";
import {
  listSavingsSchemes,
  createSavingsScheme,
  enrollCustomerInScheme,
  listCustomerSchemeAccounts,
  getSchemeAccountById,
  recordSchemeInstallment,
  listSchemeInstallments,
  redeemSchemeAccount,
  getVipLoyaltyProfile,
  upsertVipLoyaltyProfile,
} from "@jewelcore/database";
import { BadRequestError, NotFoundError } from "@jewelcore/shared";

const DEFAULT_ORG_ID = "0192e300-0000-7000-8000-000000000001";

export async function listSchemesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId = req.user?.orgId ?? req.storeContext?.organizationId ?? DEFAULT_ORG_ID;
    const schemes = await listSavingsSchemes(orgId);

    res.status(200).json({
      success: true,
      data: schemes,
    });
  } catch (err) {
    next(err);
  }
}

export async function createSchemeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId = req.user?.orgId ?? req.storeContext?.organizationId ?? DEFAULT_ORG_ID;
    const {
      code,
      name,
      schemeType,
      totalTenureMonths,
      minInstallmentAmountInr,
      bonusContributionPct,
      makingChargeDiscountPct,
      description,
    } = req.body;

    if (!code || !name || !schemeType) {
      throw new BadRequestError("code, name, and schemeType are required");
    }

    const scheme = await createSavingsScheme({
      organizationId: orgId,
      code,
      name,
      schemeType,
      totalTenureMonths: totalTenureMonths !== undefined ? Number(totalTenureMonths) : undefined,
      minInstallmentAmountInr: minInstallmentAmountInr !== undefined ? Number(minInstallmentAmountInr) : undefined,
      bonusContributionPct: bonusContributionPct !== undefined ? Number(bonusContributionPct) : undefined,
      makingChargeDiscountPct: makingChargeDiscountPct !== undefined ? Number(makingChargeDiscountPct) : undefined,
      description,
    });

    res.status(201).json({
      success: true,
      data: scheme,
      message: "Savings scheme created successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function listSchemeAccountsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId = req.user?.orgId ?? req.storeContext?.organizationId ?? DEFAULT_ORG_ID;
    const customerId = typeof req.query.customerId === "string" ? req.query.customerId : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    const accounts = await listCustomerSchemeAccounts(orgId, { customerId, status });

    res.status(200).json({
      success: true,
      data: accounts,
    });
  } catch (err) {
    next(err);
  }
}

export async function enrollSchemeAccountHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId = req.user?.orgId ?? req.storeContext?.organizationId ?? DEFAULT_ORG_ID;
    const {
      schemeId,
      customerId,
      monthlyInstallmentInr,
      nomineeName,
      nomineeRelationship,
      nomineePhone,
      kycStatus,
      panNumber,
    } = req.body;

    if (!schemeId || !customerId || monthlyInstallmentInr === undefined) {
      throw new BadRequestError("schemeId, customerId, and monthlyInstallmentInr are required");
    }

    const account = await enrollCustomerInScheme({
      organizationId: orgId,
      schemeId,
      customerId,
      monthlyInstallmentInr: Number(monthlyInstallmentInr),
      nomineeName,
      nomineeRelationship,
      nomineePhone,
      kycStatus,
      panNumber,
    });

    res.status(201).json({
      success: true,
      data: account,
      message: "Customer enrolled in gold savings scheme successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function getSchemeAccountByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new BadRequestError("Account ID parameter is required");

    const account = await getSchemeAccountById(id);
    if (!account) {
      throw new NotFoundError(`Savings scheme account not found: ${id}`);
    }

    const installments = await listSchemeInstallments(id);

    res.status(200).json({
      success: true,
      data: {
        ...account,
        installments,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function recordInstallmentHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new BadRequestError("Account ID parameter is required");

    const { amountInr, goldSpotRatePerGram, paymentMethod, transactionReference } = req.body;
    if (amountInr === undefined || goldSpotRatePerGram === undefined) {
      throw new BadRequestError("amountInr and goldSpotRatePerGram are required");
    }

    const result = await recordSchemeInstallment(id, {
      amountInr: Number(amountInr),
      goldSpotRatePerGram: Number(goldSpotRatePerGram),
      paymentMethod,
      transactionReference,
    });

    res.status(200).json({
      success: true,
      data: result,
      message: `Installment #${result.installment.installmentNumber} recorded. Total paid: ${result.account.installmentsPaid} months.`,
    });
  } catch (err) {
    next(err);
  }
}

export async function redeemSchemeAccountHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new BadRequestError("Account ID parameter is required");

    const { redemptionInvoiceId } = req.body;
    const account = await redeemSchemeAccount(id, redemptionInvoiceId);

    res.status(200).json({
      success: true,
      data: account,
      message: "Scheme account redeemed successfully for jewelry purchase credit",
    });
  } catch (err) {
    next(err);
  }
}

export async function getLoyaltyProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const customerId = Array.isArray(req.params.customerId) ? req.params.customerId[0] : req.params.customerId;
    if (!customerId) throw new BadRequestError("Customer ID parameter is required");

    const profile = await getVipLoyaltyProfile(customerId);

    res.status(200).json({
      success: true,
      data: profile || {
        customerId,
        tier: "SILVER",
        rewardPointsBalance: 500,
        lifetimePurchasesInr: 125000,
        makingChargePrivilegePct: 10.0,
        personalConciergeAssigned: "Rachel R., Senior Private Client Director",
        specialPrivilegesJson: ["VIP Salon Express Appointment"],
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function upsertLoyaltyProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId = req.user?.orgId ?? req.storeContext?.organizationId ?? DEFAULT_ORG_ID;
    const {
      customerId,
      tier,
      rewardPointsBalance,
      lifetimePurchasesInr,
      makingChargePrivilegePct,
      personalConciergeAssigned,
      specialPrivilegesJson,
    } = req.body;

    if (!customerId) throw new BadRequestError("customerId is required");

    const profile = await upsertVipLoyaltyProfile({
      organizationId: orgId,
      customerId,
      tier,
      rewardPointsBalance,
      lifetimePurchasesInr,
      makingChargePrivilegePct,
      personalConciergeAssigned,
      specialPrivilegesJson,
    });

    res.status(200).json({
      success: true,
      data: profile,
      message: "VIP loyalty profile updated successfully",
    });
  } catch (err) {
    next(err);
  }
}
