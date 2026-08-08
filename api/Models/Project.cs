namespace PlaceRate.Api.Models;

public class Project
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Addr { get; set; } = string.Empty;
    public string? Postcode { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? By { get; set; }
    public DateOnly ProjectDate { get; set; }
    public string AnswersJson { get; set; } = "{}";
    public string ScoresJson { get; set; } = "{}";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
