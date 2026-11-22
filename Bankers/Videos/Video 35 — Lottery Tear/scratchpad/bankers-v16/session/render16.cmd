@echo off
rem Video 16 master render (Timur, 2026-10-23: "Render the master now, and glitch-check the MP4"), single tab, run detached
rem through WMI (root CLAUDE.md). Logs to out\render16.log and ends with a DONE marker.
cd /d "%~dp0..\.."
set RPORT=3300
set LOG=out\render16.log
echo START %DATE% %TIME% > %LOG%
"C:\Program Files\nodejs\node.exe" scratchpad\render.mjs 1 >> %LOG% 2>&1
echo EXIT %ERRORLEVEL% >> %LOG%
echo DONE %DATE% %TIME% >> %LOG%
