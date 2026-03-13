using BetterLink.Backend.Tests.Helpers;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace BetterLink.Backend.Tests.Tests;

public class HealthTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public HealthTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task HealthEndpoint_ReturnsOkWithStatusOk()
    {
        var response = await _client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("ok", body.GetProperty("status").GetString());
        Assert.True(body.TryGetProperty("timestamp", out _));
    }
}
