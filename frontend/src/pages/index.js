import Head from "next/head";
import Link from "next/link";
import Navbar from "../components/layout/Navbar";
import { Brain, Sparkles, Users, BarChart3, ChevronRight, Star, Zap, Heart } from "lucide-react";

const features = [
  { icon: Brain, title: "Perfiles Cognitivos", desc: "TEA, TDAH y dislexia atendidos con estrategias específicas para cada perfil neurodivergente.", color: "bg-blue-50 text-blue-600" },
  { icon: Sparkles, title: "ML Adaptativo", desc: "Algoritmos de Machine Learning que aprenden del ritmo y desempeño de cada estudiante.", color: "bg-teal-50 text-teal-600" },
  { icon: Users, title: "Para Docentes", desc: "Panel de monitoreo en tiempo real con alertas, progreso y métricas por estudiante.", color: "bg-purple-50 text-purple-600" },
  { icon: BarChart3, title: "Analítica Educativa", desc: "Métricas detalladas de rendimiento, retención y progresión de aprendizaje.", color: "bg-green-50 text-green-600" },
];

const stats = [
  { value: "3+", label: "Perfiles Neurodivergentes" },
  { value: "ML", label: "Motor de Recomendación" },
  { value: "100%", label: "Inclusivo" },
  { value: "24/7", label: "Disponible" },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>PEAML – Plataforma Educativa Adaptativa</title>
      </Head>
      <Navbar />

      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-teal-700 text-white pt-20 pb-24 px-4 overflow-hidden relative">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            Capstone Project · Ingeniería de Sistemas Computacionales
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
            Educación que se<br />
            <span className="text-teal-300">adapta a cada mente</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            PEAML personaliza contenidos para niños con TEA, TDAH y dislexia mediante Machine Learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/assessment" className="bg-white text-primary-700 hover:bg-primary-50 font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg flex items-center gap-2 justify-center">
              <Zap className="w-5 h-5" /> Iniciar Evaluación
            </Link>
            <Link href="/solution" className="bg-white/20 hover:bg-white/30 text-white font-bold py-3.5 px-8 rounded-xl border border-white/30 flex items-center gap-2 justify-center">
              Conocer Solución <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.value} className="text-center">
              <div className="text-3xl font-black text-primary-600">{s.value}</div>
              <div className="text-sm text-gray-500 font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-800">¿Qué hace PEAML?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-primary-600 to-teal-600 rounded-3xl p-12 text-white">
            <Star className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-3xl font-black mb-4">Comienza ahora</h2>
            <p className="text-blue-100 mb-8">Accede a la plataforma y descubre contenidos personalizados con IA.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-white text-primary-700 hover:bg-primary-50 font-bold py-3 px-8 rounded-xl transition-all">Registrarse</Link>
              <Link href="/login" className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-8 rounded-xl border border-white/30 transition-all">Ingresar</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-gray-400 py-8 px-4 text-center text-sm">
        <p className="font-semibold text-white mb-1">PEAML – Plataforma Educativa Adaptativa con ML</p>
        <p>Capstone Project · Ingeniería de Sistemas Computacionales · 2026</p>
      </footer>
    </>
  );
}