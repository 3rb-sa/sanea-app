"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useTrips } from "@/lib/trips";
import { SAUDI_CITIES } from "@/lib/cities";
import { IconChevronRight, IconPackage, IconUsers } from "@/components/icons";

export default function PostTripPage() {
  const router = useRouter();
  const { addTrip } = useTrips();

  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [acceptsPassengers, setAcceptsPassengers] = useState(true);
  const [acceptsParcels, setAcceptsParcels] = useState(true);
  const [note, setNote] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<20 | 30>(20);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fromCity || !toCity) {
      setError("اختر مدينة الانطلاق والوجهة");
      return;
    }
    if (fromCity === toCity) {
      setError("لازم تكون الوجهة مدينة ثانية");
      return;
    }
    if (!acceptsPassengers && !acceptsParcels) {
      setError("اختر تقبل ركاب أو طرود على الأقل");
      return;
    }

    setBusy(true);
    setError(null);
    const { error } = await addTrip({
      fromCity,
      toCity,
      acceptsPassengers,
      acceptsParcels,
      note: note.trim() || null,
      durationMinutes,
    });
    setBusy(false);
    if (error) setError(error);
    else router.push("/");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-shrink-0 items-center justify-between px-4 pb-2.5 pt-5">
        <button
          onClick={() => router.back()}
          aria-label="رجوع"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface"
        >
          <IconChevronRight size={19} />
        </button>
        <div className="text-[15px] font-bold">انشر رحلتك</div>
        <div className="w-10" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-6 pt-2">
        <p className="rounded-xl bg-accent-soft px-3.5 py-2.5 text-xs font-semibold text-accent-dark">
          إعلانك مؤقت وينتهي تلقائيًا بعد المدة اللي تحددها — لأي حد رايح نفس طريقك يشوفه ويتواصل معك.
        </p>

        <div className="flex gap-2.5">
          <div className="flex-1">
            <label className="mb-1.5 block text-[12.5px] font-bold text-text-soft">من</label>
            <select value={fromCity} onChange={(e) => setFromCity(e.target.value)} className="field">
              <option value="">اختر المدينة</option>
              {SAUDI_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-[12.5px] font-bold text-text-soft">إلى</label>
            <select value={toCity} onChange={(e) => setToCity(e.target.value)} className="field">
              <option value="">اختر المدينة</option>
              {SAUDI_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[12.5px] font-bold text-text-soft">تقبل توصيل</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAcceptsPassengers((v) => !v)}
              className={`flex flex-1 flex-col items-center gap-1.5 rounded-2xl border-[1.5px] py-3 ${
                acceptsPassengers ? "border-accent bg-accent-soft text-accent-dark" : "border-border bg-surface text-text-soft"
              }`}
            >
              <IconUsers size={20} />
              <span className="text-xs font-bold">ركاب</span>
            </button>
            <button
              type="button"
              onClick={() => setAcceptsParcels((v) => !v)}
              className={`flex flex-1 flex-col items-center gap-1.5 rounded-2xl border-[1.5px] py-3 ${
                acceptsParcels ? "border-accent bg-accent-soft text-accent-dark" : "border-border bg-surface text-text-soft"
              }`}
            >
              <IconPackage size={20} />
              <span className="text-xs font-bold">طرود / أغراض</span>
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[12.5px] font-bold text-text-soft">ينتهي الإعلان بعد</label>
          <div className="flex gap-2">
            {([20, 30] as const).map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDurationMinutes(mins)}
                className={`flex-1 rounded-2xl border-[1.5px] py-2.5 text-sm font-bold ${
                  durationMinutes === mins ? "border-accent bg-accent-soft text-accent-dark" : "border-border bg-surface text-text-soft"
                }`}
              >
                {mins} دقيقة
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[12.5px] font-bold text-text-soft">ملاحظة (اختياري)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="مثال: عندي مقعدين فاضيين، أو أقدر أوصل طرد صغير بس"
            className="field resize-none"
          />
        </div>

        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-1 rounded-2xl bg-accent py-4 font-bold text-white shadow-[0_10px_26px_-16px_oklch(45%_0.16_255_/_0.45)] disabled:opacity-60"
        >
          {busy ? "جارٍ النشر..." : "انشر الرحلة"}
        </button>
      </form>
    </div>
  );
}
