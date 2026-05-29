import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { managementAPI, studentsAPI } from "../services/api";
import { UserPlus, CheckCircle, XCircle, RefreshCw, Search } from "lucide-react";

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
  const [mode, setMode] = useState("mine");

  const [search, setSearch] = useState("");
  const [filterProfile, setFilterProfile] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name_asc");

  const [form, setForm] = useState({
    name: "", email: "", password: "", age: "",
    cognitive_profile: "general", learning_preference: "visual", current_level: "basico"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = mode === "mine"
        ? await managementAPI.listMyStudents()
        : await studentsAPI.list();
      setStudents(r.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [mode]);

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

  const resetFilters = () => {
    setSearch("");
    setFilterProfile("all");
    setFilterLevel("all");
    setFilterStatus("all");
    setSortBy("name_asc");
  };

  const filtered = useMemo(() => {
    let result = [...students];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.cognitive_profile?.toLowerCase().includes(q) ||
        s.current_level?.toLowerCase().includes(q) ||
        String(s.age || "").includes(q)
      );
    }
    if (filterProfile !== "all") result = result.filter(s => s.cognitive_profile === filterProfile);
    if (filterLevel !== "all") result = result.filter(s => s.current_level === filterLevel);
    if (filterStatus !== "all") result = result.filter(s => s.status === filterStatus);
    result.sort((a, b) => {
      switch (sortBy) {
        case "name_asc": return (a.name || "").localeCompare(b.name || "");
        case "name_desc": return (b.name || "").localeCompare(a.name || "");
        case "age_asc": return (a.age || 0) - (b.age || 0);
        case "age_desc": return (b.age || 0) - (a.age || 0);
        case "level_asc": return (a.current_level || "").localeCompare(b.current_level || "");
        case "status": return (a.status || "").localeCompare(b.status || "");
        default: return 0;
      }
    });
    return result;
  }, [students, search, filterProfile, filterLevel, filterStatus, sortBy]);

  return (
    <DashboardLayout title="Estudiantes">
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black text-gray-800">
              {mode === "mine" ? "Mis Estudiantes" : "Todos los Estudiantes"}
            </h1>
            <p className="text-gray-500 mt-1">{students.length} estudiantes</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => { setMode("mine"); resetFilters(); }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  mode === "mine" ? "bg-primary-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300"
                }`}>
                Mis estudiantes
              </button>
              <button onClick={() => { setMode("all"); resetFilters(); }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  mode === "all" ? "bg-primary-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300"
                }`}>
                Todos los estudiantes
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchData} className="btn-secondary flex items-center gap-2 text-sm">
              <RefreshCw className="w-4 h-4" /> Actualizar
            </button>
            {mode === "mine" && (
              <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Nuevo Estudiante
              </button>
            )}
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

        {showForm && mode === "mine" && (
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
                  required min={5} max={18} placeholder="Edad" className="input-field" />
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

        <div className="card mb-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-3">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre, email, perfil, nivel, edad..."
                className="input-field pl-9" />
            </div>
            <select value={filterProfile} onChange={e => setFilterProfile(e.target.value)} className="input-field bg-white">
              <option value="all">Todos los perfiles</option>
              <option value="TEA">TEA</option>
              <option value="TDAH">TDAH</option>
              <option value="dislexia">Dislexia</option>
              <option value="general">General</option>
            </select>
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className="input-field bg-white">
              <option value="all">Todos los niveles</option>
              <option value="basico">Básico</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field bg-white">
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field bg-white">
              <option value="name_asc">Nombre A-Z</option>
              <option value="name_desc">Nombre Z-A</option>
              <option value="age_asc">Edad ↑</option>
              <option value="age_desc">Edad ↓</option>
              <option value="level_asc">Nivel A-Z</option>
              <option value="status">Estado</option>
            </select>
            <button onClick={resetFilters} className="btn-secondary text-sm">Limpiar filtros</button>
          </div>
        </div>

        <div className="card">
          <p className="text-xs text-gray-400 mb-3">
            {filtered.length} resultado(s)
            {mode === "mine" && " · ⚠ Desactivar conserva historial y evaluaciones"}
          </p>
          {loading ? (
            <div className="text-center text-gray-400 py-8">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No se encontraron estudiantes.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Nombre", "Email", "Perfil", "Preferencia", "Nivel", "Edad", "Estado", mode === "mine" ? "Acción" : ""].map(h => (
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
                        <span className="badge bg-gray-100 text-gray-600 text-xs capitalize">{s.learning_preference || "—"}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="badge bg-gray-100 text-gray-600 text-xs capitalize">{s.current_level || "—"}</span>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{s.age ? `${s.age} años` : "—"}</td>
                      <td className="py-3 pr-4">{statusBadge(s.status)}</td>
                      {mode === "mine" && (
                        <td className="py-3">
                          {s.status !== "inactive" ? (
                            <button onClick={() => handleStatus(s.id, "inactive")}
                              className="text-xs text-red-600 hover:underline font-medium">Desactivar</button>
                          ) : (
                            <button onClick={() => handleStatus(s.id, "active")}
                              className="text-xs text-green-600 hover:underline font-medium">Activar</button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}