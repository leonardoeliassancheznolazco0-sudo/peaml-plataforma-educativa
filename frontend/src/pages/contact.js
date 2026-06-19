import Head from "next/head";
import Navbar from "../components/layout/Navbar";
import { GraduationCap, Brain, Code2, Github } from "lucide-react";

export default function ContactPage() {
  return (
    <>
      <Head><title>Acerca del Proyecto | PEAML</title></Head>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="badge bg-green-100 text-green-600 mb-3">Acerca del Proyecto</span>
          <h1 className="text-4xl font-black text-gray-800 mt-2">Capstone Project</h1>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Proyecto de graduación de Ingeniería de Sistemas Computacionales desarrollado con tecnologías modernas.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="font-black text-gray-800 text-lg mb-3">Información Académica</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <div><span className="font-semibold">Proyecto:</span> Capstone Project</div>
              <div><span className="font-semibold">Carrera:</span> Ingeniería de Sistemas Computacionales</div>
              <div><span className="font-semibold">Universidad:</span> UPN</div>
              <div><span className="font-semibold">Año:</span> 2026</div>
            </div>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-4">
              <Brain className="w-6 h-6" />
            </div>
            <h2 className="font-black text-gray-800 text-lg mb-3">Sobre PEAML</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              PEAML es una solución tecnológica orientada a mejorar la calidad educativa de niños neurodivergentes mediante personalización inteligente de contenidos con Machine Learning.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Code2 className="w-6 h-6" />
            </div>
            <h2 className="font-black text-gray-800 text-lg mb-3">Stack Técnico</h2>
            <div className="flex flex-wrap gap-2">
              {["Python 3.11", "FastAPI", "Next.js", "PostgreSQL 16", "Redis", "Docker", "scikit-learn", "pandas"].map(t => (
                <span key={t} className="badge bg-gray-100 text-gray-600">{t}</span>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
              <Github className="w-6 h-6" />
            </div>
            <h2 className="font-black text-gray-800 text-lg mb-3">Repositorio</h2>
            <p className="text-sm text-gray-600 mb-3">Código fuente disponible en GitHub con documentación completa.</p>
            <a href="https://github.com/leonardoeliassancheznolazco0-sudo/peaml-plataforma-educativa"
              target="_blank" rel="noreferrer"
              className="btn-secondary text-sm inline-flex items-center gap-2">
              <Github className="w-4 h-4" /> Ver en GitHub
            </a>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-600 to-teal-600 text-white rounded-3xl p-8">
          <Brain className="w-10 h-10 mb-4 text-teal-200" />
          <h2 className="text-2xl font-black mb-3">Objetivo General</h2>
          <p className="text-blue-100 leading-relaxed">
            Desarrollar una plataforma educativa adaptativa basada en Machine Learning que permita personalizar contenidos de aprendizaje para niños neurodivergentes, optimizando su rendimiento académico y favoreciendo una experiencia educativa inclusiva.
          </p>
        </div>
      </div>
    </>
  );
}