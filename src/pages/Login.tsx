import { ArrowRight, Eye, EyeOff, KeyRound, LockKeyhole, Mail, Map, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { BrandMark } from "../components/layout/AppShell";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { user, signIn, register, cloudEnabled } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (user) return <Navigate to="/home" replace />;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (mode === "login") await signIn(email, password);
      else await register(email, password, inviteCode, name);
      navigate("/home");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We couldn't open your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual" aria-hidden="true">
        <img src="./memories/weekend-walk.png" alt="" />
        <div className="login-visual__wash" />
        <div className="login-map-card">
          <span><Map size={18} /></span>
          <div><strong>8 years, mapped.</strong><small>Every place has a story.</small></div>
        </div>
      </section>
      <section className="login-form-wrap">
        <BrandMark />
        <form className="login-form" onSubmit={submit}>
          <div className="login-copy"><p className="page-kicker">PRIVATE FRIEND JOURNAL</p><h1>{mode === "login" ? "Welcome back" : "Join your circle"}</h1><p>{mode === "login" ? "Return to the moments that made you, you." : "Create an account with the private invitation you received."}</p></div>
          <div className="auth-switch" role="tablist" aria-label="Account action"><button type="button" className={mode === "login" ? "is-active" : ""} onClick={() => { setMode("login"); setError(""); }}>Sign in</button><button type="button" className={mode === "register" ? "is-active" : ""} onClick={() => { setMode("register"); setError(""); }}>Use invitation</button></div>
          {mode === "register" && <><label htmlFor="name">Your name</label><div className="input-with-icon"><UserRound size={19} /><input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" autoComplete="name" required /></div></>}
          <label htmlFor="email">Email address</label>
          <div className="input-with-icon"><Mail size={19} /><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" autoComplete="email" required /></div>
          <label htmlFor="password">Password</label>
          <div className="input-with-icon"><LockKeyhole size={19} /><input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          {mode === "register" && <><label htmlFor="invite">Invitation code</label><div className="input-with-icon"><KeyRound size={19} /><input id="invite" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="Your one-time code" autoComplete="one-time-code" required /></div></>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>{submitting ? "Opening your map…" : mode === "login" ? "Sign in" : "Create private account"} {!submitting && <ArrowRight size={18} />}</button>
          <p className="login-note"><LockKeyhole size={14} /> For invited friends only · {cloudEnabled ? "Secure cloud mode" : "Preview mode"}</p>
        </form>
      </section>
    </main>
  );
}
