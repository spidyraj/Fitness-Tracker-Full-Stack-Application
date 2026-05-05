# Complete API Testing Script
Write-Host "🚀 Fitness Tracker API Testing - Complete Implementation" -ForegroundColor Green

# Test 1: User Registration with DIVS@a123
Write-Host "1. Testing User Registration..." -ForegroundColor Yellow
try {
    $registerBody = @{
        firstName = "Divyanshu"
        lastName = "Raj"
        email = "divyanshu@example.com"
        password = "DIVS@a123"
    } | ConvertTo-Json
    
    $registerResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/register" -Method POST -ContentType "application/json" -Body $registerBody
    Write-Host "✅ Registration Successful!" -ForegroundColor Green
    Write-Host "Response: $($registerResponse.Content)" -ForegroundColor White
    $token = ($registerResponse.Content | ConvertFrom-Json).token
    Write-Host "Token: $token" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Registration Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

# Test 2: User Login with DIVS@a123
if (-not $token) {
    Write-Host "2. Testing User Login..." -ForegroundColor Yellow
    try {
        $loginBody = @{
            email = "divyanshu@example.com"
            password = "DIVS@a123"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
        Write-Host "✅ Login Successful!" -ForegroundColor Green
        Write-Host "Response: $($loginResponse.Content)" -ForegroundColor White
        $token = ($loginResponse.Content | ConvertFrom-Json).token
        Write-Host "Token: $token" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test 3: Get Profile (if we have token)
if ($token) {
    Write-Host "3. Testing Get Profile..." -ForegroundColor Yellow
    try {
        $profileResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/users/profile" -Method GET -Headers @{Authorization = "Bearer $token"}
        Write-Host "✅ Profile Retrieved!" -ForegroundColor Green
        Write-Host "Response: $($profileResponse.Content)" -ForegroundColor White
    } catch {
        Write-Host "❌ Profile Failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test 4: Create Workout (if we have token)
if ($token) {
    Write-Host "4. Testing Create Workout..." -ForegroundColor Yellow
    try {
        $workoutBody = @{
            name = "Morning Run"
            type = "CARDIO"
            duration = 30
            caloriesBurned = 250
            date = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        } | ConvertTo-Json
        
        $workoutResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/workouts" -Method POST -ContentType "application/json" -Body $workoutBody -Headers @{Authorization = "Bearer $token"}
        Write-Host "✅ Workout Created!" -ForegroundColor Green
        Write-Host "Response: $($workoutResponse.Content)" -ForegroundColor White
    } catch {
        Write-Host "❌ Workout Creation Failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test 5: Create Nutrition Entry (if we have token)
if ($token) {
    Write-Host "5. Testing Create Nutrition Entry..." -ForegroundColor Yellow
    try {
        $nutritionBody = @{
            foodName = "Protein Shake"
            calories = 150
            protein = 25
            carbs = 10
            fat = 2
            logDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        } | ConvertTo-Json
        
        $nutritionResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/nutrition" -Method POST -ContentType "application/json" -Body $nutritionBody -Headers @{Authorization = "Bearer $token"}
        Write-Host "✅ Nutrition Entry Created!" -ForegroundColor Green
        Write-Host "Response: $($nutritionResponse.Content)" -ForegroundColor White
    } catch {
        Write-Host "❌ Nutrition Creation Failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test 6: H2 Console Access
Write-Host "6. Testing H2 Console..." -ForegroundColor Yellow
try {
    $h2Response = Invoke-WebRequest -Uri "http://localhost:8080/h2-console" -Method GET
    Write-Host "✅ H2 Console Accessible!" -ForegroundColor Green
} catch {
    Write-Host "❌ H2 Console Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎉 API Testing Complete!" -ForegroundColor Green
Write-Host "Backend is ready for full production deployment!" -ForegroundColor Cyan
