import { useState } from "react";
import { Link } from "wouter";
import {
  useForgotPassword,
  useResetPassword,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { ArabesqueDivider, GeometricPattern } from "@/components/Pattern";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslation } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const forgot = useForgotPassword();
  const reset = useResetPassword();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"request" | "verify" | "done">("request");
  const [emailConfigured, setEmailConfigured] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const submitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    forgot.mutate(
      { data: { email: email.trim() } },
      {
        onSuccess: (resp) => {
          setEmailConfigured(resp.emailConfigured);
          setStep("verify");
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : t("forgot.failed"));
        },
      },
    );
  };

  const submitReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    reset.mutate(
      {
        data: {
          email: email.trim(),
          code: code.trim(),
          newPassword,
        },
      },
      {
        onSuccess: () => setStep("done"),
        onError: (err) => {
          setError(err instanceof Error ? err.message : t("forgot.failed"));
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <GeometricPattern opacity={0.06} />
      </div>
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle variant="outline" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <Logo />
          </Link>
        </div>
        <Card className="border-card-border">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2
                className="text-2xl text-foreground"
                style={{ fontFamily: "var(--app-font-serif)" }}
              >
                {t("forgot.title")}
              </h2>
              <ArabesqueDivider className="mt-4" />
            </div>

            {step === "request" && (
              <form onSubmit={submitRequest} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("forgot.intro")}
                </p>
                <div>
                  <Label htmlFor="email">{t("forgot.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    data-testid="input-forgot-email"
                  />
                </div>
                {error && (
                  <div
                    className="text-sm text-destructive"
                    data-testid="text-forgot-error"
                  >
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={forgot.isPending}
                  data-testid="button-forgot-send"
                >
                  {forgot.isPending ? t("forgot.sending") : t("forgot.send")}
                </Button>
              </form>
            )}

            {step === "verify" && (
              <form onSubmit={submitReset} className="space-y-4">
                <div
                  className="rounded-md border border-card-border bg-muted/30 p-3 text-sm"
                  data-testid="text-forgot-sent-notice"
                >
                  {emailConfigured
                    ? t("forgot.sentNotice")
                    : t("forgot.notConfiguredNotice")}
                </div>
                <div>
                  <Label htmlFor="code">{t("forgot.code")}</Label>
                  <Input
                    id="code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    minLength={6}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    required
                    autoFocus
                    data-testid="input-forgot-code"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">{t("forgot.newPassword")}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                    autoComplete="new-password"
                    data-testid="input-forgot-new-password"
                  />
                </div>
                {error && (
                  <div
                    className="text-sm text-destructive"
                    data-testid="text-forgot-error"
                  >
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={reset.isPending}
                  data-testid="button-forgot-reset"
                >
                  {reset.isPending ? t("forgot.resetting") : t("forgot.reset")}
                </Button>
              </form>
            )}

            {step === "done" && (
              <div
                className="text-center space-y-4"
                data-testid="text-forgot-success"
              >
                <p className="text-foreground">{t("forgot.success")}</p>
                <Link href="/login">
                  <Button className="w-full" data-testid="button-forgot-back-to-login">
                    {t("common.signIn")}
                  </Button>
                </Link>
              </div>
            )}

            {step !== "done" && (
              <p className="mt-6 text-sm text-center">
                <Link
                  href="/login"
                  className="text-primary hover:underline"
                  data-testid="link-forgot-back-to-login"
                >
                  {t("forgot.backToLogin")}
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
