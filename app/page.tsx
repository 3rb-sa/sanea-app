"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTrips } from "@/lib/trips";
import { toE164 } from "@/lib/phone";
import { Trip } from "@/lib/types";
import { IconClock, IconPackage, IconPhone, IconPlus, IconRoute, IconUsers } from "@/components/icons";

function timeLeftLabel(expiresAt: number, nowTick: number) {
  const ms = expiresAt - nowTick;
  if (ms <= 0) return "انتهت";
  const minutes = Math.ceil(ms / 60_000);
  return `باقي ${minutes} دقيقة`;
}

export default function HomePage() {
  const router = useRouter();
  const { session } = useAuth();
  const { trips, loading, loadError, getDriverPhone } = useTrips();
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [contactingId, setContactingId] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

  async function handleContact(trip: Trip) {
    if (!session) {
      router.push("/login?next=/");
      return;
    }
    setContactingId(trip.id);
    const phone = await getDriverPhone(trip.driverId);
    setContactingId(null);
    if (!phone) return;
    window.open(`https://wa.me/${toE164(phone).replace("+", "")}`, "_blank");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-shrink-0 flex-col gap-1 px-5 pb-3 pt-6">
        <div className="font-heading text-xl font-bold text-accent-dark">سنع</div>
        <p className="text-[12.5px] text-text-soft">رحلات وطرود بين المدن، تنتهي بسرعة — تابع الجديد أول بأول</p>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-5 pb-6">
        {loadError && <p className="text-center text-xs font-semibold text-red-600">{loadError}</p>}
        {!loading && trips.length === 0 && !loadError && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-accent-soft bg-accent-soft/30 py-10 text-center text-text-faint">
            <IconRoute size={28} className="text-accent-dark" />
            <span className="text-sm font-semibold text-text">ما فيه رحلات نشطة الحين</span>
            <span className="text-xs">كن أول من ينشر رحلته، أو ارجع بعد شوي</span>
          </div>
        )}
        {trips.map((trip) => (
          <div key={trip.id} className="flex flex-col gap-2.5 rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-bold">
                <span>{trip.fromCity}</span>
                <IconRoute size={14} className="text-accent" />
                <span>{trip.toCity}</span>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-[10.5px] font-bold text-accent-dark">
                <IconClock size={11} />
                {timeLeftLabel(trip.expiresAt, nowTick)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-soft">
              <span className="font-semibold text-text">{trip.driverName}</span>
              {trip.acceptsPassengers && (
                <span className="flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 font-bold">
                  <IconUsers size={11} /> ركاب
                </span>
              )}
              {trip.acceptsParcels && (
                <span className="flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 font-bold">
                  <IconPackage size={11} /> طرود
                </span>
              )}
            </div>
            {trip.note && <p className="text-xs text-text-soft">{trip.note}</p>}
            <button
              onClick={() => handleContact(trip)}
              disabled={contactingId === trip.id}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-whatsapp-soft py-2.5 text-xs font-bold text-whatsapp-text disabled:opacity-60"
            >
              <IconPhone size={13} />
              {contactingId === trip.id ? "جارٍ التحميل..." : "تواصل مع السائق"}
            </button>
          </div>
        ))}
      </div>

      <Link
        href="/post"
        className="fixed bottom-24 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-accent px-6 py-3.5 font-bold text-white shadow-[0_10px_26px_-10px_oklch(45%_0.16_255_/_0.5)]"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <IconPlus size={16} />
        انشر رحلتك
      </Link>
    </div>
  );
}
