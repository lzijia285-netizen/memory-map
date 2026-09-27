import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export function PageHeader({ title, eyebrow, action, back = false }: { title: string; eyebrow?: string; action?: ReactNode; back?: boolean }) {
  const navigate = useNavigate();
  return (
    <header className="page-header">
      <div className="page-header__title">
        {back && <button className="icon-button" type="button" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={21} /></button>}
        <div>{eyebrow && <p className="page-kicker">{eyebrow}</p>}<h1>{title}</h1></div>
      </div>
      {action}
    </header>
  );
}
