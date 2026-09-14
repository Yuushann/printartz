"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function ProfileMenu({
  name,
  email,
  image,
  used,
  quota,
}: {
  name: string | null;
  email: string | null;
  image: string | null;
  used: number;
  quota: number;
}) {
  const [open, setOpen] = useState(false);
  const remaining = Math.max(0, quota - used);
  const display = name || email || "Account";
  const initial = (display[0] || "?").toUpperCase();

  const Avatar = ({ size }: { size: string }) =>
    image ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt="" className={`${size} rounded-full object-cover`} />
    ) : (
      <span className={`${size} bg-primary text-primary-foreground flex items-center justify-center rounded-full text-sm font-bold`}>
        {initial}
      </span>
    );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-border hover:bg-accent flex items-center gap-2 rounded-full border px-2 py-1 text-sm font-medium transition-colors"
        aria-label="Open profile"
      >
        <Avatar size="h-6 w-6" />
        <span className="hidden max-w-[140px] truncate sm:inline">{display}</span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Your profile">
        <div className="space-y-5 text-sm">
          <div className="flex items-center gap-3">
            <Avatar size="h-12 w-12" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{name || "—"}</p>
              <p className="text-muted-foreground truncate">{email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-accent/50 rounded-xl border p-3 text-center">
              <p className="text-2xl font-bold">{used}</p>
              <p className="text-muted-foreground text-xs">Generated</p>
            </div>
            <div className="bg-accent/50 rounded-xl border p-3 text-center">
              <p className="text-2xl font-bold">{remaining}</p>
              <p className="text-muted-foreground text-xs">Free left</p>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={() => signOut({ callbackUrl: "/" })}>
            Sign out
          </Button>
        </div>
      </Modal>
    </>
  );
}
