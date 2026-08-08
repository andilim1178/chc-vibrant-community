namespace PlaceRate.Api.Dtos;

public record ProjectDetailDto(
    Guid Id,
    string Name,
    string Addr,
    string? Postcode,
    string Type,
    string? By,
    DateOnly ProjectDate,
    string AnswersJson,
    string ScoresJson,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
