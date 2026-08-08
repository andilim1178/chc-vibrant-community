namespace PlaceRate.Api.Services;

public class DuplicateProjectNameException : Exception
{
    public DuplicateProjectNameException(string name)
        : base($"A project named '{name}' already exists.")
    {
    }
}
