import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexto/AuthContexto';
import { api } from '../servicios/api';
import {
  Briefcase, FileText, TrendingUp, ArrowRight,
  Shield, Layers, Zap, Code, Users
} from 'lucide-react';

export default function PaginaInicio() {
  const { usuario, esDesarrollador } = useAuth();
  const [stats, setStats] = useState({ servicios: 0, propuestas: 0 });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const [sRes, pRes] = await Promise.all([
          api.getServices(),
          esDesarrollador
            ? api.getProposalsByDeveloper(usuario.id)
            : api.getProposalsByClient(usuario.id),
        ]);
        setStats({
          servicios: sRes.data?.length || 0,
          propuestas: pRes.data?.length || 0,
        });
      } catch { /* silently fail */ }
      finally { setCargando(false); }
    }
    cargar();
  }, []);

  return (
    <>
      <section className="hero">
        <h1>¡Hola, {usuario.name}!</h1>
        <p>
          {esDesarrollador
            ? 'Publica tus servicios de desarrollo y recibe propuestas de clientes interesados.'
            : 'Explora servicios de desarrollo y envía propuestas a los profesionales que necesitas.'}
        </p>
        <div className="hero-actions">
          {esDesarrollador ? (
            <Link to="/servicios" className="btn btn-primary">
              <Briefcase size={18} /> Mis Servicios <ArrowRight size={16} />
            </Link>
          ) : (
            <Link to="/servicios" className="btn btn-primary">
              <Briefcase size={18} /> Explorar Servicios <ArrowRight size={16} />
            </Link>
          )}
          <Link to="/propuestas" className="btn btn-ghost">
            <FileText size={18} /> {esDesarrollador ? 'Propuestas Recibidas' : 'Mis Propuestas'}
          </Link>
        </div>
      </section>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green"><Briefcase size={22} /></div>
          <div className="stat-info">
            <h3>{cargando ? '…' : stats.servicios}</h3>
            <p>Servicios</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><FileText size={22} /></div>
          <div className="stat-info">
            <h3>{cargando ? '…' : stats.propuestas}</h3>
            <p>{esDesarrollador ? 'Propuestas recibidas' : 'Propuestas enviadas'}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Users size={22} /></div>
          <div className="stat-info">
            <h3>{esDesarrollador ? 'Desarrollador' : 'Cliente'}</h3>
            <p>Tu rol</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan"><TrendingUp size={22} /></div>
          <div className="stat-info">
            <h3>15%</h3>
            <p>Comisión</p>
          </div>
        </div>
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <div className="feature-card-icon stat-icon purple"><Layers size={20} /></div>
          <h3>Componentes Reutilizables</h3>
          <p>Arquitectura con ApiResponse&lt;T&gt;, repositorio genérico y middleware global.</p>
        </div>
        <div className="feature-card">
          <div className="feature-card-icon stat-icon green"><Shield size={20} /></div>
          <h3>Sistema de Propuestas</h3>
          <p>Los clientes envían propuestas. El desarrollador acepta la mejor y las demás se rechazan.</p>
        </div>
        <div className="feature-card">
          <div className="feature-card-icon stat-icon amber"><Zap size={20} /></div>
          <h3>Cálculo de Tarifas</h3>
          <p>Comisiones dinámicas: 15% estándar o 10% premium para servicios de alto valor (+Bs 1000).</p>
        </div>
        <div className="feature-card">
          <div className="feature-card-icon stat-icon cyan"><Code size={20} /></div>
          <h3>Refactorización Aplicada</h3>
          <p>Técnicas Replace Magic Number, Extract Method y Decompose Conditional.</p>
        </div>
      </div>
    </>
  );
}
