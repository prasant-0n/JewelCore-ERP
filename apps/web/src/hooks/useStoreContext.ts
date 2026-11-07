"use client";

import { useState, useEffect, useCallback } from "react";
import { api, DEFAULT_STORE_ID } from "../lib/api";
import { toast } from "sonner";

export interface BranchStore {
  id: string;
  code: string;
  name: string;
  type: string;
  city: string;
}

export const BRANCH_STORES: BranchStore[] = [
  {
    id: "0192e300-0001-7000-8000-000000000001",
    code: "INV-11",
    name: "Downtown Showroom",
    type: "RETAIL_STORE",
    city: "Colaba, Mumbai",
  },
  {
    id: "0192e300-0001-7000-8000-000000000002",
    code: "VAULT-01",
    name: "Central Treasury Vault Hub",
    type: "VAULT_HUB",
    city: "Zaveri Bazaar, Mumbai",
  },
  {
    id: "0192e300-0001-7000-8000-000000000003",
    code: "SHOW-02",
    name: "Uptown Luxury Boutique",
    type: "SHOWROOM",
    city: "Bandra Pavilion, Mumbai",
  },
];

export function useStoreContext() {
  const getInitialStore = (): BranchStore => {
    const currentId = api.getStoreId() || DEFAULT_STORE_ID;
    return BRANCH_STORES.find((s) => s.id === currentId) || BRANCH_STORES[0];
  };

  const [currentStore, setCurrentStore] = useState<BranchStore>(BRANCH_STORES[0]);

  useEffect(() => {
    setCurrentStore(getInitialStore());

    const handleStoreChange = (e: Event) => {
      const customEvent = e as CustomEvent<{
        storeId: string;
        storeCode: string;
        storeName: string;
      }>;
      if (customEvent.detail?.storeId) {
        const found = BRANCH_STORES.find(
          (s) => s.id === customEvent.detail.storeId,
        );
        if (found) setCurrentStore(found);
      }
    };

    window.addEventListener("jewelcore:store-changed", handleStoreChange);
    return () => {
      window.removeEventListener("jewelcore:store-changed", handleStoreChange);
    };
  }, []);

  const switchStore = useCallback((storeOrId: BranchStore | string) => {
    const targetStore =
      typeof storeOrId === "string"
        ? BRANCH_STORES.find((s) => s.id === storeOrId || s.code === storeOrId)
        : storeOrId;

    if (!targetStore) return;

    api.setStoreId(targetStore.id);
    setCurrentStore(targetStore);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("jewelcore:store-changed", {
          detail: {
            storeId: targetStore.id,
            storeCode: targetStore.code,
            storeName: targetStore.name,
          },
        }),
      );
    }

    toast.success(`Active Branch: ${targetStore.name}`, {
      description: `Switched store to ${targetStore.code} (${targetStore.type}) • Cross-store boundary scoped.`,
    });
  }, []);

  return {
    currentStore,
    stores: BRANCH_STORES,
    switchStore,
  };
}
