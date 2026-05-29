using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using FreelanceMarketplace.API.Models;
using FreelanceMarketplace.API.Services;
using FreelanceMarketplace.API.Utils;
using FreelanceMarketplace.API.Middlewares;
using FreelanceMarketplace.API.Config;

var builder = WebApplication.CreateSlimBuilder(args);

// 1. CONFIGURAR BASE DE DATOS Y CONTENEDOR DE INYECCIÓN DE DEPENDENCIAS
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=DESKTOP-EROEUF5\\SQLEXPRESS;Database=Marketplace;Trusted_Connection=True;TrustServerCertificate=True;";

// Registrar el contexto de base de datos con SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// Registrar repositorios genéricos usando registro de genéricos abiertos
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(SqlRepository<>));
builder.Services.AddScoped<IProposalService, ProposalService>();

// Configurar CORS para permitir comunicación con el frontend React
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configurar opciones de serialización JSON
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
});

var app = builder.Build();

// 2. INICIALIZAR ESTRUCTURA DE LA BASE DE DATOS AUTOMÁTICAMENTE
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.EnsureCreated();
}

// 3. HABILITAR CORS
app.UseCors("PermitirFrontend");

// 4. REGISTRAR MIDDLEWARE GLOBAL DE EXCEPCIONES
app.UseMiddleware<ExceptionMiddleware>();

// =====================================================
// 5. ENDPOINTS DE AUTENTICACIÓN
// =====================================================

// Registrar un nuevo usuario (Desarrollador o Cliente)
app.MapPost("/api/auth/register", async (User nuevoUsuario, IGenericRepository<User> repoUsuarios) =>
{
    if (string.IsNullOrWhiteSpace(nuevoUsuario.Name))
        return Results.BadRequest(ApiResponse.Fail("El nombre es obligatorio."));
    if (string.IsNullOrWhiteSpace(nuevoUsuario.Email))
        return Results.BadRequest(ApiResponse.Fail("El correo electrónico es obligatorio."));
    if (string.IsNullOrWhiteSpace(nuevoUsuario.Password))
        return Results.BadRequest(ApiResponse.Fail("La contraseña es obligatoria."));
    if (nuevoUsuario.Role != "Freelancer" && nuevoUsuario.Role != "Client")
        return Results.BadRequest(ApiResponse.Fail("El rol debe ser 'Freelancer' o 'Client'."));

    var usuarios = await repoUsuarios.GetAllAsync();
    if (usuarios.Any(u => u.Email.ToLower() == nuevoUsuario.Email.ToLower()))
        return Results.BadRequest(ApiResponse.Fail("Ya existe una cuenta con ese correo electrónico."));

    nuevoUsuario.IsActive = true;
    nuevoUsuario.ProfileCompleted = true;
    nuevoUsuario.Rating = 5.0;
    await repoUsuarios.AddAsync(nuevoUsuario);

    nuevoUsuario.Password = "";
    return Results.Ok(ApiResponse.Ok(nuevoUsuario, "¡Cuenta creada exitosamente! Ya puedes iniciar sesión."));
});

// Iniciar sesión con correo y contraseña
app.MapPost("/api/auth/login", async (User loginData, IGenericRepository<User> repoUsuarios) =>
{
    if (string.IsNullOrWhiteSpace(loginData.Email) || string.IsNullOrWhiteSpace(loginData.Password))
        return Results.BadRequest(ApiResponse.Fail("Correo y contraseña son obligatorios."));

    var usuarios = await repoUsuarios.GetAllAsync();
    var usuario = usuarios.FirstOrDefault(u =>
        u.Email.ToLower() == loginData.Email.ToLower() && u.Password == loginData.Password);

    if (usuario == null)
        return Results.BadRequest(ApiResponse.Fail("Correo o contraseña incorrectos."));

    var respuesta = new User
    {
        Id = usuario.Id, Name = usuario.Name, Email = usuario.Email,
        Password = "", Role = usuario.Role, Rating = usuario.Rating,
        IsActive = usuario.IsActive, ProfileCompleted = usuario.ProfileCompleted
    };

    return Results.Ok(ApiResponse.Ok(respuesta, $"¡Bienvenido {usuario.Name}!"));
});

// =====================================================
// 6. ENDPOINTS DE SERVICIOS
// =====================================================

// Obtener todos los servicios publicados (incluye módulos de cada uno)
app.MapGet("/api/services", async (IGenericRepository<FreelanceService> repoServicios, IGenericRepository<Modulo> repoModulos) =>
{
    var servicios = (await repoServicios.GetAllAsync()).ToList();
    var todosModulos = (await repoModulos.GetAllAsync()).ToList();

    // Asignar módulos a cada servicio
    foreach (var servicio in servicios)
        servicio.Modulos = todosModulos.Where(m => m.ServiceId == servicio.Id).ToList();

    return Results.Ok(ApiResponse.Ok(servicios, "Servicios obtenidos exitosamente."));
});

// Crear/publicar un nuevo servicio (solo desarrolladores)
app.MapPost("/api/services", async (FreelanceService nuevoServicio, IGenericRepository<FreelanceService> repoServicios, IGenericRepository<User> repoUsuarios) =>
{
    if (string.IsNullOrWhiteSpace(nuevoServicio.Title))
        return Results.BadRequest(ApiResponse.Fail("El título del servicio es obligatorio."));
    if (string.IsNullOrWhiteSpace(nuevoServicio.Description))
        return Results.BadRequest(ApiResponse.Fail("La descripción del servicio es obligatoria."));
    if (nuevoServicio.BasePrice <= 0)
        return Results.BadRequest(ApiResponse.Fail("El precio base debe ser mayor a Bs 0."));
    if (string.IsNullOrWhiteSpace(nuevoServicio.Category))
        return Results.BadRequest(ApiResponse.Fail("La categoría es obligatoria."));

    var desarrollador = await repoUsuarios.GetByIdAsync(nuevoServicio.FreelancerId);
    if (desarrollador == null)
        return Results.BadRequest(ApiResponse.Fail("El desarrollador no existe."));
    if (desarrollador.Role != "Freelancer")
        return Results.BadRequest(ApiResponse.Fail("Solo los desarrolladores pueden publicar servicios."));

    await repoServicios.AddAsync(nuevoServicio);
    return Results.Created($"/api/services/{nuevoServicio.Id}", ApiResponse.Ok(nuevoServicio, "¡Servicio publicado exitosamente!"));
});

// =====================================================
// 7. ENDPOINTS DE MÓDULOS
// =====================================================

// Obtener módulos de un servicio específico
app.MapGet("/api/services/{serviceId}/modules", async (int serviceId, IGenericRepository<Modulo> repoModulos) =>
{
    var todos = await repoModulos.GetAllAsync();
    var modulos = todos.Where(m => m.ServiceId == serviceId).ToList();
    return Results.Ok(ApiResponse.Ok(modulos, $"Módulos del servicio {serviceId} obtenidos."));
});

// Agregar un módulo a un servicio (solo el desarrollador dueño del servicio)
app.MapPost("/api/services/{serviceId}/modules", async (int serviceId, Modulo nuevoModulo,
    IGenericRepository<Modulo> repoModulos, IGenericRepository<FreelanceService> repoServicios) =>
{
    // Verificar que el servicio existe
    var servicio = await repoServicios.GetByIdAsync(serviceId);
    if (servicio == null)
        return Results.BadRequest(ApiResponse.Fail("El servicio no existe."));

    // Validar campos del módulo
    if (string.IsNullOrWhiteSpace(nuevoModulo.Nombre))
        return Results.BadRequest(ApiResponse.Fail("El nombre del módulo es obligatorio."));
    if (nuevoModulo.Precio <= 0)
        return Results.BadRequest(ApiResponse.Fail("El precio del módulo debe ser mayor a Bs 0."));

    nuevoModulo.ServiceId = serviceId;
    await repoModulos.AddAsync(nuevoModulo);

    return Results.Created($"/api/services/{serviceId}/modules/{nuevoModulo.Id}",
        ApiResponse.Ok(nuevoModulo, $"¡Módulo '{nuevoModulo.Nombre}' agregado exitosamente!"));
});

// Eliminar un módulo
app.MapDelete("/api/modules/{id}", async (int id, IGenericRepository<Modulo> repoModulos) =>
{
    var modulo = await repoModulos.GetByIdAsync(id);
    if (modulo == null)
        return Results.NotFound(ApiResponse.Fail("El módulo no existe."));

    await repoModulos.DeleteAsync(id);
    return Results.Ok(ApiResponse.Ok(modulo, "Módulo eliminado correctamente."));
});

// =====================================================
// 8. ENDPOINTS DE PROPUESTAS
// =====================================================

// Obtener todas las propuestas
app.MapGet("/api/proposals", async (IGenericRepository<Proposal> repo) =>
{
    var propuestas = await repo.GetAllAsync();
    return Results.Ok(ApiResponse.Ok(propuestas, "Propuestas obtenidas exitosamente."));
});

// Obtener propuestas recibidas por un desarrollador específico
app.MapGet("/api/proposals/developer/{developerId}", async (int developerId, IGenericRepository<Proposal> repo) =>
{
    var todas = await repo.GetAllAsync();
    var resultado = todas.Where(p => p.FreelancerId == developerId).ToList();
    return Results.Ok(ApiResponse.Ok(resultado, "Propuestas del desarrollador obtenidas."));
});

// Obtener propuestas enviadas por un cliente específico
app.MapGet("/api/proposals/client/{clientId}", async (int clientId, IGenericRepository<Proposal> repo) =>
{
    var todas = await repo.GetAllAsync();
    var resultado = todas.Where(p => p.ClientId == clientId).ToList();
    return Results.Ok(ApiResponse.Ok(resultado, "Propuestas del cliente obtenidas."));
});

// Enviar una propuesta (con soporte para sistema completo o módulos individuales)
app.MapPost("/api/proposals", async (Proposal proposal, IProposalService proposalService) =>
{
    try
    {
        var resultado = await proposalService.SubmitProposalAsync(proposal);
        return Results.Created($"/api/proposals/{resultado.Id}", ApiResponse.Ok(resultado, "¡Propuesta enviada exitosamente!"));
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(ApiResponse.Fail(ex.Message));
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(ApiResponse.Fail(ex.Message));
    }
});

// Aceptar una propuesta
app.MapPost("/api/proposals/{id}/accept", async (int id, IProposalService proposalService) =>
{
    var resultado = await proposalService.AcceptProposalAsync(id);
    return Results.Ok(ApiResponse.Ok(resultado, $"Propuesta #{id} aceptada. Las demás fueron rechazadas automáticamente."));
});

// =====================================================
// 9. ENDPOINTS AUXILIARES
// =====================================================

// Obtener usuarios (para el frontend — sin contraseñas)
app.MapGet("/api/users", async (IGenericRepository<User> repo) =>
{
    var usuarios = await repo.GetAllAsync();
    var seguros = usuarios.Select(u => new User
    {
        Id = u.Id, Name = u.Name, Email = u.Email, Password = "",
        Role = u.Role, Rating = u.Rating, IsActive = u.IsActive, ProfileCompleted = u.ProfileCompleted
    });
    return Results.Ok(ApiResponse.Ok(seguros, "Usuarios obtenidos exitosamente."));
});

// Semilla — poblar con datos iniciales de prueba
app.MapGet("/api/seed", async (
    IGenericRepository<User> repoUsuarios,
    IGenericRepository<FreelanceService> repoServicios,
    IGenericRepository<Modulo> repoModulos) =>
{
    var usuarios = await repoUsuarios.GetAllAsync();
    if (!usuarios.Any())
    {
        var dev1 = new User { Name = "Julian Rueda", Email = "julian@freerueda.com", Password = "123456", Role = "Freelancer", Rating = 4.8, IsActive = true, ProfileCompleted = true };
        var dev2 = new User { Name = "Maria Gomez", Email = "maria@freerueda.com", Password = "123456", Role = "Freelancer", Rating = 4.9, IsActive = true, ProfileCompleted = true };
        var cliente1 = new User { Name = "TechBolivia SRL", Email = "contacto@techbolivia.bo", Password = "123456", Role = "Client", Rating = 5.0 };
        var cliente2 = new User { Name = "Startup InnovaCode", Email = "info@innovacode.bo", Password = "123456", Role = "Client", Rating = 5.0 };

        await repoUsuarios.AddAsync(dev1);
        await repoUsuarios.AddAsync(dev2);
        await repoUsuarios.AddAsync(cliente1);
        await repoUsuarios.AddAsync(cliente2);

        // Servicios con módulos de ejemplo
        var s1 = new FreelanceService { Title = "Sistema ERP Empresarial", Description = "Sistema completo de gestión empresarial con módulos independientes adquiribles por separado.", BasePrice = 10500.00m, Category = "Sistema de Gestión (ERP)", FreelancerId = dev1.Id };
        var s2 = new FreelanceService { Title = "Sistema Web de Escaneo de Productos", Description = "Sistema web para supermercados con escaneo de productos, inventario y reportes.", BasePrice = 6000.00m, Category = "Sistema Web", FreelancerId = dev1.Id };
        var s3 = new FreelanceService { Title = "Aplicación Móvil Flutter", Description = "App móvil multiplataforma con módulos de autenticación, notificaciones y panel de control.", BasePrice = 7500.00m, Category = "Aplicación Móvil", FreelancerId = dev2.Id };

        await repoServicios.AddAsync(s1);
        await repoServicios.AddAsync(s2);
        await repoServicios.AddAsync(s3);

        // Módulos del Sistema ERP
        await repoModulos.AddAsync(new Modulo { ServiceId = s1.Id, Nombre = "Gestión de Usuarios", Descripcion = "Administración de roles, permisos y accesos del sistema.", Precio = 1500.00m });
        await repoModulos.AddAsync(new Modulo { ServiceId = s1.Id, Nombre = "Gestión de Inventario", Descripcion = "Control de stock, entradas y salidas de productos.", Precio = 2500.00m });
        await repoModulos.AddAsync(new Modulo { ServiceId = s1.Id, Nombre = "Facturación", Descripcion = "Emisión de facturas, notas de crédito y reportes de ventas.", Precio = 2000.00m });
        await repoModulos.AddAsync(new Modulo { ServiceId = s1.Id, Nombre = "Reportes y Estadísticas", Descripcion = "Dashboards y reportes exportables en PDF/Excel.", Precio = 1800.00m });

        // Módulos del Sistema de Escaneo
        await repoModulos.AddAsync(new Modulo { ServiceId = s2.Id, Nombre = "Escaneo de Productos", Descripcion = "Lectura de códigos de barra y QR para identificar productos.", Precio = 1800.00m });
        await repoModulos.AddAsync(new Modulo { ServiceId = s2.Id, Nombre = "Control de Stock", Descripcion = "Alertas de stock mínimo y reposición automática.", Precio = 1500.00m });
        await repoModulos.AddAsync(new Modulo { ServiceId = s2.Id, Nombre = "Punto de Venta", Descripcion = "Módulo de caja con cálculo de vuelto y cierre de caja.", Precio = 2000.00m });

        // Módulos de la App Móvil
        await repoModulos.AddAsync(new Modulo { ServiceId = s3.Id, Nombre = "Autenticación", Descripcion = "Login, registro y recuperación de contraseña.", Precio = 1200.00m });
        await repoModulos.AddAsync(new Modulo { ServiceId = s3.Id, Nombre = "Panel de Control", Descripcion = "Dashboard con métricas y accesos rápidos.", Precio = 1800.00m });
        await repoModulos.AddAsync(new Modulo { ServiceId = s3.Id, Nombre = "Notificaciones Push", Descripcion = "Sistema de alertas y notificaciones en tiempo real.", Precio = 1500.00m });

        return Results.Ok(ApiResponse.Ok("Base de datos sembrada con módulos de ejemplo. Usuario de prueba: julian@freerueda.com / 123456"));
    }
    return Results.Ok(ApiResponse.Ok("La base de datos ya contiene datos."));
});

// Ruta de prueba del middleware de excepciones
app.MapGet("/api/crash", () =>
{
    throw new InvalidOperationException("Simulación: Error crítico de conexión a la base de datos.");
});

app.Run();

// 10. CONFIGURACIÓN DE SERIALIZACIÓN JSON
[JsonSerializable(typeof(User))]
[JsonSerializable(typeof(User[]))]
[JsonSerializable(typeof(List<User>))]
[JsonSerializable(typeof(IEnumerable<User>))]
[JsonSerializable(typeof(FreelanceService))]
[JsonSerializable(typeof(FreelanceService[]))]
[JsonSerializable(typeof(List<FreelanceService>))]
[JsonSerializable(typeof(IEnumerable<FreelanceService>))]
[JsonSerializable(typeof(Modulo))]
[JsonSerializable(typeof(Modulo[]))]
[JsonSerializable(typeof(List<Modulo>))]
[JsonSerializable(typeof(IEnumerable<Modulo>))]
[JsonSerializable(typeof(Proposal))]
[JsonSerializable(typeof(Proposal[]))]
[JsonSerializable(typeof(List<Proposal>))]
[JsonSerializable(typeof(IEnumerable<Proposal>))]
[JsonSerializable(typeof(ApiResponse))]
[JsonSerializable(typeof(ApiResponse<User>))]
[JsonSerializable(typeof(ApiResponse<IEnumerable<User>>))]
[JsonSerializable(typeof(ApiResponse<FreelanceService>))]
[JsonSerializable(typeof(ApiResponse<IEnumerable<FreelanceService>>))]
[JsonSerializable(typeof(ApiResponse<Modulo>))]
[JsonSerializable(typeof(ApiResponse<IEnumerable<Modulo>>))]
[JsonSerializable(typeof(ApiResponse<List<Modulo>>))]
[JsonSerializable(typeof(ApiResponse<Proposal>))]
[JsonSerializable(typeof(ApiResponse<IEnumerable<Proposal>>))]
[JsonSerializable(typeof(ApiResponse<object>))]
[JsonSerializable(typeof(ApiResponse<string>))]
internal partial class AppJsonSerializerContext : JsonSerializerContext
{
}
