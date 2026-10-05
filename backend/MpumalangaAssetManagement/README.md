# Asset Management API deployment

## Build and publish

The API targets .NET 10. Publish the `MAM.API.csproj` project in Release
configuration. The checked-in Folder publish profile writes to
`MAM.API/bin/Release/net10.0/win-x64/publish` and does not clear the target
directory. Do not publish directly over a running deployment.

## Required configuration

Keep secrets out of `appsettings.json`. Supply these values through protected
deployment environment variables (ASP.NET Core uses `__` for nested keys):

| Environment variable | Purpose |
| --- | --- |
| `AppSettings__Secret` | Random JWT signing secret of at least 32 UTF-8 bytes; rotate the previously checked-in value |
| `AppSettings__ConnectionString` | Production SQL Server connection string |
| `AppSettings__JwtIssuer` | Absolute issuer URL used in newly issued JWTs |
| `AppSettings__JwtAudience` | Absolute audience URL validated on API requests |
| `AppSettings__EmailPassword` | SMTP credential |
| `AppSettings__WebAppURL` | Absolute HTTPS web-app URL included in user email |
| `AllowedHosts` | Production host name(s), separated by semicolons |
| `ASPNETCORE_URLS` | `http://127.0.0.1:5000` for the checked-in IIS reverse-proxy rule |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

Configure the SMTP host/user/from-address as needed with the corresponding
`AppSettings__EmailHost`, `AppSettings__EmailUserName`,
`AppSettings__EmailPot`, and `AppSettings__FromEmailAddress` variables. For a
cross-origin client, configure each exact origin using
`AppSettings__AllowedOrigins__0`, `AppSettings__AllowedOrigins__1`, and so on.
The same-origin IIS setup does not require CORS origins.

Add a connection string named `log4net` for the AdoNetAppender used by
log4net. Provide it via the environment variable `ConnectionStrings__log4net`
or a secured configuration source. If empty, the logging appender will fail
when attempting to write database logs.

The API fails at startup if required settings are missing or malformed. Local
developers can use `dotnet user-secrets` rather than committing credentials.
The Angular client now sends login and password-management values in POST
bodies. Legacy GET password routes remain temporarily for older clients; retire
them after all consumers migrate because URL paths can be captured by web-server
and proxy access logs.

## IIS and persistent files

The frontend `web.config` requires IIS URL Rewrite and ARR with proxying enabled.
Run the API listener on loopback port 5000; IIS forwards `/api/...` to it and
serves other client routes from the Angular app.

Set `AppSettings__UploadsFolder` to a persistent absolute directory outside the
publish folder, then grant the API process identity read/write access. Back up
this directory; it contains uploaded asset and operational documents. The
folder is also served publicly under `/Uploads`, so do not place private files
there. Copy existing files from the current `Uploads` tree into the configured
directory before switching the deployment so existing document links continue
to resolve.

Use a production SQL connection with certificate validation enabled. Avoid
`TrustServerCertificate=True` unless your organization explicitly accepts that
tradeoff.
