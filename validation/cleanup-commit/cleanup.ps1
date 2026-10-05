$ErrorActionPreference = 'Stop'
$appRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..')).TrimEnd('\')
$audit = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'audit.json') -Raw | ConvertFrom-Json
$results = @()
foreach ($candidate in $audit.temporary) {
    $target = [IO.Path]::GetFullPath((Join-Path $appRoot $candidate.relative))
    if (!$target.StartsWith($appRoot + '\', [StringComparison]::OrdinalIgnoreCase)) { throw "Outside app root: $target" }
    if ($candidate.tracked.Count -gt 0 -or $candidate.links.Count -gt 0) { throw "Unauthorised tracked content or redirect: $target" }
    if (!(Test-Path -LiteralPath $target)) { $results += @{path=$candidate.relative;status='REMOVED_BEFORE_RESUME';auditedBytes=$candidate.bytes;auditedFiles=$candidate.files}; continue }
    $pending = New-Object 'Collections.Generic.Stack[string]'
    $pending.Push('\\?\' + $target)
    $inspected = 0
    while ($pending.Count -gt 0) {
        $current = $pending.Pop()
        $item = Get-Item -LiteralPath $current -Force
        if ($item.LinkType) { throw "Filesystem redirect requires separate review: $current" }
        foreach ($redirect in @($item.Target)) {
            if (!$redirect) { continue }
            $cleanRedirect = ($redirect -replace '^\\\\\?\\','') -replace '\\+','\'
            $cleanCurrent = ($current -replace '^\\\\\?\\','') -replace '\\+','\'
            if ($cleanRedirect -ne $cleanCurrent) { throw "Filesystem redirect requires separate review: $current -> $redirect" }
        }
        $inspected++
        if ($item.PSIsContainer) {
            foreach ($child in Get-ChildItem -LiteralPath $current -Force) { $pending.Push($child.FullName) }
        }
    }
    try {
        Remove-Item -LiteralPath ('\\?\' + $target) -Recurse -Force
        $results += @{path=$candidate.relative;status='REMOVED';auditedBytes=$candidate.bytes;auditedFiles=$candidate.files;inspectedEntries=$inspected}
    } catch {
        $results += @{path=$candidate.relative;status='PRESERVED_OR_PARTIAL';auditedBytes=$candidate.bytes;auditedFiles=$candidate.files;reason=$_.Exception.Message}
    }
}
$index = Join-Path $appRoot '.git/staging-validation.index'
if (Test-Path -LiteralPath $index) {
    if ((Test-Path -LiteralPath ($index+'.lock')) -or (Test-Path -LiteralPath (Join-Path $appRoot '.git/index.lock'))) { throw 'Git lock active; preserve temporary index' }
    $item = Get-Item -LiteralPath $index -Force
    if ($item.LinkType -or ($item.Target -and @($item.Target).Count -gt 0) -or $item.PSIsContainer) { throw 'Unexpected temporary index type' }
    $results += @{path='.git/staging-validation.index';status='REMOVED';auditedBytes=$item.Length;auditedFiles=1;inspectedEntries=1}
    Remove-Item -LiteralPath $index -Force
}
@{checkedAt=(Get-Date).ToString('o');appRoot=$appRoot;results=$results} | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'cleanup-final.json')
$results | Group-Object status | Select-Object Name,Count | ConvertTo-Json
