# Azure Configuration

Deployment notes for BetterLink cloud hosting.

## Recommended Resources

- `Azure App Service` for backend API (`betterlink-api`)
- `Azure Database for MySQL` (or `Azure SQL Database`)
- `Azure Static Web Apps` or App Service for web frontend
- `Azure Key Vault` for secret management
- `Application Insights` for monitoring

## Suggested Naming Convention

- Resource Group: `rg-betterlink-dev`
- App Service Plan: `asp-betterlink-dev`
- Backend App Service: `app-betterlink-api-dev`
- Database: `db-betterlink-dev`
- Key Vault: `kv-betterlink-dev`

## Backend App Settings

Configure these in App Service Configuration:

- `ASPNETCORE_ENVIRONMENT=Production`
- `ConnectionStrings__DefaultConnection=<production-db-connection-string>`
- `Jwt__Key=<strong-random-secret>`
- `Jwt__Issuer=BetterLink`
- `Jwt__Audience=BetterLink.Client`

Do not commit production secrets to source control.

## Deployment Flow

1. Push changes to `main`.
2. GitHub Actions builds backend project.
3. Deploy job runs when Azure publish profile secret exists.
4. App Service restarts with updated package.

## Monitoring Checklist

- Enable Application Insights request and dependency tracking.
- Configure alerts for high error rate and response latency.
- Track failed login attempts and suspicious activity patterns.
