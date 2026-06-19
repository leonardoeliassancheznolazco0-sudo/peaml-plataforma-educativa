import Head from "next/head";
import Navbar from "../components/layout/Navbar";

const techs = [
  { name: "Python 3.11", role: "Lenguaje principal del backend y módulo ML", color: "bg-yellow-50 border-yellow-200", badge: "bg-yellow-100 text-yellow-700", emoji: "🐍" },
  { name: "FastAPI", role: "Framework para la API REST del backend", color: "bg-teal-50 border-teal-200", badge: "bg-teal-100 text-teal-700", emoji: "⚡" },
  { name: "Node.js 20", role: "Entorno de ejecución del frontend Next.js", color: "bg-green-50 border-green-200", badge: "bg-green-100 text-green-700", emoji: "🟢" },
  { name: "React / Next.js", role: "Framework frontend con SSR y enrutamiento", color: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-700", emoji: "⚛️" },
  { name: "PostgreSQL 16", role: "Base de datos relacional principal", color: "bg-indigo-50 border-indigo-200", badge: "bg-indigo-100 text-indigo-700", emoji: "🐘" },
  { name: "SQLAlchemy", role: "ORM para modelos y conexión a base de datos", color: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-700", emoji: "🔗" },
  { name: "Redis", role: "Cache de recomendaciones y sesiones", color: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-700", emoji: "🔴" },
  { name: "Docker / Compose", role: "Contenedores y orquestación de servicios", color: "bg-sky-50 border-sky-200", badge: "bg-sky-100 text-sky-700", emoji: "🐳" },
  { name: "scikit-learn", role: "Motor ML: DecisionTree, KNN, métricas", color: "bg-purple-50 border-purple-200", badge: "bg-purple-100 text-purple-700", emoji: "🤖" },
  { name: "pandas / NumPy", role: "Procesamiento de datos y datasets", color: "bg-pink-50 border-pink-200", badge: "bg-pink-100 text-pink-700", emoji: "📊" },
  { name: "Tailwind CSS", role: "Framework de estilos responsive", color: "bg-cyan-50 border-cyan-200", badge: "bg-cyan-100 text-cyan-700", emoji: "🎨" },
  { name: "Git / GitHub", role: "Control de versiones y repositorio", color: "bg-gray-50 border-gray-200", badge: "bg-gray-100 text-gray-700", emoji: "🐙" },
];

export default function TechnologyPage() {
  return (
    <>
      <Head><title>Tecnología | PEAML</title></Head>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="badge bg-purple-100 text-purple-600 mb-3">Stack Tecnológico</span>
          <h1 className="text-4xl font-black text-gray-800 mt-2">Tecnología detrás de PEAML</h1>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Arquitectura desacoplada moderna con las mejores herramientas open source.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {techs.map(t => (
            <div key={t.name} className={`border-2 ${t.color} rounded-2xl p-5 hover:shadow-md transition-shadow`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{t.emoji}</span>
                <div>
                  <span className={`badge ${t.badge} text-xs mb-1`}>Tecnología</span>
                  <h3 className="font-black text-gray-800 leading-tight">{t.name}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{t.role}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="font-bold text-gray-700 mb-6 text-center">Arquitectura del Sistema</h2>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            {[
              { emoji: "⚛️", title: "Frontend", sub: "Next.js · React · Tailwind", port: "Puerto 3000", color: "bg-blue-50 border-blue-100 text-blue-700" },
              { emoji: "⚡", title: "Backend API", sub: "FastAPI · Python 3.11", port: "Puerto 8000", color: "bg-teal-50 border-teal-100 text-teal-700" },
              { emoji: "🤖", title: "Módulo ML", sub: "scikit-learn · pandas", port: "Integrado en backend", color: "bg-purple-50 border-purple-100 text-purple-700" },
              { emoji: "🐘", title: "PostgreSQL 16", sub: "Base de datos principal", port: "Puerto 5432", color: "bg-indigo-50 border-indigo-100 text-indigo-700" },
              { emoji: "🔴", title: "Redis", sub: "Cache y sesiones", port: "Puerto 6379", color: "bg-red-50 border-red-100 text-red-700" },
              { emoji: "🐳", title: "Docker Compose", sub: "Orquestación completa", port: "4 servicios", color: "bg-sky-50 border-sky-100 text-sky-700" },
            ].map(item => (
              <div key={item.title} className={`${item.color} rounded-xl p-4 border`}>
                <div className="text-2xl mb-2">{item.emoji}</div>
                <div className="font-bold">{item.title}</div>
                <div className="text-xs mt-1 opacity-75">{item.sub}</div>
                <div className="text-xs mt-1 opacity-50">{item.port}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}