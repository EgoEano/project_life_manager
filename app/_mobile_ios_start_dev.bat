@echo on
chcp 65001

cd /d %~dp0
@REM npm run mobile:ios:start:dev > log_mobile_ios_start_dev.txt 2>&1
npm run mobile:ios:start:dev

pause