namespace PlaceRate.Api.Services;

public class ProjectNotFoundException : Exception
{
    public ProjectNotFoundException(Guid id)
        : base($"No project found with id '{id}'.")
    {
    }
}
