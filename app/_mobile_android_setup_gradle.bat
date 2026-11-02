@echo off
chcp 65001

cd /d "%~dp0"

echo === ШАГ 1: ПОЛУЧЕНИЕ ПАРОЛЯ ИЗ .ENV ===
set "MY_PASSWORD="
for /f "tokens=2 delims==" %%i in ('findstr /i "ANDROID_KEYTOOL_PASS" .env') do (
    set "MY_PASSWORD=%%i"
)

echo === ШАГ 2: НАСТРОЙКА android/gradle.properties ===
set "PROP_FILE=android\gradle.properties"
:: Удаляем старые записи, если они были, чтобы не дублировать
findstr /v "MYAPP_UPLOAD_" "%PROP_FILE%" > "%PROP_FILE%.tmp"
move /y "%PROP_FILE%.tmp" "%PROP_FILE%" > nul

:: Дописываем новые данные в конец файла
(
echo.
echo MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
echo MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
echo MYAPP_UPLOAD_STORE_PASSWORD=%MY_PASSWORD%
echo MYAPP_UPLOAD_KEY_PASSWORD=%MY_PASSWORD%
) >> "%PROP_FILE%"

echo === ШАГ 3: МОДИФИКАЦИЯ android/app/build.gradle ===
set "GRADLE_FILE=android\app\build.gradle"
set "TEMP_FILE=android\app\build.gradle.tmp"

:: Скрипт на PowerShell (встроенный в Windows) для точечной вставки блока release в signingConfigs
powershell -Command "$p='%GRADLE_FILE%'; $text=[System.IO.File]::ReadAllText($p); if ($text -notmatch 'release\s*\{\s*if\s*\(') { $rb='signingConfigs {'+[Environment]::NewLine+'        release {'+[Environment]::NewLine+'            if (project.hasProperty(\"MYAPP_UPLOAD_STORE_FILE\")) {'+[Environment]::NewLine+'                storeFile file(MYAPP_UPLOAD_STORE_FILE)'+[Environment]::NewLine+'                storePassword MYAPP_UPLOAD_STORE_PASSWORD'+[Environment]::NewLine+'                keyAlias MYAPP_UPLOAD_KEY_ALIAS'+[Environment]::NewLine+'                keyPassword MYAPP_UPLOAD_KEY_PASSWORD'+[Environment]::NewLine+'            }'+[Environment]::NewLine+'        }'; $text=$text -replace 'signingConfigs\s*\{', $rb }; if ($text -match 'signingConfig\s+signingConfigs\.debug') { $text=$text -replace 'signingConfig\s+signingConfigs\.debug', 'signingConfig signingConfigs.release' }; [System.IO.File]::WriteAllText('%TEMP_FILE%', $text)"

if exist "%TEMP_FILE%" (
    move /y "%TEMP_FILE%" "%GRADLE_FILE%" > nul
    echo [УСПЕХ] Файл build.gradle успешно настроен под release.
) else (
    echo [ВНИМАНИЕ] Не удалось автоматически изменить build.gradle. Возможно, структура файла нестандартная.
)

echo === ШАГ 4: ЗАПУСК СБОРКИ APK ===
cd android
echo [ИНФО] Очистка кэша...
call gradlew clean
echo [ИНФО] Сборка релизного APK...
call gradlew assembleRelease

echo.
echo === ВСЁ ГОТОВО! ===
echo Проверьте папку: android\app\build\outputs\apk\release\
pause