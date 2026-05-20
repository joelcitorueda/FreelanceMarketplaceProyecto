import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexto/AuthContexto';
import { NotificacionProvider } from './componentes/Notificacion';
import BarraNavegacion from './componentes/BarraNavegacion';
import PaginaAuth from './paginas/PaginaAuth';
import PaginaInicio from './paginas/PaginaInicio';
import PaginaServicios from './paginas/PaginaServicios';
import PaginaPropuestas from './paginas/PaginaPropuestas';

function ContenidoApp() {
  const { estaAutenticado, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <p className="loading-text">Cargando FreelanRueda...</p>
      </div>
    );
  }

  // Si no está autenticado, mostrar pantalla de login
  if (!estaAutenticado) {
    return <PaginaAuth />;
  }

  // Si está autenticado, mostrar la aplicación completa
  return (
    <BrowserRouter>
      <div className="app">
        <BarraNavegacion />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<PaginaInicio />} />
            <Route path="/servicios" element={<PaginaServicios />} />
            <Route path="/propuestas" element={<PaginaPropuestas />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificacionProvider>
        <ContenidoApp />
      </NotificacionProvider>
    </AuthProvider>
  );
}
