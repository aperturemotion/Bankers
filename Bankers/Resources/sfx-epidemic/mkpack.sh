#!/usr/bin/env bash
# THE BANKERS SFX PACK FROM TIMUR'S EPIDEMIC SOUND SET (STYLE §16 2026-10-23: "from now on, use these sound effects in the videos").
# Cuts ONE clean hit per family out of the supplied files (several are multi-hit exports: the long whooshes hold four, the softs two, the
# clicks three), as mono 44.1 kHz WAV — the format the kit's SfxLayer plays — each with a short fade in and a fade out so no cut clicks.
# The family names keep their jobs (STYLE §11); three are new: clock (time passing), type (printing), flash (a snapshot or a record).
# Usage (from a video folder): bash ../../Resources/sfx-epidemic/mkpack.sh public/sfx
set -euo pipefail
OUT="${1:?usage: mkpack.sh <out dir>}"
SRC="$(cd "$(dirname "$0")" && pwd)"
FF="/c/Users/Timur/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe"
mkdir -p "$OUT"
# cut <family> <source file> <start s> <end s> <fade in s> <fade out s>
cut() {
  local name="$1" file="$2" a="$3" b="$4" fi="$5" fo="$6"
  local d; d=$(awk "BEGIN{print $b-$a}")
  local st; st=$(awk "BEGIN{print $d-$fo}")
  "$FF" -v error -y -ss "$a" -t "$d" -i "$SRC/$file" -ac 1 -ar 44100 \
    -af "afade=t=in:st=0:d=$fi,afade=t=out:st=$st:d=$fo" -c:a pcm_s16le "$OUT/$name.wav"
  echo "$name.wav  ← $file [$a–$b s]"
}
SOFTS="ES_Swooshes, Whoosh, Softs - Epidemic Sound.mp3"
LONG="ES_Swooshes, Whoosh, Generic Long Whooshes - Epidemic Sound.mp3"
TR1="ES_Designed,_Riser,_Transition,_Whoosh,_Fast,_Short_01_Epidemic.mp3"
TR2="ES_Designed,_Riser,_Transition,_Whoosh,_Fast,_Short_02_Epidemic.mp3"
BOOM="ES_Designed, Boom, Low Hit - Epidemic Sound.mp3"
PING="ES_Designed,_Tonal,_Ping,_Mysterious,_Piano,_Musical_Note_C_Epidemic.mp3"
PAGE="ES_Magazine, Page Turn 03 - Epidemic Sound.mp3"
COINS="ES_Objects, Coin, Falling Coins - Epidemic Sound.mp3"
CLICK="ES_User_Interface,_Click,_Button_Press_Click,_Tap,_Video_Game,_Back.mp3"
DATA="ES_User_Interface,_Data,_Calculating,_Processing,_Futuristic_02.mp3"
CLOCK="Clock.mp3"
TYPE="ES_Computers,_Keyboard_&_Mouse,_Typewriter,_Fast,_Type_Epidemic.mp3"
FLASH="ES_Communications,_Camera,_Flash,_Vintage,_Design_01_Epidemic_Sound.mp3"
# ── the whoosh families (soft hand-overs, big moves, camera travels, pushes and slides, the dive into the close) ──
cut whooshsoft "$SOFTS" 0.00 0.75 0.01 0.15
cut whooshlong "$LONG"  2.05 3.35 0.03 0.25
cut airwoosh   "$LONG"  6.75 8.40 0.03 0.30
cut swoosh     "$TR2"   1.95 3.20 0.03 0.25
cut lowwoosh   "$TR1"   1.95 3.00 0.03 0.25
# ── landings and arrivals ──
cut sub        "$BOOM"  0.00 1.90 0.005 0.50
cut ping       "$PING"  0.00 3.60 0.005 1.20
cut pingshort  "$PING"  0.00 1.30 0.005 0.50
cut flick      "$PAGE"  0.45 1.07 0.02 0.12
cut coin       "$COINS" 3.40 3.95 0.005 0.15
cut click      "$CLICK" 0.00 0.30 0.002 0.08
cut tick       "$CLOCK" 0.97 1.15 0.003 0.05
# ── processes (spanned to their animation by the kit's proc()/hold) ──
cut data       "$DATA"  0.00 2.28 0.005 0.20
cut datamid    "$DATA"  0.00 1.60 0.005 0.25
cut datashort  "$DATA"  0.00 0.97 0.005 0.20
cut clock      "$CLOCK" 0.50 2.90 0.02 0.25
cut type       "$TYPE"  0.95 3.95 0.02 0.25
cut flash      "$FLASH" 0.00 1.00 0.003 0.25
