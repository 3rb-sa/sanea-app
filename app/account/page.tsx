"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTrips } from "@/lib/trips";
import { IconRoute, IconTrash, IconUserCircle } from "@/components/icons";

export default function AccountPage() {
  const router = useRouter();
  const { profile, signOut, deleteAccount } = useAuth();
  const { myTrips, deleteTrip } = useTrips();
  const [confirmingAccountDelete, setConfirmingAccountDelete] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [accountDeleteError, setAccountDeleteError] = useState<string | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);

  if (!profile) return null;

  async function handleSignOut() {
    await signOut();
    router.replace("/");
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true);
    setAccountDeleteError(null);
    sessionStorage.setItem("accountDeleted", "1");
    const { error } = await deleteAccount();
    setDeletingAccount(false);
    if (error) {
      sessionStorage.removeItem("accountDeleted");
      setAccountDeleteError(error);
      return;
    }
    router.replace("/?accountDeleted=1");
  }

  async function handleDeleteTrip(id: string) {
    setDeletingTripId(id);
    await deleteTrip(id);
    setDeletingTripId(null);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-shrink-0 items-center justify-between px-4 pb-1.5 pt-[22px]">
        <div className="w-10" />
        <div className="font-heading text-lg font-bold">حسابي</div>
        <button
          onClick={handleSignOut}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-[11px] font-bold text-text-soft"
        >
          خروج
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto px-5 pb-6 pt-2.5">
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-surface p-6">
          <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-accent-soft text-accent-dark">
            <IconUserCircle size={30} />
          </div>
          <span className="font-heading text-lg font-bold">{profile.full_name}</span>
          <span dir="ltr" className="text-[12.5px] text-text-soft">
            {profile.phone}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="text-[13.5px] font-bold">رحلاتي النشطة</div>
          {myTrips.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-accent-soft bg-accent-soft/30 py-8 text-center text-text-faint">
              <span className="text-sm font-semibold text-text">ما عندك رحلة نشطة الحين</span>
            </div>
          )}
          {myTrips.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-surface p-3.5">
              <div className="flex items-center gap-1.5 text-[12.5px] font-bold">
                <span>{t.fromCity}</span>
                <IconRoute size={12} className="text-accent" />
                <span>{t.toCity}</span>
              </div>
              <button
                onClick={() => handleDeleteTrip(t.id)}
                disabled={deletingTripId === t.id}
                className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-bold text-text-soft disabled:opacity-60"
              >
                <IconTrash size={12} />
                إنهاء
              </button>
            </div>
          ))}
        </div>

        <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
          {confirmingAccountDelete ? (
            <div className="flex flex-col gap-2.5 rounded-2xl bg-red-50 p-3.5">
              <span className="text-xs font-bold text-red-700">تأكيد حذف الحساب نهائيًا؟ راح تنحذف كل بياناتك ورحلاتك.</span>
              {accountDeleteError && <span className="text-xs font-semibold text-red-700">{accountDeleteError}</span>}
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="flex-1 rounded-xl bg-red-600 py-2 text-xs font-bold text-white disabled:opacity-60"
                >
                  {deletingAccount ? "جارٍ الحذف..." : "حذف الحساب نهائيًا"}
                </button>
                <button
                  onClick={() => setConfirmingAccountDelete(false)}
                  disabled={deletingAccount}
                  className="flex-1 rounded-xl border border-border py-2 text-xs font-bold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingAccountDelete(true)}
              className="flex items-center justify-center gap-1.5 py-1 text-xs font-semibold text-red-600"
            >
              <IconTrash size={13} />
              حذف الحساب نهائيًا
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
