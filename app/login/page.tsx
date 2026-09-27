"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { IconRoute, IconUserCircle } from "@/components/icons";

type Step = "welcome" | "connecting" | "profile";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { signInWithGoogle, completeProfile, checkHasProfile, session, profile, loading } = useAuth();

  const [step, setStep] = useState<Step>("welcome");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Runs once the OAuth redirect lands back here with a session established.
  useEffect(() => {
    if (loading || !session) return;
    if (profile) {
      router.replace(next);
      return;
    }
    let cancelled = false;
    checkHasProfile().then((hasProfile) => {
      if (cancelled) return;
      if (hasProfile) {
        router.replace(next);
      } else {
        const meta = session.user.user_metadata as Record<string, string> | undefined;
        setFullName(meta?.full_name ?? meta?.name ?? "");
        setStep("profile");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loading, session, profile, checkHasProfile, next, router]);

  async function handleGoogleSignIn() {
    setBusy(true);
    setError(null);
    const { error } = await signInWithGoogle(`/login?next=${encodeURIComponent(next)}`);
    if (error) {
      setBusy(false);
      setError(error);
    }
    // On success the page navigates away to Google, so no need to clear `busy`.
  }

  async function handleCompleteProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("اكتب الاسم الكامل");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9) {
      setError("رقم الجوال غير صحيح");
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await completeProfile({ fullName: fullName.trim(), phone: `+966${digits.replace(/^0+/, "")}` });
    setBusy(false);
    if (error) setError(error);
    else router.replace(next);
  }

  if (step === "profile") {
    return (
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-6 px-6 pb-6 pt-6">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
            <IconUserCircle size={28} />
          </div>
          <div className="font-heading text-lg font-bold">أكمل بياناتك</div>
          <p className="text-sm text-text-soft">رقم جوالك هو اللي يتواصلون عليه معك، تأكد إنه صحيح</p>
        </div>
        <form onSubmit={handleCompleteProfile} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-bold text-text-soft">الاسم الكامل</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              type="text"
              placeholder="مثال: عبدالله محمد الشمري"
              className="field"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-bold text-text-soft">رقم الجوال</label>
            <div dir="ltr" className="flex items-center gap-2 rounded-2xl border-[1.5px] border-border bg-surface px-4 py-3.5">
              <span className="text-sm font-bold text-text-soft">+966</span>
              <div className="h-5 w-px bg-border" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                inputMode="numeric"
                placeholder="5xxxxxxxx"
                className="w-full bg-transparent text-left text-sm outline-none placeholder:text-text-faint"
              />
            </div>
          </div>
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-2xl bg-accent py-4 font-bold text-white shadow-[0_10px_26px_-16px_oklch(45%_0.16_255_/_0.45)] disabled:opacity-60"
          >
            {busy ? "جارٍ الحفظ..." : "دخول"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-7 px-8 pb-10 pt-16 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-accent shadow-[0_16px_32px_-16px_oklch(45%_0.16_255_/_0.5)]">
        <IconRoute size={40} className="text-white" />
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="font-heading text-3xl font-bold text-accent-dark">سنع</div>
        <p className="max-w-[260px] text-sm leading-relaxed text-text-soft">
          سواقين متجهين لمدينتك الحين، لركاب أو طرود — انشر أو تواصل مباشرة
        </p>
      </div>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      <button
        onClick={handleGoogleSignIn}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-border bg-surface py-4 font-bold text-text shadow-[0_10px_26px_-16px_oklch(30%_0.05_155_/_0.2)] disabled:opacity-60"
      >
        <GoogleMark />
        {busy ? "جارٍ التحويل..." : "تسجيل الدخول بحساب قوقل"}
      </button>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.55-5.17 3.55-8.73Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.88-3c-1.08.72-2.45 1.15-4.05 1.15-3.12 0-5.76-2.1-6.7-4.93H1.3v3.1C3.26 21.3 7.3 24 12 24Z"
      />
      <path fill="#FBBC05" d="M5.3 14.32a7.2 7.2 0 0 1 0-4.64V6.58H1.3a12 12 0 0 0 0 10.84l4-3.1Z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.3 0 3.26 2.7 1.3 6.58l4 3.1c.94-2.83 3.58-4.93 6.7-4.93Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
