import { useState, useEffect } from "react";
import "./App.css";
 
const API = "http://localhost:5277";
 
function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [vista, setVista] = useState("login"); // "login" | "register" | "app"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
 
  const [nombre, setNombre] = useState("");
  const [emailPersona, setEmailPersona] = useState("");
  const [personas, setPersonas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editando, setEditando] = useState(null);
 
  useEffect(() => {
    if (token) cargarPersonas();
  }, [token]);
 
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
 
  const cargarPersonas = async () => {
    try {
      const res = await fetch(`${API}/personas`, { headers });
      const data = await res.json();
      setPersonas(data);
    } catch (err) {
      console.error(err);
    }
  };
 
  const login = async () => {
    setAuthError("");
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) { setAuthError("Email o contraseña incorrectos."); return; }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setEmail(""); setPassword("");
    } catch {
      setAuthError("Error al conectar con el servidor.");
    }
  };
 
  const register = async () => {
    setAuthError("");
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) { setAuthError("El email ya está registrado."); return; }
      setVista("login");
      setAuthError("✓ Cuenta creada. Iniciá sesión.");
    } catch {
      setAuthError("Error al conectar con el servidor.");
    }
  };
 
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setVista("login");
  };
 
  const guardarPersona = async () => {
    if (!nombre.trim()) return;
    setLoading(true);
    try {
      if (editando) {
        await fetch(`${API}/personas/${editando.id}`, {
          method: "PUT", headers,
          body: JSON.stringify({ nombre, email: emailPersona }),
        });
        setEditando(null);
      } else {
        await fetch(`${API}/personas`, {
          method: "POST", headers,
          body: JSON.stringify({ nombre, email: emailPersona }),
        });
      }
      setNombre(""); setEmailPersona("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      cargarPersonas();
    } catch (err) { console.error(err); }
    setLoading(false);
  };
 
  const eliminarPersona = async (id) => {
    if (!window.confirm("¿Seguro que querés eliminar esta persona?")) return;
    await fetch(`${API}/personas/${id}`, { method: "DELETE", headers });
    cargarPersonas();
  };
 
  const iniciarEdicion = (persona) => {
    setEditando(persona);
    setNombre(persona.nombre);
    setEmailPersona(persona.email || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
 
  const personasFiltradas = personas.filter((p) =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(filtro.toLowerCase()))
  );
 
  // --- PANTALLA DE AUTH ---
  if (!token) {
    return (
      <div className="app">
        <div className="glow glow-1" />
        <div className="glow glow-2" />
        <div className="container">
          <header className="header">
            <div className="logo">✦</div>
            <h1 className="title">Personas</h1>
            <p className="subtitle">{vista === "login" ? "Iniciá sesión para continuar" : "Creá tu cuenta"}</p>
          </header>
 
          <div className="card form-card">
            <h2 className="card-title">{vista === "login" ? "Iniciar sesión" : "Registrarse"}</h2>
            <div className="input-group">
              <input className="input" placeholder="Email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (vista === "login" ? login() : register())} />
              <input className="input" placeholder="Contraseña" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (vista === "login" ? login() : register())} />
            </div>
            {authError && <p className={`auth-msg ${authError.startsWith("✓") ? "auth-ok" : "auth-error"}`}>{authError}</p>}
            <div className="btn-group">
              <button className="btn" onClick={vista === "login" ? login : register}>
                {vista === "login" ? "Entrar" : "Crear cuenta"}
              </button>
            </div>
            <p className="auth-switch">
              {vista === "login" ? "¿No tenés cuenta?" : "¿Ya tenés cuenta?"}
              <button className="link-btn" onClick={() => { setVista(vista === "login" ? "register" : "login"); setAuthError(""); }}>
                {vista === "login" ? " Registrate" : " Iniciá sesión"}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }
 
  // --- PANTALLA PRINCIPAL ---
  return (
    <div className="app">
      <div className="glow glow-1" />
      <div className="glow glow-2" />
      <div className="container">
        <header className="header">
          <div className="logo">✦</div>
          <h1 className="title">Personas</h1>
          <p className="subtitle">Registrá y explorá tu lista</p>
          <button className="btn-logout" onClick={logout}>Cerrar sesión</button>
        </header>
 
        <div className={`card form-card ${editando ? "editing" : ""}`}>
          <h2 className="card-title">{editando ? "✏️ Editando persona" : "Nueva persona"}</h2>
          <div className="input-group">
            <input className="input" placeholder="Nombre" value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && guardarPersona()} />
            <input className="input" placeholder="Email" value={emailPersona}
              onChange={(e) => setEmailPersona(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && guardarPersona()} />
          </div>
          <div className="btn-group">
            <button className={`btn ${success ? "btn-success" : ""}`} onClick={guardarPersona} disabled={loading}>
              {loading ? "Guardando..." : success ? "✓ Guardado!" : editando ? "Actualizar" : "Guardar"}
            </button>
            {editando && <button className="btn btn-cancel" onClick={() => { setEditando(null); setNombre(""); setEmailPersona(""); }}>Cancelar</button>}
          </div>
        </div>
 
        <div className="card list-card">
          <h2 className="card-title">Lista <span className="badge">{personasFiltradas.length}</span></h2>
          <input className="input input-search" placeholder="🔍 Buscar por nombre o email..."
            value={filtro} onChange={(e) => setFiltro(e.target.value)} />
          {personasFiltradas.length === 0 ? (
            <p className="empty">{filtro ? "No se encontraron resultados." : "Todavía no hay personas registradas."}</p>
          ) : (
            <ul className="list">
              {personasFiltradas.map((p, i) => (
                <li key={p.id} className="list-item" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="avatar">{p.nombre?.charAt(0).toUpperCase()}</div>
                  <div className="item-info">
                    <span className="item-name">{p.nombre}</span>
                    {p.email && <span className="item-email">{p.email}</span>}
                  </div>
                  <div className="item-actions">
                    <button className="action-btn edit-btn" onClick={() => iniciarEdicion(p)}>✏️</button>
                    <button className="action-btn delete-btn" onClick={() => eliminarPersona(p.id)}>🗑️</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
 
export default App;