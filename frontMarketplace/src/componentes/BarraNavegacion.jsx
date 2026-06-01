import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexto/AuthContexto';
import { useMensajes } from '../contexto/MensajesContexto';
import { Home, Briefcase, FileText, LogOut, Code, Building2, MessageCircle } from 'lucide-react';

export default function BarraNavegacion() {
  const { usuario, cerrarSesion, esDesarrollador } = useAuth();
  const { totalNoLeidos } = useMensajes();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <img src="/logo.png" alt="FreelanRueda" className="brand-logo" />
          FreelanRueda
        </NavLink>
        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Home /> Inicio
          </NavLink>
          <NavLink to="/servicios" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Briefcase /> Servicios
          </NavLink>
          <NavLink to="/propuestas" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FileText /> Propuestas
            {totalNoLeidos > 0 && (
              <span className="nav-badge">
                <MessageCircle size={10} />
                {totalNoLeidos}
              </span>
            )}
          </NavLink>

          <div className="navbar-user">
            <span className="navbar-user-info">
              {esDesarrollador ? <Code size={14} /> : <Building2 size={14} />}
              {usuario.name}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={cerrarSesion}>
              <LogOut size={16} /> Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
