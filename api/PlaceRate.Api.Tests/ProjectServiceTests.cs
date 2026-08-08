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

    [Fact]
    public async Task GetAllAsync_ReturnsAllCreatedProjects()
    {
        using var context = CreateContext();
        var service = new ProjectService(context);

        await service.CreateAsync(NewProject("Project A"));
        await service.CreateAsync(NewProject("Project B"));

        var all = await service.GetAllAsync();

        Assert.Equal(2, all.Count);
    }

    [Fact]
    public async Task GetByIdAsync_ThrowsWhenNotFound()
    {
        using var context = CreateContext();
        var service = new ProjectService(context);

        await Assert.ThrowsAsync<ProjectNotFoundException>(() => service.GetByIdAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task UpdateAsync_UpdatesFieldsAndTimestamp()
    {
        using var context = CreateContext();
        var service = new ProjectService(context);
        var created = await service.CreateAsync(NewProject("Original Name"));
        var originalUpdatedAt = created.UpdatedAt;

        var replacement = NewProject("Original Name");
        replacement.Addr = "New Address";
        var updated = await service.UpdateAsync(created.Id, replacement);

        Assert.Equal("New Address", updated.Addr);
        Assert.True(updated.UpdatedAt >= originalUpdatedAt);
    }

    [Fact]
    public async Task UpdateAsync_ThrowsWhenRenamingToAnotherProjectsName()
    {
        using var context = CreateContext();
        var service = new ProjectService(context);
        var first = await service.CreateAsync(NewProject("Project A"));
        await service.CreateAsync(NewProject("Project B"));

        await Assert.ThrowsAsync<DuplicateProjectNameException>(
            () => service.UpdateAsync(first.Id, NewProject("Project B")));
    }

    [Fact]
    public async Task DeleteAsync_RemovesProject()
    {
        using var context = CreateContext();
        var service = new ProjectService(context);
        var created = await service.CreateAsync(NewProject("To Delete"));

        await service.DeleteAsync(created.Id);

        await Assert.ThrowsAsync<ProjectNotFoundException>(() => service.GetByIdAsync(created.Id));
    }

    [Fact]
    public async Task DeleteAsync_ThrowsWhenNotFound()
    {
        using var context = CreateContext();
        var service = new ProjectService(context);

        await Assert.ThrowsAsync<ProjectNotFoundException>(() => service.DeleteAsync(Guid.NewGuid()));
    }
}
