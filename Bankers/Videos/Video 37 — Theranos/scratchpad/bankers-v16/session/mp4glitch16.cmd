@echo off
rem THE RENDERED FILE'S GLITCH CHECK (Bankers/CLAUDE.md, Timur 2026-10-18: "always ensure that there aren't any glitches in the rendered
rem version"): every frame of the MP4 decoded (half size, as the sweep keeps them) and run through the pop scan and the flash check; then
rem the MP4 against FRESH stills of the same frames, by frame number, every 4th frame of the whole film. Detached via WMI, DONE marker.
cd /d "%~dp0..\.."
set RPORT=3301
set LOG=out\mp4glitch16.log
set FFM=C:\Users\Timur\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe
echo START %DATE% %TIME% > %LOG%
if exist out\mp4_frames rmdir /s /q out\mp4_frames
mkdir out\mp4_frames
echo === decode >> %LOG%
"%FFM%" -v error -i out\private_equity_backlog.mp4 -vf scale=540:960 -q:v 2 -start_number 0 out\mp4_frames\element-%%04d.jpeg >> %LOG% 2>&1
dir /b out\mp4_frames | find /c "element-" >> %LOG%
echo === popscan (the MP4) >> %LOG%
set PYTHONIOENCODING=utf-8
python scratchpad\popscan.py out\mp4_frames >> %LOG% 2>&1
echo === flash (the MP4) >> %LOG%
python scratchpad\flash.py out\mp4_frames >> %LOG% 2>&1
echo === mp4check (the MP4 vs fresh stills, every 4th frame) >> %LOG%
"C:\Program Files\nodejs\node.exe" scratchpad\mp4check.mjs 0 2285 4 >> %LOG% 2>&1
echo DONE %DATE% %TIME% >> %LOG%
