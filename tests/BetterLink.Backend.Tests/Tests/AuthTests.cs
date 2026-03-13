using BetterLink.Backend.Models.DTOs.Auth;
using BetterLink.Backend.Tests.Helpers;
using System.Net;
using System.Net.Http.Json;

namespace BetterLink.Backend.Tests.Tests;

public class AuthTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // ─── Register Student ─────────────────────────────────────────────────────

    [Fact]
    public async Task RegisterStudent_ValidPayload_Returns200WithToken()
    {
        var email = $"student-{Guid.NewGuid()}@test.com";

        var response = await _client.PostAsJsonAsync("/api/auth/register/student", new
        {
            email,
            password = "Test1234!",
            fullName = "Jane Student",
            university = "Northern Caribbean University",
            programName = "Computer Science"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(body);
        Assert.NotEmpty(body.Token);
        Assert.Equal(email, body.Email);
        Assert.Equal("Student", body.Role);
    }

    [Fact]
    public async Task RegisterStudent_MissingRequiredField_Returns400()
    {
        // No university field
        var response = await _client.PostAsJsonAsync("/api/auth/register/student", new
        {
            email = $"bad-{Guid.NewGuid()}@test.com",
            password = "Test1234!",
            fullName = "Jane Student"
            // university and programName missing
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // ─── Register Employer ────────────────────────────────────────────────────

    [Fact]
    public async Task RegisterEmployer_ValidPayload_Returns200WithToken()
    {
        var email = $"employer-{Guid.NewGuid()}@test.com";

        var response = await _client.PostAsJsonAsync("/api/auth/register/employer", new
        {
            email,
            password = "Test1234!",
            fullName = "Bob Employer",
            organizationName = "Acme Corp",
            industry = "Technology",
            location = "Kingston, Jamaica"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(body);
        Assert.NotEmpty(body.Token);
        Assert.Equal(email, body.Email);
        Assert.Equal("Employer", body.Role);
    }

    // ─── Duplicate Email ──────────────────────────────────────────────────────

    [Fact]
    public async Task RegisterStudent_DuplicateEmail_Returns409Conflict()
    {
        var email = $"dup-{Guid.NewGuid()}@test.com";

        // First registration
        await _client.PostAsJsonAsync("/api/auth/register/student", new
        {
            email,
            password = "Test1234!",
            fullName = "First User",
            university = "NCU",
            programName = "IT"
        });

        // Second registration with same email
        var response = await _client.PostAsJsonAsync("/api/auth/register/student", new
        {
            email,
            password = "Test1234!",
            fullName = "Second User",
            university = "NCU",
            programName = "IT"
        });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    // ─── Login ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Login_ValidCredentials_Returns200WithToken()
    {
        var email = $"logintest-{Guid.NewGuid()}@test.com";
        const string password = "Test1234!";

        // Register first
        await _client.PostAsJsonAsync("/api/auth/register/student", new
        {
            email,
            password,
            fullName = "Login Tester",
            university = "NCU",
            programName = "CS"
        });

        // Then login
        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(body);
        Assert.NotEmpty(body.Token);
        Assert.Equal(email, body.Email);
    }

    [Fact]
    public async Task Login_WrongPassword_Returns401()
    {
        var email = $"wrongpw-{Guid.NewGuid()}@test.com";

        await _client.PostAsJsonAsync("/api/auth/register/student", new
        {
            email,
            password = "Test1234!",
            fullName = "Wrong PW Test",
            university = "NCU",
            programName = "CS"
        });

        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password = "WrongPassword99!"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_UnknownEmail_Returns401()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "nobody@unknown.com",
            password = "Test1234!"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
