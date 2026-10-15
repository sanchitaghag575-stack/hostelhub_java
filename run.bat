@echo off
cd /d "%~dp0"
where javac >nul 2>nul
if errorlevel 1 (
  echo Java JDK not found. Install a JDK 17 or newer and reopen VS Code.
  pause
  exit /b 1
)
if not exist "java-backend\out" mkdir "java-backend\out"
javac --add-modules jdk.httpserver -d java-backend\out java-backend\src\HostelHubServer.java
if errorlevel 1 (
  echo Compilation failed. Check the Java error above.
  pause
  exit /b 1
)
java --add-modules jdk.httpserver -cp java-backend\out HostelHubServer
pause
