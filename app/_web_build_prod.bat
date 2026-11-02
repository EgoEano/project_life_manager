@echo on
chcp 65001

cd /d %~dp0
npm run web:build:prod
@REM npm run web:build:prod > log_web_build_prod.txt 2>&1

pause