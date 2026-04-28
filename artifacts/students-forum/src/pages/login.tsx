import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  useLogin,
  getGetCurrentUserQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { ArabesqueDivider, GeometricPattern } from "@/components/Pattern";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const login = useLogin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    login.mutate(
      { data: { username: username.trim(), password } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
          setLocation("/home");
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Sign in failed");
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <GeometricPattern opacity={0.06} />
      </div>
      <div className="relative w-full max-w-md">
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
                أهلاً بكم
              </div>
              <h2
                className="text-2xl text-foreground"
                style={{ fontFamily: "var(--app-font-serif)" }}
              >
                Welcome back to the majlis
              </h2>
              <ArabesqueDivider className="mt-4" />
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your username"
                  required
                  autoFocus
                  data-testid="input-login-username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-login-password"
                />
              </div>
              {error && (
                <div className="text-sm text-destructive" data-testid="text-login-error">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={login.isPending}
                data-testid="button-login-submit"
              >
                {login.isPending ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <p className="mt-6 text-sm text-center text-muted-foreground">
              New here?{" "}
              <Link href="/register" className="text-primary hover:underline" data-testid="link-to-register">
                  Create an account
                </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
