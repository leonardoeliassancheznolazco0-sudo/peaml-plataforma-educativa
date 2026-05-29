import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { Brain, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/problem", label: "Problema" },
  { href: "/solution", label: "Solución" },
  { href: "/contact", label: "Acerca de" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "teacher") return "/teacher/dashboard";
    return "/student/dashboard";
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-teal-600 rounded-xl flex items-center justify-center shadow">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-primary-700 tracking-tight">PEAML</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  router.pathname === l.href
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:text-primary-700 hover:bg-gray-50"
                }`}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href={getDashboardLink()} className="btn-secondary text-sm py-2 px-4">Mi Panel</Link>
                <button onClick={logout} className="btn-primary text-sm py-2 px-4">Salir</button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm py-2 px-4">Ingresar</Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">Registrarse</Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary-700">
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            {user ? (
              <button onClick={logout} className="btn-primary w-full text-sm">Salir</button>
            ) : (
              <>
                <Link href="/login" className="btn-secondary flex-1 text-sm text-center">Ingresar</Link>
                <Link href="/register" className="btn-primary flex-1 text-sm text-center">Registrarse</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}