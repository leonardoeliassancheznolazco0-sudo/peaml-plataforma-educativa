import Head from "next/head";
import Link from "next/link";
import Navbar from "../components/layout/Navbar";
import { AlertTriangle, TrendingDown, Frown, Clock, ChevronRight } from "lucide-react";

export default function ProblemPage() {
  return (
    <>
      <Head><title>El Problema | PEAML</title></Head>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="badge bg-red-100 text-red-600 mb-3">El Problema</span>
          <h1 className="text-4xl font-black text-gray-800 mt-2">Educación sin personalización</h1>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">El sistema educativo actual aplica un modelo único que ignora la diversidad cognitiva de los estudiantes.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {[
            { icon: AlertTriangle, title: "Contenido uniforme", desc: "Los mismos materiales para todos los estudiantes, sin considerar perfiles cognitivos ni ritmos de aprendizaje diferentes.", color: "text-red-500 bg-red-50" },
            { icon: TrendingDown, title: "Bajo rendimiento", desc: "Niños con TEA, TDAH y dislexia presentan hasta un 40% menos de rendimiento cuando no reciben atención personalizada.", color: "text-orange-500 bg-orange-50" },
            { icon: Frown, title: "Desmotivación", desc: "La falta de adaptación genera frustración, pérdida de interés y abandono escolar en niños neurodivergentes.", color: "text-yellow-600 bg-yellow-50" },
            { icon: Clock, title: "Sobrecarga docente", desc: "Los maestros intentan adaptar contenidos manualmente sin herramientas especializadas, generando agotamiento.", color: "text-purple-500 bg-purple-50" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card">
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}><Icon className="w-6 h-6" /></div>
              <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <p className="text-lg font-bold text-red-700 mb-4">El 15-20% de la población escolar mundial tiene algún tipo de neurodivergencia.</p>
          <Link href="/solution" className="btn-primary inline-flex items-center gap-2">Ver la solución <ChevronRight className="w-4 h-4" /></Link>
        </div>
      </div>
    </>
  );
}