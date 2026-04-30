import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  useRegister,
  getGetCurrentUserQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { ArabesqueDivider, GeometricPattern } from "@/components/Pattern";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslation } from "@/lib/i18n";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const register = useRegister();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
    gender: "",
    country: "",
    bio: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.gender !== "male" && form.gender !== "female") {
      setError(t("register.selectGender"));
      return;
    }
    register.mutate(
      {
        data: {
          username: form.username.trim(),
          displayName: form.displayName.trim(),
          email: form.email.trim(),
          password: form.password,
          gender: form.gender as "male" | "female",
          country: form.country.trim() || undefined,
          bio: form.bio.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
          setLocation("/home");
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : t("register.failed"));
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <GeometricPattern opacity={0.06} />
      </div>
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle variant="outline" />
      </div>
      <div className="relative w-full max-w-lg">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block"><Logo /></Link>
        </div>
        <Card className="border-card-border">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div
                className="text-secondary text-lg mb-1"
                style={{ fontFamily: "var(--app-font-serif)" }}
              >
                {t("ar.joinMajlis")}
              </div>
              <h2
                className="text-2xl text-foreground"
                style={{ fontFamily: "var(--app-font-serif)" }}
              >
                {t("register.title")}
              </h2>
              <ArabesqueDivider className="mt-4" />
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">{t("register.username")}</Label>
                  <Input
                    id="username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="abu_abdillah"
                    minLength={3}
                    maxLength={32}
                    required
                    autoComplete="username"
                    data-testid="input-register-username"
                  />
                </div>
                <div>
                  <Label htmlFor="displayName">{t("register.displayName")}</Label>
                  <Input
                    id="displayName"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    placeholder="Abu 'Abdillah"
                    minLength={2}
                    maxLength={60}
                    required
                    data-testid="input-register-display-name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">{t("register.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={t("register.emailPlaceholder")}
                  maxLength={254}
                  required
                  autoComplete="email"
                  data-testid="input-register-email"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("register.emailHint")}
                </p>
              </div>
              <div>
                <Label htmlFor="password">{t("register.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={6}
                  required
                  autoComplete="new-password"
                  data-testid="input-register-password"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("register.passwordHint")}
                </p>
              </div>
              <div>
                <Label>{t("register.iAmA")}</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => setForm({ ...form, gender: v })}
                >
                  <SelectTrigger data-testid="select-gender">
                    <SelectValue placeholder={t("register.select")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male" data-testid="option-gender-male">
                      {t("common.brother")}
                    </SelectItem>
                    <SelectItem value="female" data-testid="option-gender-female">
                      {t("common.sister")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("register.genderHint")}
                </p>
              </div>
              <div>
                <Label htmlFor="country">{t("register.country")}</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder={t("register.countryPlaceholder")}
                  data-testid="input-register-country"
                />
              </div>
              <div>
                <Label htmlFor="bio">{t("register.bio")}</Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  maxLength={280}
                  placeholder={t("register.bioPlaceholder")}
                  data-testid="input-register-bio"
                />
              </div>
              {error && (
                <div className="text-sm text-destructive" data-testid="text-register-error">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={register.isPending}
                data-testid="button-register-submit"
              >
                {register.isPending
                  ? t("common.creatingAccount")
                  : t("common.createAccount")}
              </Button>
            </form>
            <p className="mt-6 text-sm text-center text-muted-foreground">
              {t("register.alreadyMember")}{" "}
              <Link href="/login" className="text-primary hover:underline" data-testid="link-to-login">
                {t("common.signIn")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
