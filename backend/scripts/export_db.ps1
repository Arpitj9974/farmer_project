$env:PGPASSWORD='Jamunarani'
$pgDump = "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"
$outputFile = "..\database\production_seed.sql"

if (Test-Path $pgDump) {
    & $pgDump -h 127.0.0.1 -p 5432 -U postgres -d farmer_connect -F p -f $outputFile --clean --if-exists --no-owner --no-acl
    Write-Host "✅ Database successfully exported to $outputFile"
} else {
    Write-Error "❌ pg_dump.exe not found at $pgDump"
}
