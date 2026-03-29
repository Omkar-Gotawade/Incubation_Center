$ErrorActionPreference = 'Stop'
$base = 'http://localhost:8000/api'
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

function PostJson($url, $body, $token) {
  $headers = @{}
  if ($token) { $headers['Authorization'] = "Bearer $token" }
  return Invoke-RestMethod -Uri $url -Method Post -ContentType 'application/json' -Headers $headers -Body ($body | ConvertTo-Json)
}

function GetJson($url, $token) {
  $headers = @{}
  if ($token) { $headers['Authorization'] = "Bearer $token" }
  return Invoke-RestMethod -Uri $url -Method Get -Headers $headers
}

function DeleteCall($url, $token) {
  $headers = @{}
  if ($token) { $headers['Authorization'] = "Bearer $token" }
  return Invoke-WebRequest -Uri $url -Method Delete -Headers $headers -UseBasicParsing
}

function Expect-HttpError($scriptBlock, $expectedStatus) {
  try {
    & $scriptBlock | Out-Null
    throw "Expected HTTP $expectedStatus but call succeeded"
  } catch {
    $resp = $_.Exception.Response
    if (-not $resp) { throw }
    $code = [int]$resp.StatusCode
    if ($code -ne $expectedStatus) {
      throw "Expected HTTP $expectedStatus but got $code"
    }
  }
}

$admin = @{ name='Admin User'; email="admin.$ts@example.com"; password='StrongPass123!'; role='admin' }
$proto = @{ name='Proto User'; email="proto.$ts@example.com"; password='StrongPass123!'; role='prototyper' }
$biz = @{ name='Biz User'; email="biz.$ts@example.com"; password='StrongPass123!'; role='business' }

$null = PostJson "$base/register" $admin $null
$null = PostJson "$base/register" $proto $null
$null = PostJson "$base/register" $biz $null

$adminLogin = PostJson "$base/login" @{ email=$admin.email; password=$admin.password } $null
$protoLogin = PostJson "$base/login" @{ email=$proto.email; password=$proto.password } $null
$bizLogin = PostJson "$base/login" @{ email=$biz.email; password=$biz.password } $null

$adminToken = $adminLogin.access_token
$protoToken = $protoLogin.access_token
$bizToken = $bizLogin.access_token

$me = GetJson "$base/me" $adminToken
if ($me.role -ne 'admin') { throw 'Expected /me role admin' }

$created = PostJson "$base/prototypes" @{ title="Demo Prototype $ts"; description='Prototype description for e2e validation.' } $protoToken
if (-not $created.id) { throw 'Prototype creation failed' }

Expect-HttpError { PostJson "$base/prototypes" @{ title='No Access'; description='Business user should not create prototypes.' } $bizToken } 403

$list = GetJson "$base/prototypes" $bizToken
if (($list | Measure-Object).Count -lt 1) { throw 'Expected at least one prototype in list' }

Expect-HttpError { DeleteCall "$base/prototypes/$($created.id)" $bizToken } 403

$delResp = DeleteCall "$base/prototypes/$($created.id)" $adminToken
if ([int]$delResp.StatusCode -ne 204) { throw "Expected 204 delete, got $($delResp.StatusCode)" }

$emailResp = PostJson "$base/send-meeting-email" @{} $adminToken
if ($emailResp.recipients_count -lt 3) { throw 'Expected at least 3 recipients in email broadcast' }

Write-Output "E2E PASS"
Write-Output "Registered users: $($admin.email), $($proto.email), $($biz.email)"
Write-Output "Email broadcast recipients_count: $($emailResp.recipients_count)"
