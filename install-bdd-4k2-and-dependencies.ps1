#Requires -RunAsAdministrator

Set-Executionpolicy UnRestricted

iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"

choco feature enable -n allowGlobalConfirmation

choco install git.install 		#only needed when using git packages dependencies

choco install nodejs-lts

choco install googlechrome

$env:path +=';C:\Program Files\nodejs\;%APPDATA%\npm;C:\Program Files\Git\cmd'

npm install -g bdd-4k2

Write-Host 'You must open another shell to run bdd-4k2 for the first time'

stop-process -Id $PID