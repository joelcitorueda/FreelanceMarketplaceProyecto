using FreelanceMarketplace.API.Models;

namespace FreelanceMarketplace.API.Patrones.Observador
{
    // Patrón Observer (GoF Comportamental)
    // Propósito: Notificar automáticamente a múltiples objetos cuando cambia el estado de una propuesta.
    // Participantes: IObservadorPropuesta (Observer), ObservadorRegistroConsola y ObservadorEstadisticas (ConcreteObservers)

    public interface IObservadorPropuesta
    {
        string Nombre { get; }
        void Actualizar(Proposal propuesta, string evento);
    }

    /// <summary>
    /// ConcreteObserver A: Registra los cambios de estado de propuestas en consola
    /// </summary>
    public class ObservadorRegistroConsola : IObservadorPropuesta
    {
        public string Nombre => "Registro en Consola";

        public void Actualizar(Proposal propuesta, string evento)
        {
            var color = evento switch
            {
                "ACEPTADA" => ConsoleColor.Green,
                "RECHAZADA" => ConsoleColor.Red,
                "CREADA" => ConsoleColor.Cyan,
                _ => ConsoleColor.White
            };
            Console.ForegroundColor = color;
            Console.WriteLine($"[FreelancRued] [{DateTime.Now:HH:mm:ss}] Propuesta #{propuesta.Id} — {evento} | Monto: Bs {propuesta.ProposedPrice:F2}");
            Console.ResetColor();
        }
    }

    /// <summary>
    /// ConcreteObserver B: Registra estadísticas de propuestas aceptadas/rechazadas
    /// </summary>
    public class ObservadorEstadisticas : IObservadorPropuesta
    {
        public string Nombre => "Estadísticas de Propuestas";

        // Contadores de métricas del sistema
        public int TotalCreadas { get; private set; }
        public int TotalAceptadas { get; private set; }
        public int TotalRechazadas { get; private set; }
        public decimal MontoTotalAceptado { get; private set; }

        public void Actualizar(Proposal propuesta, string evento)
        {
            switch (evento)
            {
                case "CREADA":
                    TotalCreadas++;
                    break;
                case "ACEPTADA":
                    TotalAceptadas++;
                    MontoTotalAceptado += propuesta.ProposedPrice;
                    break;
                case "RECHAZADA":
                    TotalRechazadas++;
                    break;
            }
            Console.WriteLine($"[Estadísticas] Creadas:{TotalCreadas} | Aceptadas:{TotalAceptadas} | Rechazadas:{TotalRechazadas} | Monto Total: Bs {MontoTotalAceptado:F2}");
        }
    }

    /// <summary>
    /// Subject: gestiona la suscripción y notificación de observadores
    /// </summary>
    public class GestorEventosPropuesta
    {
        private readonly List<IObservadorPropuesta> _observadores = new();

        public void Suscribir(IObservadorPropuesta observador)
        {
            if (!_observadores.Contains(observador))
                _observadores.Add(observador);
        }

        public void Desuscribir(IObservadorPropuesta observador)
            => _observadores.Remove(observador);

        public void Notificar(Proposal propuesta, string evento)
        {
            foreach (var observador in _observadores)
                observador.Actualizar(propuesta, evento);
        }
    }
}
