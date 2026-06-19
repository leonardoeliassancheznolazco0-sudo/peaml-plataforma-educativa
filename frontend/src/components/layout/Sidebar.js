import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { Brain, LayoutDashboard, Star, Users, Settings, LogOut, ClipboardList, BookOpen, UserPlus, FileQuestion, AlertTriangle, Layers, Info } from "lucide-react";

const studentLinks = [
  { href: "/student/dashboard", icon: LayoutDashboard, label: "Mi Panel" },
  { href: "/assessment", icon: ClipboardList, label: "Evaluación" },
  { href: "/recommendations", icon: Star, label: "Recomendaciones" },
  { href: "/contents", icon: BookOpen, label: "Contenidos" },
];

const teacherLinks = [
  { href: "/teacher/dashboard", icon: LayoutDashboard, label: "Panel Docente" },
  { href: "/teacher/students", icon: UserPlus, label: "Mis Estudiantes" },
  { href: "/students", icon: Users, label: "Todos los Estudiantes" },
  { href: "/teacher/quiz-create", icon: FileQuestion, label: "Gestión de Contenidos" },
  { href: "/alerts", icon: AlertTriangle, label: "Alertas" },
  { href: "/clusters", icon: Layers, label: "Grupos" },
];

const adminLinks = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Panel Admin" },
  { href: "/admin/users", icon: UserPlus, label: "Gestión Usuarios" },
  { href: "/students", icon: Users, label: "Estudiantes" },
  { href: "/teacher/quiz-create", icon: FileQuestion, label: "Gestión de Contenidos" },
  { href: "/alerts", icon: AlertTriangle, label: "Alertas" },
  { href: "/clusters", icon: Layers, label: "Grupos" },
  { href: "/admin/settings", icon: Info, label: "Acerca de" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const links = user?.role === "admin" ? adminLinks : user?.role === "teacher" ? teacherLinks : studentLinks;
  const roleLabel = user?.role === "admin" ? "Administrador" : user?.role === "teacher" ? "Docente" : "Estudiante";
  const roleColor = user?.role === "admin" ? "bg-purple-100 text-purple-700" : user?.role === "teacher" ? "bg-teal-100 text-teal-700" : "bg-blue-100 text-blue-700";

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      <div className="p-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-primary-700">PEAML</span>
        </Link>
      </div>

      {user && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-800 truncate">{user.name}</p>
              <span className={`badge ${roleColor} text-xs`}>{roleLabel}</span>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}
            className={`sidebar-link ${router.pathname === href ? "active" : ""}`}>
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button onClick={logout}
          className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}