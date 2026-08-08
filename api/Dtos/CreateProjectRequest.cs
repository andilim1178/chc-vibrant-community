namespace PlaceRate.Api.Dtos;

public record CreateProjectRequest(
    string Name,
    string Addr,
    string? Postcode,
    string Type,
    string? By
);
