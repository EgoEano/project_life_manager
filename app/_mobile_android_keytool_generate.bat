@echo off
chcp 65001

cd /d %~dp0

if "%JAVA_HOME%"=="" (
    echo [ERROR] JAVA_HOME is not found! Set the JDK path.
    pause
    exit /b
)

if not exist .env (
    echo [ERROR] File .env is not found!
    pause
    exit /b
)

set "MY_PASSWORD="
for /f "tokens=2 delims==" %%i in ('findstr /i "ANDROID_KEYTOOL_PASS" .env') do (
    set "MY_PASSWORD=%%i"
)

if defined MY_PASSWORD (
    for /f "tokens=*" %%g in ("%MY_PASSWORD%") do set "MY_PASSWORD=%%g"
)

echo [INFO] Using JAVA_HOME: %JAVA_HOME%
echo [INFO] Generating key...

echo yes | "%JAVA_HOME%\bin\keytool.exe" -genkey -v -keystore "android\app\my-upload-key.keystore" -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000 -storepass "%MY_PASSWORD%" -keypass "%MY_PASSWORD%" -dname "CN=MyName, OU=MyOrg, O=MyCompany, L=MyCity, S=MyState, C=US"

echo [SUCCESS] File created into: android/app/my-upload-key.keystore

pause