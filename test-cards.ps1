# Payment Cards API Test Script (PowerShell)
# This script tests all payment card endpoints with sample cards

Write-Host "🧪 Payment Cards API Test Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Configuration
$API_BASE = "http://localhost:5000"
$TEST_USER = @{
    email = "funder@example.com"  # Update with your test user email
    password = "Password123!"     # Update with your test user password
}

# Sample test cards
$TEST_CARDS = @(
    @{
        bankName = "Standard Bank"
        cardNumber = "4111111111111111"
        expiryDate = "12/25"
        ccv = "123"
        nickname = "Standard Bank Visa"
        isDefault = $true
    },
    @{
        bankName = "FNB"
        cardNumber = "4000000000000002"
        expiryDate = "08/26"
        ccv = "456"
        nickname = "FNB Business Card"
        isDefault = $false
    },
    @{
        bankName = "Capitec Bank"
        cardNumber = "5555555555554444"
        expiryDate = "03/27"
        ccv = "789"
        nickname = "Capitec Mastercard"
        isDefault = $false
    },
    @{
        bankName = "ABSA"
        cardNumber = "4242424242424242"
        expiryDate = "11/28"
        ccv = "321"
        nickname = "ABSA Premium Card"
        isDefault = $false
    }
)

Write-Host "`n📋 Available Test Cards:" -ForegroundColor Yellow
for ($i = 0; $i -lt $TEST_CARDS.Count; $i++) {
    $card = $TEST_CARDS[$i]
    Write-Host "   $($i + 1). $($card.bankName) - **** **** **** $($card.cardNumber.Substring($card.cardNumber.Length - 4)) ($($card.nickname))" -ForegroundColor White
}

try {
    # Step 1: Login
    Write-Host "`n🔐 Step 1: Logging in..." -ForegroundColor Green
    $loginBody = $TEST_USER | ConvertTo-Json
    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.token) {
        Write-Host "✅ Login successful" -ForegroundColor Green
        $token = $loginResponse.token
        $headers = @{ 
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json" 
        }
        
        # Step 2: Add payment cards
        Write-Host "`n💳 Step 2: Adding payment cards..." -ForegroundColor Green
        $addedCards = @()
        
        foreach ($card in $TEST_CARDS) {
            Write-Host "   Adding $($card.bankName) card..." -ForegroundColor Cyan
            try {
                $cardBody = $card | ConvertTo-Json
                $addResponse = Invoke-RestMethod -Uri "$API_BASE/api/payment-cards/add" -Method Post -Headers $headers -Body $cardBody
                
                Write-Host "   ✅ $($card.bankName) card added successfully" -ForegroundColor Green
                Write-Host "      Card ID: $($addResponse.card.id)" -ForegroundColor Gray
                Write-Host "      Masked Number: $($addResponse.card.cardNumber)" -ForegroundColor Gray
                
                $addedCards += $addResponse.card
                Start-Sleep -Milliseconds 500
            }
            catch {
                Write-Host "   ❌ Failed to add $($card.bankName) card: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        # Step 3: Get all payment cards
        Write-Host "`n📋 Step 3: Getting all payment cards..." -ForegroundColor Green
        try {
            $cardsResponse = Invoke-RestMethod -Uri "$API_BASE/api/payment-cards/my-cards" -Method Get -Headers $headers
            
            Write-Host "✅ Cards retrieved successfully" -ForegroundColor Green
            Write-Host "   Total cards: $($cardsResponse.totalCards)" -ForegroundColor Gray
            
            for ($i = 0; $i -lt $cardsResponse.cards.Count; $i++) {
                $card = $cardsResponse.cards[$i]
                $defaultText = if ($card.isDefault) { " (Default)" } else { "" }
                Write-Host "   $($i + 1). $($card.bankName) - $($card.cardNumber)$defaultText" -ForegroundColor White
                Write-Host "      Nickname: $($card.nickname)" -ForegroundColor Gray
                Write-Host "      Expires: $($card.expiryDate)" -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "❌ Failed to get cards: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Step 4: Set default card (if we have multiple cards)
        if ($addedCards.Count -gt 1) {
            Write-Host "`n🎯 Step 4: Setting default card..." -ForegroundColor Green
            try {
                $cardToSetDefault = $addedCards[1]
                $defaultResponse = Invoke-RestMethod -Uri "$API_BASE/api/payment-cards/set-default/$($cardToSetDefault.id)" -Method Put -Headers $headers
                
                Write-Host "✅ Default card updated successfully" -ForegroundColor Green
                Write-Host "   New default: $($defaultResponse.bankName) - $($defaultResponse.cardNumber)" -ForegroundColor Gray
            }
            catch {
                Write-Host "❌ Failed to set default card: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        # Step 5: Create payment intent
        if ($addedCards.Count -gt 0) {
            Write-Host "`n💰 Step 5: Creating payment intent..." -ForegroundColor Green
            try {
                $paymentBody = @{
                    amount = 100.50
                    cardId = $addedCards[0].id
                    description = "Test payment with card"
                } | ConvertTo-Json
                
                $paymentResponse = Invoke-RestMethod -Uri "$API_BASE/api/payment-cards/create-payment-intent" -Method Post -Headers $headers -Body $paymentBody
                
                Write-Host "✅ Payment intent created successfully" -ForegroundColor Green
                Write-Host "   Amount: `$$($paymentResponse.amount)" -ForegroundColor Gray
                Write-Host "   Payment Intent ID: $($paymentResponse.paymentIntentId)" -ForegroundColor Gray
                Write-Host "   Client Secret: $($paymentResponse.clientSecret.Substring(0, 40))..." -ForegroundColor Gray
            }
            catch {
                Write-Host "❌ Failed to create payment intent: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        # Step 6: Remove a card
        if ($addedCards.Count -gt 0) {
            Write-Host "`n🗑️ Step 6: Removing a payment card..." -ForegroundColor Green
            try {
                $cardToRemove = $addedCards[-1]  # Last card
                $removeResponse = Invoke-RestMethod -Uri "$API_BASE/api/payment-cards/remove/$($cardToRemove.id)" -Method Delete -Headers $headers
                
                Write-Host "✅ Card removed successfully" -ForegroundColor Green
                Write-Host "   Removed: $($cardToRemove.bankName) - $($cardToRemove.cardNumber)" -ForegroundColor Gray
            }
            catch {
                Write-Host "❌ Failed to remove card: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        # Final verification
        Write-Host "`n🔍 Final verification - Getting updated card list..." -ForegroundColor Green
        try {
            $finalCardsResponse = Invoke-RestMethod -Uri "$API_BASE/api/payment-cards/my-cards" -Method Get -Headers $headers
            Write-Host "✅ Final card count: $($finalCardsResponse.totalCards)" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed final verification: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Write-Host "`n🎉 TEST SUMMARY" -ForegroundColor Cyan
        Write-Host "===============" -ForegroundColor Cyan
        Write-Host "✅ Login: Success" -ForegroundColor Green
        Write-Host "✅ Cards added: $($addedCards.Count)/$($TEST_CARDS.Count)" -ForegroundColor Green
        Write-Host "✅ All endpoints tested" -ForegroundColor Green
        
    } else {
        Write-Host "❌ Login failed - no token received" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error during testing: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure:" -ForegroundColor Yellow
    Write-Host "   - Server is running on localhost:5000" -ForegroundColor Yellow
    Write-Host "   - Test user credentials are correct" -ForegroundColor Yellow
    Write-Host "   - Database is properly connected" -ForegroundColor Yellow
}

Write-Host "`n📝 Manual Testing Commands:" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host "# Single card test:" -ForegroundColor Gray
Write-Host "`$cardData = '{`"bankName`":`"Test Bank`",`"cardNumber`":`"4111111111111111`",`"expiryDate`":`"12/25`",`"ccv`":`"123`",`"nickname`":`"My Test Card`",`"isDefault`":true}'" -ForegroundColor White
Write-Host "Invoke-RestMethod -Uri `"$API_BASE/api/payment-cards/add`" -Method Post -Headers `$headers -Body `$cardData" -ForegroundColor White

Write-Host "`n🎊 Payment Cards API Testing Complete! 🎊" -ForegroundColor Cyan
