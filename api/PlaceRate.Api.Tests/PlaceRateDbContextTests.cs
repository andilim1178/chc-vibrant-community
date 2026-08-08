using Microsoft.EntityFrameworkCore;
using PlaceRate.Api.Data;
using PlaceRate.Api.Models;
using Xunit;

namespace PlaceRate.Api.Tests;

public class PlaceRateDbContextTests
{
    private static PlaceRateDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<PlaceRateDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new PlaceRateDbContext(options);
    }

    [Fact]
    public async Task CanAddAndRetrieveProject()
    {
        using var context = CreateContext();
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Test Project",
            Addr = "123 Main St",
            Type = "Mixed Use",
            ProjectDate = DateOnly.FromDateTime(DateTime.UtcNow),
            AnswersJson = "{}",
            ScoresJson = "{}",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Projects.Add(project);
        await context.SaveChangesAsync();

        var retrieved = await context.Projects.FirstOrDefaultAsync(p => p.Id == project.Id);

        Assert.NotNull(retrieved);
        Assert.Equal("Test Project", retrieved!.Name);
    }
}
