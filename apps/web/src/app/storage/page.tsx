"use client";

import React, { useState, useEffect } from "react";
import type { VaultHierarchyWithOccupancy } from "@jewelcore/shared";
import { AppShell } from "../../components/common/AppShell";
import { StorageDirectoryView } from "../../components/storage/StorageDirectoryView";

// Complete 3-Tier Storage Hierarchy replicating approved Stitch visual design
const SAMPLE_STORAGE_HIERARCHY: VaultHierarchyWithOccupancy[] = [
  {
    id: "0192e350-0001-7000-8000-000000000001",
    storeId: "0192e300-0001-7000-8000-000000000001",
    code: "VLT-01",
    name: "Vault 01: Primary Bullion & Diamond Safe",
    vaultType: "MAIN_VAULT",
    accessLevelRequired: "MAXIMUM",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lockers: [
      {
        id: "0192e350-0002-7000-8000-000000000001",
        vaultId: "0192e350-0001-7000-8000-000000000001",
        storeId: "0192e300-0001-7000-8000-000000000001",
        code: "LCK-02",
        name: "Locker 02: High-Jewellery Trays",
        lockerNumber: "SAFE-B04",
        capacityRating: "Grade V Heavy Door • Biometric Armed",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        compartments: [
          {
            id: "comp-02-a1",
            lockerId: "0192e350-0002-7000-8000-000000000001",
            storeId: "0192e300-0001-7000-8000-000000000001",
            code: "COMP-02-A1",
            name: "Antique Kundan Necklaces",
            compartmentNumber: "A1",
            maxWeightCapacityGrams: 5000,
            maxItemCapacity: 25,
            occupiedItemCount: 18,
            occupancyPercentage: 72,
            status: "AVAILABLE",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "comp-02-a2",
            lockerId: "0192e350-0002-7000-8000-000000000001",
            storeId: "0192e300-0001-7000-8000-000000000001",
            code: "COMP-02-A2",
            name: "Bridal Diamond Sets",
            compartmentNumber: "A2",
            maxWeightCapacityGrams: 5000,
            maxItemCapacity: 25,
            occupiedItemCount: 24,
            occupancyPercentage: 96,
            status: "NEAR_CAPACITY",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "comp-02-a3",
            lockerId: "0192e350-0002-7000-8000-000000000001",
            storeId: "0192e300-0001-7000-8000-000000000001",
            code: "COMP-02-A3",
            name: "Platinum Brooches & Pins",
            compartmentNumber: "A3",
            maxWeightCapacityGrams: 3000,
            maxItemCapacity: 25,
            occupiedItemCount: 5,
            occupancyPercentage: 20,
            status: "AVAILABLE",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "comp-02-b1",
            lockerId: "0192e350-0002-7000-8000-000000000001",
            storeId: "0192e300-0001-7000-8000-000000000001",
            code: "COMP-02-B1",
            name: "Solitaire Rings & Pave Bands",
            compartmentNumber: "B1",
            maxWeightCapacityGrams: 5000,
            maxItemCapacity: 20,
            occupiedItemCount: 12,
            occupancyPercentage: 60,
            status: "AVAILABLE",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "comp-02-b2",
            lockerId: "0192e350-0002-7000-8000-000000000001",
            storeId: "0192e300-0001-7000-8000-000000000001",
            code: "COMP-02-B2",
            name: "Heritage Jhumkas & Earstuds",
            compartmentNumber: "B2",
            maxWeightCapacityGrams: 4000,
            maxItemCapacity: 20,
            occupiedItemCount: 16,
            occupancyPercentage: 80,
            status: "AVAILABLE",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "comp-02-b3",
            lockerId: "0192e350-0002-7000-8000-000000000001",
            storeId: "0192e300-0001-7000-8000-000000000001",
            code: "COMP-02-B3",
            name: "Vacant Reserve Tray",
            compartmentNumber: "B3",
            maxWeightCapacityGrams: 5000,
            maxItemCapacity: 20,
            occupiedItemCount: 0,
            occupancyPercentage: 0,
            status: "AVAILABLE",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "comp-02-c1",
            lockerId: "0192e350-0002-7000-8000-000000000001",
            storeId: "0192e300-0001-7000-8000-000000000001",
            code: "COMP-02-C1",
            name: "Filigree Bridal Bangles",
            compartmentNumber: "C1",
            maxWeightCapacityGrams: 8000,
            maxItemCapacity: 20,
            occupiedItemCount: 20,
            occupancyPercentage: 100,
            status: "FULL",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "comp-02-c2",
            lockerId: "0192e350-0002-7000-8000-000000000001",
            storeId: "0192e300-0001-7000-8000-000000000001",
            code: "COMP-02-C2",
            name: "Gemstone Pendant Cassettes",
            compartmentNumber: "C2",
            maxWeightCapacityGrams: 4000,
            maxItemCapacity: 15,
            occupiedItemCount: 9,
            occupancyPercentage: 60,
            status: "AVAILABLE",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
      {
        id: "0192e350-0002-7000-8000-000000000002",
        vaultId: "0192e350-0001-7000-8000-000000000001",
        storeId: "0192e300-0001-7000-8000-000000000001",
        code: "LCK-01",
        name: "Locker 01: Bullion Bars & Cast Ingots",
        lockerNumber: "SAFE-A01",
        capacityRating: "8 Heavy Trays • Reinforced Steel",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        compartments: [
          {
            id: "comp-01-a1",
            lockerId: "0192e350-0002-7000-8000-000000000002",
            storeId: "0192e300-0001-7000-8000-000000000001",
            code: "COMP-01-A1",
            name: "Au 999 100g Minted Bars",
            compartmentNumber: "A1",
            maxWeightCapacityGrams: 20000,
            maxItemCapacity: 20,
            occupiedItemCount: 18,
            occupancyPercentage: 90,
            status: "NEAR_CAPACITY",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
      {
        id: "0192e350-0002-7000-8000-000000000003",
        vaultId: "0192e350-0001-7000-8000-000000000001",
        storeId: "0192e300-0001-7000-8000-000000000001",
        code: "LCK-03",
        name: "Locker 03: Loose Certified Gemstones",
        lockerNumber: "SAFE-C02",
        capacityRating: "16 Micro Cassettes • High Precision",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        compartments: [
          {
            id: "comp-03-a1",
            lockerId: "0192e350-0002-7000-8000-000000000003",
            storeId: "0192e300-0001-7000-8000-000000000001",
            code: "COMP-03-A1",
            name: "GIA Certified D-Flawless Solitaires",
            compartmentNumber: "A1",
            maxWeightCapacityGrams: 1000,
            maxItemCapacity: 30,
            occupiedItemCount: 13,
            occupancyPercentage: 43,
            status: "AVAILABLE",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
    ],
  },
  {
    id: "0192e350-0001-7000-8000-000000000002",
    storeId: "0192e300-0001-7000-8000-000000000001",
    code: "VLT-02",
    name: "Vault 02: Retail Strongroom (High Turnaround POS Staging)",
    vaultType: "SHOWROOM_SAFE",
    accessLevelRequired: "HIGH",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lockers: [
      {
        id: "0192e350-0002-7000-8000-000000000004",
        vaultId: "0192e350-0001-7000-8000-000000000002",
        storeId: "0192e300-0001-7000-8000-000000000001",
        code: "LCK-04",
        name: "Locker 04: Counter A Showroom Trays",
        lockerNumber: "SAFE-D01",
        capacityRating: "Quick Turnaround Smart-Lock",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        compartments: [
          {
            id: "comp-04-a1",
            lockerId: "0192e350-0002-7000-8000-000000000004",
            storeId: "0192e300-0001-7000-8000-000000000001",
            code: "COMP-04-A1",
            name: "Showcase Gold Rings",
            compartmentNumber: "D1",
            maxWeightCapacityGrams: 4000,
            maxItemCapacity: 30,
            occupiedItemCount: 22,
            occupancyPercentage: 73,
            status: "AVAILABLE",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
    ],
  },
  {
    id: "0192e350-0001-7000-8000-000000000003",
    storeId: "0192e300-0001-7000-8000-000000000001",
    code: "VLT-03",
    name: "Vault 03: Analytical QC Lab & Assay Isolation Safe",
    vaultType: "INTAKE_HOLDING",
    accessLevelRequired: "HIGH",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lockers: [
      {
        id: "0192e350-0002-7000-8000-000000000005",
        vaultId: "0192e350-0001-7000-8000-000000000003",
        storeId: "0192e300-0001-7000-8000-000000000001",
        code: "LCK-05",
        name: "Locker 05: Inward Assay Intake Quarantine",
        lockerNumber: "LAB-Q01",
        capacityRating: "Metrology Isolated",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        compartments: [
          {
            id: "comp-05-a1",
            lockerId: "0192e350-0002-7000-8000-000000000005",
            storeId: "0192e300-0001-7000-8000-000000000001",
            code: "COMP-05-A1",
            name: "XRF Density Test Trays",
            compartmentNumber: "Q1",
            maxWeightCapacityGrams: 5000,
            maxItemCapacity: 15,
            occupiedItemCount: 3,
            occupancyPercentage: 20,
            status: "AVAILABLE",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
    ],
  },
];

export default function StoragePage() {
  const [vaults, setVaults] = useState<VaultHierarchyWithOccupancy[]>(SAMPLE_STORAGE_HIERARCHY);

  useEffect(() => {
    async function loadLiveHierarchy() {
      try {
        const res = await fetch("/api/v1/storage/hierarchy", {
          credentials: "omit",
        });
        if (res.ok) {
          const body = await res.json();
          if (Array.isArray(body.data) && body.data.length > 0) {
            setVaults(body.data);
          }
        }
      } catch {
        // Fallback to rich mock data replicating Stitch visual design
      }
    }
    loadLiveHierarchy();
  }, []);

  return (
    <AppShell>
      <StorageDirectoryView
        storeName="Flagship Mumbai"
        storeCode="INV-11"
        vaults={vaults}
      />
    </AppShell>
  );
}
