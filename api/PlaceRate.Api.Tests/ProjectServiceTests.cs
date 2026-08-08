using Microsoft.EntityFrameworkCore;
using PlaceRate.Api.Data;
using PlaceRate.Api.Models;
using PlaceRate.Api.Services;
using Xunit;

namespace PlaceRate.Api.Tests;

public class ProjectServiceTests
{
    private static PlaceRateDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<PlaceRateDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new PlaceRateDbContext(options);
    }

    private static Project NewProject(string name) => new()
    {
        Name = name,
        Addr = "81 Joseph Dr, Yalyalup WA 6280",
        Type = "Mixed Use",
        ProjectDate = DateOnly.FromDateTime(DateTime.UtcNow),
        AnswersJson = "{}",
        ScoresJson = "{}"
    };

    [Fact]
    public async Task CreateAsync_AssignsIdAndTimestamps()
    {
        using var context = CreateContext();
        var service = new ProjectService(context);

        var created = await service.CreateAsync(NewProject("Embark Town Centre"));

        Assert.NotEqual(Guid.Empty, created.Id);
        Assert.NotEqual(default, created.CreatedAt);
        Assert.Equal(created.CreatedAt, created.UpdatedAt);
    }

    [Fact]
    public async Task CreateAsync_ThrowsOnDuplicateName_CaseInsensitive()
    {
        using var context = CreateContext();
        var service = new ProjectService(context);

        await service.CreateAsync(NewProject("Embark Town Centre"));

        await Assert.ThrowsAsync<DuplicateProjectNameException>(
            () => service.CreateAsync(NewProject("embark town centre")));
    }
}
