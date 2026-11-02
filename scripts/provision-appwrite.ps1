$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repositoryRoot

$key = Read-Host 'Collez la nouvelle cle API Appwrite (la saisie reste masquee)' -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($key)

try {
  $env:APPWRITE_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  node .\scripts\provision-appwrite.cjs
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
} finally {
  Remove-Item Env:\APPWRITE_API_KEY -ErrorAction SilentlyContinue
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
}
