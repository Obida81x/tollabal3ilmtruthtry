import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { GeometricPattern, ArabesqueDivider } from "@/components/Pattern";
import { LanguageToggle } from "@/components/LanguageToggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/lib/i18n";

export default function SupportContactPage() {
  const { t, lang } = useTranslation();
  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;

  const [form, setForm] = useState({
    username: "",
    email: "",
    subject: "login",
    message: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.username.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          subject: t(`support.subjectOptions.${form.subject}` as Parameters<typeof t>[0]),
          message: form.message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to send message.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <Link href="/" className="inline-block"><Logo /></Link>
        </div>
        <Card className="border-card-border">
          <CardContent className="p-8">
            {success ? (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2
                  className="text-2xl text-foreground mb-2"
                  style={{ fontFamily: "var(--app-font-serif)" }}
                >
                  {t("support.success")}
                </h2>
                <ArabesqueDivider className="my-4" />
                <Link href="/login">
                  <Button variant="outline" className="gap-2">
                    <BackIcon className="h-4 w-4" />
                    {t("support.backToLogin")}
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2
                    className="text-2xl text-foreground"
                    style={{ fontFamily: "var(--app-font-serif)" }}
                  >
                    {t("support.title")}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t("support.subtitle")}
                  </p>
                  <ArabesqueDivider className="mt-4" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="sup-username">{t("support.fieldUsername")}</Label>
                    <Input
                      id="sup-username"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      required
                      data-testid="input-support-username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sup-email">{t("support.fieldEmail")}</Label>
                    <Input
                      id="sup-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      data-testid="input-support-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sup-subject">{t("support.fieldSubject")}</Label>
                    <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                      <SelectTrigger id="sup-subject">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="login">{t("support.subjectOptions.login")}</SelectItem>
                        <SelectItem value="email">{t("support.subjectOptions.email")}</SelectItem>
                        <SelectItem value="account">{t("support.subjectOptions.account")}</SelectItem>
                        <SelectItem value="other">{t("support.subjectOptions.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sup-message">{t("support.fieldMessage")}</Label>
                    <Textarea
                      id="sup-message"
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                      data-testid="input-support-message"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <Button type="submit" className="w-full gap-2" disabled={loading} data-testid="button-support-submit">
                    {loading ? (
                      t("support.submitting")
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {t("support.submit")}
                      </>
                    )}
                  </Button>
                </form>

                <p className="mt-4 text-sm text-center">
                  <Link href="/login" className="text-primary hover:underline">
                    <span className="inline-flex items-center gap-1">
                      <BackIcon className="h-3 w-3" />
                      {t("support.backToLogin")}
                    </span>
                  </Link>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
