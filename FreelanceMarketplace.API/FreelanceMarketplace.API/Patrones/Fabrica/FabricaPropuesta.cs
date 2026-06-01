using FreelanceMarketplace.API.Models;

namespace FreelanceMarketplace.API.Patrones.Fabrica
{
    // Patrón Factory Method (GoF Creacional)
    // Centraliza la creación de propuestas (sistema completo vs módulos) evitando valores dispersos.
    // Participantes: IFabricaPropuesta (Creator), FabricaPropuestaSistemaCompleto y FabricaPropuestaModulos (ConcreteCreators)

    public interface IFabricaPropuesta
    {
        string TipoDescripcion { get; }
        Proposal Crear(int serviceId, int freelancerId, int clientId, decimal precio, string mensaje);
    }

    /// <summary>
    /// ConcreteCreator A: Fábrica para propuestas de sistema completo
    /// </summary>
    public class FabricaPropuestaSistemaCompleto : IFabricaPropuesta
    {
        public string TipoDescripcion => "Adquisición de Sistema Completo";

        public Proposal Crear(int serviceId, int freelancerId, int clientId, decimal precio, string mensaje)
            => new()
            {
                ServiceId = serviceId,
                FreelancerId = freelancerId,
                ClientId = clientId,
                ProposedPrice = precio,
                Message = mensaje,
                EsSistemaCompleto = true,
                EstimatedHours = 1,
                Status = ProposalStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                ModulosSeleccionadosIds = string.Empty,
                ModulosSeleccionadosNombres = string.Empty,
            };
    }

    /// <summary>
    /// ConcreteCreator B: Fábrica para propuestas de módulos individuales
    /// </summary>
    public class FabricaPropuestaModulos : IFabricaPropuesta
    {
        private readonly string _idsModulos;
        private readonly string _nombresModulos;

        public FabricaPropuestaModulos(string idsModulos, string nombresModulos)
        {
            _idsModulos = idsModulos;
            _nombresModulos = nombresModulos;
        }

        public string TipoDescripcion => "Adquisición de Módulos Individuales";

        public Proposal Crear(int serviceId, int freelancerId, int clientId, decimal precio, string mensaje)
            => new()
            {
                ServiceId = serviceId,
                FreelancerId = freelancerId,
                ClientId = clientId,
                ProposedPrice = precio,
                Message = mensaje,
                EsSistemaCompleto = false,
                EstimatedHours = 1,
                Status = ProposalStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                ModulosSeleccionadosIds = _idsModulos,
                ModulosSeleccionadosNombres = _nombresModulos,
            };
    }

    /// <summary>
    /// Método auxiliar para seleccionar la fábrica correcta según los datos de la propuesta
    /// </summary>
    public static class FabricaPropuestaSelector
    {
        public static IFabricaPropuesta Seleccionar(bool esSistemaCompleto, string idsModulos = "", string nombresModulos = "")
        {
            if (esSistemaCompleto)
                return new FabricaPropuestaSistemaCompleto();

            return new FabricaPropuestaModulos(idsModulos, nombresModulos);
        }
    }
}
