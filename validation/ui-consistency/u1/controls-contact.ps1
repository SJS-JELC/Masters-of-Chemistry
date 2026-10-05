Add-Type -AssemblyName System.Drawing
$taskFiles = @(
 'generic-desktop.png', 'actual-app-reload.png',
 'alevel-acid-base-calculations-390.png', 'alevel-electrons-bonding-390.png',
 'alevel-dot-and-cross-390.png', 'alevel-electron-configurations-390.png',
 'igcse-energy-enthalpy-390.png', 'alevel-ph-titration-curves-390.png'
)
$taskTileWidth = 420
$taskTileHeight = 700
$taskColumns = 4
$taskSheet = New-Object System.Drawing.Bitmap ($taskColumns * $taskTileWidth), (2 * $taskTileHeight)
$taskGraphics = [System.Drawing.Graphics]::FromImage($taskSheet)
$taskGraphics.Clear([System.Drawing.Color]::FromArgb(240,240,240))
$taskFont = New-Object System.Drawing.Font 'Arial', 10
$taskIndex = 0
foreach ($taskFile in $taskFiles) {
 $taskSource = [System.Drawing.Image]::FromFile((Join-Path $PSScriptRoot ('controls/screens/' + $taskFile)))
 $taskX = ($taskIndex % $taskColumns) * $taskTileWidth
 $taskY = [Math]::Floor($taskIndex / $taskColumns) * $taskTileHeight
 $taskScale = [Math]::Min(($taskTileWidth - 16) / $taskSource.Width, ($taskTileHeight - 35) / $taskSource.Height)
 $taskWidth = [int]($taskSource.Width * $taskScale)
 $taskHeight = [int]($taskSource.Height * $taskScale)
 $taskGraphics.DrawString($taskFile, $taskFont, [System.Drawing.Brushes]::Black, $taskX + 6, $taskY + 5)
 $taskGraphics.DrawImage($taskSource, $taskX + [int](($taskTileWidth - $taskWidth) / 2), $taskY + 28, $taskWidth, $taskHeight)
 $taskSource.Dispose()
 $taskIndex++
}
$taskSheet.Save((Join-Path $PSScriptRoot 'controls-contact.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$taskFont.Dispose()
$taskGraphics.Dispose()
$taskSheet.Dispose()
