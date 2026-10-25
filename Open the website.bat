@echo off
title Danyal Bashir - Archive
cd /d "%~dp0"
start "" http://localhost:5180
echo Serving the archive on http://localhost:5180 (close this window to stop)
node server.js
pause
