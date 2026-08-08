namespace PlaceRate.Api.Dtos;

public record UpdateProjectRequest(
    string Name,
    string Addr,
    string? Postcode,
    string Type,
    string? By,
    string AnswersJson,
    string ScoresJson
);
