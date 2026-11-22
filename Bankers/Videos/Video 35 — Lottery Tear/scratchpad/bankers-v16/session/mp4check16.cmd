@echo off
cd /d "%~dp0..\.."
set RPORT=3302
set LOG=out\mp4check16.log
echo START %DATE% %TIME% > %LOG%
"C:\Program Files\nodejs\node.exe" scratchpad\mp4check.mjs 0 2285 4 >> %LOG% 2>&1
echo DONE %DATE% %TIME% >> %LOG%
