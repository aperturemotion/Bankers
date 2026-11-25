@echo off
rem Video 16 MP4 on its range-request host (4416), detached via WMI; srv.us forward 30 carries it.
cd /d "%~dp0..\.."
"C:\Program Files\nodejs\node.exe" scratchpad\serve.mjs 4416 out\private_equity_backlog.mp4 > out\serve4416.log 2>&1
