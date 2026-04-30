import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ForgotPasswordPage from "@/pages/forgot-password";
import HomePage from "@/pages/home";
import FeedPage from "@/pages/feed";
import HalaqahListPage from "@/pages/halaqah";
import HalaqahRoomPage from "@/pages/halaqah-room";
import SessionsPage from "@/pages/sessions";
import SessionDetailPage from "@/pages/session-detail";
import LibraryPage from "@/pages/library";
import BookDetailPage from "@/pages/book-detail";
import TestsPage from "@/pages/tests";
import TestDetailPage from "@/pages/test-detail";
import MembersPage from "@/pages/members";
import ProfilePage from "@/pages/profile";
import AdminPage from "@/pages/admin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Routes() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/home" component={HomePage} />
      <Route path="/feed" component={FeedPage} />
      <Route path="/halaqah" component={HalaqahListPage} />
      <Route path="/halaqah/:id" component={HalaqahRoomPage} />
      <Route path="/sessions" component={SessionsPage} />
      <Route path="/sessions/:id" component={SessionDetailPage} />
      <Route path="/library" component={LibraryPage} />
      <Route path="/library/:id" component={BookDetailPage} />
      <Route path="/tests" component={TestsPage} />
      <Route path="/tests/:id" component={TestDetailPage} />
      <Route path="/members" component={MembersPage} />
      <Route path="/profile/:id" component={ProfilePage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Routes />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
