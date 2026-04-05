using BetterLink.Backend.Models.DTOs.Auth;
using BetterLink.Backend.Tests.Helpers;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace BetterLink.Backend.Tests.Tests;

[Trait("Category", "MySqlIntegration")]
public class RealMySqlApiSmokeTests : IClassFixture<MySqlWebApplicationFactory>
{
    private readonly HttpClient _client;

    public RealMySqlApiSmokeTests(MySqlWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task EndToEndFlow_WorksAgainstRealMySql()
    {
        // Health
        var health = await _client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, health.StatusCode);

        // Register employer
        var employerEmail = $"mysql-employer-{Guid.NewGuid()}@test.com";
        var employerResp = await _client.PostAsJsonAsync("/api/auth/register/employer", new
        {
            email = employerEmail,
            password = "Test1234!",
            fullName = "MySql Employer",
            organizationName = "MySql Org"
        });
        Assert.Equal(HttpStatusCode.OK, employerResp.StatusCode);
        var employerAuth = await employerResp.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(employerAuth);

        // Register student
        var studentEmail = $"mysql-student-{Guid.NewGuid()}@test.com";
        var studentResp = await _client.PostAsJsonAsync("/api/auth/register/student", new
        {
            email = studentEmail,
            password = "Test1234!",
            fullName = "MySql Student",
            university = "NCU",
            programName = "Computer Science"
        });
        Assert.Equal(HttpStatusCode.OK, studentResp.StatusCode);
        var studentAuth = await studentResp.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(studentAuth);

        // Login student
        var loginResp = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = studentEmail,
            password = "Test1234!"
        });
        Assert.Equal(HttpStatusCode.OK, loginResp.StatusCode);

        // Employer creates job
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", employerAuth!.Token);
        var jobCreateResp = await _client.PostAsJsonAsync("/api/jobs", new
        {
            title = "MySQL Backend Role",
            description = "Role created in real MySQL smoke test.",
            employmentType = "full-time"
        });
        Assert.Equal(HttpStatusCode.Created, jobCreateResp.StatusCode);
        var createdJob = await jobCreateResp.Content.ReadFromJsonAsync<JsonElement>();
        var jobId = createdJob.GetProperty("id").GetInt64();

        // Public jobs list and job detail
        _client.DefaultRequestHeaders.Authorization = null;
        var jobsResp = await _client.GetAsync("/api/jobs");
        Assert.Equal(HttpStatusCode.OK, jobsResp.StatusCode);
        var jobByIdResp = await _client.GetAsync($"/api/jobs/{jobId}");
        Assert.Equal(HttpStatusCode.OK, jobByIdResp.StatusCode);

        // Student gets/updates profile
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", studentAuth!.Token);
        var meResp = await _client.GetAsync("/api/users/me");
        Assert.Equal(HttpStatusCode.OK, meResp.StatusCode);
        var updateResp = await _client.PutAsJsonAsync("/api/users/me", new
        {
            firstName = "Updated",
            lastName = "Student"
        });
        Assert.Equal(HttpStatusCode.NoContent, updateResp.StatusCode);

        // Student applies to job and can see applications
        var applyResp = await _client.PostAsJsonAsync($"/api/jobs/{jobId}/apply", new
        {
            coverLetter = "I am interested in this role."
        });
        Assert.Equal(HttpStatusCode.OK, applyResp.StatusCode);
        var myAppsResp = await _client.GetAsync("/api/applications/me");
        Assert.Equal(HttpStatusCode.OK, myAppsResp.StatusCode);

        // Community create (as employer), join + message (as student)
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", employerAuth.Token);
        var communityResp = await _client.PostAsJsonAsync("/api/communities", new
        {
            name = "MySQL Test Community",
            description = "Created during real MySQL smoke test"
        });
        Assert.Equal(HttpStatusCode.Created, communityResp.StatusCode);
        var createdCommunity = await communityResp.Content.ReadFromJsonAsync<JsonElement>();
        var communityId = createdCommunity.GetProperty("id").GetInt64();

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", studentAuth.Token);
        var joinResp = await _client.PostAsync($"/api/communities/{communityId}/join", content: null);
        Assert.Equal(HttpStatusCode.OK, joinResp.StatusCode);
        var messageResp = await _client.PostAsJsonAsync($"/api/communities/{communityId}/messages", new
        {
            body = "Hello from real MySQL test"
        });
        Assert.Equal(HttpStatusCode.OK, messageResp.StatusCode);

        var communityGetResp = await _client.GetAsync($"/api/communities/{communityId}");
        Assert.Equal(HttpStatusCode.OK, communityGetResp.StatusCode);

        _client.DefaultRequestHeaders.Authorization = null;
    }
}
