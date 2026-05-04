@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------
@echo off

set MAVEN_PROJECTBASEDIR=%~dp0

if not "%JAVA_HOME%"=="" goto OkJHome
for %%i in (java.exe) do set "JAVA_HOME=%%~dp$PATH:i"
if not "%JAVA_HOME%"=="" goto OkJHome
echo Error: JAVA_HOME not found or java not in PATH
exit /b 1

:OkJHome
set JAVA_EXECUTABLE=%JAVA_HOME%\bin\java.exe
if not exist "%JAVA_EXECUTABLE%" set JAVA_EXECUTABLE=%JAVA_HOME%java.exe

set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain
set WRAPPER_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"

if exist %WRAPPER_JAR% goto execute

echo Downloading maven-wrapper.jar...
"%JAVA_EXECUTABLE%" -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%" ^
  -jar "%MAVEN_PROJECTBASEDIR%.mvn\wrapper\MavenWrapperDownloader.class" %WRAPPER_URL% %WRAPPER_JAR%

:execute
set MAVEN_OPTS=%MAVEN_OPTS% -Xms256m -Xmx512m

"%JAVA_EXECUTABLE%" ^
  %MAVEN_OPTS% ^
  -classpath %WRAPPER_JAR% ^
  "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" ^
  %WRAPPER_LAUNCHER% %MAVEN_CONFIG% %*
