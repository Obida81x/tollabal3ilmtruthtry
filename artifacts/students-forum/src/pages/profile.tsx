import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, ArrowRight, MapPin, Calendar, Pencil, ShieldCheck, Key, Mail, UserCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetUser,
  getGetUserQueryKey,
  useUpdateMyProfile,
  getGetCurrentUserQueryKey,
} from "@workspace/api-client-react";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { Badge } from "@/components/ui/badge";
import { ArabesqueDivider } from "@/components/Pattern";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

// ─── Change Password Dialog ───────────────────────────────────────────────────

function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep(1); setCode(""); setNewPwd(""); setConfirmPwd("");
      setError(null); setCodeSent(false); setSuccess(false);
    }
  }, [open]);

  const requestCode = async () => {
    setError(null); setLoading(true);
    try {
      const res = await fetch("/api/auth/request-password-change", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to send code"); return; }
      setCodeSent(true); setStep(2);
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  const confirmChange = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (newPwd !== confirmPwd) { setError(t("security.passwordMismatch")); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/confirm-password-change", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to change password"); return; }
      setSuccess(true);
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--app-font-serif)" }}>{t("security.changePassword")}</DialogTitle>
        </DialogHeader>
        {success ? (
          <div className="py-6 text-center text-primary font-medium">{t("security.passwordChanged")}</div>
        ) : step === 1 ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">{t("security.step1Password")}</p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
              <Button onClick={requestCode} disabled={loading}>
                {loading ? t("security.sendingCode") : t("security.sendCode")}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={confirmChange} className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">{t("security.step2Password")}</p>
            {codeSent && <p className="text-xs text-primary">{t("security.codeSent")}</p>}
            <div>
              <Label>{t("security.code")}</Label>
              <Input value={code} onChange={e => setCode(e.target.value)} required autoFocus inputMode="numeric" maxLength={6} />
            </div>
            <div>
              <Label>{t("security.newPassword")}</Label>
              <Input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required minLength={8} />
            </div>
            <div>
              <Label>{t("security.confirmPassword")}</Label>
              <Input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required minLength={8} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={loading}>{loading ? "…" : t("security.changePassword")}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Change Email Dialog ──────────────────────────────────────────────────────

function ChangeEmailDialog({ open, onOpenChange, currentEmail, onSuccess }: { open: boolean; onOpenChange: (o: boolean) => void; currentEmail: string; onSuccess: () => void }) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) { setStep(1); setNewEmail(""); setCode(""); setError(null); setSuccess(false); }
  }, [open]);

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const res = await fetch("/api/auth/request-email-change", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: newEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to send code"); return; }
      setStep(2);
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  const confirmChange = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const res = await fetch("/api/auth/confirm-email-change", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to change email"); return; }
      setSuccess(true); onSuccess();
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--app-font-serif)" }}>{t("security.changeEmail")}</DialogTitle>
        </DialogHeader>
        {success ? (
          <div className="py-6 text-center text-primary font-medium">{t("security.emailChanged")}</div>
        ) : step === 1 ? (
          <form onSubmit={requestCode} className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">{t("security.step1Email")}</p>
            <p className="text-xs text-muted-foreground">Current: <span className="font-medium">{currentEmail}</span></p>
            <div>
              <Label>{t("security.newEmail")}</Label>
              <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required autoFocus />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={loading}>{loading ? t("security.sendingCode") : t("security.sendCode")}</Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={confirmChange} className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">{t("security.step2Email")}</p>
            <p className="text-xs text-primary">{t("security.codeSent")}</p>
            <div>
              <Label>{t("security.code")}</Label>
              <Input value={code} onChange={e => setCode(e.target.value)} required autoFocus inputMode="numeric" maxLength={6} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={loading}>{loading ? "…" : t("security.changeEmail")}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Apply to Admin Dialog ────────────────────────────────────────────────────

function ApplyAdminDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const [form, setForm] = useState({ fullName: "", age: "", email: "", reasons: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open && me) { setForm(f => ({ ...f, fullName: me.displayName ?? "", email: me.email ?? "" })); setError(null); setSuccess(false); }
  }, [open, me]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    const age = Number(form.age);
    if (!age || age < 14 || age > 120) { setError("Please enter a valid age (14–120)."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin-applications", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: form.fullName, age, contactEmail: form.email, reasons: form.reasons, notes: form.notes || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Submission failed"); return; }
      setSuccess(true);
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--app-font-serif)" }}>{t("apply.title")}</DialogTitle>
        </DialogHeader>
        {success ? (
          <div className="py-8 text-center text-primary font-medium">{t("apply.success")}</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">{t("apply.description")}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("apply.fieldFullName")}</Label>
                <Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div>
                <Label>{t("apply.fieldAge")}</Label>
                <Input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} min="14" max="120" required />
              </div>
            </div>
            <div>
              <Label>{t("apply.fieldEmail")}</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <Label>{t("apply.fieldReasons")}</Label>
              <Textarea rows={4} value={form.reasons} onChange={e => setForm({ ...form, reasons: e.target.value })} required minLength={10} />
            </div>
            <div>
              <Label>{t("apply.fieldNotes")}</Label>
              <Textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={loading}>{loading ? t("apply.submitting") : t("apply.submit")}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  useRequireAuth();
  const { user: me, refresh } = useAuth();
  const { t, lang } = useTranslation();
  const [, params] = useRoute<{ id: string }>("/profile/:id");
  const id = params?.id ? Number(params.id) : 0;
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useGetUser(id, {
    query: { enabled: !!id, queryKey: getGetUserQueryKey(id) },
  });
  const updateProfile = useUpdateMyProfile();

  const isOwn = !!me && !!user && me.id === user.id;
  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;

  // Edit profile dialog
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ displayName: "", email: "", country: "", bio: "", avatarUrl: "" });
  const [error, setError] = useState<string | null>(null);

  // Security dialogs
  const [pwdOpen, setPwdOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    if (open && user) {
      setForm({ displayName: user.displayName ?? "", email: user.email ?? "", country: user.country ?? "", bio: user.bio ?? "", avatarUrl: user.avatarUrl ?? "" });
      setError(null);
    }
  }, [open, user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    updateProfile.mutate(
      { data: { displayName: form.displayName.trim(), email: form.email.trim() || undefined, country: form.country.trim() || null, bio: form.bio.trim() || null, avatarUrl: form.avatarUrl.trim() || null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
          refresh(); setOpen(false);
        },
        onError: (err) => setError(err instanceof Error ? err.message : t("profile.saveFailed")),
      },
    );
  };

  return (
    <AppLayout>
      <div className="px-6 lg:px-10 py-8 max-w-3xl mx-auto">
        <Link href="/members" data-testid="link-back-members">
          <Button variant="ghost" size="sm" className="gap-1 mb-4">
            <BackIcon className="h-4 w-4" /> {t("members.allMembers")}
          </Button>
        </Link>
        {isLoading && <Skeleton className="h-64 w-full" />}
        {user && (
          <>
            <Card className="border-card-border">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <InitialsAvatar name={user.displayName} size="xl" />
                  <h1 className="text-3xl text-foreground mt-4" style={{ fontFamily: "var(--app-font-serif)" }} data-testid="text-profile-name">
                    {user.displayName}
                  </h1>
                  <div className="text-sm text-muted-foreground mt-1">@{user.username}</div>
                  <Badge variant="secondary" className="mt-3" data-testid="badge-profile-gender">
                    {user.gender === "male" ? t("common.brother") : t("common.sister")}
                  </Badge>
                  {isOwn && (
                    <div className="flex gap-2 mt-4 flex-wrap justify-center">
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)} data-testid="button-edit-profile">
                        <Pencil className="h-4 w-4" /> {t("profile.editButton")}
                      </Button>
                      {!user.isAdmin && (
                        <Button variant="outline" size="sm" className="gap-2 border-secondary text-secondary hover:bg-secondary/10" onClick={() => setApplyOpen(true)} data-testid="button-apply-admin">
                          <ShieldCheck className="h-4 w-4" /> {t("apply.button")}
                        </Button>
                      )}
                    </div>
                  )}
                  <ArabesqueDivider className="my-6 w-full max-w-xs" />
                  <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
                    {user.country && (
                      <div className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {user.country}
                      </div>
                    )}
                    <div className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4" />{" "}
                      {t("profile.joined", { date: formatDateTime(user.createdAt, lang === "ar" ? "ar" : undefined, t("common.tba")) })}
                    </div>
                  </div>
                  {user.bio && (
                    <p className="mt-6 text-foreground leading-relaxed max-w-xl" style={{ fontFamily: "var(--app-font-serif)", fontSize: "1.1rem" }} data-testid="text-profile-bio">
                      {user.bio}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Settings — only shown to profile owner */}
            {isOwn && (
              <Card className="border-card-border mt-4">
                <CardContent className="p-6">
                  <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--app-font-serif)" }}>
                    <Key className="h-4 w-4 text-muted-foreground" />
                    {t("security.settings")}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setPwdOpen(true)} data-testid="button-change-password">
                      <Key className="h-4 w-4" /> {t("security.changePassword")}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setEmailOpen(true)} data-testid="button-change-email">
                      <Mail className="h-4 w-4" /> {t("security.changeEmail")}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {user.email && (
                      <span className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3" /> {user.email}
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Edit Profile Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("profile.editTitle")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="edit-displayName">{t("profile.fieldDisplayName")}</Label>
                <Input id="edit-displayName" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} minLength={2} maxLength={60} required data-testid="input-edit-display-name" />
              </div>
              <div>
                <Label htmlFor="edit-country">{t("profile.fieldCountry")}</Label>
                <Input id="edit-country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} data-testid="input-edit-country" />
              </div>
              <div>
                <Label htmlFor="edit-bio">{t("profile.fieldBio")}</Label>
                <Textarea id="edit-bio" rows={3} maxLength={280} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} data-testid="input-edit-bio" />
              </div>
              <div>
                <Label htmlFor="edit-avatar">{t("profile.fieldAvatar")}</Label>
                <Input id="edit-avatar" type="url" value={form.avatarUrl} onChange={e => setForm({ ...form, avatarUrl: e.target.value })} placeholder="https://" data-testid="input-edit-avatar" />
              </div>
              {error && <div className="text-sm text-destructive" data-testid="text-edit-profile-error">{error}</div>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-edit-profile-cancel">{t("common.cancel")}</Button>
                <Button type="submit" disabled={updateProfile.isPending} data-testid="button-edit-profile-save">
                  {updateProfile.isPending ? t("profile.saving") : t("profile.save")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Security Dialogs */}
        <ChangePasswordDialog open={pwdOpen} onOpenChange={setPwdOpen} />
        <ChangeEmailDialog
          open={emailOpen}
          onOpenChange={setEmailOpen}
          currentEmail={user?.email ?? ""}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(id) });
            queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
            refresh();
          }}
        />
        <ApplyAdminDialog open={applyOpen} onOpenChange={setApplyOpen} />
      </div>
    </AppLayout>
  );
}
