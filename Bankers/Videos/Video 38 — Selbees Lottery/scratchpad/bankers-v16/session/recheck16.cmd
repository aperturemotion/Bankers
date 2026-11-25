@echo off
rem Video 16: re-sweep the ranges the last margin nudges touch, then the whole-film checks on the merged set (logged, DONE marker)
cd /d "%~dp0..\.."
set RPORT=3297
set LOG=out\recheck16.log
echo START %DATE% %TIME% > %LOG%
"C:\Program Files\nodejs\node.exe" scratchpad\remerge.mjs 400-880 >> %LOG% 2>&1
"C:\Program Files\nodejs\node.exe" scratchpad\remerge.mjs 1080-1440 >> %LOG% 2>&1
echo === violations >> %LOG%
"C:\Program Files\nodejs\node.exe" scratchpad\violations.mjs >> %LOG% 2>&1
echo === flash >> %LOG%
python scratchpad\flash.py >> %LOG% 2>&1
echo === popscan >> %LOG%
python scratchpad\popscan.py >> %LOG% 2>&1
echo === sfxsheet >> %LOG%
"C:\Program Files\nodejs\node.exe" scratchpad\sfxsheet.mjs --json >> %LOG% 2>&1
echo === whooshsync >> %LOG%
python scratchpad\whooshsync.py >> %LOG% 2>&1
echo DONE %DATE% %TIME% >> %LOG%
