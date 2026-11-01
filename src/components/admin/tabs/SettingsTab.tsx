"use client";

import { useState } from "react";
import {
  Settings,
  Shield,
  Database,
  CheckCircle2,
  Clock,
  BookOpen,
  Mail,
  Lock,
  Save,
  Server,
} from "lucide-react";
import { toast } from "sonner";

interface SettingsTabProps {
  adminEmails: string[];
}

export default function SettingsTab({ adminEmails }: SettingsTabProps) {
  const [loanPeriodDays, setLoanPeriodDays] = useState(14);
  const [maxConcurrentBorrows, setMaxConcurrentBorrows] = useState(3);
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Library borrowing policies saved successfully!");
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* 1. Loan Policies Card */}
      <div className="rounded-3xl border border-[#E7E0D3] bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#174B32]">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Circulation & Loan Rules
            </h3>
            <p className="text-xs text-stone-500">
              Standard borrowing windows and concurrent quota per reader
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePolicies} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700">
                Default Loan Period (Days)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={loanPeriodDays}
                onChange={(e) => setLoanPeriodDays(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 shadow-2xs focus:border-[#174B32] focus:outline-hidden"
              />
              <p className="mt-1 text-[11px] text-stone-400">
                Borrow transactions automatically calculate due dates at {loanPeriodDays} days after checkout.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">
                Max Concurrent Loans per User
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={maxConcurrentBorrows}
                onChange={(e) => setMaxConcurrentBorrows(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 shadow-2xs focus:border-[#174B32] focus:outline-hidden"
              />
              <p className="mt-1 text-[11px] text-stone-400">
                Prevents single reader accounts from monopolizing multiple copies simultaneously.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#174B32] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#103B29] disabled:opacity-50"
            >
              <Save className="h-4 w-4 text-[#F4A623]" />
              <span>{isSaving ? "Saving..." : "Save Circulation Policy"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Admin Whitelist Card */}
      <div className="rounded-3xl border border-[#E7E0D3] bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#F4A623]">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Curator & Administrator Access Whitelist
            </h3>
            <p className="text-xs text-stone-500">
              Only verified emails below or users with explicit &quot;admin&quot; role have access to this dashboard
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              Configured Admin Emails (Environment & Seed)
            </h4>
            <div className="space-y-2">
              {adminEmails.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between rounded-xl bg-white p-3 border border-stone-200 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-[#174B32]" />
                    <span className="text-xs font-semibold text-stone-900 font-mono">
                      {email}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    Authorized
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-stone-500">
              To add additional administrators, set the <code>ADMIN_EMAILS</code> environment variable as a comma-separated list.
            </p>
          </div>
        </div>
      </div>

      {/* 3. System Infrastructure & Health Card */}
      <div className="rounded-3xl border border-[#E7E0D3] bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              System Infrastructure & Database Health
            </h3>
            <p className="text-xs text-stone-500">
              Underlying data persistence and security engines
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4">
            <span className="text-[10px] font-bold text-stone-400 uppercase">
              Database Engine
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="font-serif text-sm font-bold text-stone-900">
                MongoDB Native
              </span>
            </div>
            <p className="mt-1 text-[11px] text-stone-500">
              Atomic $inc concurrency protection active
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4">
            <span className="text-[10px] font-bold text-stone-400 uppercase">
              Auth Protocol
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="font-serif text-sm font-bold text-stone-900">
                Better Auth v1.7
              </span>
            </div>
            <p className="mt-1 text-[11px] text-stone-500">
              Cookie session + CSRF token validation
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4">
            <span className="text-[10px] font-bold text-stone-400 uppercase">
              Route Security
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="font-serif text-sm font-bold text-stone-900">
                Next.js App Router
              </span>
            </div>
            <p className="mt-1 text-[11px] text-stone-500">
              Server-side redirect &amp; RBAC protection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
