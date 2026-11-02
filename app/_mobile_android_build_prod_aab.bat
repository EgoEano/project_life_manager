@echo on
chcp 65001

cd /d %~dp0
cd android
@REM gradlew bundleRelease
gradlew bundleRelease  > log_mobile_android_build_prod_aab.txt 2>&1

pause