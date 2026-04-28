import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { ArrowRight, BookOpen, Users, Video, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { GeometricPattern, ArabesqueDivider } from "@/components/Pattern";
import { useAuth } from "@/lib/auth";

const features = [
  {
    icon: BookOpen,
    title: "A library of beneficial books",
    body: "Classical works of Aqeedah, Hadith, Tafsir, and Fiqh — available to read and download.",
  },
  {
    icon: Video,
    title: "Live & recorded sittings",
    body: "Attend scholarly halaqahs as they happen, or revisit recorded explanations on your time.",
  },
  {
    icon: Users,
    title: "Brothers' & sisters' halaqahs",
    body: "Quiet, focused chat circles for sincere companionship in seeking knowledge.",
  },
  {
    icon: GraduationCap,
    title: "Aqeedah tests on the Salafi creed",
    body: "Test your understanding with carefully written multiple-choice questions and explanations.",
  },
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) setLocation("/home");
  }, [user, isLoading, setLocation]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="px-6 lg:px-10 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <Logo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" data-testid="button-landing-login">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild data-testid="button-landing-register">
            <Link href="/register">Create account</Link>
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
            مَجْلِسُ طُلَّابِ العِلْمِ
          </div>
          <h1
            className="text-4xl lg:text-6xl leading-tight text-foreground"
            style={{ fontFamily: "var(--app-font-serif)" }}
            data-testid="text-hero-title"
          >
            A quiet majlis for seekers of knowledge,
            <br />
            <span className="text-primary">grounded in the Salafi methodology.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            A gathering place for students of Islamic law from around the world — to study
            authentic books, attend scholarly sittings, and benefit one another upon what
            the Prophet ﷺ and his Companions were upon.
          </p>
          <ArabesqueDivider className="my-10 max-w-md mx-auto" />
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="gap-2" data-testid="button-hero-join">
              <Link href="/register">
                Enter the majlis <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" data-testid="button-hero-login">
              <Link href="/login">I have an account</Link>
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
              ما تجده هنا
            </div>
            <h2
              className="text-3xl text-foreground"
              style={{ fontFamily: "var(--app-font-serif)" }}
            >
              What you will find here
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} className="border-card-border" data-testid={`card-feature-${f.title.toLowerCase().replace(/\s+/g, "-")}`}>
                  <CardContent className="p-6 flex gap-4">
                    <div className="h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
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
            “Whoever takes a path in pursuit of knowledge, Allah will make easy for him a
            path to Paradise.”
          </blockquote>
          <div className="mt-3 text-sm text-muted-foreground">— Sahih Muslim</div>
          <ArabesqueDivider className="mt-10 max-w-sm mx-auto" />
          <Button asChild size="lg" className="mt-10" data-testid="button-cta-bottom">
            <Link href="/register">Begin the journey</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Students of Islamic Law Forum · A quiet majlis for seekers of knowledge
      </footer>
    </div>
  );
}
