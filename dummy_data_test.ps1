$ErrorActionPreference = 'Stop'
$base = 'http://localhost:8000/api'
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

function PostJson($url, $body, $token) {
  $headers = @{}
  if ($token) { $headers['Authorization'] = "Bearer $token" }
  return Invoke-RestMethod -Uri $url -Method Post -ContentType 'application/json' -Headers $headers -Body ($body | ConvertTo-Json -Depth 5)
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

$admin = @{ name='Dummy Admin'; email="dummy.admin.$ts@example.com"; password='DummyPass123!'; role='admin' }
$proto = @{ name='Dummy Prototyper'; email="dummy.proto.$ts@example.com"; password='DummyPass123!'; role='prototyper' }
$biz = @{ name='Dummy Business'; email="dummy.biz.$ts@example.com"; password='DummyPass123!'; role='business' }

$null = PostJson "$base/register" $admin $null
$null = PostJson "$base/register" $proto $null
$null = PostJson "$base/register" $biz $null

$adminToken = (PostJson "$base/login" @{email=$admin.email; password=$admin.password} $null).access_token
$protoToken = (PostJson "$base/login" @{email=$proto.email; password=$proto.password} $null).access_token
$bizToken = (PostJson "$base/login" @{email=$biz.email; password=$biz.password} $null).access_token

$protoMe = GetJson "$base/me" $protoToken
if ($protoMe.role -ne 'prototyper') { throw 'Role mismatch for prototyper' }

$p1 = PostJson "$base/prototypes" @{ title="AI Drone $ts"; description='Autonomous mapping drone prototype with smart flight controls.' } $protoToken
$p2 = PostJson "$base/prototypes" @{ title="Bio Sensor $ts"; description='Wearable biosensor prototype for real-time health monitoring.' } $protoToken

$all = GetJson "$base/prototypes" $bizToken
if (($all | Measure-Object).Count -lt 2) { throw 'Expected at least 2 prototypes visible to business user' }

$single = GetJson "$base/prototypes/$($p1.id)" $bizToken
if ($single.id -ne $p1.id) { throw 'GET /prototypes/{id} returned wrong prototype' }

$search = GetJson "$base/prototypes?search=Drone" $bizToken
if (($search | Where-Object { $_.id -eq $p1.id } | Measure-Object).Count -lt 1) { throw 'Search did not return expected prototype' }

Expect-HttpError { PostJson "$base/prototypes" @{ title='Forbidden'; description='Business user create attempt should fail.' } $bizToken } 403
Expect-HttpError { DeleteCall "$base/prototypes/$($p1.id)" $bizToken } 403

$del1 = DeleteCall "$base/prototypes/$($p1.id)" $adminToken
$del2 = DeleteCall "$base/prototypes/$($p2.id)" $adminToken
if ([int]$del1.StatusCode -ne 204 -or [int]$del2.StatusCode -ne 204) { throw 'Admin delete did not return 204' }

$emailResult = PostJson "$base/send-meeting-email" @{} $adminToken
if ($emailResult.recipients_count -lt 3) { throw 'Email broadcast recipients count too low' }

Write-Output 'DUMMY TEST PASS'
Write-Output "Users: $($admin.email), $($proto.email), $($biz.email)"
Write-Output "Created prototype IDs: $($p1.id), $($p2.id)"
Write-Output "Email recipients_count: $($emailResult.recipients_count)"
