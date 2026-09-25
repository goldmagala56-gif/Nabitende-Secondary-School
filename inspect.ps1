"=== ROOT package.json ===" 
Get-Content .\package.json

"`n=== ROOT-LEVEL FILES ===" 
Get-ChildItem -File -Name

"`n=== ROOT 'src' FOLDER ===" 
if (Test-Path .\src) { Get-ChildItem .\src -Recurse -Name } else { "src not found" }

"`n=== ROOT 'supabase' FOLDER ===" 
if (Test-Path .\supabase) { Get-ChildItem .\supabase -Recurse -Force -Name } else { "supabase not found" }

"`n=== 'css' FOLDER ===" 
if (Test-Path .\css) { Get-ChildItem .\css -Recurse -Name } else { "css not found" }

"`n=== 'js' FOLDER ===" 
if (Test-Path .\js) { Get-ChildItem .\js -Recurse -Name } else { "js not found" }