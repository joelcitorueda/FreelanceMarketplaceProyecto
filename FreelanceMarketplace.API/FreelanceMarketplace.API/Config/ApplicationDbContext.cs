using Microsoft.EntityFrameworkCore;
using FreelanceMarketplace.API.Models;

namespace FreelanceMarketplace.API.Config
{
    // Contexto de base de datos principal de la plataforma freelance
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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configurar nombre de tabla "Usuarios" en SQL Server
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Usuarios");
            });

            // Configurar nombre de tabla "Servicios" y precisión decimal para precios en bolivianos
            modelBuilder.Entity<FreelanceService>(entity =>
            {
                entity.ToTable("Servicios");
                entity.Property(e => e.BasePrice)
                    .HasPrecision(18, 2);
            });

            // Configurar nombre de tabla "Propuestas" y precisión decimal para montos en bolivianos
            modelBuilder.Entity<Proposal>(entity =>
            {
                entity.ToTable("Propuestas");

                entity.Property(e => e.ProposedPrice)
                    .HasPrecision(18, 2);

                entity.Property(e => e.PlatformFee)
                    .HasPrecision(18, 2);

                entity.Property(e => e.NetPayout)
                    .HasPrecision(18, 2);
            });
        }
    }
}
