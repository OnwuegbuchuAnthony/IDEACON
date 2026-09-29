# Nightly local backup: pg_dump → timestamped file → (optional) R2 sync.
# Schedule: Task Scheduler → daily 02:00 → powershell -File backup.ps1
$ErrorActionPreference = "Stop"
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$dir = "C:\IDEACON-backups"
New-Item -ItemType Directory -Path $dir -Force | Out-Null
$file = Join-Path $dir "ideacon-$stamp.dump"
$env:PGPASSWORD = "ideacon_local_dev"
& "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" -U ideacon -h localhost -F c -f $file ideacon
# Keep 14 days
Get-ChildItem -LiteralPath $dir -Filter "ideacon-*.dump" |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-14) } |
  Remove-Item -Force
Write-Output "backup: $file"
