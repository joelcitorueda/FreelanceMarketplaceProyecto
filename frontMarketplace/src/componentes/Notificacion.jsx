import { useState, useCallback, createContext, useContext } from 'react';

const NotificacionContext = createContext();

export function useNotificacion() {
  return useContext(NotificacionContext);
}

export function NotificacionProvider({ children }) {
  const [notificaciones, setNotificaciones] = useState([]);

  const agregarNotificacion = useCallback((mensaje, tipo = 'info') => {
    const id = Date.now();
    setNotificaciones((prev) => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  return (
    <NotificacionContext.Provider value={agregarNotificacion}>
      {children}
      <div className="toast-container">
        {notificaciones.map((n) => (
          <div key={n.id} className={`toast toast-${n.tipo}`}>
            {n.mensaje}
          </div>
        ))}
      </div>
    </NotificacionContext.Provider>
  );
}
