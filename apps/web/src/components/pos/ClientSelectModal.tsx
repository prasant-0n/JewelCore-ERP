"use client";

import React, { useState } from "react";
import { X, UserCheck, Search, Check, ShieldCheck, Sparkles } from "lucide-react";

export interface ClientProfileData {
  id: string;
  name: string;
  vipTier: string;
  panNumber: string;
  phone: string;
  lifetimeSpendInr: number;
  assignedSalon: string;
  relationshipManager: string;
}

const SAMPLE_CLIENTS: ClientProfileData[] = [
  {
    id: "cli-01",
    name: "Mrs. Radhika Singhania",
    vipTier: "Ultra High Net Worth (UHNW)",
    panNumber: "AAAPS9012K",
    phone: "+91 98201 44892",
    lifetimeSpendInr: 24500000,
    assignedSalon: "Private Salon Suite 1",
    relationshipManager: "N. Mehta",
  },
  {
    id: "cli-02",
    name: "Mr. Vikramaditya Birla",
    vipTier: "Centurion Royal VIP",
    panNumber: "BPLPB1104M",
    phone: "+91 99302 77120",
    lifetimeSpendInr: 48900000,
    assignedSalon: "Heritage Solitaire Lounge",
    relationshipManager: "R. Kapoor",
  },
  {
    id: "cli-03",
    name: "Mrs. Ananya Piramal",
    vipTier: "HNW Bridal Collector",
    panNumber: "CKAPP4491J",
    phone: "+91 98110 55219",
    lifetimeSpendInr: 16200000,
    assignedSalon: "Private Salon Suite 2",
    relationshipManager: "S. Sharma",
  },
];

interface ClientSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClient?: (client: ClientProfileData) => void;
}

export function ClientSelectModal({
  isOpen,
  onClose,
  onSelectClient,
}: ClientSelectModalProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>("cli-01");

  if (!isOpen) return null;

  const filteredClients = SAMPLE_CLIENTS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.panNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleConfirm = () => {
    const client = SAMPLE_CLIENTS.find((c) => c.id === selectedId);
    if (client) {
      onSelectClient?.(client);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-obsidian/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-card border border-surface-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-surface-elevated border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Select VIP Client & Salon Session
              </h3>
              <p className="text-[11px] text-platinum/60 font-mono">
                PMLA / AML Verified Client Registry • Flagship Salon
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-platinum/60 hover:text-slate-100 hover:bg-surface-border transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-surface-border">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-platinum/50" />
            <input
              type="text"
              placeholder="Search by Client Name, PAN, or Mobile #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-elevated border border-surface-border rounded-lg text-xs text-slate-100 placeholder:text-platinum/40 focus:outline-none focus:border-gold font-mono"
            />
          </div>
        </div>

        {/* Client List */}
        <div className="p-4 space-y-2.5 max-h-72 overflow-y-auto">
          {filteredClients.map((client) => {
            const isSelected = selectedId === client.id;
            return (
              <div
                key={client.id}
                onClick={() => setSelectedId(client.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-surface-elevated border-gold shadow-[0_0_12px_rgba(212,175,55,0.18)]"
                    : "bg-surface-card border-surface-border hover:border-gold/40"
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-100 font-mono">
                      {client.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-gold/15 border border-gold/30 text-gold text-[9px] font-mono uppercase font-semibold">
                      {client.vipTier}
                    </span>
                  </div>

                  <div className="text-[11px] text-platinum/70 flex items-center space-x-2 mt-1 font-mono">
                    <span>PAN: {client.panNumber}</span>
                    <span>•</span>
                    <span>{client.phone}</span>
                    <span>•</span>
                    <span className="text-emerald-400">
                      ₹ {(client.lifetimeSpendInr / 10000000).toFixed(2)} Cr Lifetime
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? "border-gold bg-gold text-obsidian"
                        : "border-surface-border bg-surface-elevated"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-surface-elevated border-t border-surface-border flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-platinum/80 hover:bg-surface-card transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-gold hover:bg-gold-light text-obsidian shadow-lg shadow-gold/20 flex items-center space-x-1.5 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Assign Client to POS Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
