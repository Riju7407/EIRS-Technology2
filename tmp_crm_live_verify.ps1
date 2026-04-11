$ErrorActionPreference = 'Stop'
$websiteApi = 'https://eirs-technology2-2.onrender.com'
$crmApi = 'https://eirs-technology-crm.vercel.app/api'
$ts = Get-Date -Format 'yyyyMMddHHmmss'
$email = "crmverify$ts@example.com"
$password = 'Test@12345'
$phone = "90000" + (Get-Random -Minimum 10000 -Maximum 99999)

Write-Output "[1/8] Signup: $email"
$signupBody = @{ name='CRM Verify User'; phoneNumber=$phone; address='Kolkata Test Address'; email=$email; password=$password; confirmPassword=$password } | ConvertTo-Json
try {
  $null = Invoke-RestMethod -Uri "$websiteApi/auth/signup" -Method Post -ContentType 'application/json' -Body $signupBody
  Write-Output 'Signup: OK'
} catch {
  $resp = $_.Exception.Response
  if ($resp -and $resp.StatusCode.value__ -eq 400) {
    Write-Output 'Signup: 400 (continuing)'
  } else { throw }
}

Write-Output '[2/8] Signin website'
$signinBody = @{ email=$email; password=$password } | ConvertTo-Json
$signinRes = Invoke-RestMethod -Uri "$websiteApi/auth/signin" -Method Post -ContentType 'application/json' -Body $signinBody
$token = $signinRes.token
if (-not $token) { throw 'No website token' }
$headers = @{ Authorization = "Bearer $token" }
Write-Output 'Signin: OK'

Write-Output '[3/8] Create contact'
$contactBody = @{ name='CRM Verify Contact'; email=$email; phoneNumber=$phone; subject='Live CRM Sync Test'; message="Contact sync test at $ts" } | ConvertTo-Json
$contactRes = Invoke-RestMethod -Uri "$websiteApi/auth/contact" -Method Post -Headers $headers -ContentType 'application/json' -Body $contactBody
Write-Output "Contact: $($contactRes.message)"

Write-Output '[4/8] Create order'
$orderBody = @{
  items=@(@{ productId='64b7e1a2f9c1234567890abc'; productName="CRM Sync Test Product $ts"; price=499; quantity=1; category='Testing'; brand='EIRS'; image='' })
  totalPrice=499
  totalItems=1
  shippingAddress=@{ fullName='CRM Verify User'; email=$email; phone=$phone; houseNo='123'; address='Test Street'; city='Kolkata'; state='West Bengal'; zipCode='700001' }
  paymentMethod='Card'
  notes="Order sync test at $ts"
} | ConvertTo-Json -Depth 8
$orderRes = Invoke-RestMethod -Uri "$websiteApi/auth/orders/create" -Method Post -Headers $headers -ContentType 'application/json' -Body $orderBody
$orderId = $orderRes.data._id
Write-Output "Order: OK id=$orderId"

Write-Output '[5/8] CRM login'
$crmLoginBody = @{ email='technologyeirs@gmail.com'; password='EIRS@123crm' } | ConvertTo-Json
$crmLoginRes = Invoke-RestMethod -Uri "$crmApi/auth/login" -Method Post -ContentType 'application/json' -Body $crmLoginBody
$crmToken = $crmLoginRes.token
if (-not $crmToken) { throw 'No CRM token' }
$crmHeaders = @{ Authorization = "Bearer $crmToken" }
Write-Output 'CRM login: OK'

Write-Output '[6/8] Poll service-management (prospects)'
$prospectId = $null
for ($i = 0; $i -lt 8; $i++) {
  $p = Invoke-RestMethod -Uri "$crmApi/service-management?search=$email&limit=20" -Method Get -Headers $crmHeaders
  $m = @($p.prospects) | Where-Object { $_.email -eq $email } | Select-Object -First 1
  if ($m) { $prospectId = $m._id; break }
  Start-Sleep -Seconds 2
}

Write-Output '[7/8] Poll clients'
$clientId = $null
$purchaseCount = 0
for ($i = 0; $i -lt 8; $i++) {
  $c = Invoke-RestMethod -Uri "$crmApi/clients?search=$email&limit=20" -Method Get -Headers $crmHeaders
  $m2 = @($c.clients) | Where-Object { $_.email -eq $email } | Select-Object -First 1
  if ($m2) {
    $clientId = $m2._id
    $purchaseCount = @($m2.purchaseHistory).Count
    break
  }
  Start-Sleep -Seconds 2
}

Write-Output '[8/8] Summary'
Write-Output "EMAIL=$email"
Write-Output "PHONE=$phone"
Write-Output "ORDER_ID=$orderId"
Write-Output "PROSPECT_ID=$prospectId"
Write-Output "CLIENT_ID=$clientId"
Write-Output "CLIENT_PURCHASE_COUNT=$purchaseCount"
Write-Output "PROSPECT_SYNC=$(if($prospectId){'PASSED'}else{'FAILED'})"
Write-Output "CLIENT_SYNC=$(if($clientId){'PASSED'}else{'FAILED'})"
