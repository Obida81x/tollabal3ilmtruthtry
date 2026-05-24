import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  MessagesSquare,
  Users,
  BookOpen,
  GraduationCap,
  Video,
  Newspaper,
  LogOut,
  UserCircle,
  Shield,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLogout, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Logo } from "@/components/Logo";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { Button } from "@/components/ui/button";
import { GeometricPattern } from "@/components/Pattern";
import { LanguageToggle } from "@/components/LanguageToggle";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const logout = useLogout();
  const { t } = useTranslation();

  const navItems = [
    { path: "/home", labelKey: "nav.dashboard", icon: Home, testId: "link-nav-home" },
    { path: "/feed", labelKey: "nav.feed", icon: Newspaper, testId: "link-nav-feed" },
    { path: "/halaqah", labelKey: "nav.halaqah", icon: MessagesSquare, testId: "link-nav-halaqah" },
    { path: "/sessions", labelKey: "nav.sessions", icon: Video, testId: "link-nav-sessions" },
    { path: "/library", labelKey: "nav.library", icon: BookOpen, testId: "link-nav-library" },
    { path: "/tests", labelKey: "nav.tests", icon: GraduationCap, testId: "link-nav-tests" },
    { path: "/members", labelKey: "nav.members", icon: Users, testId: "link-nav-members" },
    ...(user?.isAdmin
      ? [{ path: "/admin", labelKey: "nav.admin", icon: Shield, testId: "link-nav-admin" }]
      : []),
  ];

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        setLocation("/");
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-72 flex-col border-r border-border bg-sidebar text-sidebar-foreground relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <GeometricPattern opacity={0.05} />
          </div>
          <div className="relative px-6 pt-6 pb-4 border-b border-sidebar-border flex items-center justify-between gap-2">
            <Link href={user ? "/home" : "/"} data-testid="link-home-logo">
              <Logo size="md" />
            </Link>
            <LanguageToggle />
          </div>
          <nav className="relative flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location === item.path || location.startsWith(item.path + "/");
              return (
                <Link key={item.path} href={item.path} data-testid={item.testId}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent",
                    )}>
                    <Icon className="h-4 w-4" />
                    <span>{t(item.labelKey)}</span>
                  </Link>
              );
            })}
          </nav>
          <div className="relative border-t border-sidebar-border p-3">
            {user ? (
              <div className="space-y-2">
                <Link href={`/profile/${user.id}`} data-testid="link-current-profile"
                    className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-sidebar-accent transition-colors">
                    <InitialsAvatar name={user.displayName} size="md" testId="avatar-current" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium" data-testid="text-current-name">
                        {user.displayName}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        @{user.username}
                      </div>
                    </div>
                  </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4" />
                  {t("common.signOut")}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button asChild className="w-full" data-testid="button-sidebar-login">
                  <Link href="/login">{t("common.signIn")}</Link>
                </Button>
                <Button asChild variant="outline" className="w-full" data-testid="button-sidebar-register">
                  <Link href="/register">{t("common.createAccount")}</Link>
                </Button>
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="lg:hidden flex items-center justify-between border-b border-border px-4 py-3 bg-card">
            <Link href={user ? "/home" : "/"}><Logo size="sm" showWordmark={false} /></Link>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              {user ? (
                <Link href={`/profile/${user.id}`} data-testid="link-mobile-profile">
                    <InitialsAvatar name={user.displayName} size="sm" />
                  </Link>
              ) : (
                <>
                  <Button asChild size="sm" variant="ghost"><Link href="/login">{t("common.signIn")}</Link></Button>
                  <Button asChild size="sm"><Link href="/register">{t("common.join")}</Link></Button>
                </>
              )}
            </div>
          </header>

          {/* Mobile bottom nav */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex justify-around py-2">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const active = location === item.path || location.startsWith(item.path + "/");
              return (
                <Link key={item.path} href={item.path} data-testid={`mobile-${item.testId}`}
                    className={cn(
                      "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]",
                      active ? "text-primary" : "text-muted-foreground",
                    )}>
                    <Icon className="h-5 w-5" />
                    <span>{t(item.labelKey)}</span>
                  </Link>
              );
            })}
          </nav>

          <main className="flex-1 pb-20 lg:pb-0">{children}</main>

          <footer className="hidden lg:flex items-center justify-center gap-2 border-t border-border py-4 text-xs text-muted-foreground">
            <UserCircle className="h-3 w-3" />
            <span>{t("app.footer")}</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
