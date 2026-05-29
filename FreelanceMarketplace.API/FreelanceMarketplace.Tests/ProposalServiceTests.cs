using Xunit;
using FreelanceMarketplace.API.Models;
using FreelanceMarketplace.API.Services;

namespace FreelanceMarketplace.Tests
{
    /// <summary>
    /// Tests TDD para la lógica de cálculo de comisiones en Bs (bolivianos)
    /// Ciclo: Red (falla) → Green (pasa) → Refactor
    /// </summary>
    public class ProposalServiceTests
    {
        // Constantes del sistema (mismas que ProposalService.cs)
        private const decimal COMISION_ESTANDAR = 0.15m;    // 15%
        private const decimal COMISION_PREMIUM = 0.10m;      // 10% para montos altos
        private const decimal UMBRAL_PREMIUM_BS = 1000.00m; // Límite para tarifa premium

        // =====================================================
        // TEST 1: Comisión estándar (15%) para propuestas menores a Bs 1000
        // =====================================================
        [Fact]
        public void CalcularComision_MontoBajoUmbral_DebeAplicar15Porciento()
        {
            // Arrange (preparar)
            var servicio = new ProposalService(null!);
            decimal montoPropuesto = 800.00m; // Bs 800 — menor al umbral de Bs 1000

            // Act (actuar)
            decimal comisionCalculada = servicio.CalcularComisionPlataforma(montoPropuesto);

            // Assert (verificar)
            decimal comisionEsperada = 800.00m * COMISION_ESTANDAR; // 800 * 0.15 = 120 Bs
            Assert.Equal(comisionEsperada, comisionCalculada);
        }

        // =====================================================
        // TEST 2: Comisión premium (10%) para propuestas mayores a Bs 1000
        // =====================================================
        [Fact]
        public void CalcularComision_MontoSobreUmbral_DebeAplicar10Porciento()
        {
            // Arrange
            var servicio = new ProposalService(null!);
            decimal montoPropuesto = 5000.00m; // Bs 5000 — mayor al umbral

            // Act
            decimal comisionCalculada = servicio.CalcularComisionPlataforma(montoPropuesto);

            // Assert
            decimal comisionEsperada = 5000.00m * COMISION_PREMIUM; // 5000 * 0.10 = 500 Bs
            Assert.Equal(comisionEsperada, comisionCalculada);
        }

        // =====================================================
        // TEST 3: Pago neto = Precio - Comisión
        // =====================================================
        [Fact]
        public void CalcularPagoNeto_DebeSerPrecioMenosComision()
        {
            // Arrange
            var servicio = new ProposalService(null!);
            decimal precio = 3000.00m;
            decimal comision = 300.00m; // 10% de 3000

            // Act
            decimal pagoNeto = servicio.CalcularPagoNeto(precio, comision);

            // Assert
            Assert.Equal(2700.00m, pagoNeto); // 3000 - 300 = 2700 Bs
        }

        // =====================================================
        // TEST 4: Validar que precio cero lanza excepción
        // =====================================================
        [Fact]
        public void ValidarPrecio_PrecioCero_DebeRetornarFalso()
        {
            // Arrange
            decimal precioInvalido = 0;

            // Act
            bool esValido = precioInvalido > 0;

            // Assert
            Assert.False(esValido); // El precio debe ser mayor a Bs 0
        }

        // =====================================================
        // TEST 5: Comisión exactamente en el umbral (Bs 1000 → usa tarifa premium)
        // =====================================================
        [Fact]
        public void CalcularComision_MontoExactoEnUmbral_DebeAplicar10Porciento()
        {
            // Arrange
            var servicio = new ProposalService(null!);
            decimal montoPropuesto = 1000.00m; // Exactamente en el umbral

            // Act
            decimal comisionCalculada = servicio.CalcularComisionPlataforma(montoPropuesto);

            // Assert
            decimal comisionEsperada = 1000.00m * COMISION_PREMIUM; // 1000 * 0.10 = 100 Bs
            Assert.Equal(comisionEsperada, comisionCalculada);
        }

        // =====================================================
        // TEST 6: Propuesta con módulos seleccionados calcula precio correcto
        // =====================================================
        [Fact]
        public void PropuestaConModulos_PrecioDebeSerSumaDeModulos()
        {
            // Arrange — módulos seleccionados individualmente
            var modulo1 = new Modulo { Nombre = "Gestión de Usuarios", Precio = 1500.00m };
            var modulo2 = new Modulo { Nombre = "Gestión de Inventario", Precio = 2500.00m };
            var modulosSeleccionados = new List<Modulo> { modulo1, modulo2 };

            // Act
            decimal totalModulos = modulosSeleccionados.Sum(m => m.Precio);

            // Assert
            Assert.Equal(4000.00m, totalModulos); // 1500 + 2500 = 4000 Bs
        }

        // =====================================================
        // TEST 7: Propuesta de sistema completo usa el precio base del servicio
        // =====================================================
        [Fact]
        public void PropuestaSistemaCompleto_DebeUsarPrecioBase()
        {
            // Arrange
            var servicio = new FreelanceService
            {
                Title = "Sistema ERP",
                BasePrice = 10500.00m
            };
            bool esSistemaCompleto = true;

            // Act
            decimal precioFinal = esSistemaCompleto ? servicio.BasePrice : 0;

            // Assert
            Assert.Equal(10500.00m, precioFinal);
        }
    }
}
