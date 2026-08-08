using PlaceRate.Api.Models;

namespace PlaceRate.Api.Dtos;

public static class ProjectMappingExtensions
{
    public static ProjectSummaryDto ToSummaryDto(this Project project) =>
        new(project.Id, project.Name, project.Addr, project.Postcode, project.Type,
            project.By, project.ProjectDate, project.CreatedAt, project.UpdatedAt);

    public static ProjectDetailDto ToDetailDto(this Project project) =>
        new(project.Id, project.Name, project.Addr, project.Postcode, project.Type,
            project.By, project.ProjectDate, project.AnswersJson, project.ScoresJson,
            project.CreatedAt, project.UpdatedAt);

    public static Project ToProject(this CreateProjectRequest request) => new()
    {
        Name = request.Name,
        Addr = request.Addr,
        Postcode = request.Postcode,
        Type = request.Type,
        By = request.By,
        ProjectDate = DateOnly.FromDateTime(DateTime.UtcNow),
        AnswersJson = "{}",
        ScoresJson = "{}"
    };

    public static Project ToProject(this UpdateProjectRequest request) => new()
    {
        Name = request.Name,
        Addr = request.Addr,
        Postcode = request.Postcode,
        Type = request.Type,
        By = request.By,
        AnswersJson = request.AnswersJson,
        ScoresJson = request.ScoresJson
    };
}
