@echo on
chcp 65001

cd /d %~dp0
@REM npm run mobile:android:start:dev > log_mobile_android_start_dev.txt 2>&1
npm run mobile:android:start:dev

pause