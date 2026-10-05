param([Parameter(Mandatory=$true)][int]$ChromePid)
$process=Get-Process -Id $ChromePid -ErrorAction Stop
$process.Refresh()
if ($process.ProcessName -ne 'chrome') {throw 'Only owned Chrome may be activated'}
$handle=$process.MainWindowHandle
if ($handle -eq 0) {throw 'Owned Chrome has no native main window handle'}
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class OwnedEbpChromeWindow {
 [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr handle, int command);
 [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr handle);
 [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr handle, IntPtr after, int x, int y, int width, int height, uint flags);
}
"@
$shown=[OwnedEbpChromeWindow]::ShowWindow($handle,9)
$raised=[OwnedEbpChromeWindow]::SetWindowPos($handle,[IntPtr](-1),0,0,0,0,3)
$foreground=[OwnedEbpChromeWindow]::SetForegroundWindow($handle)
$lowered=[OwnedEbpChromeWindow]::SetWindowPos($handle,[IntPtr](-2),0,0,0,0,3)
@{pid=$ChromePid;handle=$handle.ToInt64();showRestore=$shown;raise=$raised;foreground=$foreground;releaseTopmost=$lowered}|ConvertTo-Json -Compress
