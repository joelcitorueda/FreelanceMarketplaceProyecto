#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera un PDF con la guía completa de estudio para la defensa del proyecto FreelancRued
Incluye rutas exactas de carpetas, explicación detallada de tests, y todo el contenido
"""

from fpdf import FPDF
import os

class PDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=20)

    def header(self):
        if self.page_no() > 1:
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(100, 100, 100)
            self.cell(0, 8, 'Guia de Estudio - FreelancRued | Defensa de Proyecto', 0, 0, 'C')
            self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 10, f'Pagina {self.page_no()}/{{nb}}', 0, 0, 'C')

    def titulo_principal(self, texto):
        self.set_font('Helvetica', 'B', 22)
        self.set_text_color(0, 51, 102)
        self.cell(0, 15, texto, 0, 1, 'C')
        self.ln(5)

    def subtitulo(self, texto):
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(0, 70, 130)
        self.cell(0, 10, texto, 0, 1, 'L')
        self.ln(3)

    def sub_subtitulo(self, texto):
        self.set_font('Helvetica', 'B', 13)
        self.set_text_color(50, 50, 50)
        self.cell(0, 8, texto, 0, 1, 'L')
        self.ln(2)

    def parrafo(self, texto):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5.5, texto)
        self.ln(2)

    def parrafo_negrita(self, texto):
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5.5, texto)
        self.ln(1)

    def codigo(self, texto):
        self.set_font('Courier', '', 8.5)
        self.set_text_color(20, 20, 20)
        self.set_fill_color(240, 240, 240)
        self.multi_cell(0, 4.5, texto, fill=True)
        self.ln(2)

    def ruta_archivo(self, texto):
        self.set_font('Courier', 'B', 9)
        self.set_text_color(0, 80, 0)
        self.cell(0, 6, texto, 0, 1)
        self.ln(1)

    def bullet(self, texto, nivel=0):
        prefix = "  " * nivel + "- " if nivel == 0 else "  " * nivel + "* "
        self.set_font('Helvetica', '', 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5.5, prefix + texto)
        self.ln(1)

    def tabla_encabezado(self, cols, widths):
        self.set_font('Helvetica', 'B', 9)
        self.set_fill_color(0, 70, 130)
        self.set_text_color(255, 255, 255)
        for i, col in enumerate(cols):
            self.cell(widths[i], 7, col, 1, 0, 'C', fill=True)
        self.ln()

    def tabla_fila(self, cols, widths, fill=False):
        self.set_font('Helvetica', '', 8.5)
        self.set_text_color(30, 30, 30)
        if fill:
            self.set_fill_color(245, 245, 245)
        else:
            self.set_fill_color(255, 255, 255)
        max_h = 7
        for i, col in enumerate(cols):
            self.cell(widths[i], max_h, col, 1, 0, 'L', fill=fill)
        self.ln()


def generar_pdf():
    pdf = PDF()
    pdf.alias_nb_pages()

    # ===================== PORTADA =====================
    pdf.add_page()
    pdf.ln(40)
    pdf.set_font('Helvetica', 'B', 28)
    pdf.set_text_color(0, 51, 102)
    pdf.cell(0, 15, 'GUIA DE ESTUDIO', 0, 1, 'C')
    pdf.ln(5)
    pdf.set_font('Helvetica', 'B', 22)
    pdf.set_text_color(0, 70, 130)
    pdf.cell(0, 12, 'FreelancRued Marketplace', 0, 1, 'C')
    pdf.ln(10)
    pdf.set_font('Helvetica', '', 14)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(0, 8, 'Preparacion para la Defensa del Proyecto', 0, 1, 'C')
    pdf.cell(0, 8, 'Software II - Gestion de Calidad', 0, 1, 'C')
    pdf.ln(20)
    pdf.set_font('Helvetica', 'I', 11)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 7, 'Contiene: explicacion detallada de cada archivo,', 0, 1, 'C')
    pdf.cell(0, 7, 'rutas exactas, patrones de diseno, refactorizacion,', 0, 1, 'C')
    pdf.cell(0, 7, 'TDD, pruebas por objetivo, y como ejecutar los tests.', 0, 1, 'C')
    pdf.ln(10)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(0, 51, 102)
    pdf.cell(0, 8, '22/22 TESTS PASANDO EXITOSAMENTE', 0, 1, 'C')

    # ===================== INDICE =====================
    pdf.add_page()
    pdf.subtitulo('INDICE')
    pdf.set_font('Helvetica', '', 11)
    indice = [
        ("1. Estructura del Proyecto", "- pagina 3"),
        ("2. La Carpeta FreelanceMarketplace.Tests", "- pagina 5"),
        ("3. Como abrir y ejecutar los tests en Visual Studio / Terminal", "- pagina 7"),
        ("4. Resultado de los tests (22/22)", "- pagina 8"),
        ("5. Modelos de Datos (Models/)", "- pagina 9"),
        ("6. Patron Repository (Services/)", "- pagina 11"),
        ("7. Refactorizacion (ProposalService.cs)", "- pagina 13"),
        ("8. Patron Strategy (Patrones/Estrategia/)", "- pagina 17"),
        ("9. Patron Factory Method (Patrones/Fabrica/)", "- pagina 19"),
        ("10. Patron Observer (Patrones/Observador/)", "- pagina 21"),
        ("11. ExceptionMiddleware y ApiResponse", "- pagina 23"),
        ("12. Program.cs y Endpoints", "- pagina 24"),
        ("13. TDD - 7 Tests Unitarios", "- pagina 26"),
        ("14. Pruebas por Objetivo - 14 Tests", "- pagina 28"),
        ("15. Preguntas Frecuentes de Defensa", "- pagina 31"),
        ("16. Refactorizacion del Frontend", "- pagina 34"),
        ("17. Diagrama de Componentes del Frontend", "- pagina 36"),
    ]
    for item, page in indice:
        pdf.cell(0, 7, f"  {item} {page}", 0, 1)

    # ===================== 1. ESTRUCTURA DEL PROYECTO =====================
    pdf.add_page()
    pdf.subtitulo('1. ESTRUCTURA DEL PROYECTO')
    pdf.parrafo('A continuacion se muestra la estructura completa del proyecto con las RUTAS EXACTAS de cada carpeta y archivo. Esto es importante para que sepas exactamente donde encontrar cada cosa al abrir el proyecto en Visual Studio.')
    pdf.ln(2)

    pdf.sub_subtitulo('Ruta raiz del proyecto:')
    pdf.ruta_archivo('C:\\Users\\user\\Desktop\\Software II\\FreelanceMarketplaceProyecto')
    pdf.ln(2)

    pdf.sub_subtitulo('Arbol de directorios con rutas:')
    tree = """FreelanceMarketplaceProyecto/
|
+-- FreelanceMarketplace.API/              [BACKEND - C# .NET]
|   +-- FreelanceMarketplace.API.slnx      [Solucion de Visual Studio]
|   |
|   +-- FreelanceMarketplace.API/          [Proyecto principal]
|   |   +-- Program.cs                     [Punto de entrada + endpoints]
|   |   +-- FreelanceMarketplace.API.csproj [Configuracion del proyecto]
|   |   |
|   |   +-- Models/
|   |   |   +-- User.cs                     [Modelo de usuario]
|   |   |   +-- FreelanceService.cs         [Modelo de servicio/sistema]
|   |   |   +-- Proposal.cs                 [Modelo de propuesta]
|   |   |   +-- Modulo.cs                   [Modelo de modulo funcional]
|   |   |
|   |   +-- Services/
|   |   |   +-- IGenericRepository.cs       [Interfaz del patron Repository]
|   |   |   +-- SqlRepository.cs            [Repository con SQL Server]
|   |   |   +-- InMemoryRepository.cs       [Repository en memoria (pruebas)]
|   |   |   +-- ProposalService.cs          [Logica de negocio + patrones]
|   |   |
|   |   +-- Patrones/
|   |   |   +-- Estrategia/
|   |   |   |   +-- EstrategiaComision.cs   [Patron Strategy]
|   |   |   +-- Fabrica/
|   |   |   |   +-- FabricaPropuesta.cs     [Patron Factory Method]
|   |   |   +-- Observador/
|   |   |   |   +-- ObservadorPropuesta.cs  [Patron Observer]
|   |   |   +-- Mediator/
|   |   |       +-- GestorConversacion.cs   [Patron Mediator - chat]
|   |   |
|   |   +-- Middlewares/
|   |   |   +-- ExceptionMiddleware.cs.cs   [Manejo global de errores]
|   |   |
|   |   +-- Utils/
|   |   |   +-- ApiResponse.cs              [Respuestas JSON estandarizadas]
|   |   |
|   |   +-- Config/
|   |       +-- ApplicationDbContext.cs     [Entity Framework - BD context]
|   |
|   +-- FreelanceMarketplace.Tests/         [PROYECTO DE TESTS - xUnit]
|       +-- FreelanceMarketplace.Tests.csproj
|       +-- ProposalServiceTests.cs         [7 tests TDD unitarios]
|       +-- AcceptanceTests.cs              [14 tests de aceptacion]
|
+-- frontMarketplace/                      [FRONTEND - React + Vite]
|   +-- src/
|   |   +-- paginas/
|   |   |   +-- PaginaAuth.jsx              [Inicio de sesion / registro]
|   |   |   +-- PaginaInicio.jsx            [Pagina principal]
|   |   |   +-- PaginaServicios.jsx         [Servicios ~130 lineas (refactorizado)]
|   |   |   +-- PaginaPropuestas.jsx        [Propuestas ~160 lineas (refactorizado)]
|   |   |
|   |   +-- componentes/                   [Componentes REUTILIZABLES]
|   |   |   +-- BarraNavegacion.jsx         [Barra de navegacion]
|   |   |   +-- Notificacion.jsx            [Notificaciones]
|   |   |   +-- TarjetaPropuesta.jsx        [Tarjeta individual de propuesta]
|   |   |   +-- FormularioPropuesta.jsx     [Modal crear/editar propuesta]
|   |   |   +-- PanelChat.jsx              [Panel de chat de propuestas]
|   |   |   +-- TarjetaServicio.jsx        [Tarjeta individual de servicio]
|   |   |   +-- FormularioServicio.jsx     [Modal publicar/editar servicio]
|   |   |   +-- FormularioModulo.jsx       [Modal agregar modulo a servicio]
|   |   |
|   |   +-- contexto/
|   |   |   +-- AuthContexto.jsx            [Estado global de autenticacion]
|   |   |
|   |   +-- servicios/
|   |       +-- api.js                      [Conexion con el backend]
|   |
|   +-- package.json
|   +-- vite.config.js
|
+-- INFORME_FINAL_ACTUALIZADO_v3.docx      [Documento del informe]
+-- generar_pdf_guia_estudio.py             [Este script]"""
    pdf.codigo(tree)

    # ===================== 2. TESTS =====================
    pdf.add_page()
    pdf.subtitulo('2. LA CARPETA FreelanceMarketplace.Tests')
    pdf.parrafo('Esta es una de las partes mas importantes del proyecto y es probable que te pregunten especificamente sobre ella en la defensa.')
    pdf.ln(3)

    pdf.sub_subtitulo('2.1. Que es esta carpeta?')
    pdf.parrafo('FreelanceMarketplace.Tests es un PROYECTO DE PRUEBAS separado del proyecto principal. NO es parte del backend que se ejecuta en produccion. Es un proyecto independiente que solo contiene los tests para verificar que el codigo funciona correctamente.')
    pdf.ln(2)

    pdf.sub_subtitulo('2.2. Ruta exacta:')
    pdf.ruta_archivo('C:\\Users\\user\\Desktop\\Software II\\FreelanceMarketplaceProyecto\\FreelanceMarketplace.API\\FreelanceMarketplace.Tests\\')
    pdf.ln(2)

    pdf.sub_subtitulo('2.3. Archivos dentro de esta carpeta:')
    pdf.bullet('FreelanceMarketplace.Tests.csproj - Archivo de configuracion del proyecto de tests')
    pdf.bullet('ProposalServiceTests.cs - Contiene los 7 tests TDD unitarios')
    pdf.bullet('AcceptanceTests.cs - Contiene los 14 tests de aceptacion (pruebas por objetivo)')
    pdf.bullet('bin/ y obj/ - Carpetas generadas automaticamente al compilar (no se tocan)')
    pdf.ln(2)

    pdf.sub_subtitulo('2.4. Que tecnologia usa?')
    pdf.parrafo('Los tests usan el framework xUnit (https://xunit.net/), que es el framework de pruebas mas popular para .NET. Cada test es un metodo marcado con [Fact] que ejecuta una verificacion y lanza una asercion (Assert).')
    pdf.ln(2)

    pdf.sub_subtitulo('2.5. Por que esta separado del proyecto principal?')
    pdf.parrafo('En .NET, los proyectos de tests SIEMPRE estan separados del proyecto principal. Esto es una buena practica de ingenieria de software porque:')
    pdf.bullet('Los tests no se incluyen en la compilacion final (publicacion)')
    pdf.bullet('Se puede ejecutar los tests sin necesidad de ejecutar la API')
    pdf.bullet('Se pueden usar diferentes frameworks de tests sin contaminar el codigo de produccion')
    pdf.bullet('Sigue el principio de Separacion de Intereses (Separation of Concerns)')
    pdf.ln(2)

    pdf.sub_subtitulo('2.6. Como se relaciona con el proyecto principal?')
    pdf.parrafo('El proyecto de tests tiene una REFERENCIA al proyecto principal. Esto se define en el archivo FreelanceMarketplace.Tests.csproj:')
    pdf.codigo('<ProjectReference Include="..\\FreelanceMarketplace.API\\FreelanceMarketplace.API.csproj" />')
    pdf.parrafo('Esto significa que los tests pueden usar todas las clases publicas del proyecto principal (ProposalService, Strategy, Factory, Observer, etc.) sin necesidad de copiar nada.')

    pdf.sub_subtitulo('2.7. Paquetes NuGet que usa (definidos en el .csproj):')
    pdf.bullet('xunit 2.9.3 - El framework de pruebas')
    pdf.bullet('xunit.runner.visualstudio 3.1.4 - Para ejecutar tests desde Visual Studio')
    pdf.bullet('Microsoft.NET.Test.Sdk 17.14.1 - SDK de pruebas de Microsoft')
    pdf.bullet('coverlet.collector 6.0.4 - Para medir cobertura de codigo')
    pdf.ln(2)

    # ===================== 3. COMO EJECUTAR =====================
    pdf.add_page()
    pdf.subtitulo('3. COMO ABRIR Y EJECUTAR LOS TESTS')
    pdf.ln(3)

    pdf.sub_subtitulo('3.1. Opcion 1: Desde Visual Studio (Recomendado para la defensa)')
    pdf.parrafo('PASO 1: Abre Visual Studio.')
    pdf.parrafo('PASO 2: Ve a "Archivo" > "Abrir" > "Proyecto/Solucion".')
    pdf.parrafo('PASO 3: Navega hasta la carpeta del proyecto:')
    pdf.ruta_archivo('C:\\Users\\user\\Desktop\\Software II\\FreelanceMarketplaceProyecto\\FreelanceMarketplace.API\\')
    pdf.parrafo('PASO 4: Selecciona el archivo FreelanceMarketplace.API.slnx (la solucion que contiene AMBOS proyectos: el API y el de Tests).')
    pdf.parrafo('PASO 5: En el "Explorador de Soluciones" (lado derecho), veras DOS proyectos:')
    pdf.bullet('FreelanceMarketplace.API (el proyecto principal)')
    pdf.bullet('FreelanceMarketplace.Tests (el proyecto de pruebas)')
    pdf.parrafo('PASO 6: Para ejecutar los tests, ve al menu "Pruebas" > "Ejecutar" > "Todas las pruebas".')
    pdf.parrafo('PASO 7: Se abrira el "Explorador de Pruebas" (Test Explorer) y veras los 22 tests ejecutandose. Todos deben aparecer en VERDE (pasaron).')
    pdf.ln(3)

    pdf.sub_subtitulo('3.2. Opcion 2: Desde la terminal (Mas rapido para demostrar)')
    pdf.parrafo('PASO 1: Abre una terminal (CMD, PowerShell o Git Bash).')
    pdf.parrafo('PASO 2: Navega a la carpeta de tests:')
    pdf.codigo('cd C:\\Users\\user\\Desktop\\Software II\\FreelanceMarketplaceProyecto\\FreelanceMarketplace.API\\FreelanceMarketplace.Tests')
    pdf.parrafo('PASO 3: Ejecuta el comando:')
    pdf.codigo('dotnet test')
    pdf.parrafo('Resultado esperado:')
    pdf.codigo('Aprobados! - Errores: 0, Correctos: 22, Advertidos: 0, Total: 22, Duracion: 84 ms')
    pdf.ln(2)

    pdf.sub_subtitulo('3.3. Que ventana de Visual Studio usar?')
    pdf.parrafo('ABRES UNA SOLA VENTANA de Visual Studio. La solucion (.slnx) ya incluye ambos proyectos (API + Tests). NO necesitas abrir dos ventanas. En el "Explorador de Soluciones" veras algo como:')
    pdf.codigo('Solution \'FreelanceMarketplace.API\' (2 of 2 projects)')
    pdf.codigo('+-- FreelanceMarketplace.API')
    pdf.codigo('|   +-- Models/')
    pdf.codigo('|   +-- Services/')
    pdf.codigo('|   +-- Patrones/')
    pdf.codigo('|   +-- Program.cs')
    pdf.codigo('+-- FreelanceMarketplace.Tests')
    pdf.codigo('    +-- ProposalServiceTests.cs')
    pdf.codigo('    +-- AcceptanceTests.cs')
    pdf.ln(2)

    pdf.sub_subtitulo('3.4. Como se ve en el Explorador de Pruebas de Visual Studio')
    pdf.parrafo('Cuando ejecutes los tests, el "Explorador de Pruebas" (Test Explorer) te mostrara algo como:')
    pdf.codigo('  [VERDE] ProposalServiceTests')
    pdf.codigo('  [VERDE]   CalcularComision_MontoBajoUmbral_DebeAplicar15Porciento')
    pdf.codigo('  [VERDE]   CalcularComision_MontoSobreUmbral_DebeAplicar10Porciento')
    pdf.codigo('  [VERDE]   CalcularPagoNeto_DebeSerPrecioMenosComision')
    pdf.codigo('  [VERDE]   ... (7 tests TDD)')
    pdf.codigo('  [VERDE] AcceptanceTests')
    pdf.codigo('  [VERDE]   Objetivo1_ComisionEstandar_ParaMontosMenoresA1000')
    pdf.codigo('  [VERDE]   Objetivo1_ComisionPremium_ParaMontosMayoresOIgualA1000')
    pdf.codigo('  [VERDE]   Objetivo2_FabricaSistemaCompleto_CreaPropuestaSinModulos')
    pdf.codigo('  [VERDE]   ... (14 tests de aceptacion)')
    pdf.codigo('  ---------------------------')
    pdf.codigo('  Total: 22 | Pasaron: 22 | Fallaron: 0')

    # ===================== 4. RESULTADOS =====================
    pdf.add_page()
    pdf.subtitulo('4. RESULTADO DE LOS TESTS (22/22)')
    pdf.parrafo('Los tests se ejecutaron exitosamente con el siguiente resultado:')
    pdf.ln(3)

    pdf.set_font('Helvetica', 'B', 14)
    pdf.set_text_color(0, 120, 0)
    pdf.cell(0, 10, '>>> TODOS LOS 22 TESTS PASARON CORRECTAMENTE <<<', 0, 1, 'C')
    pdf.ln(3)

    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(30, 30, 30)
    pdf.parrafo_negrita('Resumen de la ejecucion:')
    pdf.parrafo('  Total de pruebas: 22')
    pdf.parrafo('  Aprobadas: 22')
    pdf.parrafo('  Fallidas: 0')
    pdf.parrafo('  Omitidas: 0')
    pdf.parrafo('  Duracion total: 84 ms (menos de 1 decima de segundo)')
    pdf.ln(3)

    pdf.sub_subtitulo('Desglose de los 22 tests:')
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(0, 70, 130)
    pdf.cell(0, 7, 'ProposalServiceTests.cs (7 tests TDD - Unitarios):', 0, 1)
    pdf.set_font('Courier', '', 8.5)
    tests_tdd = [
        "[OK] CalcularComision_MontoBajoUmbral_DebeAplicar15Porciento",
        "[OK] CalcularComision_MontoSobreUmbral_DebeAplicar10Porciento",
        "[OK] CalcularPagoNeto_DebeSerPrecioMenosComision",
        "[OK] ValidarPrecio_PrecioCero_DebeRetornarFalso",
        "[OK] CalcularComision_MontoExactoEnUmbral_DebeAplicar10Porciento",
        "[OK] PropuestaConModulos_PrecioDebeSerSumaDeModulos",
        "[OK] PropuestaSistemaCompleto_DebeUsarPrecioBase"
    ]
    for t in tests_tdd:
        pdf.cell(0, 5, t, 0, 1)
    pdf.ln(2)

    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(0, 70, 130)
    pdf.cell(0, 7, 'AcceptanceTests.cs (14 tests de Aceptacion - Por Objetivo):', 0, 1)
    pdf.set_font('Courier', '', 8.5)
    tests_accept = [
        "[OK] Objetivo1_ComisionEstandar_ParaMontosMenoresA1000",
        "[OK] Objetivo1_ComisionPremium_ParaMontosMayoresOIgualA1000",
        "[OK] Objetivo1_MontoExactoEnUmbral_UsaComisionPremium",
        "[OK] Objetivo1_ServicioCompleto_CalculaPagoNetoCorrectamente",
        "[OK] Objetivo2_FabricaSistemaCompleto_CreaPropuestaSinModulos",
        "[OK] Objetivo2_FabricaModulos_CreaPropuestaConModulos",
        "[OK] Objetivo2_Observer_NotificaCambiosDeEstado",
        "[OK] Objetivo3_FreelancerActivo_EnviaPropuestaExitosamente",
        "[OK] Objetivo3_FreelancerInactivo_LanzaExcepcion",
        "[OK] Objetivo3_FreelancerSinPerfil_LanzaExcepcion",
        "[OK] Objetivo3_FreelancerBajaCalificacion_LanzaExcepcion",
        "[OK] Objetivo4_FlujoCompleto_StrategyFactoryObserverIntegrados",
        "[OK] Objetivo4_PropuestaModulosConComision_CicloCompleto",
        "[OK] Objetivo5_PrecioCero_LanzaExcepcion",
        "[OK] Objetivo5_Propuesta_FlujoCrearAceptarYRechazar"
    ]
    for t in tests_accept:
        pdf.cell(0, 5, t, 0, 1)

    # ===================== 5. MODELOS =====================
    pdf.add_page()
    pdf.subtitulo('5. MODELOS DE DATOS - Models/')
    pdf.ln(2)

    pdf.sub_subtitulo('5.1. User.cs')
    pdf.ruta_archivo('FreelanceMarketplace.API/FreelanceMarketplace.API/Models/User.cs')
    pdf.parrafo('Representa a los usuarios del sistema, tanto desarrolladores (Freelancer) como clientes (Client). Las propiedades clave son:')
    pdf.bullet('Role: "Freelancer" o "Client" - define el tipo de usuario')
    pdf.bullet('IsActive, ProfileCompleted, Rating: se usan en las validaciones de elegibilidad del ProposalService')
    pdf.parrafo('Tabla en BD: Usuarios')

    pdf.sub_subtitulo('5.2. FreelanceService.cs')
    pdf.ruta_archivo('FreelanceMarketplace.API/FreelanceMarketplace.API/Models/FreelanceService.cs')
    pdf.parrafo('Representa un sistema/servicio publicado por un desarrollador. Ejemplo: "Sistema ERP Empresarial" con precio base de Bs 10,500.')
    pdf.bullet('Modulos: Lista de modulos funcionales que el cliente puede comprar por separado')
    pdf.parrafo('Tabla en BD: Servicios')

    pdf.sub_subtitulo('5.3. Modulo.cs')
    pdf.ruta_archivo('FreelanceMarketplace.API/FreelanceMarketplace.API/Models/Modulo.cs')
    pdf.parrafo('Representa un modulo funcional dentro de un sistema. Ejemplo: "Facturacion", "Gestion de Inventario", "Reportes".')
    pdf.parrafo('Tabla en BD: Modulos')

    pdf.sub_subtitulo('5.4. Proposal.cs')
    pdf.ruta_archivo('FreelanceMarketplace.API/FreelanceMarketplace.API/Models/Proposal.cs')
    pdf.parrafo('Es la entidad MAS IMPORTANTE del negocio. Una propuesta es cuando un cliente dice: "Quiero contratar este servicio por X precio".')
    pdf.bullet('ProposedPrice: Precio que ofrece el cliente')
    pdf.bullet('PlatformFee: Comision que cobra la plataforma (calculada con Strategy)')
    pdf.bullet('NetPayout: Pago neto que recibe el desarrollador (Precio - Comision)')
    pdf.bullet('Status: Pending (0), Accepted (1), Rejected (2), Withdrawn (3)')
    pdf.bullet('EsSistemaCompleto: true = sistema completo, false = modulos individuales')
    pdf.parrafo('Tabla en BD: Propuestas')

    # ===================== 6. REPOSITORY =====================
    pdf.add_page()
    pdf.subtitulo('6. PATRON REPOSITORY - Services/')
    pdf.ln(2)

    pdf.sub_subtitulo('6.1. IGenericRepository.cs - La interfaz')
    pdf.ruta_archivo('FreelanceMarketplace.API/FreelanceMarketplace.API/Services/IGenericRepository.cs')
    pdf.parrafo('Define las operaciones basicas de acceso a datos (CRUD) de forma GENERICA para cualquier tipo de entidad.')
    pdf.codigo('public interface IGenericRepository<T> where T : class {\n    Task<IEnumerable<T>> GetAllAsync();    // Obtener todos\n    Task<T?> GetByIdAsync(int id);         // Obtener por ID\n    Task AddAsync(T entity);               // Agregar\n    Task UpdateAsync(T entity);            // Actualizar\n    Task DeleteAsync(int id);              // Eliminar\n}')
    pdf.parrafo('Al ser generica (<T>), funciona para User, Proposal, FreelanceService y Modulo sin necesidad de escribir 4 repositorios.')

    pdf.sub_subtitulo('6.2. SqlRepository.cs - Implementacion con SQL Server')
    pdf.ruta_archivo('FreelanceMarketplace.API/FreelanceMarketplace.API/Services/SqlRepository.cs')
    pdf.parrafo('Implementacion REAL que se conecta a SQL Server usando Entity Framework Core. Traduce las operaciones C# a consultas SQL automaticamente.')
    pdf.codigo('public async Task<IEnumerable<T>> GetAllAsync()\n    => await _dbSet.ToListAsync();  // Genera: SELECT * FROM Tabla')
    pdf.parrafo('SE USA EN PRODUCCION. Se registra en Program.cs como Scoped (una instancia por peticion HTTP).')

    pdf.sub_subtitulo('6.3. InMemoryRepository.cs - Implementacion en memoria')
    pdf.ruta_archivo('FreelanceMarketplace.API/FreelanceMarketplace.API/Services/InMemoryRepository.cs')
    pdf.parrafo('Implementacion que guarda los datos en una LISTA EN MEMORIA en lugar de una base de datos.')
    pdf.codigo('private readonly List<T> _entities = new();\nprivate int _currentId = 1;')
    pdf.parrafo('SE USA EN LOS TESTS. Permite probar el ProposalService sin necesidad de SQL Server. Esto es posible gracias al polimorfismo: tanto SqlRepository como InMemoryRepository implementan la misma interfaz IGenericRepository<T>.')

    pdf.sub_subtitulo('6.4. Donde se registra cada uno?')
    pdf.ruta_archivo('FreelanceMarketplace.API/FreelanceMarketplace.API/Program.cs')
    pdf.codigo('// En produccion: SQL Server\nbuilder.Services.AddScoped(typeof(IGenericRepository<>), typeof(SqlRepository<>));\n\n// En tests: se crea manualmente el InMemoryRepository\nvar repo = new InMemoryRepository<Proposal>();')

    # ===================== 7. REFACTORIZACION =====================
    pdf.add_page()
    pdf.subtitulo('7. REFACTORIZACION - ProposalService.cs')
    pdf.ruta_archivo('FreelanceMarketplace.API/FreelanceMarketplace.API/Services/ProposalService.cs')
    pdf.parrafo('Este es el archivo MAS IMPORTANTE del proyecto. Aqui se concentra la logica de negocio y se aplicaron las 3 tecnicas de refactorizacion y los 4 patrones de diseno.')
    pdf.ln(2)

    pdf.sub_subtitulo('7.1. CODIGO ANTES (con malos olores)')
    pdf.parrafo('El codigo ORIGINAL tenia estos problemas:')
    pdf.codigo('public async Task<Proposal> SubmitProposalAsync_ANTES(Proposal p) {\n    var u = await _userRepository.GetByIdAsync(p.FreelancerId);\n    // MAL OLOR 3: Condicional complejo\n    if (u == null || !u.IsActive || !u.ProfileCompleted || u.Rating < 3.0)\n        throw new Exception("Desarrollador no elegible");\n\n    var s = await _serviceRepository.GetByIdAsync(p.ServiceId);\n    if (s == null) throw new Exception("Servicio no encontrado");\n\n    // MAL OLOR 1: Numeros magicos (0.10, 0.15, 1000)\n    p.PlatformFee = p.ProposedPrice > 1000\n        ? p.ProposedPrice * 0.10m\n        : p.ProposedPrice * 0.15m;\n\n    // MAL OLOR 2: Metodo largo (todo junto: validacion + calculo + persistencia)\n    p.NetPayout = p.ProposedPrice - p.PlatformFee;\n    p.Status = 0;\n    await _proposalRepository.AddAsync(p);\n    return p;\n}')

    pdf.sub_subtitulo('7.2. Tecnica 1: Reemplazar Numeros Magicos por Constantes')
    pdf.parrafo('QUE HICIMOS: Los numeros 3.0, 0.10, 0.15, 1000 ahora son constantes con nombre.')
    pdf.parrafo('ANTES: if (u.Rating < 3.0)')
    pdf.parrafo('DESPUES:')
    pdf.codigo('private const double CALIFICACION_MINIMA = 3.0;\nif (freelancer.Rating < CALIFICACION_MINIMA)')
    pdf.parrafo('BENEFICIO: Si la calificacion minima cambia a 3.5, solo se modifica UN lugar en lugar de buscar todos los "3.0" en el codigo.')

    pdf.sub_subtitulo('7.3. Tecnica 2: Extraer Metodo')
    pdf.parrafo('QUE HICIMOS: Dividimos el metodo gigante en metodos pequenos con una sola responsabilidad.')
    pdf.parrafo('ANTES: SubmitProposalAsync tenia validacion + calculo + persistencia todo mezclado.')
    pdf.parrafo('DESPUES: Metodos separados:')
    pdf.codigo('public decimal CalcularComisionPlataforma(decimal monto);\npublic decimal CalcularPagoNeto(decimal precio, decimal comision);\nprivate async Task ValidarElegibilidadPropuestaAsync(...);\nprivate void ValidarElegibilidadDesarrollador(User freelancer);')
    pdf.parrafo('BENEFICIO: Cada metodo se puede probar INDEPENDIENTEMENTE (y lo hicimos con TDD). Ademas, CalcularComisionPlataforma se REUTILIZA en SubmitProposalAsync y UpdateProposalAsync.')

    pdf.sub_subtitulo('7.4. Tecnica 3: Descomponer Condicional')
    pdf.parrafo('QUE HICIMOS: La validacion de elegibilidad que antes era un solo if, ahora son metodos separados con mensajes de error ESPECIFICOS.')
    pdf.parrafo('ANTES: if (u == null || !u.IsActive || !u.ProfileCompleted || u.Rating < 3.0)')
    pdf.parrafo('DESPUES:')
    pdf.codigo('private void ValidarElegibilidadDesarrollador(User freelancer) {\n    if (!freelancer.IsActive)\n        throw new InvalidOperationException("La cuenta no esta activa.");\n    if (!freelancer.ProfileCompleted)\n        throw new InvalidOperationException("El perfil esta incompleto.");\n    if (freelancer.Rating < CALIFICACION_MINIMA)\n        throw new InvalidOperationException("Calificacion insuficiente.");\n}')
    pdf.parrafo('BENEFICIO: Si algo falla, sabes EXACTAMENTE que fue. Mensajes claros para el usuario.')

    pdf.sub_subtitulo('7.5. CODIGO DESPUES (limpio con patrones)')
    pdf.parrafo('El metodo principal ahora se lee como una historia paso a paso:')
    pdf.codigo('public async Task<Proposal> SubmitProposalAsync(Proposal proposal) {\n    // 1. Validar elegibilidad (refactorizacion aplicada)\n    await ValidarElegibilidadPropuestaAsync(proposal, freelancer, service);\n\n    // 2. Crear propuesta (Patron Factory Method)\n    var fabrica = FabricaPropuestaSelector.Seleccionar(...);\n\n    // 3. Calcular comision (Patron Strategy)\n    var estrategia = SelectorEstrategiaComision.Seleccionar(proposal.ProposedPrice);\n    proposal.PlatformFee = estrategia.CalcularComision(proposal.ProposedPrice);\n\n    // 4. Guardar en BD (Patron Repository)\n    await _proposalRepository.AddAsync(proposal);\n\n    // 5. Notificar cambio (Patron Observer)\n    _gestorEventos.Notificar(proposal, "CREADA");\n\n    return proposal;\n}')

    # ===================== 8. STRATEGY =====================
    pdf.add_page()
    pdf.subtitulo('8. PATRON STRATEGY - Patrones/Estrategia/')
    pdf.ruta_archivo('FreelanceMarketplace.API/FreelanceMarketplace.API/Patrones/Estrategia/EstrategiaComision.cs')
    pdf.ln(2)

    pdf.parrafo('Tipo: Patron COMPORTAMENTAL (GoF)')
    pdf.parrafo('Proposito: Permite intercambiar algoritmos en tiempo de ejecucion sin usar if-else.')
    pdf.ln(2)

    pdf.sub_subtitulo('Problema que resuelve:')
    pdf.parrafo('El sistema necesita calcular la comision de la plataforma de dos formas diferentes segun el monto:')
    pdf.bullet('Monto < Bs 1,000 -> Comision del 15% (Estandar)')
    pdf.bullet('Monto >= Bs 1,000 -> Comision del 10% (Premium)')
    pdf.parrafo('Sin Strategy, esto se resolvia con un operador ternario con numeros magicos. Con Strategy, cada algoritmo es una clase separada.')

    pdf.sub_subtitulo('Participantes del patron:')
    pdf.parrafo_negrita('Strategy (Interfaz):')
    pdf.codigo('public interface IEstrategiaComision {\n    string Nombre { get; }\n    decimal CalcularComision(decimal montoBase);\n    bool AplicaA(decimal monto);\n}')

    pdf.parrafo_negrita('ConcreteStrategy A - Comision Estandar (15%):')
    pdf.codigo('public class EstrategiaComisionEstandar : IEstrategiaComision {\n    public string Nombre => "Comision Estandar (15%)";\n    public decimal CalcularComision(decimal monto) => monto * 0.15m;\n    public bool AplicaA(decimal monto) => monto < 1000;\n}')

    pdf.parrafo_negrita('ConcreteStrategy B - Comision Premium (10%):')
    pdf.codigo('public class EstrategiaComisionPremium : IEstrategiaComision {\n    public string Nombre => "Comision Premium (10%)";\n    public decimal CalcularComision(decimal monto) => monto * 0.10m;\n    public bool AplicaA(decimal monto) => monto >= 1000;\n}')

    pdf.parrafo_negrita('Selector / Contexto:')
    pdf.codigo('public static class SelectorEstrategiaComision {\n    private static readonly List<IEstrategiaComision> _estrategias = new() {\n        new EstrategiaComisionPremium(),\n        new EstrategiaComisionEstandar(),\n    };\n\n    public static IEstrategiaComision Seleccionar(decimal monto)\n        => _estrategias.First(e => e.AplicaA(monto));\n}')

    pdf.parrafo_negrita('Uso en ProposalService:')
    pdf.codigo('var estrategia = SelectorEstrategiaComision.Seleccionar(proposal.ProposedPrice);\nproposal.PlatformFee = estrategia.CalcularComision(proposal.ProposedPrice);')

    pdf.sub_subtitulo('Ventaja clave:')
    pdf.parrafo('Si en el futuro se necesita una comision del 5% para montos mayores a Bs 10,000, SOLO se crea una nueva clase EstrategiaComisionVIP y se agrega a la lista en SelectorEstrategiaComision. NO se modifica el ProposalService.')

    # ===================== 9. FACTORY =====================
    pdf.add_page()
    pdf.subtitulo('9. PATRON FACTORY METHOD - Patrones/Fabrica/')
    pdf.ruta_archivo('FreelanceMarketplace.API/FreelanceMarketplace.API/Patrones/Fabrica/FabricaPropuesta.cs')
    pdf.ln(2)

    pdf.parrafo('Tipo: Patron CREACIONAL (GoF)')
    pdf.parrafo('Proposito: Encapsular la creacion de objetos para que el codigo cliente no tenga que saber los detalles de construccion.')
    pdf.ln(2)

    pdf.sub_subtitulo('Problema que resuelve:')
    pdf.parrafo('Una propuesta puede ser de DOS tipos diferentes:')
    pdf.bullet('Sistema Completo: EsSistemaCompleto=true, sin modulos')
    pdf.bullet('Modulos Individuales: EsSistemaCompleto=false, con IDs y nombres de modulos')
    pdf.parrafo('Sin Factory, cada vez que se crea una propuesta hay que acordarse de configurar correctamente todas las propiedades segun el tipo.')

    pdf.sub_subtitulo('Participantes del patron:')
    pdf.parrafo_negrita('Creator (Interfaz):')
    pdf.codigo('public interface IFabricaPropuesta {\n    string TipoDescripcion { get; }\n    Proposal Crear(int serviceId, int freelancerId, int clientId,\n                   decimal precio, string mensaje);\n}')

    pdf.parrafo_negrita('ConcreteCreator A - Sistema Completo:')
    pdf.codigo('public class FabricaPropuestaSistemaCompleto : IFabricaPropuesta {\n    public Proposal Crear(...) => new Proposal {\n        EsSistemaCompleto = true,\n        ModulosSeleccionadosIds = "",\n        ModulosSeleccionadosNombres = "",\n        Status = ProposalStatus.Pending,\n        CreatedAt = DateTime.UtcNow,\n    };\n}')

    pdf.parrafo_negrita('ConcreteCreator B - Modulos:')
    pdf.codigo('public class FabricaPropuestaModulos : IFabricaPropuesta {\n    public Proposal Crear(...) => new Proposal {\n        EsSistemaCompleto = false,\n        ModulosSeleccionadosIds = _idsModulos,       // "1,2,3"\n        ModulosSeleccionadosNombres = _nombresModulos, // "Gestion, Facturacion"\n    };\n}')

    pdf.parrafo_negrita('Selector de fabrica:')
    pdf.codigo('public static class FabricaPropuestaSelector {\n    public static IFabricaPropuesta Seleccionar(\n        bool esSistemaCompleto, string idsModulos = "", string nombresModulos = "") {\n        if (esSistemaCompleto)\n            return new FabricaPropuestaSistemaCompleto();\n        return new FabricaPropuestaModulos(idsModulos, nombresModulos);\n    }\n}')

    # ===================== 10. OBSERVER =====================
    pdf.add_page()
    pdf.subtitulo('10. PATRON OBSERVER - Patrones/Observador/')
    pdf.ruta_archivo('FreelanceMarketplace.API/FreelanceMarketplace.API/Patrones/Observador/ObservadorPropuesta.cs')
    pdf.ln(2)

    pdf.parrafo('Tipo: Patron COMPORTAMENTAL (GoF)')
    pdf.parrafo('Proposito: Un objeto (sujeto) notifica automaticamente a multiples observadores cuando ocurre un cambio.')
    pdf.ln(2)

    pdf.sub_subtitulo('Problema que resuelve:')
    pdf.parrafo('Cuando una propuesta cambia de estado (creada, aceptada, rechazada), multiples componentes necesitan reaccionar:')
    pdf.bullet('Mostrar un log en la consola con colores')
    pdf.bullet('Actualizar estadisticas (total creadas, aceptadas, rechazadas, monto total)')
    pdf.bullet('En el futuro: enviar email, actualizar dashboard, etc.')
    pdf.parrafo('Sin Observer, el ProposalService tendria que conocer y llamar explicitamente a cada uno de estos componentes.')

    pdf.sub_subtitulo('Participantes del patron:')
    pdf.parrafo_negrita('Observer (Interfaz):')
    pdf.codigo('public interface IObservadorPropuesta {\n    string Nombre { get; }\n    void Actualizar(Proposal propuesta, string evento);\n}')

    pdf.parrafo_negrita('ConcreteObserver A - Registro en consola:')
    pdf.codigo('public class ObservadorRegistroConsola : IObservadorPropuesta {\n    public void Actualizar(Proposal propuesta, string evento) {\n        Console.WriteLine($"[FreelancRued] Propuesta #{propuesta.Id} -- {evento}");\n    }\n}')

    pdf.parrafo_negrita('ConcreteObserver B - Estadisticas:')
    pdf.codigo('public class ObservadorEstadisticas : IObservadorPropuesta {\n    public int TotalCreadas { get; private set; }\n    public int TotalAceptadas { get; private set; }\n    public int TotalRechazadas { get; private set; }\n    public decimal MontoTotalAceptado { get; private set; }\n}')

    pdf.parrafo_negrita('Subject (Gestor de eventos):')
    pdf.codigo('public class GestorEventosPropuesta {\n    private readonly List<IObservadorPropuesta> _observadores = new();\n\n    public void Suscribir(IObservadorPropuesta observador) => _observadores.Add(observador);\n    public void Desuscribir(IObservadorPropuesta observador) => _observadores.Remove(observador);\n\n    public void Notificar(Proposal propuesta, string evento) {\n        foreach (var observador in _observadores)\n            observador.Actualizar(propuesta, evento);\n    }\n}')

    pdf.sub_subtitulo('Registro en Program.cs (Singleton):')
    pdf.codigo('builder.Services.AddSingleton<GestorEventosPropuesta>(sp => {\n    var gestor = new GestorEventosPropuesta();\n    gestor.Suscribir(new ObservadorRegistroConsola());\n    gestor.Suscribir(new ObservadorEstadisticas());\n    return gestor;\n});')
    pdf.parrafo('Se registra como Singleton para que TODA la aplicacion comparta la misma instancia y las estadisticas sean globales.')

    pdf.sub_subtitulo('Eventos que se notifican:')
    tbl_events = [("Evento", "Metodo", "Descripcion"),
                  ("CREADA", "SubmitProposalAsync", "Cliente creo una propuesta"),
                  ("ACEPTADA", "AcceptProposalAsync", "Desarrollador acepto"),
                  ("RECHAZADA", "RejectProposalAsync", "Desarrollador rechazo"),
                  ("MODIFICADA", "UpdateProposalAsync", "Cliente edito la propuesta"),
                  ("ELIMINADA", "DeleteProposalAsync", "Propuesta eliminada")]
    widths = [40, 60, 80]
    for i, row in enumerate(tbl_events):
        if i == 0:
            pdf.tabla_encabezado(row, widths)
        else:
            pdf.tabla_fila(row, widths, fill=(i % 2 == 0))

    # ===================== 11. MIDDLEWARE + API RESPONSE =====================
    pdf.add_page()
    pdf.subtitulo('11. MIDDLEWARE DE EXCEPCIONES Y ApiResponse')
    pdf.ln(2)

    pdf.sub_subtitulo('11.1. ExceptionMiddleware.cs')
    pdf.ruta_archivo('FreelanceMarketplace.API/FreelanceMarketplace.API/Middlewares/ExceptionMiddleware.cs.cs')
    pdf.parrafo('Es un middleware GLOBAL que intercepta TODAS las peticiones HTTP. Si ocurre cualquier excepcion no controlada durante la ejecucion de un endpoint, la captura y devuelve una respuesta JSON estructurada.')
    pdf.codigo('public async Task InvokeAsync(HttpContext context) {\n    try {\n        await _next(context);  // Ejecuta el endpoint\n    }\n    catch (Exception ex) {\n        // Captura CUALQUIER excepcion\n        await HandleExceptionAsync(context, ex);\n    }\n}\n\n// Devuelve: { success: false, message: "...", errors: [...] }')
    pdf.parrafo('BENEFICIO: No necesitas poner try-catch en cada endpoint. El middleware lo hace una sola vez para todos.')

    pdf.sub_subtitulo('11.2. ApiResponse.cs')
    pdf.ruta_archivo('FreelanceMarketplace.API/FreelanceMarketplace.API/Utils/ApiResponse.cs')
    pdf.parrafo('Estandariza TODAS las respuestas de la API con la misma estructura JSON.')
    pdf.codigo('public class ApiResponse<T> {\n    public bool Success { get; set; }     // true = exito\n    public string Message { get; set; }   // Mensaje legible\n    public T? Data { get; set; }          // Datos de respuesta\n    public List<string> Errors { get; set; }  // Errores\n}\n\n// Metodos de ayuda:\n// ApiResponse.Ok(data, "mensaje")   -> Respuesta exitosa\n// ApiResponse.Fail("error")         -> Respuesta de error')

    # ===================== 12. PROGRAM.CS =====================
    pdf.add_page()
    pdf.subtitulo('12. Program.cs - Los Endpoints de la API')
    pdf.ruta_archivo('FreelanceMarketplace.API/FreelanceMarketplace.API/Program.cs')
    pdf.parrafo('Es el punto de entrada de la aplicacion. Configura la BD, los servicios, CORS y TODOS los endpoints de la API REST.')
    pdf.ln(2)

    endpoints_widths = [25, 65, 90]

    pdf.sub_subtitulo('Endpoints de Autenticacion:')
    pdf.tabla_encabezado(["Metodo", "Ruta", "Funcion"], endpoints_widths)
    pdf.tabla_fila(["POST", "/api/auth/register", "Registrar nuevo usuario"], endpoints_widths, True)
    pdf.tabla_fila(["POST", "/api/auth/login", "Iniciar sesion"], endpoints_widths, False)
    pdf.ln(2)

    pdf.sub_subtitulo('Endpoints de Servicios:')
    pdf.tabla_encabezado(["Metodo", "Ruta", "Funcion"], endpoints_widths)
    pdf.tabla_fila(["GET", "/api/services", "Obtener todos los servicios + modulos"], endpoints_widths, True)
    pdf.tabla_fila(["POST", "/api/services", "Publicar nuevo servicio"], endpoints_widths, False)
    pdf.tabla_fila(["PUT", "/api/services/{id}", "Actualizar servicio"], endpoints_widths, True)
    pdf.tabla_fila(["DELETE", "/api/services/{id}", "Eliminar servicio + sus modulos"], endpoints_widths, False)
    pdf.ln(2)

    pdf.sub_subtitulo('Endpoints de Modulos:')
    pdf.tabla_encabezado(["Metodo", "Ruta", "Funcion"], endpoints_widths)
    pdf.tabla_fila(["GET", "/api/services/{id}/modules", "Obtener modulos de un servicio"], endpoints_widths, True)
    pdf.tabla_fila(["POST", "/api/services/{id}/modules", "Agregar modulo a servicio"], endpoints_widths, False)
    pdf.tabla_fila(["DELETE", "/api/modules/{id}", "Eliminar modulo"], endpoints_widths, True)
    pdf.ln(2)

    pdf.sub_subtitulo('Endpoints de Propuestas (corazon del sistema):')
    pdf.tabla_encabezado(["Metodo", "Ruta", "Funcion"], endpoints_widths)
    pdf.tabla_fila(["GET", "/api/proposals", "Obtener todas las propuestas"], endpoints_widths, True)
    pdf.tabla_fila(["GET", "/api/proposals/developer/{id}", "Propuestas de un desarrollador"], endpoints_widths, False)
    pdf.tabla_fila(["GET", "/api/proposals/client/{id}", "Propuestas de un cliente"], endpoints_widths, True)
    pdf.tabla_fila(["POST", "/api/proposals", "CREAR propuesta (activa Strategy+Factory+Observer)"], endpoints_widths, False)
    pdf.tabla_fila(["POST", "/api/proposals/{id}/accept", "ACEPTAR propuesta"], endpoints_widths, True)
    pdf.tabla_fila(["POST", "/api/proposals/{id}/reject", "RECHAZAR propuesta"], endpoints_widths, False)
    pdf.tabla_fila(["PUT", "/api/proposals/{id}", "Actualizar propuesta"], endpoints_widths, True)
    pdf.tabla_fila(["DELETE", "/api/proposals/{id}", "Eliminar propuesta"], endpoints_widths, False)
    pdf.ln(2)

    pdf.sub_subtitulo('Endpoints de Mensajeria (Mediator):')
    pdf.tabla_encabezado(["Metodo", "Ruta", "Funcion"], endpoints_widths)
    pdf.tabla_fila(["GET", "/api/proposals/{id}/messages", "Obtener mensajes de propuesta"], endpoints_widths, True)
    pdf.tabla_fila(["POST", "/api/proposals/{id}/messages", "Enviar mensaje en propuesta"], endpoints_widths, False)
    pdf.ln(2)

    pdf.sub_subtitulo('Endpoints Auxiliares:')
    pdf.tabla_encabezado(["Metodo", "Ruta", "Funcion"], endpoints_widths)
    pdf.tabla_fila(["GET", "/api/users", "Listar todos los usuarios"], endpoints_widths, True)
    pdf.tabla_fila(["GET", "/api/seed", "Poblar BD con datos de ejemplo"], endpoints_widths, False)
    pdf.tabla_fila(["GET", "/api/crash", "SIMULAR error (probar ExceptionMiddleware)"], endpoints_widths, True)

    # ===================== 13. TDD =====================
    pdf.add_page()
    pdf.subtitulo('13. TDD - 7 TESTS UNITARIOS (ProposalServiceTests.cs)')
    pdf.ruta_archivo('FreelanceMarketplace.API/FreelanceMarketplace.Tests/ProposalServiceTests.cs')
    pdf.ln(2)

    pdf.parrafo('TDD (Test-Driven Development) es una metodologia donde los tests se escriben ANTES del codigo, siguiendo el ciclo:')
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(200, 0, 0)
    pdf.cell(0, 7, '  RED (rojo)  ->  El test FALLA porque el codigo no existe', 0, 1)
    pdf.set_text_color(0, 150, 0)
    pdf.cell(0, 7, '  GREEN (verde) ->  Se escribe el codigo MINIMO para que pase', 0, 1)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 7, '  REFACTOR  ->  Se mejora el codigo sin romper el test', 0, 1)
    pdf.ln(3)

    pdf.parrafo('Los tests unitarios siguen el patron AAA: Arrange (preparar), Act (actuar), Assert (verificar).')
    pdf.ln(2)

    pdf.sub_subtitulo('Test 1: Comision estandar (15%) para montos < Bs 1,000')
    pdf.codigo('[Fact]\npublic void CalcularComision_MontoBajoUmbral_DebeAplicar15Porciento() {\n    // ARRANGE\n    var servicio = new ProposalService(null);\n    decimal montoPropuesto = 800.00m;\n\n    // ACT\n    decimal comision = servicio.CalcularComisionPlataforma(montoPropuesto);\n\n    // ASSERT\n    Assert.Equal(120.00m, comision);  // 800 * 0.15 = 120\n}')
    pdf.parrafo('Que prueba: Bs 800 -> 15% -> Bs 120 de comision.')

    pdf.sub_subtitulo('Test 2: Comision premium (10%) para montos >= Bs 1,000')
    pdf.codigo('[Fact]\npublic void CalcularComision_MontoSobreUmbral_DebeAplicar10Porciento() {\n    // ARRANGE\n    var servicio = new ProposalService(null);\n    decimal montoPropuesto = 5000.00m;\n\n    // ACT\n    decimal comision = servicio.CalcularComisionPlataforma(montoPropuesto);\n\n    // ASSERT\n    Assert.Equal(500.00m, comision);  // 5000 * 0.10 = 500\n}')

    pdf.sub_subtitulo('Test 3: Pago neto = Precio - Comision')
    pdf.codigo('[Fact]\npublic void CalcularPagoNeto_DebeSerPrecioMenosComision() {\n    var servicio = new ProposalService(null);\n    decimal pagoNeto = servicio.CalcularPagoNeto(3000.00m, 300.00m);\n    Assert.Equal(2700.00m, pagoNeto);  // 3000 - 300 = 2700\n}')

    pdf.sub_subtitulo('Test 4: Precio cero es invalido')
    pdf.codigo('[Fact]\npublic void ValidarPrecio_PrecioCero_DebeRetornarFalso() {\n    bool esValido = 0 > 0;\n    Assert.False(esValido);\n}')

    pdf.sub_subtitulo('Test 5: Caso borde - exactamente Bs 1,000 (usa premium)')
    pdf.codigo('[Fact]\npublic void CalcularComision_MontoExactoEnUmbral_DebeAplicar10Porciento() {\n    var servicio = new ProposalService(null);\n    decimal comision = servicio.CalcularComisionPlataforma(1000.00m);\n    Assert.Equal(100.00m, comision);  // 1000 * 0.10 = 100\n}')

    pdf.sub_subtitulo('Test 6: Precio con modulos seleccionados')
    pdf.codigo('[Fact]\npublic void PropuestaConModulos_PrecioDebeSerSumaDeModulos() {\n    var modulos = new List<Modulo> {\n        new Modulo { Precio = 1500.00m },\n        new Modulo { Precio = 2500.00m }\n    };\n    decimal total = modulos.Sum(m => m.Precio);\n    Assert.Equal(4000.00m, total);  // 1500 + 2500 = 4000\n}')

    pdf.sub_subtitulo('Test 7: Sistema completo usa precio base')
    pdf.codigo('[Fact]\npublic void PropuestaSistemaCompleto_DebeUsarPrecioBase() {\n    var servicio = new FreelanceService { BasePrice = 10500.00m };\n    decimal precio = true ? servicio.BasePrice : 0;\n    Assert.Equal(10500.00m, precio);\n}')

    # ===================== 14. PRUEBAS POR OBJETIVO =====================
    pdf.add_page()
    pdf.subtitulo('14. PRUEBAS POR OBJETIVO - 14 TESTS (AcceptanceTests.cs)')
    pdf.ruta_archivo('FreelanceMarketplace.API/FreelanceMarketplace.Tests/AcceptanceTests.cs')
    pdf.ln(2)

    pdf.parrafo('Las PRUEBAS POR OBJETIVO (acceptance tests) validan que el sistema CUMPLE SUS OBJETIVOS FUNCIONALES. A diferencia de los tests TDD que prueban funciones sueltas, estas pruebas INTEGRAN multiples componentes para probar escenarios reales.')
    pdf.parrafo('Usan InMemoryRepository en lugar de SQL Server, lo que demuestra el desacoplamiento logrado con el patron Repository.')
    pdf.ln(3)

    pdf.sub_subtitulo('OBJETIVO 1: Calculo de comisiones (4 tests)')
    pdf.parrafo('Prueba que el patron Strategy calcula correctamente las comisiones:')
    tbl_o1 = [("Test", "Entrada", "Esperado"),
              ("Comision Estandar", "Bs 800", "Bs 120 (15%)"),
              ("Comision Premium", "Bs 2,500", "Bs 250 (10%)"),
              ("Umbral exacto", "Bs 1,000", "Bs 100 (10%)"),
              ("Sistema Completo", "Bs 10,500 comision", "Bs 1,050, neto Bs 9,450")]
    for i, row in enumerate(tbl_o1):
        widths = [50, 45, 80]
        if i == 0:
            pdf.tabla_encabezado(row, widths)
        else:
            pdf.tabla_fila(row, widths, fill=(i % 2 == 0))
    pdf.ln(3)

    pdf.sub_subtitulo('OBJETIVO 2: Creacion de propuestas (3 tests)')
    pdf.parrafo('Prueba que Factory Method crea propuestas correctamente y que Observer notifica:')
    tbl_o2 = [("Test", "Que prueba"),
              ("Fabrica Sistema Completo", "Factory crea propuesta sin modulos"),
              ("Fabrica Modulos", "Factory crea propuesta con IDs y nombres de modulos"),
              ("Observer notifica", "Observer cuenta creadas y aceptadas")]
    for i, row in enumerate(tbl_o2):
        widths = [55, 120]
        if i == 0:
            pdf.tabla_encabezado(row, widths)
        else:
            pdf.tabla_fila(row, widths, fill=(i % 2 == 0))
    pdf.ln(3)

    pdf.sub_subtitulo('OBJETIVO 3: Validacion de desarrolladores (4 tests)')
    pdf.parrafo('Prueba las validaciones de elegibilidad a traves de InMemoryRepository + SubmitProposalAsync:')
    tbl_o3 = [("Test", "Condicion", "Resultado"),
              ("Freelancer activo", "IsActive=true, Rating=4.5", "Propuesta creada OK"),
              ("Freelancer inactivo", "IsActive=false", "Excepcion: no activa"),
              ("Perfil incompleto", "ProfileCompleted=false", "Excepcion: perfil"),
              ("Baja calificacion", "Rating=2.5 < 3.0", "Excepcion: calificacion")]
    for i, row in enumerate(tbl_o3):
        widths = [45, 55, 75]
        if i == 0:
            pdf.tabla_encabezado(row, widths)
        else:
            pdf.tabla_fila(row, widths, fill=(i % 2 == 0))
    pdf.ln(3)

    pdf.sub_subtitulo('OBJETIVO 4: Integracion de patrones (2 tests)')
    pdf.parrafo('Prueba que Strategy + Factory + Observer funcionan juntos:')
    tbl_o4 = [("Test", "Que prueba"),
              ("Flujo Completo", "SubmitProposalAsync activa Strategy (calcula comision) + Factory (crea) + Observer (notifica)"),
              ("Modulos con Comision", "Factory crea propuesta modulo, Strategy calcula, Observer notifica")]
    for i, row in enumerate(tbl_o4):
        widths = [50, 125]
        if i == 0:
            pdf.tabla_encabezado(row, widths)
        else:
            pdf.tabla_fila(row, widths, fill=(i % 2 == 0))
    pdf.ln(3)

    pdf.sub_subtitulo('OBJETIVO 5: Ciclo de vida de propuestas (2 tests)')
    pdf.parrafo('Prueba el flujo completo de una propuesta:')
    tbl_o5 = [("Test", "Que prueba"),
              ("PrecioCero", "Enviar propuesta con precio Bs 0 -> Excepcion"),
              ("CrearAceptarRechazar", "Crear -> Aceptar -> Rechazar con verificacion de todos los estados")]
    for i, row in enumerate(tbl_o5):
        widths = [50, 125]
        if i == 0:
            pdf.tabla_encabezado(row, widths)
        else:
            pdf.tabla_fila(row, widths, fill=(i % 2 == 0))

    # ===================== 15. PREGUNTAS =====================
    pdf.add_page()
    pdf.subtitulo('15. PREGUNTAS FRECUENTES DE DEFENSA')
    pdf.ln(2)

    preguntas = [
        ("P: Por que usaste 4 patrones de diseno?",
         "R: Use 4 patrones GoF porque cada uno resuelve un problema especifico: Strategy para los algoritmos de comision que cambian segun el monto, Factory Method para crear distintos tipos de propuestas (sistema completo vs modulos), Observer para notificar cambios de estado a multiples componentes (logs y estadisticas), y Mediator para centralizar la mensajeria del chat."),

        ("P: Que tecnicas de refactorizacion aplicaste?",
         "R: Aplique 3 tecnicas: (1) Reemplazar numeros magicos por constantes - cambie 0.10, 0.15, 1000, 3.0 por constantes con nombre como CALIFICACION_MINIMA. (2) Extraer metodo - dividi el metodo gigante SubmitProposalAsync en metodos pequenos como CalcularComisionPlataforma, CalcularPagoNeto, ValidarElegibilidadPropuestaAsync. (3) Descomponer condicional - separe el if de validacion en metodos individuales con mensajes de error especificos."),

        ("P: Como funciona el patron Strategy y donde esta?",
         "R: Esta en Patrones/Estrategia/EstrategiaComision.cs. Defini una interfaz IEstrategiaComision con el metodo CalcularComision, y dos implementaciones: EstrategiaComisionEstandar (15% para montos < Bs 1,000) y EstrategiaComisionPremium (10% para montos >= Bs 1,000). El SelectorEstrategiaComision elige automaticamente la estrategia segun el monto."),

        ("P: Y el Factory Method?",
         "R: Esta en Patrones/Fabrica/FabricaPropuesta.cs. Tengo dos fabricas concretas: FabricaPropuestaSistemaCompleto (crea propuestas con EsSistemaCompleto=true) y FabricaPropuestaModulos (crea propuestas con modulos seleccionados). El FabricaPropuestaSelector elige la fabrica correcta segun los datos de entrada."),

        ("P: Explica el Observer - por que Singleton?",
         "R: Esta en Patrones/Observador/ObservadorPropuesta.cs. Lo registramos como Singleton en Program.cs para que toda la aplicacion comparta la misma instancia. Esto asegura que el ObservadorEstadisticas mantenga un conteo GLOBAL de todas las propuestas creadas, aceptadas y rechazadas a lo largo de toda la vida de la aplicacion."),

        ("P: Que diferencia hay entre SqlRepository e InMemoryRepository?",
         "R: SqlRepository se conecta a SQL Server y ejecuta consultas reales. InMemoryRepository guarda los datos en una lista en memoria. Ambos implementan la misma interfaz IGenericRepository<T>, lo que permite usar InMemoryRepository en las pruebas sin base de datos, y SqlRepository en produccion."),

        ("P: Como aplicaste TDD?",
         "R: Segui el ciclo Red-Green-Refactor. Primero escribia el test (que fallaba porque el codigo no existia - RED), luego implementaba el codigo minimo para que pasara (GREEN), y finalmente refactorizaba para mejorar el codigo sin romper el test (REFACTOR). Ejemplo: primero escribi el test CalcularComision_MontoBajoUmbral_DebeAplicar15Porciento, luego implemente el metodo, y finalmente refactorice con Strategy."),

        ("P: Cuantos tests tienes en total y que cubren?",
         "R: Tengo 22 tests en total: 7 tests TDD unitarios (prueban calculos de comision, pago neto y precios) y 14 tests de aceptacion (prueban los 5 objetivos del sistema: comisiones, creacion, validacion, integracion de patrones y ciclo de vida). Todos pasan exitosamente con dotnet test."),

        ("P: Como se ejecutan los tests desde Visual Studio?",
         "R: Abro la solucion FreelanceMarketplace.API.slnx, voy al menu Pruebas > Ejecutar > Todas las pruebas. El Explorador de Pruebas muestra los 22 tests en verde. Tambien se puede ejecutar desde terminal con 'dotnet test' en la carpeta FreelanceMarketplace.Tests."),

        ("P: Que hace el ExceptionMiddleware?",
         "R: Es un middleware global en Middlewares/ExceptionMiddleware.cs que intercepta todas las peticiones HTTP. Si ocurre cualquier excepcion no controlada, la captura y devuelve una respuesta JSON con codigo 500 y la estructura de ApiResponse. Asi no necesito try-catch en cada endpoint."),

        ("P: Por que separaste los tests del proyecto principal?",
         "R: En .NET es una buena practica tener los tests en un proyecto separado porque: no se incluyen en la compilacion final, se pueden ejecutar independientemente, se pueden usar diferentes frameworks de pruebas, y sigue el principio de Separacion de Intereses."),

        ("P: Refactorizaste el frontend? Que hiciste?",
         'R: Si. Las paginas PaginaPropuestas.jsx (~500 lineas) y PaginaServicios.jsx (~400 lineas) eran demasiado largas y mezclaban logica de estado con JSX visual. Aplique la tecnica de refactorizacion Extraer Componente (equivalente a Extraer Metodo de la refactorizacion del backend): cree 6 componentes individuales en frontMarketplace/src/componentes/ (TarjetaPropuesta, FormularioPropuesta, PanelChat, TarjetaServicio, FormularioServicio, FormularioModulo). Ahora las paginas tienen ~150 lineas cada una y los componentes se pueden probar y mantener por separado.'),

        ("P: Como se comunican los componentes del frontend con el backend?",
         "R: A traves de api.js en frontMarketplace/src/servicios/api.js. Este modulo centraliza todas las llamadas HTTP usando fetch() y maneja los tokens de autenticacion. El backend expone endpoints REST en Program.cs que devuelven respuestas JSON con la estructura estandar de ApiResponse. Los componentes llaman a funciones de api.js, que a su vez llaman al backend.")
    ]

    for i, (pregunta, respuesta) in enumerate(preguntas):
        if i > 0 and i % 3 == 0:
            pdf.add_page()
        pdf.set_font('Helvetica', 'B', 10)
        pdf.set_text_color(0, 51, 102)
        pdf.multi_cell(0, 5.5, pregunta)
        pdf.ln(1)
        pdf.set_font('Helvetica', '', 9.5)
        pdf.set_text_color(30, 30, 30)
        pdf.multi_cell(0, 5, respuesta)
        pdf.ln(4)

    # ===================== 16. REFACTORIZACION FRONTEND =====================
    pdf.add_page()
    pdf.subtitulo('16. REFACTORIZACION DEL FRONTEND')
    pdf.ruta_archivo('frontMarketplace/src/')
    pdf.ln(2)

    pdf.parrafo('Se aplico la tecnica de refactorizacion "Extraer Componente" (equivalente a "Extraer Metodo" pero en React) para dividir las paginas grandes en componentes mas pequenos y manejables.')
    pdf.ln(2)

    pdf.sub_subtitulo('16.1. Problema original: Archivos muy largos')
    pdf.parrafo('Antes de refactorizar, dos archivos del frontend tenian cientos de lineas de codigo mezclando logica de estado con JSX visual:')
    tbl_before = [("Archivo", "Lineas", "Problema"),
                   ("PaginaPropuestas.jsx", "~500", "3 responsabilidades: estado + logica + 3 bloques JSX"),
                   ("PaginaServicios.jsx", "~400", "3 responsabilidades: estado + logica + 3 bloques JSX")]
    widths_before = [55, 20, 100]
    for i, row in enumerate(tbl_before):
        if i == 0:
            pdf.tabla_encabezado(row, widths_before)
        else:
            pdf.tabla_fila(row, widths_before, fill=(i % 2 == 0))
    pdf.ln(3)

    pdf.sub_subtitulo('16.2. Solucion: Extraer componentes individuales')
    pdf.parrafo('Se crearon 6 nuevos componentes en frontMarketplace/src/componentes/, cada uno con UNA SOLA responsabilidad:')
    tbl_new = [("Componente", "Lineas", "Responsabilidad"),
                ("TarjetaPropuesta.jsx", "~120", "Renderizar tarjeta visual de una propuesta"),
                ("FormularioPropuesta.jsx", "~184", "Modal de crear/editar propuesta"),
                ("PanelChat.jsx", "~93", "Panel de mensajeria (forwardRef para scroll)"),
                ("TarjetaServicio.jsx", "~123", "Renderizar tarjeta visual de un servicio"),
                ("FormularioServicio.jsx", "~72", "Modal de publicar/editar servicio"),
                ("FormularioModulo.jsx", "~50", "Modal de agregar modulo a servicio")]
    widths_new = [55, 18, 102]
    for i, row in enumerate(tbl_new):
        if i == 0:
            pdf.tabla_encabezado(row, widths_new)
        else:
            pdf.tabla_fila(row, widths_new, fill=(i % 2 == 0))
    pdf.ln(3)

    pdf.sub_subtitulo('16.3. Antes vs Despues (comparacion de tamanos)')
    tbl_comp = [("Archivo", "Antes", "Despues", "Reduccion"),
                 ("PaginaPropuestas.jsx", "~500 lineas", "~160 lineas", "-68%"),
                 ("PaginaServicios.jsx", "~400 lineas", "~130 lineas", "-68%")]
    widths_comp = [45, 25, 25, 25]
    for i, row in enumerate(tbl_comp):
        if i == 0:
            pdf.tabla_encabezado(row, widths_comp)
        else:
            pdf.tabla_fila(row, widths_comp, fill=(i % 2 == 0))
    pdf.ln(3)

    pdf.sub_subtitulo('16.4. Estructura de componentes: Como se relacionan')
    pdf.parrafo('Las paginas se redujeron a solo manejar ESTADO y EVENTOS, mientras que el JSX visual se delego a los componentes:')
    pdf.codigo('PaginaPropuestas.jsx (solo estado y logica)')
    pdf.codigo('  +-- TarjetaPropuesta.jsx (prop: propuesta)')
    pdf.codigo('  +-- FormularioPropuesta.jsx (prop: formulario, servicios)')
    pdf.codigo('  +-- PanelChat.jsx (prop: mensajes, ref para scroll)')
    pdf.ln(1)
    pdf.codigo('PaginaServicios.jsx (solo estado y logica)')
    pdf.codigo('  +-- TarjetaServicio.jsx (prop: servicio)')
    pdf.codigo('  +-- FormularioServicio.jsx (prop: formState)')
    pdf.codigo('  +-- FormularioModulo.jsx (prop: modalModulo)')
    pdf.ln(3)

    pdf.sub_subtitulo('16.5. Ventajas de la refactorizacion')
    pdf.bullet('MANTENIBILIDAD: Si hay un error en el chat, abres solo PanelChat.jsx (~93 lineas) en lugar de buscar en 500 lineas.')
    pdf.bullet('REUTILIZACION: Los componentes se pueden usar en otras paginas sin duplicar codigo.')
    pdf.bullet('PRUEBAS: Cada componente se puede probar independientemente.')
    pdf.bullet('COLABORACION: Varios desarrolladores pueden trabajar en diferentes componentes simultaneamente.')
    pdf.ln(2)

    pdf.sub_subtitulo('16.6. Ruta de los nuevos componentes')
    pdf.ruta_archivo('C:\\Users\\user\\Desktop\\Software II\\FreelanceMarketplaceProyecto\\frontMarketplace\\src\\componentes\\')
    pdf.ln(2)

    # ===================== 17. DIAGRAMA COMPONENTES =====================
    pdf.add_page()
    pdf.subtitulo('17. DIAGRAMA DE COMPONENTES DEL FRONTEND')
    pdf.ln(2)

    pdf.parrafo('Diagrama que muestra como se organizan los componentes del frontend y las relaciones entre ellos:')
    pdf.ln(2)

    pdf.codigo('App.jsx (Router principal)')
    pdf.codigo('  |')
    pdf.codigo('  +-- BarraNavegacion.jsx  (siempre visible)')
    pdf.codigo('  +-- AuthContexto.jsx  (estado global de usuario)')
    pdf.codigo('  |')
    pdf.codigo('  +-- [Ruta /]  -->  PaginaInicio.jsx')
    pdf.codigo('  +-- [Ruta /auth]  -->  PaginaAuth.jsx')
    pdf.codigo('  +-- [Ruta /servicios]  -->  PaginaServicios.jsx')
    pdf.codigo('  |     +-- TarjetaServicio.jsx')
    pdf.codigo('  |     +-- FormularioServicio.jsx')
    pdf.codigo('  |     +-- FormularioModulo.jsx')
    pdf.codigo('  |     +-- Notificacion.jsx')
    pdf.codigo('  |')
    pdf.codigo('  +-- [Ruta /propuestas]  -->  PaginaPropuestas.jsx')
    pdf.codigo('        +-- TarjetaPropuesta.jsx')
    pdf.codigo('        +-- FormularioPropuesta.jsx')
    pdf.codigo('        +-- PanelChat.jsx  (forwardRef para auto-scroll)')
    pdf.codigo('        +-- Notificacion.jsx')
    pdf.ln(3)

    pdf.sub_subtitulo('Flujo de datos:')
    pdf.parrafo('Cada pagina (PaginaServicios, PaginaPropuestas) mantiene su propio estado local con useState y useEffect. Los componentes hijos reciben datos via props y notifican cambios mediante funciones callback. El AuthContexto mantiene el estado global del usuario (autenticacion, rol) y se consume con useContext.')
    pdf.ln(2)
    pdf.parrafo('API.js es la capa de comunicacion con el backend. Todos los llamados HTTP pasan por este modulo, que usa fetch() y maneja los tokens de autenticacion.')

    # ===================== ULTIMA PAGINA =====================
    pdf.add_page()
    pdf.ln(40)
    pdf.set_font('Helvetica', 'B', 20)
    pdf.set_text_color(0, 51, 102)
    pdf.cell(0, 12, 'MUCHO EXITO EN TU DEFENSA!', 0, 1, 'C')
    pdf.ln(10)
    pdf.set_font('Helvetica', '', 13)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(0, 8, 'Tienes un proyecto solido y bien estructurado.', 0, 1, 'C')
    pdf.cell(0, 8, '22 tests pasando, 4 patrones GoF, 3 tecnicas de refactorizacion.', 0, 1, 'C')
    pdf.cell(0, 8, 'Todo lo que necesitas saber esta en este PDF.', 0, 1, 'C')
    pdf.ln(15)
    pdf.set_font('Helvetica', 'I', 11)
    pdf.set_text_color(120, 120, 120)
    pdf.cell(0, 7, 'Generado el: Junio 2026', 0, 1, 'C')
    pdf.cell(0, 7, 'FreelancRued Marketplace - Software II', 0, 1, 'C')

    # Guardar PDF
    output_path = os.path.join(os.getcwd(), 'GUIA_ESTUDIO_FREELANCRUED_DEFENSA.pdf')
    pdf.output(output_path)
    print(f"PDF generado exitosamente: {output_path}")
    print(f"Tamanio: {os.path.getsize(output_path) / 1024:.1f} KB")
    print(f"Paginas: {pdf.page_no()}")

if __name__ == '__main__':
    generar_pdf()
