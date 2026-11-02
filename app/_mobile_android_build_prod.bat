@echo on
chcp 65001

cd /d %~dp0
@REM npm run mobile:android:build:prod > log_mobile_android_build_prod.txt 2>&1
npm run mobile:android:build:prod

pause