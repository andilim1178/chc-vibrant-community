using PlaceRate.Api.Dtos;
using PlaceRate.Api.Models;
using Xunit;

namespace PlaceRate.Api.Tests;

public class ProjectMappingExtensionsTests
{
    private static Project SampleProject() => new()
    {
        Id = Guid.NewGuid(),
        Name = "Embark Town Centre",
        Addr = "81 Joseph Dr, Yalyalup WA 6280",
        Postcode = "6280",
        Type = "Mixed Use",
        By = "Jane Doe",
        ProjectDate = DateOnly.FromDateTime(DateTime.UtcNow),
        AnswersJson = "{\"transport\":{\"0\":\"yes\"}}",
        ScoresJson = "{\"transport\":5}",
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    [Fact]
    public void ToSummaryDto_CopiesCoreFields()
    {
        var project = SampleProject();
        var dto = project.ToSummaryDto();

        Assert.Equal(project.Id, dto.Id);
        Assert.Equal(project.Name, dto.Name);
        Assert.Equal(project.Addr, dto.Addr);
    }

    [Fact]
    public void ToDetailDto_IncludesAnswersAndScoresJson()
    {
        var project = SampleProject();
        var dto = project.ToDetailDto();

        Assert.Equal(project.AnswersJson, dto.AnswersJson);
        Assert.Equal(project.ScoresJson, dto.ScoresJson);
    }

    [Fact]
    public void CreateProjectRequest_ToProject_StartsWithEmptyAnswersAndScores()
    {
        var request = new CreateProjectRequest("New Project", "1 Main St", "6000", "Mixed Use", null);

        var project = request.ToProject();

        Assert.Equal("New Project", project.Name);
        Assert.Equal("{}", project.AnswersJson);
        Assert.Equal("{}", project.ScoresJson);
    }

    [Fact]
    public void UpdateProjectRequest_ToProject_CarriesSuppliedAnswersAndScores()
    {
        var request = new UpdateProjectRequest(
            "Renamed Project", "2 Main St", "6001", "Mixed Use", null,
            "{\"transport\":{\"0\":\"no\"}}", "{\"transport\":2}");

        var project = request.ToProject();

        Assert.Equal("{\"transport\":{\"0\":\"no\"}}", project.AnswersJson);
        Assert.Equal("{\"transport\":2}", project.ScoresJson);
    }
}
