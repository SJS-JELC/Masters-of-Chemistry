Add-Type -AssemblyName System.Drawing
$report = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'browser-report.json') -Raw | ConvertFrom-Json
$tileWidth = 280
$tileHeight = 460
$columns = 5
$rows = [Math]::Ceiling($report.screenshots.Count / $columns)
$sheet = New-Object System.Drawing.Bitmap ($columns * $tileWidth), ($rows * $tileHeight)
$graphics = [System.Drawing.Graphics]::FromImage($sheet)
$graphics.Clear([System.Drawing.Color]::FromArgb(240,240,240))
$font = New-Object System.Drawing.Font 'Arial', 9
$index = 0
foreach ($file in $report.screenshots) {
  $source = [System.Drawing.Image]::FromFile((Join-Path $PSScriptRoot $file))
  $x = ($index % $columns) * $tileWidth
  $y = [Math]::Floor($index / $columns) * $tileHeight
  $scale = [Math]::Min(($tileWidth - 12) / $source.Width, ($tileHeight - 35) / $source.Height)
  $width = [int]($source.Width * $scale)
  $height = [int]($source.Height * $scale)
  $graphics.DrawString($file, $font, [System.Drawing.Brushes]::Black, $x + 5, $y + 5)
  $graphics.DrawImage($source, $x + [int](($tileWidth - $width) / 2), $y + 26, $width, $height)
  $source.Dispose()
  $index++
}
$sheet.Save((Join-Path $PSScriptRoot 'contact-sheet.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$font.Dispose()
$graphics.Dispose()
$sheet.Dispose()
