namespace PlaceRate.Api.Dtos;

public record ProjectSummaryDto(
    Guid Id,
    string Name,
    string Addr,
    string? Postcode,
    string Type,
    string? By,
    DateOnly ProjectDate,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
