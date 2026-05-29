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

export default function AdminUsers() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [trialUsers, setTrialUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState("teachers");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState(null);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [t, s, tr] = await Promise.all([
        managementAPI.listTeachers(),
        managementAPI.listAllStudents(),
        managementAPI.listTrialUsers(),
      ]);
      setTeachers(t.data);
      setStudents(s.data);
      setTrialUsers(tr.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      await managementAPI.createTeacher(form);
      setMsg({ type: "success", text: "Docente creado exitosamente" });
      setForm({ name: "", email: "", password: "" });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.detail || "Error al crear docente" });
    }
  };

  const handleStatus = async (userId, status) => {
    const labels = { active: "activado", inactive: "desactivado (historial conservado)" };
    try {
      await managementAPI.updateUserStatus(userId, status);
      setMsg({ type: "success", text: `Usuario ${labels[status] || status}` });
      fetchData();
    } catch {
      setMsg({ type: "error", text: "Error al cambiar estado" });
    }
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTeachers = teachers.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Gestión de Usuarios">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-800">Gestión de Usuarios</h1>
            <p className="text-gray-500 mt-1">Administra docentes, estudiantes y usuarios en modo prueba.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchData} className="btn-secondary flex items-center gap-2 text-sm">
              <RefreshCw className="w-4 h-4" /> Actualizar
            </button>
            {tab === "teachers" && (
              <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Nuevo Docente
              </button>
            )}
          </div>
        </div>

        {msg && (
          <div className={`flex items-center gap-2 rounded-xl p-3 mb-5 text-sm ${
            msg.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {msg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {msg.text}
          </div>
        )}

        {showForm && (
          <div className="card mb-6">
            <h2 className="font-bold text-gray-700 mb-4">Crear nuevo docente</h2>
            <form onSubmit={handleCreateTeacher} className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  required placeholder="Nombre completo" className="input-field" />
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
              <div className="md:col-span-3 flex gap-3">
                <button type="submit" className="btn-primary">Crear Docente</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "teachers", label: `Docentes (${teachers.length})` },
            { key: "students", label: `Estudiantes (${students.length})` },
            { key: "trial", label: `Modo Prueba (${trialUsers.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setSearch(""); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                tab === t.key ? "bg-primary-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        {(tab === "teachers" || tab === "students") && (
          <div className="mb-4">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="input-field max-w-sm" />
          </div>
        )}

        {loading ? (
          <div className="card text-center text-gray-400 py-12">Cargando...</div>
        ) : (
          <>
            {/* Docentes */}
            {tab === "teachers" && (
              <div className="card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["ID", "Nombre", "Email", "Estado", "Creado", "Acción"].map(h => (
                        <th key={h} className="text-left text-gray-500 font-semibold pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.map(t => (
                      <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 pr-4 text-gray-400 font-mono text-xs">#{t.id}</td>
                        <td className="py-3 pr-4 font-semibold text-gray-800">{t.name}</td>
                        <td className="py-3 pr-4 text-gray-500">{t.email}</td>
                        <td className="py-3 pr-4">{statusBadge(t.status)}</td>
                        <td className="py-3 pr-4 text-gray-400 text-xs">{t.created_at?.slice(0, 10)}</td>
                        <td className="py-3">
                          {t.status !== "inactive" ? (
                            <button onClick={() => handleStatus(t.id, "inactive")}
                              className="text-xs text-red-600 hover:underline font-medium">
                              Desactivar
                            </button>
                          ) : (
                            <button onClick={() => handleStatus(t.id, "active")}
                              className="text-xs text-green-600 hover:underline font-medium">
                              Activar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Estudiantes */}
            {tab === "students" && (
              <div className="card">
                <p className="text-xs text-gray-400 mb-4">
                  ⚠ Desactivar un estudiante bloquea su acceso pero conserva todo su historial clínico y evaluaciones.
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["ID", "Nombre", "Email", "Perfil", "Nivel", "Edad", "Estado", "Acción"].map(h => (
                        <th key={h} className="text-left text-gray-500 font-semibold pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(s => (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 pr-4 text-gray-400 font-mono text-xs">#{s.id}</td>
                        <td className="py-3 pr-4 font-semibold text-gray-800">{s.name}</td>
                        <td className="py-3 pr-4 text-gray-500 text-xs">{s.email}</td>
                        <td className="py-3 pr-4">
                          <span className={`badge text-xs ${profileColors[s.cognitive_profile] || "bg-gray-100 text-gray-600"}`}>
                            {s.cognitive_profile || "—"}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="badge bg-gray-100 text-gray-600 text-xs capitalize">
                            {s.current_level || "—"}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">{s.age ? `${s.age} años` : "—"}</td>
                        <td className="py-3 pr-4">{statusBadge(s.status)}</td>
                        <td className="py-3">
                          {s.status !== "inactive" ? (
                            <button onClick={() => handleStatus(s.id, "inactive")}
                              className="text-xs text-red-600 hover:underline font-medium">
                              Desactivar
                            </button>
                          ) : (
                            <button onClick={() => handleStatus(s.id, "active")}
                              className="text-xs text-green-600 hover:underline font-medium">
                              Activar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Trial */}
            {tab === "trial" && (
              <div className="card">
                {trialUsers.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">No hay usuarios en modo prueba</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {["ID", "Nombre", "Email", "Rol", "Acción"].map(h => (
                          <th key={h} className="text-left text-gray-500 font-semibold pb-3 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trialUsers.map(u => (
                        <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 pr-4 text-gray-400 font-mono text-xs">#{u.id}</td>
                          <td className="py-3 pr-4 font-semibold text-gray-800">{u.name}</td>
                          <td className="py-3 pr-4 text-gray-500">{u.email}</td>
                          <td className="py-3 pr-4">
                            <span className="badge bg-gray-100 text-gray-600 capitalize">{u.role}</span>
                          </td>
                          <td className="py-3 flex gap-3">
                            <button onClick={() => handleStatus(u.id, "active")}
                              className="text-xs text-green-600 hover:underline font-medium">
                              Formalizar
                            </button>
                            <button onClick={() => handleStatus(u.id, "inactive")}
                              className="text-xs text-red-600 hover:underline font-medium">
                              Desactivar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}