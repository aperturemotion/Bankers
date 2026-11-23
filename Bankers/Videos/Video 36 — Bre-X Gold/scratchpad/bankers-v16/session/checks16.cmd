@echo off
rem Video 16 build (2026-10-23): the full verification, run detached (root CLAUDE.md: long jobs through WMI, each step logged, a DONE marker)
cd /d "%~dp0..\.."
set RPORT=3296
set LOG=out\checks16.log
echo START %DATE% %TIME% > %LOG%
echo === sweep >> %LOG%
"C:\Program Files\nodejs\node.exe" scratchpad\sweep.mjs 1 --keep --concurrency=2 >> %LOG% 2>&1
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
echo === stems >> %LOG%
"C:\Program Files\nodejs\node.exe" scratchpad\audioprobe.mjs vo >> %LOG% 2>&1
"C:\Program Files\nodejs\node.exe" scratchpad\audioprobe.mjs music >> %LOG% 2>&1
"C:\Program Files\nodejs\node.exe" scratchpad\audioprobe.mjs sfx >> %LOG% 2>&1
echo DONE %DATE% %TIME% >> %LOG%
