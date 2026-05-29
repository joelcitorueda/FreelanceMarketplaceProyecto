using Microsoft.EntityFrameworkCore;
using FreelanceMarketplace.API.Models;

namespace FreelanceMarketplace.API.Config
{
    // Contexto de base de datos principal de la plataforma FreelancRued
    // Gestiona la conexión con SQL Server y define las tablas del sistema
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Tablas de la base de datos con nombres en español
        public DbSet<User> Usuarios { get; set; } = null!;
        public DbSet<FreelanceService> Servicios { get; set; } = null!;
        public DbSet<Proposal> Propuestas { get; set; } = null!;
        public DbSet<Modulo> Modulos { get; set; } = null!;    // Nueva tabla de módulos

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configurar tabla "Usuarios"
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Usuarios");
            });

            // Configurar tabla "Servicios" con precisión decimal para precios en bolivianos
            modelBuilder.Entity<FreelanceService>(entity =>
            {
                entity.ToTable("Servicios");
                entity.Property(e => e.BasePrice).HasPrecision(18, 2);
                // La lista de módulos se ignora en el mapeo directo (se carga por consulta separada)
                entity.Ignore(e => e.Modulos);
            });

            // Configurar tabla "Propuestas" con precisión decimal para montos en bolivianos
            modelBuilder.Entity<Proposal>(entity =>
            {
                entity.ToTable("Propuestas");
                entity.Property(e => e.ProposedPrice).HasPrecision(18, 2);
                entity.Property(e => e.PlatformFee).HasPrecision(18, 2);
                entity.Property(e => e.NetPayout).HasPrecision(18, 2);
            });

            // Configurar tabla "Modulos" — módulos funcionales de cada sistema
            modelBuilder.Entity<Modulo>(entity =>
            {
                entity.ToTable("Modulos");
                entity.Property(e => e.Precio).HasPrecision(18, 2);
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Descripcion).HasMaxLength(1000);
            });
        }
    }
}
