@echo on
chcp 65001

cd /d %~dp0
npm run web:build:prod:inline
@REM npm run web:build:prod:inline > log_web_build_prod_inline.txt 2>&1


pause