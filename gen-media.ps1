# Generates 40 photo variants from 4 base photographs: crops, mirroring,
# rotations, and duotone tints via System.Drawing. Zero dependencies.
Add-Type -AssemblyName System.Drawing

$base = "C:\Users\Akhlaq laptop\Downloads\New folder (4)\lumen-studio\assets\images"
$dest = "C:\Users\Akhlaq laptop\Downloads\New folder (4)\rayan-archive\public\media"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

$bases = @(
  "$base\item1.jpg", "$base\item2.jpg", "$base\item3.jpg", "$base\item4.jpg"
)

function New-Variant($srcPath, $idx, $flip, $rot, $cx, $cy, $cw, $ch, $tint) {
  $src = [System.Drawing.Image]::FromFile($srcPath)

  # source crop rect (relative coords scaled into actual pixel space)
  $sx = [int]($src.Width * $cx)
  $sy = [int]($src.Height * $cy)
  $sw = [Math]::Min([int]($src.Width * $cw), $src.Width - $sx)
  $sh = [Math]::Min([int]($src.Height * $ch), $src.Height - $sy)

  # output size: max 900px wide, keep crop aspect
  $outW = 900
  $outH = [int]($outW * ($sh / $sw))
  if ($outH -gt 1200) { $outH = 1200; $outW = [int]($outH * ($sw / $sh)) }

  $bmp = New-Object System.Drawing.Bitmap($outW, $outH)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

  # tint via color matrix (warm / cool / mono)
  $cm = New-Object System.Drawing.Imaging.ColorMatrix
  switch ($tint) {
    0 { # neutral
      $cm.Matrix33 = 1.0
    }
    1 { # warm amber
      $cm.Matrix00 = 1.06; $cm.Matrix11 = 1.0; $cm.Matrix22 = 0.92
    }
    2 { # cool slate
      $cm.Matrix00 = 0.92; $cm.Matrix11 = 0.99; $cm.Matrix22 = 1.07
    }
    3 { # desaturated
      $cm.Matrix00 = 0.35; $cm.Matrix11 = 0.36; $cm.Matrix22 = 0.35
    }
  }

  $attrs = New-Object System.Drawing.Imaging.ImageAttributes
  $attrs.SetColorMatrix($cm)
  $rect = New-Object System.Drawing.Rectangle(0, 0, $outW, $outH)

  if ($rot -eq 0 -and -not $flip) {
    $g.DrawImage($src, $rect, $sx, $sy, $sw, $sh, [System.Drawing.GraphicsUnit]::Pixel, $attrs)
  } else {
    # crop to intermediate bitmap first, then transform
    $crop = New-Object System.Drawing.Bitmap($sw, $sh)
    $cg = [System.Drawing.Graphics]::FromImage($crop)
    $cg.DrawImage($src, (New-Object System.Drawing.Rectangle(0,0,$sw,$sh)), $sx, $sy, $sw, $sh, [System.Drawing.GraphicsUnit]::Pixel, $attrs)
    $cg.Dispose()

    $g.TranslateTransform($outW / 2, $outH / 2)
    switch (0 + $rot) {
      1 { $g.RotateTransform(90) }
      2 { $g.RotateTransform(180) }
    }
    if ($flip) { $g.ScaleTransform(-1, 1) }
    $g.TranslateTransform(-$outW / 2, -$outH / 2)
    $g.DrawImage($crop, $rect, 0, 0, $sw, $sh, [System.Drawing.GraphicsUnit]::Pixel, $attrs)
    $crop.Dispose()
  }

  $g.Dispose()
  $src.Dispose()

  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
  $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]62)
  $bmp.Save("$dest\img-$idx.jpg", $codec, $params)
  $bmp.Dispose()
}

# deterministic recipe grid
$idx = 0
for ($b = 0; $b -lt 4; $b++) {
  for ($v = 0; $v -lt 10; $v++) {
    $flip  = $v % 2 -eq 1
    $rot   = [math]::Floor($v / 4) % 3
    $cx    = ($v % 3) * 0.11
    $cy    = ($v % 5) * 0.07
    $cw    = $(if ($v -lt 3) { 0.62 } elseif ($v -lt 6) { 0.84 } else { 0.99 })
    $ch    = $(if ($v % 2 -eq 0) { 0.62 } else { 0.94 })
    $tint  = $v % 4
    New-Variant $bases[$b] $idx $flip $rot $cx $cy $cw $ch $tint
    $idx++
  }
}

# about portrait: a tight portrait-ish crop
New-Variant $bases[0] 40 $false 0 0.25 0.05 0.5 0.92 0
Write-Host "Generated $idx + 1 variants"
