import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";
import { assessmentsAPI, studentsAPI } from "../services/api";
import { CheckCircle, ChevronRight, Brain, AlertCircle } from "lucide-react";

const QUESTIONS = [
  {
    id: 1,
    text: "¿Cuánto tiempo tardas en resolver un ejercicio de matemáticas?",
    options: ["Menos de 2 min", "2 a 5 min", "5 a 10 min", "Más de 10 min"],
    times: [5, 15, 35, 55],
  },
  {
    id: 2,
    text: "¿Qué tipo de contenido te ayuda más a aprender?",
    options: ["Imágenes y videos", "Audios y música", "Textos y lecturas", "Juegos interactivos"],
    prefs: ["visual", "auditivo", "lectura", "interactivo"],
  },
  {
    id: 3,
    text: "¿Cuántas veces intentas resolver un ejercicio antes de rendirte?",
    options: ["1 vez", "2 a 3 veces", "4 a 6 veces", "Más de 6 veces"],
    attempts: [1, 2, 5, 8],
  },
  {
    id: 4,
    text: "¿Con qué frecuencia logras responder correctamente las preguntas?",
    options: ["Casi nunca (menos del 30%)", "A veces (30-50%)", "Frecuentemente (50-75%)", "Casi siempre (más del 75%)"],
    scores: [20, 40, 62, 85],
  },
  {
    id: 5,
    text: "¿Cuál es tu diagnóstico o perfil de aprendizaje?",
    options: ["TEA (Autismo)", "TDAH", "Dislexia", "Sin diagnóstico específico"],
    profiles: ["TEA", "TDAH", "dislexia", "general"],
  },
];

export default function AssessmentPage() {
  const { user, studentProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "student") { setChecking(false); return; }
    studentsAPI.me()
      .then((r) => setAlreadyDone(!!r.data?.assessment_done && !r.data?.assessment_unlocked))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [user]);

  const q = QUESTIONS[step];

  const handleAnswer = (idx) => {
    const newAnswers = { ...answers, [q.id]: idx };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      submitAssessment(newAnswers);
    }
  };

  const submitAssessment = async (ans) => {
    setLoading(true);
    setSubmitError(null);
    try {
      const score        = QUESTIONS[3].scores[ans[4] ?? 2]   ?? 62;
      const responseTime = QUESTIONS[0].times[ans[1] ?? 1]    ?? 15;
      const attempts     = QUESTIONS[2].attempts[ans[3] ?? 1] ?? 2;
      const profile      = QUESTIONS[4].profiles[ans[5] ?? 3] ?? "general";
      const preference   = QUESTIONS[1].prefs[ans[2] ?? 0]    ?? "visual";

      const studentId = studentProfile?.id;
      if (!studentId) {
        setSubmitError("No se encontró tu perfil de estudiante. Cierra sesión y vuelve a entrar.");
        setLoading(false);
        return;
      }

      const res = await assessmentsAPI.create({
        student_id: studentId,
        score,
        response_time: responseTime,
        attempts,
        cognitive_profile: profile,
        learning_preference: preference,
      });
      setResult(res.data);
    } catch (e) {
      setSubmitError(e.response?.data?.detail || "Error al guardar la evaluación.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <Link href="/login" className="btn-primary">Iniciar sesión para continuar</Link>
      </div>
    );
  }

  if (user.role !== "student") {
    return (
      <DashboardLayout title="Evaluación">
        <div className="p-8">
          <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            La evaluación diagnóstica solo está disponible para estudiantes.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (checking) {
    return (
      <DashboardLayout title="Evaluación">
        <div className="p-8 text-center text-gray-400">Cargando...</div>
      </DashboardLayout>
    );
  }

  if (alreadyDone && !result) {
    return (
      <DashboardLayout title="Evaluación">
        <div className="p-8 max-w-xl mx-auto">
          <div className="card text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h1 className="text-xl font-black text-gray-800 mb-2">Ya completaste tu evaluación</h1>
            <p className="text-gray-500 mb-4">Tu evaluación inicial ya fue registrada. Ahora resuelve actividades para avanzar.</p>
            <Link href="/contents" className="btn-primary">Ir a actividades</Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout title="Evaluación">
        <div className="flex flex-col items-center justify-center min-h-96 gap-4">
          <Brain className="w-16 h-16 text-primary-500 animate-pulse" />
          <p className="text-gray-600 font-semibold text-lg">Analizando tu perfil con ML...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (result) {
    return (
      <DashboardLayout title="Resultado">
        <div className="p-8 max-w-xl mx-auto">
          <div className="card text-center shadow-lg">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-black text-gray-800 mb-2">¡Evaluación completada!</h1>
            <p className="text-gray-500 mb-6">El modelo ML analizó tu perfil y determinó:</p>
            <div className="bg-primary-50 rounded-2xl p-6 mb-6">
              <div className="text-4xl font-black text-primary-600 capitalize">{result.predicted_level}</div>
              <div className="text-sm text-primary-500 mt-1">Nivel Recomendado</div>
              <div className="mt-3 text-2xl font-bold text-teal-600">
                {result.score}% <span className="text-sm text-gray-500 font-normal">de aciertos</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/recommendations" className="btn-primary flex-1 text-center flex items-center justify-center gap-2">
                Ver Recomendaciones <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/student/dashboard" className="btn-secondary flex-1 text-center">Mi Panel</Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Evaluación Diagnóstica">
      <div className="p-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-500">Pregunta {step + 1} de {QUESTIONS.length}</span>
            <span className="text-sm font-bold text-primary-600">{Math.round((step / QUESTIONS.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
          </div>
        </div>

        {submitError && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {submitError}
          </div>
        )}

        <div className="card shadow-md">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
            <Brain className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">{q.text}</h2>
          <div className="space-y-3">
            {q.options.map((opt, idx) => (
              <button key={idx} onClick={() => handleAnswer(idx)}
                className="w-full text-left px-5 py-4 rounded-xl border-2 border-gray-100 hover:border-primary-300 hover:bg-primary-50 font-medium text-gray-700 transition-all">
                <span className="inline-flex w-7 h-7 bg-primary-100 text-primary-600 rounded-lg items-center justify-center text-sm font-bold mr-3">
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}