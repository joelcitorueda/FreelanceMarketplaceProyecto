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
    }

    // Servicio principal de lógica de negocio para gestionar propuestas del marketplace
    // Aquí se aplicaron las 3 técnicas de refactorización sobre el código prototipo original
    public class ProposalService : IProposalService
    {
        private readonly IGenericRepository<Proposal> _proposalRepository;
        private readonly IGenericRepository<User> _userRepository;
        private readonly IGenericRepository<FreelanceService> _serviceRepository;

        // --- CONSTANTES (REFACTORIZACIÓN: REEMPLAZAR NÚMEROS MÁGICOS) ---
        // Antes estaban como 0.15, 0.10, 1000, 3.0 directamente en el código
        private const decimal ComisionEstandar = 0.15m;         // 15% comisión estándar de la plataforma
        private const decimal ComisionPremium = 0.10m;          // 10% comisión para servicios de alto valor
        private const decimal UmbralAltoValor = 1000.00m;       // Umbral en bolivianos para comisión premium (Bs 1000)
        private const double CalificacionMinima = 3.0;          // Calificación mínima requerida para enviar propuestas

        public ProposalService(
            IGenericRepository<Proposal> proposalRepository,
            IGenericRepository<User> userRepository,
            IGenericRepository<FreelanceService> serviceRepository)
        {
            _proposalRepository = proposalRepository;
            _userRepository = userRepository;
            _serviceRepository = serviceRepository;
        }

        #region CÓDIGO ANTES DE LA REFACTORIZACIÓN (PROTOTIPO CON MALOS OLORES)
        /*
        // PROBLEMAS DETECTADOS: 
        // 1. Números Mágicos: 0, 1, 0.15, 0.10, 1000, 3.0 hardcodeados directamente.
        // 2. Método Largo y Condicionales Anidados: Todo en un solo bloque gigante.
        // 3. Variables con Nombres Crípticos: p, u, s en lugar de proposal, freelancer, service.

        public async Task<Proposal> SubmitProposalAsync(Proposal p)
        {
            // Validar freelancer
            var u = await _userRepository.GetByIdAsync(p.FreelancerId);
            if (u == null)
            {
                throw new Exception("Freelancer no encontrado");
            }
            if (u.IsActive)
            {
                if (u.ProfileCompleted)
                {
                    if (u.Rating >= 3.0)
                    {
                        // Validar servicio
                        var s = await _serviceRepository.GetByIdAsync(p.ServiceId);
                        if (s == null)
                        {
                            throw new Exception("Servicio no encontrado");
                        }

                        // Calcular comisión y pago neto (¡Números mágicos por todos lados!)
                        if (p.ProposedPrice > 1000)
                        {
                            p.PlatformFee = p.ProposedPrice * 0.10m;
                        }
                        else
                        {
                            p.PlatformFee = p.ProposedPrice * 0.15m;
                        }
                        p.NetPayout = p.ProposedPrice - p.PlatformFee;
                        p.Status = 0; // ¡Número Mágico! 0 significa Pendiente

                        await _proposalRepository.AddAsync(p);
                        return p;
                    }
                    else
                    {
                        throw new Exception("La calificación del freelancer es muy baja");
                    }
                }
                else
                {
                    throw new Exception("El perfil del freelancer está incompleto");
                }
            }
            else
            {
                throw new Exception("El freelancer está inactivo");
            }
        }
        */
        #endregion

        #region CÓDIGO DESPUÉS DE LA REFACTORIZACIÓN (LIMPIO Y LISTO PARA PRODUCCIÓN)

        /// <summary>
        /// Envía una nueva propuesta después de validar elegibilidad, calcular comisiones
        /// y verificar que el desarrollador cumple los requisitos de la plataforma.
        /// </summary>
        public async Task<Proposal> SubmitProposalAsync(Proposal proposal)
        {
            // 1. Obtener datos relacionados de la base de datos
            var freelancer = await _userRepository.GetByIdAsync(proposal.FreelancerId);
            var service = await _serviceRepository.GetByIdAsync(proposal.ServiceId);

            // 2. Validar elegibilidad (TÉCNICA: Extraer Método)
            await ValidarElegibilidadPropuestaAsync(proposal, freelancer, service);

            // 3. Calcular comisión de la plataforma y pago neto (TÉCNICA: Extraer Método + Reemplazar Números Mágicos)
            CalcularComisionPlataforma(proposal);

            // 4. Establecer estado inicial (TÉCNICA: Reemplazar Número Mágico con Enum fuertemente tipado)
            proposal.Status = ProposalStatus.Pending;
            proposal.CreatedAt = DateTime.UtcNow;

            await _proposalRepository.AddAsync(proposal);
            return proposal;
        }

        /// <summary>
        /// Acepta una propuesta existente y rechaza automáticamente todas las demás
        /// propuestas pendientes sobre el mismo servicio.
        /// </summary>
        public async Task<Proposal?> AcceptProposalAsync(int proposalId)
        {
            var proposal = await _proposalRepository.GetByIdAsync(proposalId);
            if (proposal == null)
            {
                throw new KeyNotFoundException($"No se encontró la propuesta con ID {proposalId}.");
            }

            // Cambiar estado a Aceptada
            proposal.Status = ProposalStatus.Accepted;
            await _proposalRepository.UpdateAsync(proposal);

            // Rechazar automáticamente todas las demás propuestas pendientes del mismo servicio
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

        // --- MÉTODO EXTRAÍDO: VALIDACIÓN DE ELEGIBILIDAD ---
        // Separado del método principal para cumplir el Principio de Responsabilidad Única (SRP)
        private async Task ValidarElegibilidadPropuestaAsync(Proposal proposal, User? freelancer, FreelanceService? service)
        {
            if (freelancer == null)
            {
                throw new ArgumentException("El desarrollador freelancer especificado no existe en el sistema.");
            }

            if (service == null)
            {
                throw new ArgumentException("El servicio especificado no existe en el sistema.");
            }

            // TÉCNICA: Descomponer Condicional - expresión booleana compleja extraída a método descriptivo
            if (!EsFreelancerElegible(freelancer))
            {
                throw new InvalidOperationException("El desarrollador no cumple los requisitos para enviar propuestas. Verifique calificación, estado del perfil y actividad de la cuenta.");
            }

            if (proposal.ProposedPrice <= 0)
            {
                throw new ArgumentException("El precio propuesto debe ser mayor a cero bolivianos.");
            }

            if (proposal.EstimatedHours <= 0)
            {
                throw new ArgumentException("Las horas estimadas deben ser al menos 1 hora.");
            }
        }

        // --- MÉTODO EXTRAÍDO: CÁLCULO DE COMISIONES ---
        // Los números mágicos fueron reemplazados por constantes descriptivas
        private void CalcularComisionPlataforma(Proposal proposal)
        {
            // Si el monto supera el umbral de Bs 1000, se aplica comisión premium (10%)
            // De lo contrario, se aplica la comisión estándar (15%)
            decimal tasaComision = proposal.ProposedPrice >= UmbralAltoValor 
                ? ComisionPremium 
                : ComisionEstandar;

            proposal.PlatformFee = proposal.ProposedPrice * tasaComision;
            proposal.NetPayout = proposal.ProposedPrice - proposal.PlatformFee;
        }

        // --- CONDICIONAL DESCOMPUESTO: VERIFICACIÓN DE ELEGIBILIDAD ---
        // Antes era: u.IsActive && u.ProfileCompleted && u.Rating >= 3.0 en cascada anidada
        // Ahora es un método con nombre descriptivo que explica claramente la intención
        private bool EsFreelancerElegible(User freelancer)
        {
            return freelancer.IsActive && 
                   freelancer.ProfileCompleted && 
                   freelancer.Rating >= CalificacionMinima;
        }

        #endregion
    }
}
