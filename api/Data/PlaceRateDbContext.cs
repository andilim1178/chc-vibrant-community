using Microsoft.EntityFrameworkCore;
using PlaceRate.Api.Models;

namespace PlaceRate.Api.Data;

public class PlaceRateDbContext : DbContext
{
    public PlaceRateDbContext(DbContextOptions<PlaceRateDbContext> options) : base(options)
    {
    }

    public DbSet<Project> Projects => Set<Project>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(200);
            entity.HasIndex(p => p.Name).IsUnique();
            entity.Property(p => p.Addr).IsRequired().HasMaxLength(500);
            entity.Property(p => p.Postcode).HasMaxLength(20);
            entity.Property(p => p.Type).IsRequired().HasMaxLength(100);
            entity.Property(p => p.By).HasMaxLength(200);
            entity.Property(p => p.AnswersJson).IsRequired();
            entity.Property(p => p.ScoresJson).IsRequired();
        });
    }
}
