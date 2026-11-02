@echo on
chcp 65001

cd /d %~dp0
cd android
gradlew assembleDebug

pause