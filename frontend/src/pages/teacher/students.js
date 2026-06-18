import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { managementAPI } from "../../services/api";
import { UserPlus, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const statusBadge = (status) => {
  if (status === "active") return <span className="badge bg-green-100 text-green-700">✓ Activo</span>;
  if (status === "inactive") return <span className="badge bg-red-100 text-red-700">✗ Inactivo</span>;
  return <span className="badge bg-yellow-100 text-yellow-700">⏳ Prueba</span>;
};

const profileColors = {
  TEA: "bg-blue-100 text-blue-700",
  TDAH: "bg-orange-100 text-orange-700",
  dislexia: "bg-purple-100 text-purple-700",
  general: "bg-gray-100 text-gray-700",
};

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", password: "", age: "",
    cognitive_profile: "general", learning_preference: "visual", current_level: "basico"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await managementAPI.listMyStudents();
      setStudents(r.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await managementAPI.createStudent({ ...form, age: parseInt(form.age) });
      setMsg({ type: "success", text: "Estudiante creado exitosamente" });
      setForm({ name: "", email: "", password: "", age: "", cognitive_profile: "general", learning_preference: "visual", current_level: "basico" });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.detail || "Error al crear estudiante" });
    }
  };

  const handleStatus = async (userId, status) => {
    try {
      await managementAPI.updateMyStudentStatus(userId, status);
      setMsg({ type: "success", text: `Estudiante ${status === "active" ? "activado" : "desactivado — historial conservado"}` });
      fetchData();
    } catch {
      setMsg({ type: "error", text: "Error al cambiar estado" });
    }
  };

  const handleDiagnosis = async (studentId, current) => {
    try {
      await managementAPI.updateStudentProfile(studentId, { diagnosis_confirmed: !current });
      setMsg({ type: "success", text: !current ? "Diagnóstico confirmado (oficial)" : "Confirmación retirada" });
      fetchData();
    } catch {
      setMsg({ type: "error", text: "Error al actualizar el diagnóstico" });
    }
  };

  const handleProfile = async (studentId, profile) => {
    try {
      await managementAPI.updateStudentProfile(studentId, { cognitive_profile: profile });
      setMsg({ type: "success", text: "Perfil actualizado (afecta las recomendaciones del ML)" });
      fetchData();
    } catch {
      setMsg({ type: "error", text: "Error al actualizar el perfil" });
    }
  };

  const handleReopen = async (studentId) => {
    try {
      await managementAPI.updateStudentProfile(studentId, { assessment_done: false });
      setMsg({ type: "success", text: "Evaluación reabierta (modo dev) — el estudiante puede volver a hacerla" });
      fetchData();
    } catch {
      setMsg({ type: "error", text: "Error al reabrir la evaluación" });
    }
  };


  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Mis Estudiantes">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-800">Mis Estudiantes</h1>
            <p className="text-gray-500 mt-1">{students.length} estudiantes asignados</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchData} className="btn-secondary flex items-center gap-2 text-sm">
              <RefreshCw className="w-4 h-4" /> Actualizar
            </button>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Nuevo Estudiante
            </button>
          </div>
        </div>

        {msg && (
          <div className={`flex items-center gap-2 rounded-xl p-3 mb-5 text-sm ${
            msg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {msg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {msg.text}
          </div>
        )}

        {showForm && (
          <div className="card mb-6">
            <h2 className="font-bold text-gray-700 mb-4">Crear nuevo estudiante</h2>
            <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre completo</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  required placeholder="Nombre del estudiante" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  required placeholder="correo@ejemplo.com" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  required placeholder="Mínimo 6 caracteres" minLength={6} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Edad</label>
                <input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})}
                  required min={5} max={18} placeholder="Edad del estudiante" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Perfil cognitivo</label>
                <select value={form.cognitive_profile} onChange={e => setForm({...form, cognitive_profile: e.target.value})}
                  className="input-field bg-white">
                  <option value="general">General</option>
                  <option value="TEA">TEA (Autismo)</option>
                  <option value="TDAH">TDAH</option>
                  <option value="dislexia">Dislexia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Preferencia de aprendizaje</label>
                <select value={form.learning_preference} onChange={e => setForm({...form, learning_preference: e.target.value})}
                  className="input-field bg-white">
                  <option value="visual">Visual</option>
                  <option value="auditivo">Auditivo</option>
                  <option value="lectura">Lectura</option>
                  <option value="interactivo">Interactivo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nivel inicial</label>
                <select value={form.current_level} onChange={e => setForm({...form, current_level: e.target.value})}
                  className="input-field bg-white">
                  <option value="basico">Básico</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="btn-primary">Crear Estudiante</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div className="mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="input-field max-w-sm" />
        </div>

        <div className="card">
          <p className="text-xs text-gray-400 mb-4">
            ⚠ Desactivar un estudiante bloquea su acceso pero conserva todo su historial y evaluaciones.
          </p>
          {loading ? (
            <div className="text-center text-gray-400 py-8">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No hay estudiantes aún. Crea el primero.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Nombre", "Email", "Perfil", "Diagnóstico", "Preferencia", "Nivel", "Edad", "Estado", "Acción"].map(h => (
                    <th key={h} className="text-left text-gray-500 font-semibold pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 pr-4 font-semibold text-gray-800">{s.name}</td>
                    <td className="py-3 pr-4 text-gray-500 text-xs">{s.email}</td>
                    <td className="py-3 pr-4">
                      <span className={`badge text-xs ${profileColors[s.cognitive_profile] || "bg-gray-100 text-gray-600"}`}>
                        {s.cognitive_profile || "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1.5">
                        <select value={s.cognitive_profile || "general"}
                          onChange={(e) => handleProfile(s.student_id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-1.5 py-1 bg-white">
                          <option value="general">general</option>
                          <option value="TEA">TEA</option>
                          <option value="TDAH">TDAH</option>
                          <option value="dislexia">dislexia</option>
                        </select>
                        <button onClick={() => handleDiagnosis(s.student_id, s.diagnosis_confirmed)}
                          className={`text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap ${s.diagnosis_confirmed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                          {s.diagnosis_confirmed ? "✓ Oficial" : "Confirmar"}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="badge bg-gray-100 text-gray-600 text-xs capitalize">{s.learning_preference || "—"}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="badge bg-gray-100 text-gray-600 text-xs capitalize">{s.current_level || "—"}</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{s.age ? `${s.age} años` : "—"}</td>
                    <td className="py-3 pr-4">{statusBadge(s.status)}</td>
                    <td className="py-3">
                      <div className="flex flex-col gap-1">
                        {s.status !== "inactive" ? (
                          <button onClick={() => handleStatus(s.id, "inactive")}
                            className="text-xs text-red-600 hover:underline font-medium text-left">
                            Desactivar
                          </button>
                        ) : (
                          <button onClick={() => handleStatus(s.id, "active")}
                            className="text-xs text-green-600 hover:underline font-medium text-left">
                            Activar
                          </button>
                        )}
                        {s.assessment_done && (
                          <button onClick={() => handleReopen(s.student_id)}
                            className="text-xs text-blue-600 hover:underline font-medium text-left">
                            Reabrir eval (dev)
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}