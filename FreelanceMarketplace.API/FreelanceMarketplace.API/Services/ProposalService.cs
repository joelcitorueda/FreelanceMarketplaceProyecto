using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FreelanceMarketplace.API.Models;
using FreelanceMarketplace.API.Patrones.Estrategia;
using FreelanceMarketplace.API.Patrones.Fabrica;
using FreelanceMarketplace.API.Patrones.Observador;

namespace FreelanceMarketplace.API.Services
{
    // Interfaz del servicio de propuestas
    public interface IProposalService
    {
        Task<Proposal> SubmitProposalAsync(Proposal proposal);
        Task<Proposal?> AcceptProposalAsync(int proposalId);
        Task<Proposal?> RejectProposalAsync(int proposalId);
        Task<Proposal?> UpdateProposalAsync(int proposalId, Proposal updatedProposal);
        Task<bool> DeleteProposalAsync(int proposalId);
        decimal CalcularComisionPlataforma(decimal monto);
        decimal CalcularPagoNeto(decimal precio, decimal comision);
    }

    /// <summary>
    /// Servicio de lógica de negocio para propuestas.
    ///
    /// PATRONES DE DISEÑO APLICADOS:
    ///   1. Repository  — IGenericRepository[T] abstrae el acceso a datos
    ///   2. Strategy    — SelectorEstrategiaComision elige comisión automáticamente
    ///   3. Factory     — FabricaPropuestaSelector crea propuestas según su tipo
    ///   4. Observer    — GestorEventosPropuesta notifica cambios de estado
    ///
    /// TÉCNICAS DE REFACTORIZACIÓN APLICADAS:
    ///   1. Reemplazar Números Mágicos por Constantes
    ///   2. Extraer Método (cálculo de comisión, validación, pago neto)
    ///   3. Descomponer Condicional (validación de elegibilidad del desarrollador)
    /// </summary>
    public class ProposalService : IProposalService
    {
        private readonly IGenericRepository<Proposal>? _proposalRepository;
        private readonly IGenericRepository<User>? _userRepository;
        private readonly IGenericRepository<FreelanceService>? _serviceRepository;

        // PATRÓN OBSERVER — gestor de eventos para notificar cambios de estado
        private readonly GestorEventosPropuesta _gestorEventos;

        // Constante para validación de elegibilidad
        private const double CALIFICACION_MINIMA = 3.0;

        // Constructor principal (con repositorios reales)
        public ProposalService(
            IGenericRepository<Proposal>? proposalRepository,
            IGenericRepository<User>? userRepository = null,
            IGenericRepository<FreelanceService>? serviceRepository = null,
            GestorEventosPropuesta? gestorEventos = null)
        {
            _proposalRepository = proposalRepository;
            _userRepository = userRepository;
            _serviceRepository = serviceRepository;

            // Inicializar el gestor de eventos con observadores concretos
            _gestorEventos = gestorEventos ?? new GestorEventosPropuesta();
            _gestorEventos.Suscribir(new ObservadorRegistroConsola());
            _gestorEventos.Suscribir(new ObservadorEstadisticas());
        }

        // Código original antes de refactorizar (evidencia académica)
        // public async Task<Proposal> SubmitProposalAsync_ANTES(Proposal p)
        // {
        //     var u = await _userRepository.GetByIdAsync(p.FreelancerId);
        //     if (u == null || !u.IsActive || !u.ProfileCompleted || u.Rating < 3.0)
        //         throw new Exception("Desarrollador no elegible");
        //     var s = await _serviceRepository.GetByIdAsync(p.ServiceId);
        //     if (s == null) throw new Exception("Servicio no encontrado");
        //     p.PlatformFee = p.ProposedPrice > 1000 ? p.ProposedPrice * 0.10m : p.ProposedPrice * 0.15m;
        //     p.NetPayout = p.ProposedPrice - p.PlatformFee;
        //     p.Status = 0;
        //     await _proposalRepository.AddAsync(p);
        //     return p;
        // }

        public async Task<Proposal> SubmitProposalAsync(Proposal proposal)
        {
            var freelancer = _userRepository != null ? await _userRepository.GetByIdAsync(proposal.FreelancerId) : null;
            var service = _serviceRepository != null ? await _serviceRepository.GetByIdAsync(proposal.ServiceId) : null;

            await ValidarElegibilidadPropuestaAsync(proposal, freelancer, service);

            // PATRÓN FACTORY METHOD — crear la propuesta usando la fábrica correcta
            var fabrica = FabricaPropuestaSelector.Seleccionar(
                proposal.EsSistemaCompleto,
                proposal.ModulosSeleccionadosIds,
                proposal.ModulosSeleccionadosNombres);

            proposal.EsSistemaCompleto = proposal.EsSistemaCompleto;
            proposal.Status = ProposalStatus.Pending;
            proposal.CreatedAt = DateTime.UtcNow;

            // PATRÓN STRATEGY — seleccionar automáticamente la estrategia de comisión
            var estrategia = SelectorEstrategiaComision.Seleccionar(proposal.ProposedPrice);
            proposal.PlatformFee = estrategia.CalcularComision(proposal.ProposedPrice);
            proposal.NetPayout = CalcularPagoNeto(proposal.ProposedPrice, proposal.PlatformFee);

            if (_proposalRepository != null)
                await _proposalRepository.AddAsync(proposal);

            // PATRÓN OBSERVER — notificar a todos los observadores que se creó una propuesta
            _gestorEventos.Notificar(proposal, "CREADA");

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

            // PATRÓN OBSERVER — notificar aceptación
            _gestorEventos.Notificar(proposal, "ACEPTADA");

            return proposal;
        }

        public async Task<Proposal?> RejectProposalAsync(int proposalId)
        {
            if (_proposalRepository == null) return null;

            var proposal = await _proposalRepository.GetByIdAsync(proposalId);
            if (proposal == null)
                throw new KeyNotFoundException($"No se encontró la propuesta con ID {proposalId}.");

            proposal.Status = ProposalStatus.Rejected;
            await _proposalRepository.UpdateAsync(proposal);

            // PATRÓN OBSERVER — notificar rechazo
            _gestorEventos.Notificar(proposal, "RECHAZADA");

            return proposal;
        }

        public async Task<Proposal?> UpdateProposalAsync(int proposalId, Proposal updatedProposal)
        {
            if (_proposalRepository == null) return null;

            var proposal = await _proposalRepository.GetByIdAsync(proposalId);
            if (proposal == null)
                throw new KeyNotFoundException($"No se encontró la propuesta con ID {proposalId}.");

            if (proposal.Status != ProposalStatus.Pending)
                throw new InvalidOperationException("Solo se pueden modificar propuestas en estado Pendiente.");

            // Actualizar solo los campos editables
            proposal.ProposedPrice = updatedProposal.ProposedPrice;
            proposal.Message = updatedProposal.Message;
            proposal.EsSistemaCompleto = updatedProposal.EsSistemaCompleto;
            proposal.ModulosSeleccionadosIds = updatedProposal.ModulosSeleccionadosIds;
            proposal.ModulosSeleccionadosNombres = updatedProposal.ModulosSeleccionadosNombres;

            // Recalcular comisión y pago neto
            var estrategia = SelectorEstrategiaComision.Seleccionar(proposal.ProposedPrice);
            proposal.PlatformFee = estrategia.CalcularComision(proposal.ProposedPrice);
            proposal.NetPayout = CalcularPagoNeto(proposal.ProposedPrice, proposal.PlatformFee);

            await _proposalRepository.UpdateAsync(proposal);

            _gestorEventos.Notificar(proposal, "MODIFICADA");

            return proposal;
        }

        public async Task<bool> DeleteProposalAsync(int proposalId)
        {
            if (_proposalRepository == null) return false;

            var proposal = await _proposalRepository.GetByIdAsync(proposalId);
            if (proposal == null)
                throw new KeyNotFoundException($"No se encontró la propuesta con ID {proposalId}.");

            if (proposal.Status != ProposalStatus.Pending)
                throw new InvalidOperationException("Solo se pueden eliminar propuestas en estado Pendiente.");

            await _proposalRepository.DeleteAsync(proposalId);

            _gestorEventos.Notificar(proposal, "ELIMINADA");
            return true;
        }

        // Extraer Método — Calcular comisión (testeable con TDD, integra Strategy)
        public decimal CalcularComisionPlataforma(decimal monto)
        {
            var estrategia = SelectorEstrategiaComision.Seleccionar(monto);
            return estrategia.CalcularComision(monto);
        }

        // Extraer Método — Calcular pago neto
        public decimal CalcularPagoNeto(decimal precio, decimal comision)
            => precio - comision;

        // Descomponer Condicional — Validación independiente
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

        private void ValidarElegibilidadDesarrollador(User freelancer)
        {
            if (!freelancer.IsActive)
                throw new InvalidOperationException("La cuenta del desarrollador no está activa.");

            if (!freelancer.ProfileCompleted)
                throw new InvalidOperationException("El perfil del desarrollador está incompleto.");

            if (freelancer.Rating < CALIFICACION_MINIMA)
                throw new InvalidOperationException($"Calificación del desarrollador ({freelancer.Rating}) insuficiente. Mínimo: {CALIFICACION_MINIMA}");
        }
    }
}
