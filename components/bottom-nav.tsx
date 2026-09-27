"use client";

import Link from "next/link";
import { IconPlus, IconRoute, IconUserCircle } from "./icons";

const ITEMS = [
  { href: "/", label: "الرئيسية", icon: IconRoute },
  { href: "/post", label: "انشر رحلة", icon: IconPlus },
  { href: "/account", label: "حسابي", icon: IconUserCircle },
];

export function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-[440px] items-center justify-around border-t border-border bg-surface/95 py-2.5 backdrop-blur-sm"
      style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))" }}
    >
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 px-4 py-1 text-[11px] font-bold ${
              active ? "text-accent-dark" : "text-text-faint"
            }`}
          >
            <Icon size={21} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
