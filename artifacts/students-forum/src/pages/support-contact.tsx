import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Send, CheckCircle, Mail, MessageCircle, AlertCircle } from "lucide-react";
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
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;

type Tab = "email" | "chat";

interface ChatMessage {
  text: string;
  sentAt: string;
  fromUser: boolean;
}

export default function SupportContactPage() {
  const { t, lang } = useTranslation();
  const { user } = useAuth();
  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;

  const [activeTab, setActiveTab] = useState<Tab>("email");

  // --- Email form state ---
  const [form, setForm] = useState({
    username: user?.displayName ?? user?.username ?? "",
    email: "",
    subject: "login",
    message: "",
  });
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // --- Direct chat state ---
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    if (!form.username.trim() || !form.email.trim() || !form.message.trim()) {
      setEmailError("Please fill in all required fields.");
      return;
    }
    setEmailLoading(true);
    try {
      const res = await fetch(`${API_BASE}/support/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          subject: t(`support.subjectOptions.${form.subject}` as Parameters<typeof t>[0]),
          message: form.message.trim(),
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setEmailError(data.error ?? "Failed to send message.");
      } else {
        setEmailSuccess(true);
      }
    } catch {
      setEmailError("Network error. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = chatInput.trim();
    if (!msg) return;
    setChatError(null);
    setChatSending(true);
    const newMsg: ChatMessage = { text: msg, sentAt: new Date().toISOString(), fromUser: true };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");
    try {
      const body: Record<string, string> = { message: msg };
      if (!user) {
        // anonymous user needs to provide their info
        body.username = form.username || "Anonymous";
        body.email = form.email || "";
      }
      const res = await fetch(`${API_BASE}/support/admin-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setChatError(data.error ?? "Failed to send message.");
        // Remove the failed message
        setChatMessages((prev) => prev.filter((m) => m !== newMsg));
        setChatInput(msg);
      }
    } catch {
      setChatError("Network error. Please try again.");
      setChatMessages((prev) => prev.filter((m) => m !== newMsg));
      setChatInput(msg);
    } finally {
      setChatSending(false);
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
            {emailSuccess && activeTab === "email" ? (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2
                  className="text-2xl text-foreground mb-2"
                  style={{ fontFamily: "var(--app-font-serif)" }}
                >
                  {t("support.success")}
                </h2>
                <ArabesqueDivider className="my-4" />
                <div className="flex flex-col gap-2 items-center">
                  <Button variant="outline" onClick={() => setEmailSuccess(false)} className="gap-2">
                    <Send className="h-4 w-4" /> Send another message
                  </Button>
                  <Link href="/login">
                    <Button variant="ghost" className="gap-2">
                      <BackIcon className="h-4 w-4" />
                      {t("support.backToLogin")}
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2
                    className="text-2xl text-foreground"
                    style={{ fontFamily: "var(--app-font-serif)" }}
                  >
                    Technical Support
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Choose how you'd like to reach us
                  </p>
                  <ArabesqueDivider className="mt-4" />
                </div>

                {/* Tab switcher */}
                <div className="flex rounded-lg border border-border overflow-hidden mb-6">
                  <button
                    onClick={() => setActiveTab("email")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors",
                      activeTab === "email"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent",
                    )}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </button>
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors",
                      activeTab === "chat"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent",
                    )}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Direct Message
                  </button>
                </div>

                {/* Email tab */}
                {activeTab === "email" && (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                          <SelectItem value="technical">Technical problem</SelectItem>
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
                    {emailError && (
                      <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {emailError}
                      </div>
                    )}
                    <Button type="submit" className="w-full gap-2" disabled={emailLoading} data-testid="button-support-submit">
                      {emailLoading ? (
                        t("support.submitting")
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          {t("support.submit")}
                        </>
                      )}
                    </Button>
                  </form>
                )}

                {/* Direct chat tab */}
                {activeTab === "chat" && (
                  <div className="space-y-3">
                    {/* Anon user needs name/email for chat too */}
                    {!user && chatMessages.length === 0 && (
                      <div className="space-y-3 pb-2 border-b border-border mb-3">
                        <p className="text-xs text-muted-foreground">Please provide your contact details so we can reply:</p>
                        <div>
                          <Label htmlFor="chat-username">Your name</Label>
                          <Input
                            id="chat-username"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            placeholder="Name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="chat-email">Your email</Label>
                          <Input
                            id="chat-email"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                    )}

                    {/* Chat messages */}
                    <div className="min-h-[180px] max-h-[300px] overflow-y-auto space-y-3 rounded-lg bg-muted/40 border border-border p-3">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground py-8">
                          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                          <p>Type a message to contact the admin directly.</p>
                          <p className="text-xs mt-1">Your message will be forwarded by email and the admin will reply to you.</p>
                        </div>
                      ) : (
                        <>
                          {chatMessages.map((m, i) => (
                            <div key={i} className="flex justify-end">
                              <div className="max-w-[80%] bg-primary text-primary-foreground rounded-lg rounded-tr-sm px-3 py-2 text-sm">
                                <p>{m.text}</p>
                                <p className="text-[10px] opacity-60 mt-1 text-right">
                                  {new Date(m.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div className="text-center text-xs text-muted-foreground py-2 italic">
                            ✓ Message delivered to admin
                          </div>
                        </>
                      )}
                    </div>

                    {chatError && (
                      <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {chatError}
                      </div>
                    )}

                    <form onSubmit={handleChatSend} className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type your message..."
                        disabled={chatSending}
                        maxLength={2000}
                      />
                      <Button type="submit" size="icon" disabled={!chatInput.trim() || chatSending} data-testid="button-chat-send">
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                )}

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
