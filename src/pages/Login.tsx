import { ArrowRight, LockKeyhole, Mail, Map } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrandMark } from "../components/layout/AppShell";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate("/home");
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
          <div className="login-copy"><p className="page-kicker">PRIVATE JOURNAL</p><h1>Welcome back</h1><p>Return to the moments that made you, you.</p></div>
          <label htmlFor="email">Email address</label>
          <div className="input-with-icon"><Mail size={19} /><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" required /></div>
          <button className="primary-button" type="submit">Continue with email <ArrowRight size={18} /></button>
          <p className="login-note"><LockKeyhole size={14} /> For invited friends only.</p>
        </form>
      </section>
    </main>
  );
}
