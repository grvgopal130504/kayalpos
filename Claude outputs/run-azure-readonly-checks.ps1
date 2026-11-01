<#
.SYNOPSIS
  Runs "Claude outputs\azure-readonly-checks.sql" against the database named in backend\.env, READ-ONLY,
  without ever printing or logging the connection string, user name, password or database name.

.DESCRIPTION
  What it does, in order:
    1. Reads backend\.env as plain text (never modified) and extracts the DATABASE_URL line into a variable.
    2. Splits the URL itself (no psql URI, no [Uri] class), percent-decodes user/password ONCE, and checks:
       port is 5432, host ends with .postgres.database.azure.com, no pgbouncer flag, password present.
    3. Checks psql.exe exists and re-scans the SQL file for any write keyword (refuses to run if one is found).
    4. Shows ONLY a masked target, asks you to type RUN.
    5. Passes the connection to psql through process-level PG* environment variables (never on the command line,
       never in a file), with SSL required. Previous values of those variables are restored afterwards.
    6. Redacts host, user, password, database name and IP addresses from everything psql prints, saves the redacted
       output outside the project folder, and shows the SUMMARY.
  It does NOT run Prisma, migrations, backfills, or anything that writes. -ParseOnly makes NO network connection.
#>
[CmdletBinding()]
param(
    [string]$ProjectDir = 'D:\narmatha\Kayal\Nexora-pos',
    [string]$PsqlPath   = 'C:\Program Files\PostgreSQL\18\bin\psql.exe',
    [string]$OutDir     = [Environment]::GetFolderPath('MyDocuments'),
    [string]$SqlFileName = 'azure-readonly-checks.sql',   # any other read-only .sql file inside 'Claude outputs'
    [switch]$ParseOnly
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$EnvFile = Join-Path (Join-Path $ProjectDir 'backend') '.env'
if ($SqlFileName -notmatch '^[A-Za-z0-9._-]+\.sql$') { throw "SqlFileName must be a plain file name ending in .sql." }
$SqlFile = Join-Path (Join-Path $ProjectDir 'Claude outputs') $SqlFileName

function Protect-Text([string]$Text, [string[]]$Secrets) {
    foreach ($s in $Secrets) { if ($s) { $Text = $Text.Replace($s, '<redacted>') } }
    return [regex]::Replace($Text, '\b\d{1,3}(\.\d{1,3}){3}\b', '<ip>')
}
function Mask-Host([string]$HostName) {
    $first = $HostName.Split('.')[0]
    $rest  = $HostName.Substring($first.Length)
    $keep  = [Math]::Min(3, $first.Length)
    return $first.Substring(0, $keep) + '***' + $rest
}

$pgNames = 'PGHOST','PGHOSTADDR','PGPORT','PGDATABASE','PGUSER','PGPASSWORD','PGSSLMODE','PGCONNECT_TIMEOUT',
           'PGAPPNAME','PGOPTIONS','PGSERVICE','PGSERVICEFILE'
$saved = @{}
foreach ($n in $pgNames) { $saved[$n] = [Environment]::GetEnvironmentVariable($n, 'Process') }

$line = $null; $value = $null; $dbUser = $null; $dbPass = $null; $dbHost = $null; $dbName = $null; $raw = $null
try {
    # ---- 0. files ---------------------------------------------------------------------------------------------------
    if (-not (Test-Path -LiteralPath $PsqlPath -PathType Leaf)) { throw "psql.exe not found at the expected path." }
    if (-not (Test-Path -LiteralPath $EnvFile  -PathType Leaf)) { throw "backend\.env not found." }
    if (-not (Test-Path -LiteralPath $SqlFile  -PathType Leaf)) { throw "$SqlFileName not found in 'Claude outputs'." }
    Write-Host ("psql: " + (& $PsqlPath --version))

    # ---- 1. the SQL file must be read-only (re-scanned here, every run) ---------------------------------------------
    $sql  = Get-Content -LiteralPath $SqlFile -Raw -Encoding UTF8
    $code = (($sql -split "`r?`n") | Where-Object { $t = $_.TrimStart(); -not ($t.StartsWith('--') -or $t.StartsWith('\echo')) }) -join "`n"
    $code = [regex]::Replace($code, "'(?:[^']|'')*'", '')
    $code = [regex]::Replace($code, '"[^"]*"', '')
    $bad  = '(?i)\b(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|GRANT|REVOKE|COPY|CALL|DO|EXECUTE|VACUUM|ANALYZE|REINDEX|LOCK|MERGE|COMMENT|set_config|pg_terminate_backend|pg_cancel_backend)\b'
    if ($code -match $bad) { throw "The SQL file contains a write keyword ($($Matches[1])). Refusing to run it." }
    if ($sql -notmatch 'BEGIN READ ONLY' -or $sql -notmatch '(?m)^ROLLBACK;') { throw "The SQL file is not wrapped in BEGIN READ ONLY ... ROLLBACK. Refusing to run it." }
    Write-Host ("SQL file: read-only scan passed, SHA256 = " + (Get-FileHash -LiteralPath $SqlFile -Algorithm SHA256).Hash)

    # ---- 2. extract DATABASE_URL from .env (value is never printed) -------------------------------------------------
    $line = Get-Content -LiteralPath $EnvFile -Encoding UTF8 |
            Where-Object { $_ -match '^\s*(export\s+)?DATABASE_URL\s*=' } | Select-Object -Last 1
    if (-not $line) { throw "No DATABASE_URL line in backend\.env." }
    $value = ($line -replace '^\s*(export\s+)?DATABASE_URL\s*=\s*', '').Trim()
    if ($value -match '^"(.*)"\s*(#.*)?$') { $value = $Matches[1] }
    elseif ($value -match "^'(.*)'\s*(#.*)?$") { $value = $Matches[1] }
    else { $value = ($value -replace '\s+#.*$', '').Trim() }

    if (Test-Path Env:DATABASE_URL) {
        Write-Host "NOTE: a DATABASE_URL environment variable is set in this PowerShell window. dotenv/Prisma would prefer it over backend\.env. This script reads backend\.env only."
    }

    # ---- 3. split the URL ourselves ---------------------------------------------------------------------------------
    $rx = '^(?<scheme>postgres(?:ql)?)://(?<user>[^:@/]*)(?::(?<pass>.*))?@(?<host>[^/:?#@]+)(?::(?<port>\d*))?/(?<db>[^?#]*)(?:\?(?<query>.*))?$'
    if ($value -notmatch $rx) {
        throw "DATABASE_URL could not be parsed. If the user name or password contains @ : / ? # % or a space, it must be percent-encoded (see the notes)."
    }
    $m      = $Matches
    $query  = if ($m.ContainsKey('query')) { [string]$m['query'] } else { '' }
    $port   = if ($m.ContainsKey('port') -and $m['port']) { [string]$m['port'] } else { '5432' }
    $dbUser = [System.Uri]::UnescapeDataString($(if ($m.ContainsKey('user')) { [string]$m['user'] } else { '' }))
    $dbPass = [System.Uri]::UnescapeDataString($(if ($m.ContainsKey('pass')) { [string]$m['pass'] } else { '' }))
    $dbHost = [System.Uri]::UnescapeDataString([string]$m['host'])
    $dbName = [System.Uri]::UnescapeDataString($(if ($m.ContainsKey('db')) { [string]$m['db'] } else { '' }))

    if (-not $dbUser) { throw "DATABASE_URL has no user name." }
    if (-not $dbPass) { throw "DATABASE_URL has no password." }
    if (-not $dbName) { throw "DATABASE_URL has no database name." }
    if ($dbHost -notmatch '^[A-Za-z0-9.-]+$') { throw "Host name contains unexpected characters." }
    if ($port -ne '5432') { throw "DATABASE_URL uses port $port. This script only uses 5432 (direct). Stop and review." }
    if (-not $dbHost.EndsWith('.postgres.database.azure.com', [StringComparison]::OrdinalIgnoreCase)) {
        throw "Host does not end with .postgres.database.azure.com. This script is for the Azure server only."
    }
    if ($query -match '(?i)(^|&)pgbouncer=true') { throw "DATABASE_URL has pgbouncer=true (pooler). Use the direct connection on 5432." }
    if ($query -match '(?i)(^|&)sslmode=(disable|allow|prefer)') { Write-Host "NOTE: the URL asks for a weaker sslmode; this script forces sslmode=require." }

    $secrets = @($dbPass, $dbUser, $dbHost, $dbName, $dbHost.Split('.')[0]) | Where-Object { $_ } | Select-Object -Unique
    Write-Host ""
    Write-Host ("Target : " + (Mask-Host $dbHost) + "  port 5432  sslmode=require")
    Write-Host  "Account: user name, password and database name were read from backend\.env (not shown)"
    Write-Host  "Mode   : READ-ONLY checks, nothing is written, nothing is committed"
    if ($ParseOnly) { Write-Host "`n-ParseOnly: everything above was validated. NO connection was made."; return }

    $answer = Read-Host "`nType RUN to connect and run the read-only checks (anything else cancels)"
    if ($answer -cne 'RUN') { Write-Host "Cancelled. Nothing was sent."; return }

    # ---- 4. connection via process-level environment variables ------------------------------------------------------
    foreach ($n in $pgNames) { [Environment]::SetEnvironmentVariable($n, $null, 'Process') }
    [Environment]::SetEnvironmentVariable('PGHOST',            $dbHost,                 'Process')
    [Environment]::SetEnvironmentVariable('PGPORT',            '5432',                  'Process')
    [Environment]::SetEnvironmentVariable('PGDATABASE',        $dbName,                 'Process')
    [Environment]::SetEnvironmentVariable('PGUSER',            $dbUser,                 'Process')
    [Environment]::SetEnvironmentVariable('PGPASSWORD',        $dbPass,                 'Process')
    [Environment]::SetEnvironmentVariable('PGSSLMODE',         'require',               'Process')
    [Environment]::SetEnvironmentVariable('PGCONNECT_TIMEOUT', '15',                    'Process')
    [Environment]::SetEnvironmentVariable('PGAPPNAME',         'kayal-readonly-checks', 'Process')

    $psqlArgs = @('-X', '-w', '-v', 'ON_ERROR_STOP=0', '-f', $SqlFile)   # -X: no psqlrc, -w: never prompt, no URL, no password
    $ErrorActionPreference = 'Continue'          # psql writes NOTICE/ERROR text to stderr; do not turn that into a PowerShell error
    $raw  = & $PsqlPath @psqlArgs 2>&1
    $exit = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'

    $lines = @($raw | ForEach-Object { Protect-Text ("$_") $secrets })
    $raw = $null
    if (-not (Test-Path -LiteralPath $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }
    $outFile = Join-Path $OutDir ("{0}-{1}.txt" -f [IO.Path]::GetFileNameWithoutExtension($SqlFileName), (Get-Date -Format 'yyyyMMdd-HHmmss'))
    $lines | Out-File -LiteralPath $outFile -Encoding utf8

    $start = -1
    for ($i = 0; $i -lt $lines.Count; $i++) { if ($lines[$i] -like '*SUMMARY: PASS / WARNING / FAIL*') { $start = $i } }
    Write-Host ""
    if ($start -ge 0) {
        $lines[$start..($lines.Count - 1)] | ForEach-Object { Write-Host $_ }
    } elseif ($exit -eq 0) {
        $lines | Select-Object -First 200 | ForEach-Object { Write-Host $_ }     # scripts without a SUMMARY block: show the whole (redacted) output
    } else {
        Write-Host "No SUMMARY found (psql exit code $exit). Connection or authentication probably failed. First redacted lines:"
        $lines | Select-Object -First 12 | ForEach-Object { Write-Host $_ }
    }
    Write-Host ""
    Write-Host "psql exit code: $exit"
    Write-Host "Redacted output saved to: $outFile   (outside the project; delete it when you are done)"
}
finally {
    foreach ($n in $pgNames) { [Environment]::SetEnvironmentVariable($n, $saved[$n], 'Process') }
    $line = $null; $value = $null; $dbUser = $null; $dbPass = $null; $dbHost = $null; $dbName = $null; $raw = $null; $secrets = $null; $m = $null
}
