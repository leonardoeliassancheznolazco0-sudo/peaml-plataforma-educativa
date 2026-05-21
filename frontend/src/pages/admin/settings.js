import DashboardLayout from "../../components/layout/DashboardLayout";
import { Settings, Database, Cpu, Shield } from "lucide-react";

export default function AdminSettings() {
  return (
    <DashboardLayout title="Configuración">
      <div className="p-8 max-w-2xl">
        <h1 className="text-2xl font-black text-gray-800 mb-2">Configuración del Sistema</h1>
        <p className="text-gray-500 mb-8">Parámetros globales de la plataforma PEAML.</p>
        <div className="space-y-4">
          {[
            { icon: Database, label: "Base de Datos", value: "PostgreSQL 16 · peaml_db", color: "bg-indigo-50 text-indigo-600" },
            { icon: Cpu, label: "Modelo ML Activo", value: "DecisionTreeClassifier v1.0", color: "bg-purple-50 text-purple-600" },
            { icon: Shield, label: "Seguridad", value: "JWT · bcrypt · CORS habilitado", color: "bg-green-50 text-green-600" },
            { icon: Settings, label: "Entorno", value: "Development · Debug: ON", color: "bg-orange-50 text-orange-600" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card flex items-center gap-4">
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