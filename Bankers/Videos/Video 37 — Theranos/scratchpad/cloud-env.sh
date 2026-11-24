# source scratchpad/cloud-env.sh — the cloud container's tool paths (the tools default to Timur's Windows FFmpeg).
# /home/user/ffbin holds ffmpeg/ffprobe (+ .exe aliases) symlinked to /usr/bin, the convention the Style 3 verify scripts use.
export FFMPEG_BIN=/home/user/ffbin FFMPEG=/home/user/ffbin/ffmpeg.exe FFPROBE=/home/user/ffbin/ffprobe.exe
