const config = {
    "accountInfo": {
        "email": "", // Account email
        "password": "" // Account password
    },
    "userInfo": {
        "differentBillingAsDelivery": "0", // Set to 1 if your delivery is different from your billing information, otherwise set to 0
        "delivery": {
            "deliveryName": "", // Delivery name
            "deliveryPhone": "", // Delivery phone number (example: 1234567890)
            "deliveryAddress": "", // Delivery address
            "deliveryCity": "", // Delivery city
            "deliveryState": "", // Delivery state (example: "california")
            "deliveryPostalCode": "" // Delivery postal code
        },
        "billing": { // You can ignore this section if "differentBillingAsDelivery" is set to 0
            "billingName": "", // Billing name
            "billingPhone": "", // Billing phone number (example: 1234567890)
            "billingAddress": "", // Billing address
            "billingCity": "", // Billing city
            "billingState": "", // Billing state (example: "california")
            "billingPostalCode": "" // Billing postal code
        },
        "cardInfo": {
            "cardName": "", // Card name
            "cardNumber": "", // Card number (example: "1234123412341234")
            "cardCVV": "", // Card CVV
            "cardExpMonth": "", // Card expiration month (example: "07")
            "cardExpYear": "", // Card expirtation year (example: "25")
            "cardType": "" // Card type (amex, discover, mastercard, visa)
        }
    },
    "discordWebhook": "", // Discord webhook (optional)
}

module.exports = config;