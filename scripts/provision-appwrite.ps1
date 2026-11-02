$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repositoryRoot

$clipboardText = Get-Clipboard -Raw
if ([string]::IsNullOrWhiteSpace($clipboardText)) {
  throw 'Le presse-papiers est vide. Copiez la valeur de la clé API Appwrite puis relancez ce script.'
}
$key = $clipboardText.Trim()
Set-Clipboard -Value ' '
Remove-Variable clipboardText

if ($key -notmatch '^[\x21-\x7E]+$') {
  throw 'La clé copiée contient des caractères inattendus. Copiez uniquement la valeur de la clé API Appwrite.'
}

try {
  $env:APPWRITE_API_KEY = $key
  $key = $null
  node .\scripts\provision-appwrite.cjs
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
} finally {
  Remove-Item Env:\APPWRITE_API_KEY -ErrorAction SilentlyContinue
}
