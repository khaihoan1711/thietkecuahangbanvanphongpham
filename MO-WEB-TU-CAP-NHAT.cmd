@echo off
setlocal
chcp 65001 >nul
set "KHAIHOAN_NODE="
for /f "delims=" %%N in ('where node.exe 2^>nul') do if not defined KHAIHOAN_NODE set "KHAIHOAN_NODE=%%N"
if not defined KHAIHOAN_NODE if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "KHAIHOAN_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not defined KHAIHOAN_NODE (
  echo Chua tim thay Node.js. Hay cai Node.js LTS tai https://nodejs.org/en/download
  pause
  exit /b 1
)
"%KHAIHOAN_NODE%" "%~dp0scripts\sync-html.cjs"
if errorlevel 1 (
  echo Khong khoi dong duoc. Hay doc thong bao loi o tren.
  pause
)
endlocal
