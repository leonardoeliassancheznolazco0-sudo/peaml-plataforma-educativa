import Head from "next/head";
import Link from "next/link";
import Navbar from "../components/layout/Navbar";
import { Brain, Users, BarChart3, CheckCircle, ChevronRight } from "lucide-react";

const steps = [
  { num: "01", title: "Registro y Perfil", desc: "El estudiante se registra y completa datos básicos de su perfil cognitivo." },
  { num: "02", title: "Evaluación Diagnóstica", desc: "Responde preguntas que capturan tiempos, aciertos y preferencias de aprendizaje." },
  { num: "03", title: "Análisis ML", desc: "El modelo clasifica el perfil y predice el nivel óptimo de contenido." },
  { num: "04", title: "Recomendaciones", desc: "El sistema sugiere contenidos personalizados ordenados por relevancia." },
  { num: "05", title: "Monitoreo", desc: "Docentes y administradores acceden a métricas y ajustan estrategias." },
];

export default function SolutionPage() {
  return (
    <>
      <Head><title>La Solución | PEAML</title></Head>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="badge bg-teal-100 text-teal-600 mb-3">La Solución</span>
          <h1 className="text-4xl font-black text-gray-800 mt-2">PEAML: Aprendizaje que se adapta</h1>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Una plataforma inteligente que usa Machine Learning para personalizar la experiencia educativa de cada niño neurodivergente.</p>
        </div>

        <div className="card mb-12">
          <h2 className="font-bold text-gray-700 mb-6">Flujo del Sistema</h2>
          <div className="space-y-4">
            {steps.map(s => (
              <div key={s.num} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-black text-sm flex-shrink-0">{s.num}</div>
                <div>
                  <h3 className="font-bold text-gray-800">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: Brain, title: "Para Estudiantes", items: ["Contenido personalizado", "Ritmo propio", "Mayor retención", "Menos frustración"], color: "text-blue-600 bg-blue-50" },
            { icon: Users, title: "Para Docentes", items: ["Monitoreo en tiempo real", "Alertas automáticas", "Menos carga manual", "Datos accionables"], color: "text-teal-600 bg-teal-50" },
            { icon: BarChart3, title: "Para Instituciones", items: ["Mejora del rendimiento", "Inclusión educativa", "Reportes analíticos", "Tecnología accesible"], color: "text-purple-600 bg-purple-50" },
          ].map(({ icon: Icon, title, items, color }) => (
            <div key={title} className="card">
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}><Icon className="w-6 h-6" /></div>
              <h3 className="font-bold text-gray-800 mb-3">{title}</h3>
              <ul className="space-y-2">
                {items.map(i => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />{i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/register" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3.5">
            Comenzar ahora <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </>
  );
}