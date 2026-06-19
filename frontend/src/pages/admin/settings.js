import DashboardLayout from "../../components/layout/DashboardLayout";
import { Database, Cpu, Brain, Shield, Users, BookOpen } from "lucide-react";

const INFO = [
  {
    icon: BookOpen,
    label: "Qué es",
    value: "Plataforma educativa adaptativa para estudiantes neurodivergentes (TEA, TDAH, dislexia y general). Recomienda actividades según el perfil, la preferencia y el nivel del estudiante.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Database,
    label: "Backend",
    value: "FastAPI · SQLAlchemy · PostgreSQL 16 · Redis",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: Cpu,
    label: "Frontend",
    value: "Next.js 14 · Tailwind CSS · Recharts",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: Brain,
    label: "Enfoque de ML",
    value: "Nivel por desempeño real (progresión por reto) + recomendador híbrido + K-Means para agrupar. Métrica honesta: consistencia y concordancia con el desempeño real, no un accuracy sintético.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Shield,
    label: "Seguridad",
    value: "JWT · bcrypt · CORS",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Users,
    label: "Roles",
    value: "Administrador · Docente · Estudiante (gestión en cascada)",
    color: "bg-orange-50 text-orange-600",
  },
];

export default function AdminAbout() {
  return (
    <DashboardLayout title="Acerca de">
      <div className="p-8 max-w-2xl">
        <h1 className="text-2xl font-black text-gray-800 mb-2">Acerca de PEAML</h1>
        <p className="text-gray-500 mb-8">
          Plataforma Educativa Adaptativa con Machine Learning. Proyecto capstone de Ingeniería de
          Sistemas Computacionales.
        </p>

        <div className="space-y-4">
          {INFO.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card flex items-start gap-4">
              <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-gray-800">{label}</div>
                <div className="text-sm text-gray-500">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
