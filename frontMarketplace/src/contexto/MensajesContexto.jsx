import { createContext, useContext, useState, useCallback } from 'react';

const MensajesContext = createContext();

export function useMensajes() {
  return useContext(MensajesContext);
}

export function MensajesProvider({ children }) {
  const [totalNoLeidos, setTotalNoLeidos] = useState(0);

  const incrementarNoLeidos = useCallback((cantidad = 1) => {
    setTotalNoLeidos(prev => prev + cantidad);
  }, []);

  const limpiarNoLeidos = useCallback(() => {
    setTotalNoLeidos(0);
  }, []);

  return (
    <MensajesContext.Provider value={{
      totalNoLeidos,
      incrementarNoLeidos,
      limpiarNoLeidos,
    }}>
      {children}
    </MensajesContext.Provider>
  );
}
