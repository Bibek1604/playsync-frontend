"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  ArrowLeft,
  Loader2,
  MapPin,
  Coins,
  Gift,
  Users,
  Calendar,
  FileText,
  Wifi,
  WifiOff,
} from "lucide-react";
import Link from "next/link";
import { tournamentApi, CreateTournamentInput } from "@/features/tournaments/api/tournament.api";
import { toast } from "@/lib/toast";

const DEFAULT: CreateTournamentInput = {
  name: "",
  description: "",
  type: "online",
  location: "",
  maxPlayers: 16,
  entryFee: 0,
  prize: "",
  startDate: "",
  endDate: "",
};

export default function CreateTournamentPage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateTournamentInput>(DEFAULT);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof CreateTournamentInput, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.length < 3) e.name = "Name must be at least 3 characters";
    if (!form.description.trim() || form.description.length < 10) e.description = "Description must be at least 10 characters";
    if (form.type === "offline" && !form.location?.trim()) e.location = "Location is required for offline tournaments";
    if (!form.maxPlayers || form.maxPlayers < 2) e.maxPlayers = "At least 2 players required";
    if (form.entryFee < 0) e.entryFee = "Entry fee cannot be negative";
    if (!form.prize.trim()) e.prize = "Prize details are required";
    if (!form.startDate) e.startDate = "Start date is required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const tournament = await tournamentApi.create({
        ...form,
        entryFee: Number(form.entryFee),
        maxPlayers: Number(form.maxPlayers),
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        location: form.type === "online" ? undefined : form.location,
      });
      toast.success("Tournament created successfully!");
      router.push(`/tournaments/${tournament._id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create tournament");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/tournaments" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Tournaments
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Create Tournament</h1>
          <p className="text-sm text-slate-500">Set up your tournament with eSewa payment integration</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        {/* Tournament Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Tournament Type</label>
          <div className="grid grid-cols-2 gap-3">
            {(["online", "offline"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("type", t)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition ${
                  form.type === t
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {t === "online" ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                <span className="font-semibold capitalize">{t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <Field label="Tournament Name" icon={<Trophy className="w-4 h-4" />} error={errors.name}>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Summer Championship 2025"
            className={INPUT_CLS}
          />
        </Field>

        {/* Description */}
        <Field label="Description" icon={<FileText className="w-4 h-4" />} error={errors.description}>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe the tournament rules, format, and requirements…"
            rows={3}
            className={INPUT_CLS + " resize-none"}
          />
        </Field>

        {/* Location (offline only) */}
        {form.type === "offline" && (
          <Field label="Location *" icon={<MapPin className="w-4 h-4" />} error={errors.location}>
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Kathmandu, Nepal — Hall A"
              className={INPUT_CLS}
            />
          </Field>
        )}

        {/* Max Players + Entry Fee */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Max Players" icon={<Users className="w-4 h-4" />} error={errors.maxPlayers}>
            <input
              type="number"
              min={2}
              max={1000}
              value={form.maxPlayers}
              onChange={(e) => set("maxPlayers", e.target.value)}
              className={INPUT_CLS}
            />
          </Field>
          <Field label="Entry Fee (NPR)" icon={<Coins className="w-4 h-4" />} error={errors.entryFee}>
            <input
              type="number"
              min={0}
              value={form.entryFee}
              onChange={(e) => set("entryFee", e.target.value)}
              placeholder="0 for free"
              className={INPUT_CLS}
            />
          </Field>
        </div>

        {/* Prize */}
        <Field label="Prize Details" icon={<Gift className="w-4 h-4" />} error={errors.prize}>
          <input
            value={form.prize}
            onChange={(e) => set("prize", e.target.value)}
            placeholder="e.g. NPR 10,000 cash + trophy"
            className={INPUT_CLS}
          />
        </Field>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date & Time" icon={<Calendar className="w-4 h-4" />} error={errors.startDate}>
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              className={INPUT_CLS}
            />
          </Field>
          <Field label="End Date (optional)" icon={<Calendar className="w-4 h-4" />} error={""}>
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
              className={INPUT_CLS}
            />
          </Field>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy className="w-5 h-5" />}
          {loading ? "Creating…" : "Create Tournament"}
        </button>
      </form>
    </div>
  );
}

const INPUT_CLS =
  "w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm text-slate-800";

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1.5">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
