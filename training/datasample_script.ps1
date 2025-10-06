# Define paths
$sourceFolder = "C:\Users\ifedi\Documents\Applied AI and ML\Session 2\INFO8665 - Projects in Machine Learning\downsample\UnitedSynMed\audio_resampled\train"
$destFolder = "C:\Users\ifedi\Documents\Applied AI and ML\Session 2\INFO8665 - Projects in Machine Learning\downsample\audio\train"
$csvPath = "C:\Users\ifedi\Documents\Applied AI and ML\Session 2\INFO8665 - Projects in Machine Learning\downsample\audio\CopiedFiles.csv"

# Validate source folder
if (-not (Test-Path -Path $sourceFolder -PathType Container)) {
    Write-Error "Source folder does not exist!"
    exit 1
}

# Get all files from source
$allFiles = @(Get-ChildItem -Path $sourceFolder -File -Recurse)
if ($allFiles.Count -lt 9500) {
    Write-Error "Source folder contains less than 9500 files ($($allFiles.Count) found)"
    exit 1
}

# Create destination folder if needed
if (-not (Test-Path -Path $destFolder)) {
    New-Item -ItemType Directory -Path $destFolder | Out-Null
}

# Select 9500 unique random files
$selectedFiles = $allFiles | Get-Random -Count 9500

# Copy files and record filenames
$copiedFiles = @()
foreach ($file in $selectedFiles) {
    $destPath = Join-Path -Path $destFolder -ChildPath $file.Name
    Copy-Item -Path $file.FullName -Destination $destPath -Force
    $copiedFiles += [PSCustomObject]@{
        FileName = $file.Name
        SourcePath = $file.FullName
        CopiedTo = $destPath
    }
    Write-Host "Copied: $($file.Name)"
}

# Export to CSV
$copiedFiles | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
Write-Host "`nSuccessfully copied $($copiedFiles.Count) files to $destFolder"
Write-Host "File list exported to $csvPath"