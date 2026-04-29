import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { ArrowRight, BookOpen, Users, Video, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { GeometricPattern, ArabesqueDivider } from "@/components/Pattern";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { t, lang } = useTranslation();

  useEffect(() => {
    if (!isLoading && user) setLocation("/home");
  }, [user, isLoading, setLocation]);

  const features = [
    {
      icon: BookOpen,
      titleKey: "landing.feature.libraryTitle",
      bodyKey: "landing.feature.libraryBody",
      key: "library",
    },
    {
      icon: Video,
      titleKey: "landing.feature.sittingsTitle",
      bodyKey: "landing.feature.sittingsBody",
      key: "sittings",
    },
    {
      icon: Users,
      titleKey: "landing.feature.halaqahTitle",
      bodyKey: "landing.feature.halaqahBody",
      key: "halaqah",
    },
    {
      icon: GraduationCap,
      titleKey: "landing.feature.testsTitle",
      bodyKey: "landing.feature.testsBody",
      key: "tests",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="px-6 lg:px-10 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <Logo />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Button asChild variant="ghost" data-testid="button-landing-login">
            <Link href="/login">{t("common.signIn")}</Link>
          </Button>
          <Button asChild data-testid="button-landing-register">
            <Link href="/register">{t("common.createAccount")}</Link>
          </Button>
        </div>
      </header>

      <section className="relative px-6 lg:px-10 pt-12 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <GeometricPattern opacity={0.07} />
        </div>
        <div className="relative max-w-5xl mx-auto text-center">
          <div
            className="text-secondary text-2xl lg:text-3xl mb-4"
            style={{ fontFamily: "var(--app-font-serif)" }}
            data-testid="text-hero-arabic"
          >
            {t("ar.majlisFull")}
          </div>
          <h1
            className="text-4xl lg:text-6xl leading-tight text-foreground"
            style={{ fontFamily: "var(--app-font-serif)" }}
            data-testid="text-hero-title"
          >
            {t("landing.heroTitleLine1")}
            <br />
            <span className="text-primary">
              {t("landing.heroTitleLine2")}
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("landing.heroBody")}
          </p>
          <ArabesqueDivider className="my-10 max-w-md mx-auto" />
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="gap-2" data-testid="button-hero-join">
              <Link href="/register">
                {t("landing.enterMajlis")}{" "}
                <ArrowRight className={lang === "ar" ? "h-4 w-4 rotate-180" : "h-4 w-4"} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" data-testid="button-hero-login">
              <Link href="/login">{t("landing.iHaveAccount")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-10 py-16 bg-card/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div
              className="text-secondary text-xl mb-2"
              style={{ fontFamily: "var(--app-font-serif)" }}
            >
              {t("ar.whatYoullFind")}
            </div>
            <h2
              className="text-3xl text-foreground"
              style={{ fontFamily: "var(--app-font-serif)" }}
            >
              {t("landing.featuresHeading")}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Card
                  key={f.key}
                  className="border-card-border"
                  data-testid={`card-feature-${f.key}`}
                >
                  <CardContent className="p-6 flex gap-4">
                    <div className="h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{t(f.titleKey)}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t(f.bodyKey)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-10 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote
            className="text-2xl text-foreground leading-relaxed"
            style={{ fontFamily: "var(--app-font-serif)" }}
            data-testid="text-quote"
          >
            {t("landing.quote")}
          </blockquote>
          <div className="mt-3 text-sm text-muted-foreground">
            {t("landing.quoteSource")}
          </div>
          <ArabesqueDivider className="mt-10 max-w-sm mx-auto" />
          <Button asChild size="lg" className="mt-10" data-testid="button-cta-bottom">
            <Link href="/register">{t("landing.beginJourney")}</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        {t("app.footer")}
      </footer>
    </div>
  );
}
