namespace FreelanceMarketplace.API.Patrones.Estrategia
{
    // Patrón Strategy (GoF Comportamental)
    // Encapsula algoritmos de comisión en clases separadas para evitar if/else en ProposalService.
    // Participantes: IEstrategiaComision (Strategy), EstrategiaComisionEstandar/Premium (ConcreteStrategies)

    public interface IEstrategiaComision
    {
        string Nombre { get; }
        decimal CalcularComision(decimal montoBase);
        bool AplicaA(decimal monto);
    }

    /// <summary>
    /// ConcreteStrategy A: Comisión estándar del 15% para montos menores a Bs 1000
    /// </summary>
    public class EstrategiaComisionEstandar : IEstrategiaComision
    {
        private const decimal TASA = 0.15m;
        private const decimal UMBRAL = 1000.00m;

        public string Nombre => "Comisión Estándar (15%)";

        public decimal CalcularComision(decimal montoBase)
            => montoBase * TASA;

        public bool AplicaA(decimal monto)
            => monto < UMBRAL;
    }

    /// <summary>
    /// ConcreteStrategy B: Comisión premium del 10% para montos ≥ Bs 1000
    /// Recompensa a los desarrolladores con proyectos de alto valor
    /// </summary>
    public class EstrategiaComisionPremium : IEstrategiaComision
    {
        private const decimal TASA = 0.10m;
        private const decimal UMBRAL = 1000.00m;

        public string Nombre => "Comisión Premium (10%)";

        public decimal CalcularComision(decimal montoBase)
            => montoBase * TASA;

        public bool AplicaA(decimal monto)
            => monto >= UMBRAL;
    }

    /// <summary>
    /// Selector de estrategia: elige automáticamente la estrategia correcta según el monto
    /// </summary>
    public static class SelectorEstrategiaComision
    {
        private static readonly List<IEstrategiaComision> _estrategias = new()
        {
            new EstrategiaComisionPremium(),   // Se evalúa primero
            new EstrategiaComisionEstandar(),
        };

        public static IEstrategiaComision Seleccionar(decimal monto)
            => _estrategias.First(e => e.AplicaA(monto));
    }
}
