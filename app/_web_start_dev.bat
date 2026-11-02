@echo on
chcp 65001

cd /d %~dp0
@REM npm run web:start:dev > log_web_start_dev.txt 2>&1
npm run web:start:dev

pause