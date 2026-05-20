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

// Registrar el contexto de base de datos con el proveedor de SQL Server
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

// 3. HABILITAR CORS PARA EL FRONTEND REACT
app.UseCors("PermitirFrontend");

// 4. REGISTRAR MIDDLEWARE GLOBAL DE EXCEPCIONES
app.UseMiddleware<ExceptionMiddleware>();

// =====================================================
// 5. ENDPOINTS DE AUTENTICACIÓN (Registro e Inicio de Sesión)
// =====================================================

// Registrar un nuevo usuario (Desarrollador o Cliente)
app.MapPost("/api/auth/register", async (User nuevoUsuario, IGenericRepository<User> repoUsuarios) =>
{
    // Validar campos requeridos
    if (string.IsNullOrWhiteSpace(nuevoUsuario.Name))
        return Results.BadRequest(ApiResponse.Fail("El nombre es obligatorio."));
    if (string.IsNullOrWhiteSpace(nuevoUsuario.Email))
        return Results.BadRequest(ApiResponse.Fail("El correo electrónico es obligatorio."));
    if (string.IsNullOrWhiteSpace(nuevoUsuario.Password))
        return Results.BadRequest(ApiResponse.Fail("La contraseña es obligatoria."));
    if (nuevoUsuario.Role != "Freelancer" && nuevoUsuario.Role != "Client")
        return Results.BadRequest(ApiResponse.Fail("El rol debe ser 'Freelancer' o 'Client'."));

    // Verificar si el correo ya existe
    var usuarios = await repoUsuarios.GetAllAsync();
    if (usuarios.Any(u => u.Email.ToLower() == nuevoUsuario.Email.ToLower()))
        return Results.BadRequest(ApiResponse.Fail("Ya existe una cuenta con ese correo electrónico."));

    // Crear usuario con valores predeterminados
    nuevoUsuario.IsActive = true;
    nuevoUsuario.ProfileCompleted = true;
    nuevoUsuario.Rating = 5.0;

    await repoUsuarios.AddAsync(nuevoUsuario);

    // Devolver usuario sin contraseña
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

    // Devolver usuario sin contraseña
    var respuesta = new User
    {
        Id = usuario.Id,
        Name = usuario.Name,
        Email = usuario.Email,
        Password = "", // No enviar contraseña al frontend
        Role = usuario.Role,
        Rating = usuario.Rating,
        IsActive = usuario.IsActive,
        ProfileCompleted = usuario.ProfileCompleted
    };

    return Results.Ok(ApiResponse.Ok(respuesta, $"¡Bienvenido {usuario.Name}!"));
});

// =====================================================
// 6. ENDPOINTS DE SERVICIOS
// =====================================================

// Obtener todos los servicios publicados
app.MapGet("/api/services", async (IGenericRepository<FreelanceService> repo) =>
{
    var servicios = await repo.GetAllAsync();
    return Results.Ok(ApiResponse.Ok(servicios, "Servicios obtenidos exitosamente."));
});

// Crear/publicar un nuevo servicio (solo desarrolladores)
app.MapPost("/api/services", async (FreelanceService nuevoServicio, IGenericRepository<FreelanceService> repoServicios, IGenericRepository<User> repoUsuarios) =>
{
    // Validar campos requeridos
    if (string.IsNullOrWhiteSpace(nuevoServicio.Title))
        return Results.BadRequest(ApiResponse.Fail("El título del servicio es obligatorio."));
    if (string.IsNullOrWhiteSpace(nuevoServicio.Description))
        return Results.BadRequest(ApiResponse.Fail("La descripción del servicio es obligatoria."));
    if (nuevoServicio.BasePrice <= 0)
        return Results.BadRequest(ApiResponse.Fail("El precio base debe ser mayor a Bs 0."));
    if (string.IsNullOrWhiteSpace(nuevoServicio.Category))
        return Results.BadRequest(ApiResponse.Fail("La categoría es obligatoria."));

    // Verificar que el usuario sea un desarrollador
    var desarrollador = await repoUsuarios.GetByIdAsync(nuevoServicio.FreelancerId);
    if (desarrollador == null)
        return Results.BadRequest(ApiResponse.Fail("El desarrollador no existe."));
    if (desarrollador.Role != "Freelancer")
        return Results.BadRequest(ApiResponse.Fail("Solo los desarrolladores pueden publicar servicios."));

    await repoServicios.AddAsync(nuevoServicio);
    return Results.Created($"/api/services/{nuevoServicio.Id}", ApiResponse.Ok(nuevoServicio, "¡Servicio publicado exitosamente!"));
});

// =====================================================
// 7. ENDPOINTS DE PROPUESTAS
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
    var propuestasDesarrollador = todas.Where(p => p.FreelancerId == developerId).ToList();
    return Results.Ok(ApiResponse.Ok(propuestasDesarrollador, "Propuestas del desarrollador obtenidas."));
});

// Obtener propuestas enviadas por un cliente específico
app.MapGet("/api/proposals/client/{clientId}", async (int clientId, IGenericRepository<Proposal> repo) =>
{
    var todas = await repo.GetAllAsync();
    var propuestasCliente = todas.Where(p => p.ClientId == clientId).ToList();
    return Results.Ok(ApiResponse.Ok(propuestasCliente, "Propuestas del cliente obtenidas."));
});

// Enviar una propuesta (Demuestra la refactorización y cálculo de comisiones en Bs)
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

// Aceptar una propuesta (Cambia estados en SQL Server)
app.MapPost("/api/proposals/{id}/accept", async (int id, IProposalService proposalService) =>
{
    var resultado = await proposalService.AcceptProposalAsync(id);
    return Results.Ok(ApiResponse.Ok(resultado, $"Propuesta #{id} aceptada. Las demás fueron rechazadas automáticamente."));
});

// =====================================================
// 8. ENDPOINTS AUXILIARES
// =====================================================

// Obtener usuarios (para el frontend)
app.MapGet("/api/users", async (IGenericRepository<User> repo) =>
{
    var usuarios = await repo.GetAllAsync();
    // No devolver contraseñas
    var seguros = usuarios.Select(u => new User
    {
        Id = u.Id, Name = u.Name, Email = u.Email, Password = "",
        Role = u.Role, Rating = u.Rating, IsActive = u.IsActive, ProfileCompleted = u.ProfileCompleted
    });
    return Results.Ok(ApiResponse.Ok(seguros, "Usuarios obtenidos exitosamente."));
});

// Ruta de semilla - Poblar con datos iniciales de prueba
app.MapGet("/api/seed", async (
    IGenericRepository<User> repoUsuarios,
    IGenericRepository<FreelanceService> repoServicios) =>
{
    var usuarios = await repoUsuarios.GetAllAsync();
    if (!usuarios.Any())
    {
        // Agregar Desarrolladores de ejemplo
        var dev1 = new User { Name = "Julian Rueda", Email = "julian@freerueda.com", Password = "123456", Role = "Freelancer", Rating = 4.8, IsActive = true, ProfileCompleted = true };
        var dev2 = new User { Name = "Maria Gomez", Email = "maria@freerueda.com", Password = "123456", Role = "Freelancer", Rating = 4.9, IsActive = true, ProfileCompleted = true };

        // Agregar Clientes de ejemplo
        var cliente1 = new User { Name = "TechBolivia SRL", Email = "contacto@techbolivia.bo", Password = "123456", Role = "Client", Rating = 5.0 };
        var cliente2 = new User { Name = "Startup InnovaCode", Email = "info@innovacode.bo", Password = "123456", Role = "Client", Rating = 5.0 };

        await repoUsuarios.AddAsync(dev1);
        await repoUsuarios.AddAsync(dev2);
        await repoUsuarios.AddAsync(cliente1);
        await repoUsuarios.AddAsync(cliente2);

        // Agregar Servicios publicados por desarrolladores
        var s1 = new FreelanceService { Title = "Desarrollo de Sistema ERP", Description = "Sistema ERP empresarial con .NET 8 y SQL Server. Módulos de inventario, facturación y reportes.", BasePrice = 10500.00m, Category = "Desarrollo Backend", FreelancerId = dev1.Id };
        var s2 = new FreelanceService { Title = "Aplicación Web React", Description = "Interfaces modernas con React, diseño UI/UX profesional y conexión con APIs REST.", BasePrice = 5600.00m, Category = "Desarrollo Frontend", FreelancerId = dev2.Id };

        await repoServicios.AddAsync(s1);
        await repoServicios.AddAsync(s2);

        return Results.Ok(ApiResponse.Ok("¡Base de datos sembrada! Usuarios de prueba: julian@freerueda.com / 123456 (Desarrollador) | contacto@techbolivia.bo / 123456 (Cliente)"));
    }
    return Results.Ok(ApiResponse.Ok("La base de datos ya contiene datos."));
});

// Ruta de prueba del middleware de excepciones
app.MapGet("/api/crash", () =>
{
    throw new InvalidOperationException("Simulación: Error crítico de conexión a la base de datos.");
});

app.Run();

// 9. CONFIGURACIÓN DE SERIALIZACIÓN JSON
[JsonSerializable(typeof(User))]
[JsonSerializable(typeof(User[]))]
[JsonSerializable(typeof(List<User>))]
[JsonSerializable(typeof(IEnumerable<User>))]
[JsonSerializable(typeof(FreelanceService))]
[JsonSerializable(typeof(FreelanceService[]))]
[JsonSerializable(typeof(List<FreelanceService>))]
[JsonSerializable(typeof(Proposal))]
[JsonSerializable(typeof(Proposal[]))]
[JsonSerializable(typeof(List<Proposal>))]
[JsonSerializable(typeof(ApiResponse))]
[JsonSerializable(typeof(ApiResponse<User>))]
[JsonSerializable(typeof(ApiResponse<IEnumerable<User>>))]
[JsonSerializable(typeof(ApiResponse<FreelanceService>))]
[JsonSerializable(typeof(ApiResponse<IEnumerable<FreelanceService>>))]
[JsonSerializable(typeof(ApiResponse<Proposal>))]
[JsonSerializable(typeof(ApiResponse<IEnumerable<Proposal>>))]
[JsonSerializable(typeof(ApiResponse<object>))]
internal partial class AppJsonSerializerContext : JsonSerializerContext
{
}
