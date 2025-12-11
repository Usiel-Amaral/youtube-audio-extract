@echo off
echo ========================================
echo Build do YouTube Audio Extract para Windows
echo ========================================
echo.

REM Verifica se node_modules existe
if not exist "node_modules\" (
    echo Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo ERRO: Falha ao instalar dependencias
        pause
        exit /b 1
    )
)

REM Corrige permissoes de execucao dos binarios necessarios
echo.
echo Corrigindo permissoes de execucao...
if exist "node_modules\7zip-bin\win\x64\7za.exe" (
    icacls "node_modules\7zip-bin\win\x64\7za.exe" /grant "Todos:(RX)" >nul 2>&1
)
if exist "node_modules\7zip-bin\win\ia32\7za.exe" (
    icacls "node_modules\7zip-bin\win\ia32\7za.exe" /grant "Todos:(RX)" >nul 2>&1
)

echo.
echo Iniciando build para Windows...
echo Isso pode demorar alguns minutos na primeira execucao...
echo ATENCAO: O processo pode demorar 5-10 minutos, aguarde...
echo.

call npm run build:win

if errorlevel 1 (
    echo.
    echo ERRO: Falha no build
    pause
    exit /b 1
) else (
    echo.
    echo ========================================
    echo Build concluido com sucesso!
    echo O instalador esta na pasta: dist\
    echo ========================================
)

pause

