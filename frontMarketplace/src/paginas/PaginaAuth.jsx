import { useState } from 'react';
import { useAuth } from '../contexto/AuthContexto';
import { useNotificacion } from '../componentes/Notificacion';
import { api } from '../servicios/api';
import { LogIn, UserPlus, Mail, Lock, User, Code, Building2 } from 'lucide-react';

export default function PaginaAuth() {
  const [modoRegistro, setModoRegistro] = useState(false);
  const [formulario, setFormulario] = useState({ name: '', email: '', password: '', role: 'Freelancer' });
  const [enviando, setEnviando] = useState(false);
  const { iniciarSesion } = useAuth();
  const notificar = useNotificacion();

  const manejarCambio = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      let res;
      if (modoRegistro) {
        res = await api.register(formulario);
      } else {
        res = await api.login({ email: formulario.email, password: formulario.password });
      }

      if (res.success) {
        iniciarSesion(res.data);
        notificar(res.message, 'success');
      } else {
        notificar(res.message || 'Error en la operación', 'error');
      }
    } catch {
      notificar('Error de conexión con el servidor', 'error');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/logo.png" alt="FreelanRueda" className="auth-logo" />
          <h1>FreelanRueda</h1>
          <p>{modoRegistro ? 'Crea tu cuenta para empezar' : 'Inicia sesión en tu cuenta'}</p>
        </div>

        <form onSubmit={manejarEnvio}>
          {modoRegistro && (
            <div className="form-group">
              <label className="form-label"><User size={14} /> Nombre completo</label>
              <input type="text" name="name" value={formulario.name} onChange={manejarCambio}
                className="form-input" placeholder="Ej: Julian Rueda" required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label"><Mail size={14} /> Correo electrónico</label>
            <input type="email" name="email" value={formulario.email} onChange={manejarCambio}
              className="form-input" placeholder="tu@correo.com" required />
          </div>

          <div className="form-group">
            <label className="form-label"><Lock size={14} /> Contraseña</label>
            <input type="password" name="password" value={formulario.password} onChange={manejarCambio}
              className="form-input" placeholder="••••••" required />
          </div>

          {modoRegistro && (
            <div className="form-group">
              <label className="form-label">¿Qué tipo de cuenta quieres?</label>
              <div className="role-selector">
                <button
                  type="button"
                  className={`role-option ${formulario.role === 'Freelancer' ? 'role-active' : ''}`}
                  onClick={() => setFormulario({ ...formulario, role: 'Freelancer' })}
                >
                  <Code size={22} />
                  <span className="role-title">Desarrollador</span>
                  <span className="role-desc">Publica tus servicios de software</span>
                </button>
                <button
                  type="button"
                  className={`role-option ${formulario.role === 'Client' ? 'role-active' : ''}`}
                  onClick={() => setFormulario({ ...formulario, role: 'Client' })}
                >
                  <Building2 size={22} />
                  <span className="role-title">Cliente</span>
                  <span className="role-desc">Contrata desarrolladores</span>
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={enviando}>
            {enviando ? 'Procesando...' : modoRegistro ? <><UserPlus size={16} /> Crear Cuenta</> : <><LogIn size={16} /> Iniciar Sesión</>}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {modoRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            <button className="auth-toggle" onClick={() => setModoRegistro(!modoRegistro)}>
              {modoRegistro ? 'Inicia sesión' : 'Regístrate aquí'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
