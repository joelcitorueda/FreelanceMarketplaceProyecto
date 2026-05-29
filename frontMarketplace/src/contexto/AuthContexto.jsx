import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);


  useEffect(() => {
    const guardado = localStorage.getItem('freerueda_usuario');
    if (guardado) {
      try {
        setUsuario(JSON.parse(guardado));
      } catch {
        localStorage.removeItem('freerueda_usuario');
      }
    }
    setCargando(false);
  }, []);

  const iniciarSesion = (datosUsuario) => {
    setUsuario(datosUsuario);
    localStorage.setItem('freerueda_usuario', JSON.stringify(datosUsuario));
  };

  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem('freerueda_usuario');
  };

  const esDesarrollador = usuario?.role === 'Freelancer';
  const esCliente = usuario?.role === 'Client';

  return (
    <AuthContext.Provider value={{
      usuario,
      cargando,
      iniciarSesion,
      cerrarSesion,
      esDesarrollador,
      esCliente,
      estaAutenticado: !!usuario,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
