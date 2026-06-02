using Xunit;
using FreelanceMarketplace.API.Models;
using FreelanceMarketplace.API.Services;
using FreelanceMarketplace.API.Patrones.Estrategia;
using FreelanceMarketplace.API.Patrones.Fabrica;
using FreelanceMarketplace.API.Patrones.Observador;

namespace FreelanceMarketplace.Tests
{
    /// <summary>
    /// PRUEBAS POR OBJETIVO (Acceptance / Integration Tests)
    ///
    /// Validan que el sistema CUMPLE SUS OBJETIVOS FUNCIONALES,
    /// probando la interacción entre múltiples patrones de diseño (Strategy, Factory, Observer).
    /// A diferencia de las pruebas unitarias TDD, estas pruebas validan escenarios de
    /// principio a fin usando repositorios en memoria.
    ///
    /// Para ejecutar: dotnet test
    /// </summary>
    public class AcceptanceTests
    {
        // ================================================================
        // OBJETIVO 1: Cálculo de comisiones (Strategy Pattern)
        // El sistema debe calcular comisiones automáticamente según el monto:
        //   - Monto < Bs 1000 → 15% (comisión estándar)
        //   - Monto >= Bs 1000 → 10% (comisión premium)
        // ================================================================

        [Fact]
        public void Objetivo1_ComisionEstandar_ParaMontosMenoresA1000()
        {
            decimal monto = 800.00m;
            var estrategia = SelectorEstrategiaComision.Seleccionar(monto);

            Assert.Equal("Comisión Estándar (15%)", estrategia.Nombre);
            Assert.Equal(120.00m, estrategia.CalcularComision(monto));
        }

        [Fact]
        public void Objetivo1_ComisionPremium_ParaMontosMayoresOIgualA1000()
        {
            decimal monto = 2500.00m;
            var estrategia = SelectorEstrategiaComision.Seleccionar(monto);

            Assert.Equal("Comisión Premium (10%)", estrategia.Nombre);
            Assert.Equal(250.00m, estrategia.CalcularComision(monto));
        }

        [Fact]
        public void Objetivo1_MontoExactoEnUmbral_UsaComisionPremium()
        {
            decimal monto = 1000.00m;
            var estrategia = SelectorEstrategiaComision.Seleccionar(monto);

            Assert.Equal("Comisión Premium (10%)", estrategia.Nombre);
            Assert.Equal(100.00m, estrategia.CalcularComision(monto));
        }

        [Fact]
        public void Objetivo1_ServicioCompleto_CalculaPagoNetoCorrectamente()
        {
            var service = new InMemoryRepository<Proposal>();
            var propService = new ProposalService(service, null, null, null);
            decimal precio = 10500.00m;
            decimal comision = propService.CalcularComisionPlataforma(precio);
            decimal neto = propService.CalcularPagoNeto(precio, comision);

            Assert.Equal(1050.00m, comision);
            Assert.Equal(9450.00m, neto);
        }

        // ================================================================
        // OBJETIVO 2: Creación de propuestas (Factory + Observer)
        // El sistema debe crear propuestas correctamente y notificar cambios
        // ================================================================

        [Fact]
        public void Objetivo2_FabricaSistemaCompleto_CreaPropuestaSinModulos()
        {
            var fabrica = FabricaPropuestaSelector.Seleccionar(true);
            var propuesta = fabrica.Crear(1, 1, 2, 10500.00m, "Sistema ERP completo");

            Assert.Equal("Adquisición de Sistema Completo", fabrica.TipoDescripcion);
            Assert.True(propuesta.EsSistemaCompleto);
            Assert.Equal(string.Empty, propuesta.ModulosSeleccionadosIds);
            Assert.Equal(10500.00m, propuesta.ProposedPrice);
        }

        [Fact]
        public void Objetivo2_FabricaModulos_CreaPropuestaConModulos()
        {
            string idsModulos = "1,2,3";
            string nombresModulos = "Gestión de Usuarios,Facturación,Inventario";
            var fabrica = FabricaPropuestaSelector.Seleccionar(false, idsModulos, nombresModulos);
            var propuesta = fabrica.Crear(1, 1, 2, 4500.00m, "Módulos seleccionados");

            Assert.Equal("Adquisición de Módulos Individuales", fabrica.TipoDescripcion);
            Assert.False(propuesta.EsSistemaCompleto);
            Assert.Equal(idsModulos, propuesta.ModulosSeleccionadosIds);
            Assert.Equal(nombresModulos, propuesta.ModulosSeleccionadosNombres);
        }

        [Fact]
        public void Objetivo2_Observer_NotificaCambiosDeEstado()
        {
            var gestor = new GestorEventosPropuesta();
            var estadisticas = new ObservadorEstadisticas();
            gestor.Suscribir(estadisticas);

            var propuesta = new Proposal
            {
                Id = 1,
                ProposedPrice = 5000.00m,
                Status = ProposalStatus.Pending
            };

            gestor.Notificar(propuesta, "CREADA");
            gestor.Notificar(propuesta, "ACEPTADA");

            Assert.Equal(1, estadisticas.TotalCreadas);
            Assert.Equal(1, estadisticas.TotalAceptadas);
            Assert.Equal(5000.00m, estadisticas.MontoTotalAceptado);
        }

        // ================================================================
        // OBJETIVO 3: Validación de desarrolladores vía InMemoryRepository
        // El sistema debe validar que el desarrollador cumpla requisitos
        // ================================================================

        [Fact]
        public async Task Objetivo3_FreelancerActivo_EnviaPropuestaExitosamente()
        {
            var proposalRepo = new InMemoryRepository<Proposal>();
            var userRepo = new InMemoryRepository<User>();
            var serviceRepo = new InMemoryRepository<FreelanceService>();
            var gestor = new GestorEventosPropuesta();
            var estadisticas = new ObservadorEstadisticas();
            gestor.Suscribir(estadisticas);

            await userRepo.AddAsync(new User { Id = 1, IsActive = true, ProfileCompleted = true, Rating = 4.5 });
            await serviceRepo.AddAsync(new FreelanceService { Id = 1, Title = "Sistema ERP", BasePrice = 10500.00m });

            var propService = new ProposalService(proposalRepo, userRepo, serviceRepo, gestor);
            var propuesta = new Proposal
            {
                FreelancerId = 1,
                ServiceId = 1,
                ProposedPrice = 5000.00m,
                Message = "Propuesta de prueba",
                EsSistemaCompleto = true
            };

            var resultado = await propService.SubmitProposalAsync(propuesta);

            Assert.NotNull(resultado);
            Assert.Equal(ProposalStatus.Pending, resultado.Status);
            Assert.Equal(500.00m, resultado.PlatformFee);
            Assert.Equal(4500.00m, resultado.NetPayout);
            Assert.Equal(1, estadisticas.TotalCreadas);
        }

        [Fact]
        public async Task Objetivo3_FreelancerInactivo_LanzaExcepcion()
        {
            var proposalRepo = new InMemoryRepository<Proposal>();
            var userRepo = new InMemoryRepository<User>();
            var serviceRepo = new InMemoryRepository<FreelanceService>();

            await userRepo.AddAsync(new User { Id = 1, IsActive = false, ProfileCompleted = true, Rating = 4.5 });
            await serviceRepo.AddAsync(new FreelanceService { Id = 1, Title = "Test", BasePrice = 1000 });

            var propService = new ProposalService(proposalRepo, userRepo, serviceRepo);
            var propuesta = new Proposal { FreelancerId = 1, ServiceId = 1, ProposedPrice = 500, EsSistemaCompleto = true };

            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => propService.SubmitProposalAsync(propuesta));
            Assert.Contains("no está activa", ex.Message);
        }

        [Fact]
        public async Task Objetivo3_FreelancerSinPerfil_LanzaExcepcion()
        {
            var proposalRepo = new InMemoryRepository<Proposal>();
            var userRepo = new InMemoryRepository<User>();
            var serviceRepo = new InMemoryRepository<FreelanceService>();

            await userRepo.AddAsync(new User { Id = 1, IsActive = true, ProfileCompleted = false, Rating = 4.5 });
            await serviceRepo.AddAsync(new FreelanceService { Id = 1, Title = "Test", BasePrice = 1000 });

            var propService = new ProposalService(proposalRepo, userRepo, serviceRepo);
            var propuesta = new Proposal { FreelancerId = 1, ServiceId = 1, ProposedPrice = 500, EsSistemaCompleto = true };

            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => propService.SubmitProposalAsync(propuesta));
            Assert.Contains("perfil", ex.Message.ToLower());
        }

        [Fact]
        public async Task Objetivo3_FreelancerBajaCalificacion_LanzaExcepcion()
        {
            var proposalRepo = new InMemoryRepository<Proposal>();
            var userRepo = new InMemoryRepository<User>();
            var serviceRepo = new InMemoryRepository<FreelanceService>();

            await userRepo.AddAsync(new User { Id = 1, IsActive = true, ProfileCompleted = true, Rating = 2.5 });
            await serviceRepo.AddAsync(new FreelanceService { Id = 1, Title = "Test", BasePrice = 1000 });

            var propService = new ProposalService(proposalRepo, userRepo, serviceRepo);
            var propuesta = new Proposal { FreelancerId = 1, ServiceId = 1, ProposedPrice = 500, EsSistemaCompleto = true };

            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => propService.SubmitProposalAsync(propuesta));
            Assert.Contains("calificación", ex.Message.ToLower());
        }

        // ================================================================
        // OBJETIVO 4: Integración completa de patrones vía SubmitProposalAsync
        // Strategy → Factory → Observer trabajando juntos a través del servicio
        // ================================================================

        [Fact]
        public async Task Objetivo4_FlujoCompleto_StrategyFactoryObserverIntegrados()
        {
            var proposalRepo = new InMemoryRepository<Proposal>();
            var userRepo = new InMemoryRepository<User>();
            var serviceRepo = new InMemoryRepository<FreelanceService>();
            var gestor = new GestorEventosPropuesta();
            var estadisticas = new ObservadorEstadisticas();
            gestor.Suscribir(estadisticas);

            await userRepo.AddAsync(new User { Id = 1, IsActive = true, ProfileCompleted = true, Rating = 5 });
            await serviceRepo.AddAsync(new FreelanceService { Id = 1, Title = "Sistema ERP", BasePrice = 10500 });

            var propService = new ProposalService(proposalRepo, userRepo, serviceRepo, gestor);
            var propuesta = new Proposal
            {
                FreelancerId = 1,
                ServiceId = 1,
                ProposedPrice = 3500.00m,
                Message = "Propuesta integral",
                EsSistemaCompleto = true
            };

            // SubmitProposalAsync activa Strategy + Factory + Observer internamente
            var resultado = await propService.SubmitProposalAsync(propuesta);

            Assert.True(resultado.EsSistemaCompleto);
            Assert.Equal(350.00m, resultado.PlatformFee);  // Strategy: 10% de 3500
            Assert.Equal(3150.00m, resultado.NetPayout);   // Pago neto
            Assert.Equal(1, estadisticas.TotalCreadas);     // Observer notificado
        }

        [Fact]
        public void Objetivo4_PropuestaModulosConComision_CicloCompleto()
        {
            string modulos = "Gestión de Usuarios,Facturación,Reportes";
            decimal precioModulos = 7200.00m;

            // Factory: crear propuesta de módulos
            var fabrica = FabricaPropuestaSelector.Seleccionar(false, "1,2,3", modulos);
            var propuesta = fabrica.Crear(1, 1, 2, precioModulos, "Módulos seleccionados");

            // Strategy: calcular comisión
            var estrategia = SelectorEstrategiaComision.Seleccionar(precioModulos);
            propuesta.PlatformFee = estrategia.CalcularComision(precioModulos);
            propuesta.NetPayout = precioModulos - propuesta.PlatformFee;

            Assert.Equal("Adquisición de Módulos Individuales", fabrica.TipoDescripcion);
            Assert.Equal(modulos, propuesta.ModulosSeleccionadosNombres);
            Assert.Equal(720.00m, propuesta.PlatformFee);
            Assert.Equal(6480.00m, propuesta.NetPayout);

            // Observer: notificar sin errores
            var gestor = new GestorEventosPropuesta();
            var estadisticas = new ObservadorEstadisticas();
            gestor.Suscribir(estadisticas);
            gestor.Notificar(propuesta, "CREADA");

            Assert.Equal(1, estadisticas.TotalCreadas);
        }

        // ================================================================
        // OBJETIVO 5: Ciclo de vida completo de propuestas
        // ================================================================

        [Fact]
        public async Task Objetivo5_PrecioCero_LanzaExcepcion()
        {
            var proposalRepo = new InMemoryRepository<Proposal>();
            var userRepo = new InMemoryRepository<User>();
            var serviceRepo = new InMemoryRepository<FreelanceService>();

            await userRepo.AddAsync(new User { Id = 1, IsActive = true, ProfileCompleted = true, Rating = 5 });
            await serviceRepo.AddAsync(new FreelanceService { Id = 1, Title = "Test", BasePrice = 5000 });

            var gestor = new GestorEventosPropuesta();
            var propService = new ProposalService(proposalRepo, userRepo, serviceRepo, gestor);
            var propuesta = new Proposal
            {
                FreelancerId = 1,
                ServiceId = 1,
                ProposedPrice = 0,
                Message = "Precio inválido",
                EsSistemaCompleto = true
            };

            var ex = await Assert.ThrowsAsync<ArgumentException>(() => propService.SubmitProposalAsync(propuesta));
            Assert.Contains("precio", ex.Message.ToLower());
        }

        [Fact]
        public async Task Objetivo5_Propuesta_FlujoCrearAceptarYRechazar()
        {
            var proposalRepo = new InMemoryRepository<Proposal>();
            var userRepo = new InMemoryRepository<User>();
            var serviceRepo = new InMemoryRepository<FreelanceService>();
            var gestor = new GestorEventosPropuesta();
            var estadisticas = new ObservadorEstadisticas();
            gestor.Suscribir(estadisticas);

            await userRepo.AddAsync(new User { Id = 1, IsActive = true, ProfileCompleted = true, Rating = 5 });
            await serviceRepo.AddAsync(new FreelanceService { Id = 1, Title = "Test", BasePrice = 5000 });

            var propService = new ProposalService(proposalRepo, userRepo, serviceRepo, gestor);

            // Crear propuesta
            var p1 = new Proposal { FreelancerId = 1, ServiceId = 1, ProposedPrice = 3000.00m, Message = "Propuesta 1", EsSistemaCompleto = true };
            var creada = await propService.SubmitProposalAsync(p1);
            Assert.Equal(ProposalStatus.Pending, creada.Status);
            Assert.Equal(1, estadisticas.TotalCreadas);

            // Aceptar propuesta
            var aceptada = await propService.AcceptProposalAsync(creada.Id);
            Assert.NotNull(aceptada);
            Assert.Equal(ProposalStatus.Accepted, aceptada!.Status);
            Assert.Equal(1, estadisticas.TotalAceptadas);

            // Rechazar otra propuesta explícitamente
            var p2 = new Proposal { FreelancerId = 1, ServiceId = 1, ProposedPrice = 2500.00m, Message = "Propuesta 2", EsSistemaCompleto = true };
            var creada2 = await propService.SubmitProposalAsync(p2);
            Assert.Equal(ProposalStatus.Pending, creada2.Status);

            var rechazada = await propService.RejectProposalAsync(creada2.Id);
            Assert.NotNull(rechazada);
            Assert.Equal(ProposalStatus.Rejected, rechazada!.Status);
            Assert.Equal(1, estadisticas.TotalRechazadas);

            // Verificar que la primera sigue aceptada
            var p1actualizada = await proposalRepo.GetByIdAsync(creada.Id);
            Assert.NotNull(p1actualizada);
            Assert.Equal(ProposalStatus.Accepted, p1actualizada!.Status);
        }
    }
}
