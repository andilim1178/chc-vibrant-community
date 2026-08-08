using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace PlaceRate.Api.Data;

public class PlaceRateDbContextFactory : IDesignTimeDbContextFactory<PlaceRateDbContext>
{
    public PlaceRateDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("local.settings.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration["Values:SqlConnectionString"]
            ?? configuration["SqlConnectionString"]
            ?? throw new InvalidOperationException("SqlConnectionString is not configured for migrations.");

        var optionsBuilder = new DbContextOptionsBuilder<PlaceRateDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

        return new PlaceRateDbContext(optionsBuilder.Options);
    }
}
