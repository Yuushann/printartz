"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
  const [currentName, setCurrentName] = useState(name);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const remaining = Math.max(0, quota - used);
  const display = currentName || email || "Account";
  const initial = (display[0] || "?").toUpperCase();

  async function saveName() {
    const next = draft.trim();
    if (next.length < 1) {
      setErr("Name can't be empty.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErr(data.error ?? "Could not save.");
        return;
      }
      setCurrentName(next);
      setEditing(false);
    } catch {
      setErr("Network error — try again.");
    } finally {
      setSaving(false);
    }
  }

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
            <div className="min-w-0 flex-1">
              {editing ? (
                <div className="space-y-2">
                  <Label htmlFor="pf-name" className="text-xs">Name</Label>
                  <input
                    id="pf-name"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveName} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditing(false); setDraft(currentName ?? ""); setErr(null); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{currentName || "—"}</p>
                    <p className="text-muted-foreground truncate">{email}</p>
                  </div>
                  <button type="button" onClick={() => { setDraft(currentName ?? ""); setEditing(true); }} className="text-muted-foreground hover:text-foreground ml-auto text-xs underline">
                    Edit
                  </button>
                </div>
              )}
              {err && <p className="text-destructive mt-1 text-xs">{err}</p>}
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
