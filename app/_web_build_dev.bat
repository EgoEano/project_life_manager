@echo on
chcp 65001

cd /d %~dp0
echo Building client...
cmd /c "npm run web:build:dev"
@REM cmd /c "npm run web:build:dev > log_web_build_dev.txt 2>&1"
:: Проверяем код завершения
if %ERRORLEVEL% neq 0 (
    echo 0 - public:web:build:dev > log_app_build.txt
    exit /b 1
)