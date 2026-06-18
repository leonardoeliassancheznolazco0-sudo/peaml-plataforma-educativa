import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { quizAPI } from "../../services/api";
import { CheckCircle, Brain, AlertCircle, Clock, ChevronRight } from "lucide-react";

const LETTERS = ["A", "B", "C", "D"];

export default function QuizPage() {
  const router = useRouter();
  const { id } = router.query;            // id = content_id
  const { user, studentProfile } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});   // { [question_id]: "A" }
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [result, setResult] = useState(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setLoadError(null);
    quizAPI
      .getQuiz(id)
      .then((res) => {
        if (!active) return;
        setQuestions(res.data || []);
        startRef.current = Date.now();   // arranca el cronómetro al cargar
      })
      .catch((e) => {
        if (!active) return;
        setLoadError(e.response?.data?.detail || "No se pudo cargar el quiz.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  const selectOption = (questionId, letter) => {
    setAnswers((prev) => ({ ...prev, [questionId]: letter }));
  };

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);
  const answeredCount = questions.filter((q) => answers[q.id]).length;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const timeSeconds = startRef.current ? (Date.now() - startRef.current) / 1000 : 0;
      const payload = {
        content_id: parseInt(id, 10),
        answers: questions.map((q) => ({
          question_id: q.id,
          selected_option: answers[q.id] || "",
        })),
        time_seconds: Math.round(timeSeconds),
      };
      const res = await quizAPI.submit(payload);
      setResult(res.data);
    } catch (e) {
      setSubmitError(e.response?.data?.detail || "Error al enviar tus respuestas.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- validaciones de acceso ---
  if (!user) {
    return (
      <div className="p-8 text-center">
        <Link href="/login" className="btn-primary">Iniciar sesión para continuar</Link>
      </div>
    );
  }
  if (user.role !== "student") {
    return (
      <DashboardLayout title="Actividad">
        <div className="p-8">
          <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            Las actividades solo las resuelven los estudiantes.
          </div>
        </div>
      </DashboardLayout>
    );
  }
  if (loading) {
    return (
      <DashboardLayout title="Actividad">
        <div className="flex flex-col items-center justify-center min-h-96 gap-4">
          <Brain className="w-16 h-16 text-primary-500 animate-pulse" />
          <p className="text-gray-600 font-semibold text-lg">Cargando preguntas...</p>
        </div>
      </DashboardLayout>
    );
  }
  if (loadError) {
    return (
      <DashboardLayout title="Actividad">
        <div className="p-8 max-w-xl mx-auto">
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {loadError}
          </div>
          <Link href="/contents" className="btn-secondary inline-block mt-4">Volver a contenidos</Link>
        </div>
      </DashboardLayout>
    );
  }

  // --- pantalla de resultado ---
  if (result) {
    return (
      <DashboardLayout title="Resultado">
        <div className="p-8 max-w-xl mx-auto">
          <div className="card text-center shadow-lg">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-black text-gray-800 mb-2">¡Actividad completada!</h1>
            <p className="text-gray-500 mb-6">{result.mensaje}</p>
            <div className="bg-primary-50 rounded-2xl p-6 mb-6">
              <div className="text-4xl font-black text-primary-600">{result.result?.score}%</div>
              <div className="text-sm text-primary-500 mt-1">
                {result.result?.correct_answers} de {result.result?.total_questions} correctas
              </div>
              <div className="mt-3 text-lg font-bold text-teal-600 capitalize">
                Nivel: {result.nivel_nuevo}
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/recommendations" className="btn-primary flex-1 text-center flex items-center justify-center gap-2">
                Ver Recomendaciones <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/contents" className="btn-secondary flex-1 text-center">Más actividades</Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // --- quiz ---
  return (
    <DashboardLayout title="Actividad">
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-semibold text-gray-500">
            {answeredCount} de {questions.length} respondidas
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-primary-600">
            <Clock className="w-4 h-4" /> Tómate tu tiempo
          </span>
        </div>

        {submitError && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {submitError}
          </div>
        )}

        <div className="space-y-5">
          {questions.map((q, qIndex) => {
            const options = [q.option_a, q.option_b, q.option_c, q.option_d];
            return (
              <div key={q.id} className="card shadow-md">
                <h2 className="text-lg font-bold text-gray-800 mb-4">{qIndex + 1}. {q.text}</h2>
                <div className="space-y-3">
                  {options.map((opt, idx) => {
                    const letter = LETTERS[idx];
                    const selected = answers[q.id] === letter;
                    return (
                      <button
                        key={letter}
                        onClick={() => selectOption(q.id, letter)}
                        className={`w-full text-left px-5 py-3 rounded-xl border-2 font-medium transition-all ${
                          selected
                            ? "border-primary-400 bg-primary-50 text-primary-700"
                            : "border-gray-100 text-gray-700 hover:border-primary-300 hover:bg-primary-50"
                        }`}
                      >
                        <span className="inline-flex w-7 h-7 bg-primary-100 text-primary-600 rounded-lg items-center justify-center text-sm font-bold mr-3">
                          {letter}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Enviando..." : allAnswered ? "Enviar respuestas" : "Responde todas las preguntas"}
        </button>
      </div>
    </DashboardLayout>
  );
}
