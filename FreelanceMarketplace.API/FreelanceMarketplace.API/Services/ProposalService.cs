using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FreelanceMarketplace.API.Models;

namespace FreelanceMarketplace.API.Services
{
    // Interfaz del servicio de propuestas
    public interface IProposalService
    {
        Task<Proposal> SubmitProposalAsync(Proposal proposal);
        Task<Proposal?> AcceptProposalAsync(int proposalId);
        decimal CalcularComisionPlataforma(decimal monto);
        decimal CalcularPagoNeto(decimal precio, decimal comision);
    }

    /// <summary>
    /// Servicio de lógica de negocio para propuestas.
    /// Aplica técnicas de refactorización:
    ///   - Reemplazar Números Mágicos por Constantes (comisiones y umbrales)
    ///   - Extraer Método (validación, cálculo de comisión, pago neto)
    ///   - Descomponer Condicional (elegibilidad del desarrollador)
    /// </summary>
    public class ProposalService : IProposalService
    {
        private readonly IGenericRepository<Proposal>? _proposalRepository;
        private readonly IGenericRepository<User>? _userRepository;
        private readonly IGenericRepository<FreelanceService>? _serviceRepository;

        // ======================================================
        // REFACTORIZACIÓN 1: Reemplazar Números Mágicos por Constantes
        // Antes: precio > 1000 ? precio * 0.10 : precio * 0.15
        // Después: constantes con nombres descriptivos en español
        // ======================================================
        public const decimal COMISION_ESTANDAR = 0.15m;        // 15% para montos menores a Bs 1000
        public const decimal COMISION_PREMIUM = 0.10m;          // 10% para montos iguales o mayores a Bs 1000
        public const decimal UMBRAL_ALTO_VALOR_BS = 1000.00m;  // Límite para aplicar tarifa premium
        private const double CALIFICACION_MINIMA = 3.0;         // Calificación mínima del desarrollador

        // Constructor principal (con repositorios — para uso real)
        public ProposalService(
            IGenericRepository<Proposal>? proposalRepository,
            IGenericRepository<User>? userRepository = null,
            IGenericRepository<FreelanceService>? serviceRepository = null)
        {
            _proposalRepository = proposalRepository;
            _userRepository = userRepository;
            _serviceRepository = serviceRepository;
        }

        #region CÓDIGO ANTES DE LA REFACTORIZACIÓN (para evidencia académica)
        /*
        // MALOS OLORES DETECTADOS ANTES DE REFACTORIZAR:
        // 1. Números Mágicos: 0.15, 0.10, 1000, 3.0 hardcodeados
        // 2. Método largo mezclando validación, cálculo y persistencia
        // 3. Condicional complejo: if (u == null || !u.IsActive || !u.ProfileCompleted || u.Rating < 3.0)
        public async Task<Proposal> SubmitProposalAsync_ANTES(Proposal p)
        {
            var u = await _userRepository.GetByIdAsync(p.FreelancerId);
            if (u == null || !u.IsActive || !u.ProfileCompleted || u.Rating < 3.0)
                throw new Exception("Desarrollador no elegible");
            var s = await _serviceRepository.GetByIdAsync(p.ServiceId);
            if (s == null) throw new Exception("Servicio no encontrado");
            p.PlatformFee = p.ProposedPrice > 1000 ? p.ProposedPrice * 0.10m : p.ProposedPrice * 0.15m;
            p.NetPayout = p.ProposedPrice - p.PlatformFee;
            p.Status = 0;
            await _proposalRepository.AddAsync(p);
            return p;
        }
        */
        #endregion

        // ======================================================
        // MÉTODO PRINCIPAL — limpio gracias a la refactorización
        // ======================================================
        public async Task<Proposal> SubmitProposalAsync(Proposal proposal)
        {
            var freelancer = _userRepository != null ? await _userRepository.GetByIdAsync(proposal.FreelancerId) : null;
            var service = _serviceRepository != null ? await _serviceRepository.GetByIdAsync(proposal.ServiceId) : null;

            await ValidarElegibilidadPropuestaAsync(proposal, freelancer, service);

            // Calcular comisión según el monto propuesto
            proposal.PlatformFee = CalcularComisionPlataforma(proposal.ProposedPrice);
            proposal.NetPayout = CalcularPagoNeto(proposal.ProposedPrice, proposal.PlatformFee);

            proposal.Status = ProposalStatus.Pending;
            proposal.CreatedAt = DateTime.UtcNow;

            if (_proposalRepository != null)
                await _proposalRepository.AddAsync(proposal);

            return proposal;
        }

        public async Task<Proposal?> AcceptProposalAsync(int proposalId)
        {
            if (_proposalRepository == null) return null;

            var proposal = await _proposalRepository.GetByIdAsync(proposalId);
            if (proposal == null)
                throw new KeyNotFoundException($"No se encontró la propuesta con ID {proposalId}.");

            proposal.Status = ProposalStatus.Accepted;
            await _proposalRepository.UpdateAsync(proposal);

            // Rechazar automáticamente las demás propuestas pendientes del mismo servicio
            var todasPropuestas = await _proposalRepository.GetAllAsync();
            foreach (var otra in todasPropuestas)
            {
                if (otra.ServiceId == proposal.ServiceId && otra.Id != proposal.Id && otra.Status == ProposalStatus.Pending)
                {
                    otra.Status = ProposalStatus.Rejected;
                    await _proposalRepository.UpdateAsync(otra);
                }
            }

            return proposal;
        }

        // ======================================================
        // REFACTORIZACIÓN 2: Extraer Método — Calcular comisión pública (testeable)
        // ======================================================
        public decimal CalcularComisionPlataforma(decimal monto)
        {
            // Descomponer condicional: nombre descriptivo en lugar de monto > 1000
            bool esMontoAltoValor = monto >= UMBRAL_ALTO_VALOR_BS;
            decimal tasaComision = esMontoAltoValor ? COMISION_PREMIUM : COMISION_ESTANDAR;
            return monto * tasaComision;
        }

        // ======================================================
        // REFACTORIZACIÓN 2: Extraer Método — Calcular pago neto público (testeable)
        // ======================================================
        public decimal CalcularPagoNeto(decimal precio, decimal comision)
        {
            return precio - comision;
        }

        // ======================================================
        // REFACTORIZACIÓN 3: Descomponer Condicional — Validación separada en método propio
        // ======================================================
        private async Task ValidarElegibilidadPropuestaAsync(Proposal proposal, User? freelancer, FreelanceService? service)
        {
            if (freelancer == null)
                throw new ArgumentException("El desarrollador freelancer especificado no existe en el sistema.");

            if (service == null)
                throw new ArgumentException("El servicio especificado no existe en el sistema.");

            ValidarElegibilidadDesarrollador(freelancer);

            if (proposal.ProposedPrice <= 0)
                throw new ArgumentException("El precio propuesto debe ser mayor a cero bolivianos (Bs 0).");

            await Task.CompletedTask;
        }

        // Descomponer condicional: cada validación con su mensaje específico
        private void ValidarElegibilidadDesarrollador(User freelancer)
        {
            if (!freelancer.IsActive)
                throw new InvalidOperationException("La cuenta del desarrollador no está activa.");

            if (!freelancer.ProfileCompleted)
                throw new InvalidOperationException("El perfil del desarrollador está incompleto. Debe completarlo antes de recibir propuestas.");

            if (freelancer.Rating < CALIFICACION_MINIMA)
                throw new InvalidOperationException($"La calificación del desarrollador ({freelancer.Rating}) es insuficiente. Mínimo requerido: {CALIFICACION_MINIMA}");
        }
    }
}
