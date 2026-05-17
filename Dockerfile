FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY src/CurlMaster.Api/CurlMaster.Api.csproj src/CurlMaster.Api/
RUN dotnet restore src/CurlMaster.Api/CurlMaster.Api.csproj

COPY src/CurlMaster.Api/ src/CurlMaster.Api/
RUN dotnet publish src/CurlMaster.Api/CurlMaster.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080 8443

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -fsS http://localhost:8080/saglik || exit 1

ENTRYPOINT ["dotnet", "CurlMaster.Api.dll"]
