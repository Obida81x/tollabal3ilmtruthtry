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

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const register = useRegister();
  const [form, setForm] = useState({
    username: "",
    displayName: "",
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
      setError("Please select your gender (used to assign halaqah groups).");
      return;
    }
    register.mutate(
      {
        data: {
          username: form.username.trim(),
          displayName: form.displayName.trim(),
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
          setError(err instanceof Error ? err.message : "Registration failed");
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <GeometricPattern opacity={0.06} />
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
                انضم إلى المجلس
              </div>
              <h2
                className="text-2xl text-foreground"
                style={{ fontFamily: "var(--app-font-serif)" }}
              >
                Create your account
              </h2>
              <ArabesqueDivider className="mt-4" />
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="abu_abdillah"
                    minLength={3}
                    maxLength={32}
                    required
                    data-testid="input-register-username"
                  />
                </div>
                <div>
                  <Label htmlFor="displayName">Display name</Label>
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={6}
                  required
                  data-testid="input-register-password"
                />
                <p className="text-xs text-muted-foreground mt-1">At least 6 characters.</p>
              </div>
              <div>
                <Label>I am a</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => setForm({ ...form, gender: v })}
                >
                  <SelectTrigger data-testid="select-gender">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male" data-testid="option-gender-male">Brother</SelectItem>
                    <SelectItem value="female" data-testid="option-gender-female">Sister</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Used to place you in the brothers' or sisters' halaqah.
                </p>
              </div>
              <div>
                <Label htmlFor="country">Country (optional)</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="e.g. Egypt"
                  data-testid="input-register-country"
                />
              </div>
              <div>
                <Label htmlFor="bio">A short note (optional)</Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  maxLength={280}
                  placeholder="Tell the brothers and sisters a little about yourself."
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
                {register.isPending ? "Creating account…" : "Create account"}
              </Button>
            </form>
            <p className="mt-6 text-sm text-center text-muted-foreground">
              Already a member?{" "}
              <Link href="/login" className="text-primary hover:underline" data-testid="link-to-login">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
