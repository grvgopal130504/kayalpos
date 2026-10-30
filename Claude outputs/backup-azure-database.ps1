<#
.SYNOPSIS
  Takes a fresh logical backup (pg_dump custom format) of the Azure database named in backend\.env, into a NEW file,
  then checks the backup can be read. READ-ONLY on the database. Never prints or logs the connection string, user name,
  password or database name.

.DESCRIPTION
  1. Reads backend\.env as text (never modified), extracts DATABASE_URL, splits it itself, percent-decodes user/password once.
  2. Checks: port 5432, host ends with .postgres.database.azure.com, no pgbouncer flag, password present.
  3. Shows ONLY a masked target and the new backup file name; asks you to type BACKUP.
  4. Runs pg_dump through process-level PG* environment variables (SSL required, never on the command line, never in a file).
     pg_dump only READS (it takes light read locks and a consistent snapshot; it does not block your POS from selling).
  5. Refuses to overwrite: the backup name contains the date and time and the file must not already exist.
  6. Verifies with pg_restore --list (must list the Sale and Tenant tables with data), prints size and SHA256.
  7. Redacts host, user, password, database name and IPs from everything pg_dump prints.
  Never touches existing backups. Does NOT run Prisma, migrations or anything that writes to the database.
#>
[CmdletBinding()]
param(
    [string]$ProjectDir   = 'D:\narmatha\Kayal\Nexora-pos',
    [string]$PgDumpPath   = 'C:\Program Files\PostgreSQL\18\bin\pg_dump.exe',
    [string]$PgRestorePath = 'C:\Program Files\PostgreSQL\18\bin\pg_restore.exe',
    [string]$BackupDir    = 'C:\POS_Backups',
    [switch]$ParseOnly
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$EnvFile = Join-Path (Join-Path $ProjectDir 'backend') '.env'

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

$line = $null; $value = $null; $dbUser = $null; $dbPass = $null; $dbHost = $null; $dbName = $null; $raw = $null; $secrets = $null; $m = $null
$backupFile = $null; $dumpOk = $false
try {
    # ---- 0. files ---------------------------------------------------------------------------------------------------
    if (-not (Test-Path -LiteralPath $PgDumpPath    -PathType Leaf)) { throw "pg_dump.exe not found at the expected path." }
    if (-not (Test-Path -LiteralPath $PgRestorePath -PathType Leaf)) { throw "pg_restore.exe not found at the expected path." }
    if (-not (Test-Path -LiteralPath $EnvFile       -PathType Leaf)) { throw "backend\.env not found." }
    if (-not (Test-Path -LiteralPath $BackupDir     -PathType Container)) { throw "Backup folder not found." }
    Write-Host ("pg_dump: " + (& $PgDumpPath --version))

    # ---- 1. extract and split DATABASE_URL (value is never printed) -------------------------------------------------
    $line = Get-Content -LiteralPath $EnvFile -Encoding UTF8 |
            Where-Object { $_ -match '^\s*(export\s+)?DATABASE_URL\s*=' } | Select-Object -Last 1
    if (-not $line) { throw "No DATABASE_URL line in backend\.env." }
    $value = ($line -replace '^\s*(export\s+)?DATABASE_URL\s*=\s*', '').Trim()
    if ($value -match '^"(.*)"\s*(#.*)?$') { $value = $Matches[1] }
    elseif ($value -match "^'(.*)'\s*(#.*)?$") { $value = $Matches[1] }
    else { $value = ($value -replace '\s+#.*$', '').Trim() }

    if (Test-Path Env:DATABASE_URL) {
        Write-Host "NOTE: a DATABASE_URL environment variable is set in this PowerShell window. This script reads backend\.env only."
    }

    $rx = '^(?<scheme>postgres(?:ql)?)://(?<user>[^:@/]*)(?::(?<pass>.*))?@(?<host>[^/:?#@]+)(?::(?<port>\d*))?/(?<db>[^?#]*)(?:\?(?<query>.*))?$'
    if ($value -notmatch $rx) {
        throw "DATABASE_URL could not be parsed. If the user name or password contains @ : / ? # % or a space, it must be percent-encoded."
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

    $secrets = @($dbPass, $dbUser, $dbHost, $dbName, $dbHost.Split('.')[0]) | Where-Object { $_ } | Select-Object -Unique

    # ---- 2. new, never-existing backup file name ---------------------------------------------------------------------
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $backupFile = Join-Path $BackupDir ("azure_pre_migration_{0}.backup" -f $stamp)
    if (Test-Path -LiteralPath $backupFile) { throw "Backup file already exists. Refusing to overwrite." }

    Write-Host ""
    Write-Host ("Target  : " + (Mask-Host $dbHost) + "  port 5432  sslmode=require")
    Write-Host  "Account : user name, password and database name were read from backend\.env (not shown)"
    Write-Host ("New file: " + $backupFile + "   (existing backups are never touched)")
    Write-Host  "Mode    : pg_dump READS the database only; nothing is written to it"
    if ($ParseOnly) { Write-Host "`n-ParseOnly: everything above was validated. NO connection was made, no file was created."; return }

    $answer = Read-Host "`nType BACKUP to connect and create the backup file (anything else cancels)"
    if ($answer -cne 'BACKUP') { Write-Host "Cancelled. Nothing was sent."; return }

    # ---- 3. dump via process-level environment variables ------------------------------------------------------------
    foreach ($n in $pgNames) { [Environment]::SetEnvironmentVariable($n, $null, 'Process') }
    [Environment]::SetEnvironmentVariable('PGHOST',            $dbHost,                'Process')
    [Environment]::SetEnvironmentVariable('PGPORT',            '5432',                 'Process')
    [Environment]::SetEnvironmentVariable('PGDATABASE',        $dbName,                'Process')
    [Environment]::SetEnvironmentVariable('PGUSER',            $dbUser,                'Process')
    [Environment]::SetEnvironmentVariable('PGPASSWORD',        $dbPass,                'Process')
    [Environment]::SetEnvironmentVariable('PGSSLMODE',         'require',              'Process')
    [Environment]::SetEnvironmentVariable('PGCONNECT_TIMEOUT', '15',                   'Process')
    [Environment]::SetEnvironmentVariable('PGAPPNAME',         'kayal-backup',         'Process')

    $dumpArgs = @('-w', '-Fc', '--lock-wait-timeout=30s', '-f', $backupFile)   # -w: never prompt; -Fc: custom format
    $ErrorActionPreference = 'Continue'
    $raw  = & $PgDumpPath @dumpArgs 2>&1
    $exit = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    $dumpText = @($raw | ForEach-Object { Protect-Text ("$_") $secrets })
    $raw = $null
    if ($dumpText.Count -gt 0) { Write-Host "pg_dump messages (redacted):"; $dumpText | Select-Object -First 15 | ForEach-Object { Write-Host "  $_" } }
    if ($exit -ne 0) { throw "pg_dump failed with exit code $exit. No usable backup was made." }

    # ---- 4. verify the file ------------------------------------------------------------------------------------------
    if (-not (Test-Path -LiteralPath $backupFile -PathType Leaf)) { throw "pg_dump reported success but the file is missing." }
    $size = (Get-Item -LiteralPath $backupFile).Length
    $ErrorActionPreference = 'Continue'
    $toc = & $PgRestorePath --list $backupFile 2>&1
    $tocExit = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    $tocLines = @($toc | ForEach-Object { "$_" })
    $dataSale   = @($tocLines | Where-Object { $_ -match 'TABLE DATA public "?Sale"? ' }).Count
    $dataTenant = @($tocLines | Where-Object { $_ -match 'TABLE DATA public "?Tenant"? ' }).Count
    $dataMig    = @($tocLines | Where-Object { $_ -match 'TABLE DATA public "?_prisma_migrations"? ' }).Count
    $hash = (Get-FileHash -LiteralPath $backupFile -Algorithm SHA256).Hash

    Write-Host ""
    Write-Host "Backup file : $backupFile"
    Write-Host "Size        : $size bytes"
    Write-Host "SHA256      : $hash"
    Write-Host "pg_restore --list exit code: $tocExit   entries listed: $($tocLines.Count)"
    Write-Host "Contains data for Sale: $($dataSale -gt 0)   Tenant: $($dataTenant -gt 0)   _prisma_migrations: $($dataMig -gt 0)"
    if ($size -lt 20000 -or $tocExit -ne 0 -or $dataSale -eq 0 -or $dataTenant -eq 0 -or $dataMig -eq 0) {
        throw "VERIFICATION FAILED: the backup file is too small or not readable or lacks core tables. Do NOT rely on it."
    }
    $dumpOk = $true
    Write-Host ""
    Write-Host "BACKUP OK. Keep this file safe: it contains all your production data. Do not commit it or share it."
}
finally {
    foreach ($n in $pgNames) { [Environment]::SetEnvironmentVariable($n, $saved[$n], 'Process') }
    if ($backupFile -and -not $dumpOk -and (Test-Path -LiteralPath $backupFile)) {
        Write-Host "NOTE: the incomplete file $backupFile was created by this run and is NOT a valid backup. Delete it yourself."
    }
    $line = $null; $value = $null; $dbUser = $null; $dbPass = $null; $dbHost = $null; $dbName = $null; $raw = $null; $secrets = $null; $m = $null
}
