using Azure.Monitor.OpenTelemetry.Exporter;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Azure.Functions.Worker.OpenTelemetry;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OpenTelemetry;
using PlaceRate.Api.Data;
using PlaceRate.Api.Services;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

if (!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("APPLICATIONINSIGHTS_CONNECTION_STRING")))
{
    builder.Services.AddOpenTelemetry()
        .UseFunctionsWorkerDefaults()
        .UseAzureMonitorExporter();
}

var connectionString = builder.Configuration["SqlConnectionString"]
    ?? throw new InvalidOperationException("SqlConnectionString is not configured.");

builder.Services.AddDbContext<PlaceRateDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddScoped<IProjectService, ProjectService>();

builder.Build().Run();
