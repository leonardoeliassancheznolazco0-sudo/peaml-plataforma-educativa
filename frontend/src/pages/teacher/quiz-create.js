import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { contentsAPI, quizAPI } from "../../services/api";
import { AlertCircle, CheckCircle, Plus, Pencil, Trash2, ListChecks, X } from "lucide-react";

const LETTERS = ["A", "B", "C", "D"];
const TYPES = ["visual", "auditivo", "lectura", "interactivo"];
const LEVELS = ["basico", "intermedio", "avanzado"];
const PROFILES = ["TEA", "TDAH", "dislexia", "general"];

const EMPTY_CONTENT = { title: "", description: "", content_type: "visual", level: "basico", recommended_profile: "general", url: "" };
const EMPTY_QUESTION = { text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "A" };

export default function ContentManagePage() {
  const { user } = useAuth();
  const [contents, setContents] = useState([]);
  const [selected, setSelected] = useState(null);         // contenido cuyas preguntas se gestionan
  const [contentForm, setContentForm] = useState(null);   // null = oculto; objeto = crear (sin id) / editar (con id)
  const [questions, setQuestions] = useState([]);
  const [questionForm, setQuestionForm] = useState(EMPTY_QUESTION);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadContents = () => {
    contentsAPI.list().then((r) => setContents(r.data || [])).catch(() => {});
  };
  useEffect(() => { loadContents(); }, []);

  const notify = (msg, isError = false) => {
    setError(isError ? msg : null);
    setSuccess(isError ? null : msg);
  };

  // ----- contenidos -----
  const startCreateContent = () => { setContentForm({ ...EMPTY_CONTENT }); setSelected(null); setError(null); setSuccess(null); };
  const startEditContent = (c) => { setContentForm({ ...c }); setSelected(null); setError(null); setSuccess(null); };
  const cancelContentForm = () => setContentForm(null);

  const saveContent = async (e) => {
    e.preventDefault();
    try {
      if (contentForm.id) {
        await contentsAPI.update(contentForm.id, contentForm);
        notify("Contenido actualizado.");
      } else {
        await contentsAPI.create(contentForm);
        notify("Contenido creado.");
      }
      setContentForm(null);
      loadContents();
    } catch (err) {
      notify(err.response?.data?.detail || "No se pudo guardar el contenido.", true);
    }
  };

  const deleteContent = async (c) => {
    if (!window.confirm(`¿Eliminar "${c.title}" y todas sus preguntas?`)) return;
    try {
      await contentsAPI.remove(c.id);
      notify("Contenido eliminado.");
      if (selected?.id === c.id) setSelected(null);
      loadContents();
    } catch (err) {
      notify(err.response?.data?.detail || "No se pudo eliminar.", true);
    }
  };

  // ----- preguntas -----
  const manageQuestions = (c) => {
    setSelected(selected?.id === c.id ? null : c);
    setContentForm(null);
    setQuestionForm(EMPTY_QUESTION);
    setEditingQuestionId(null);
    setError(null); setSuccess(null);
    quizAPI.listQuestions(c.id).then((r) => setQuestions(r.data || [])).catch(() => setQuestions([]));
  };

  const reloadQuestions = () => {
    if (selected) quizAPI.listQuestions(selected.id).then((r) => setQuestions(r.data || [])).catch(() => {});
  };

  const setQField = (f, v) => setQuestionForm((prev) => ({ ...prev, [f]: v }));

  const startEditQuestion = (q) => {
    setEditingQuestionId(q.id);
    setQuestionForm({ text: q.text, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d, correct_option: q.correct_option });
  };
  const cancelQuestionEdit = () => { setEditingQuestionId(null); setQuestionForm(EMPTY_QUESTION); };

  const saveQuestion = async (e) => {
    e.preventDefault();
    try {
      if (editingQuestionId) {
        await quizAPI.updateQuestion(editingQuestionId, questionForm);
        notify("Pregunta actualizada.");
      } else {
        await quizAPI.addQuestion(selected.id, questionForm);
        notify("Pregunta agregada.");
      }
      setQuestionForm(EMPTY_QUESTION);
      setEditingQuestionId(null);
      reloadQuestions();
    } catch (err) {
      notify(err.response?.data?.detail || "No se pudo guardar la pregunta.", true);
    }
  };

  const deleteQuestion = async (q) => {
    if (!window.confirm("¿Eliminar esta pregunta?")) return;
    try {
      await quizAPI.deleteQuestion(q.id);
      notify("Pregunta eliminada.");
      reloadQuestions();
    } catch (err) {
      notify(err.response?.data?.detail || "No se pudo eliminar la pregunta.", true);
    }
  };

  // ----- formulario de contenido (compartido entre crear y editar) -----
  const renderContentForm = () => (
    <form onSubmit={saveContent} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800">{contentForm.id ? "Editar contenido" : "Nuevo contenido"}</h2>
        <button type="button" onClick={cancelContentForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>
      <input value={contentForm.title} onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
        className="input-field" placeholder="Título" required />
      <textarea value={contentForm.description || ""} onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
        className="input-field" rows={2} placeholder="Descripción" />
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Tipo</label>
          <select value={contentForm.content_type} onChange={(e) => setContentForm({ ...contentForm, content_type: e.target.value })} className="input-field">
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Nivel</label>
          <select value={contentForm.level} onChange={(e) => setContentForm({ ...contentForm, level: e.target.value })} className="input-field">
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Perfil</label>
          <select value={contentForm.recommended_profile} onChange={(e) => setContentForm({ ...contentForm, recommended_profile: e.target.value })} className="input-field">
            {PROFILES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <button type="submit" className="btn-primary w-full">{contentForm.id ? "Guardar cambios" : "Crear contenido"}</button>
    </form>
  );

  // ----- accesos -----
  if (!user) return (<div className="p-8 text-center"><Link href="/login" className="btn-primary">Iniciar sesión</Link></div>);
  if (user.role !== "teacher" && user.role !== "admin") {
    return (
      <DashboardLayout title="Gestión de Contenidos">
        <div className="p-8">
          <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" /> Solo los docentes pueden gestionar contenidos.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Gestión de Contenidos">
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-800">Gestión de Contenidos</h1>
            <p className="text-gray-500 mt-1">Crea, edita o elimina contenidos y sus preguntas.</p>
          </div>
          <button onClick={startCreateContent} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nuevo contenido
          </button>
        </div>

        {error && (<div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}</div>)}
        {success && (<div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm"><CheckCircle className="w-4 h-4 flex-shrink-0" /> {success}</div>)}

        {/* formulario de CREAR (solo cuando no hay id) */}
        {contentForm && !contentForm.id && (
          <div className="card mb-6">{renderContentForm()}</div>
        )}

        {/* lista de contenidos */}
        <div className="space-y-3">
          {contents.map((c) => (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-800">{c.title}</h3>
                  <p className="text-sm text-gray-500">{c.description}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="badge bg-gray-100 text-gray-600 capitalize">{c.level}</span>
                    <span className="badge bg-gray-100 text-gray-600 capitalize">{c.content_type}</span>
                    <span className="badge bg-gray-100 text-gray-600">{c.recommended_profile}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => manageQuestions(c)} title="Preguntas" className="p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100"><ListChecks className="w-4 h-4" /></button>
                  <button onClick={() => startEditContent(c)} title="Editar" className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteContent(c)} title="Eliminar" className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              {/* formulario de EDITAR este contenido (inline) */}
              {contentForm?.id === c.id && (
                <div className="mt-4 border-t border-gray-100 pt-4">{renderContentForm()}</div>
              )}

              {/* gestor de preguntas del contenido seleccionado */}
              {selected?.id === c.id && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <h4 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2"><ListChecks className="w-4 h-4 text-primary-600" /> Preguntas ({questions.length})</h4>

                  <ul className="space-y-2 mb-4">
                    {questions.map((q, i) => (
                      <li key={q.id} className="flex items-start justify-between gap-2 border border-gray-100 rounded-xl p-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{i + 1}. {q.text}</p>
                          <p className="text-xs text-gray-500">Correcta: <span className="font-bold text-green-600">{q.correct_option}</span></p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button onClick={() => startEditQuestion(q)} className="p-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteQuestion(q)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </li>
                    ))}
                    {questions.length === 0 && <p className="text-gray-400 text-sm">Sin preguntas todavía.</p>}
                  </ul>

                  {/* formulario agregar/editar pregunta */}
                  <form onSubmit={saveQuestion} className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-gray-700">{editingQuestionId ? "Editar pregunta" : "Nueva pregunta"}</p>
                      {editingQuestionId && <button type="button" onClick={cancelQuestionEdit} className="text-xs text-gray-500 hover:text-gray-700">Cancelar edición</button>}
                    </div>
                    <textarea value={questionForm.text} onChange={(e) => setQField("text", e.target.value)} className="input-field" rows={2} placeholder="Enunciado" required />
                    {LETTERS.map((letter) => {
                      const field = `option_${letter.toLowerCase()}`;
                      return (
                        <div key={letter} className="flex items-center gap-2">
                          <span className={`inline-flex w-7 h-7 rounded-lg items-center justify-center text-xs font-bold flex-shrink-0 ${questionForm.correct_option === letter ? "bg-green-100 text-green-700" : "bg-primary-100 text-primary-600"}`}>{letter}</span>
                          <input value={questionForm[field]} onChange={(e) => setQField(field, e.target.value)} className="input-field" placeholder={`Opción ${letter}`} required />
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Correcta:</span>
                      {LETTERS.map((letter) => (
                        <button key={letter} type="button" onClick={() => setQField("correct_option", letter)}
                          className={`w-9 h-9 rounded-lg border-2 font-bold text-sm ${questionForm.correct_option === letter ? "border-green-400 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-primary-300"}`}>{letter}</button>
                      ))}
                    </div>
                    <button type="submit" className="btn-primary w-full text-sm">{editingQuestionId ? "Guardar pregunta" : "Agregar pregunta"}</button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
