const config = {
  "profiles": [
    {
      "accountInfo": {
        "email": "", // Account email
        "password": "", // Account password
        "twoFactorSecret": "" // 2FA secret key
      },
      "userInfo": {
        "differentBillingAsDelivery": "0", // Set to 1 if your delivery is different from your billing information, otherwise set to 0
        "delivery": {
          "deliveryName": "", // Delivery name
          "deliveryPhone": "", // Delivery phone number
          "deliveryAddress": "", // Delivery address
          "deliveryCity": "", // Delivery city
          "deliveryState": "", // Delivery state (example: "California")
          "deliveryPostalCode": "" // Delivery postal code
        },
        "billing": { // Not required if "differentBillingAsDelivery" is set to 0
          "billingName": "", // Billing name
          "billingPhone": "", // Billing phone
          "billingAddress": "", // Billing address
          "billingCity": "", // Billing city
          "billingState": "", // Billing state (example: "California")
          "billingPostalCode": "" // Billing postal code
        },
        "cardInfo": {
          "cardName": "", // Card name
          "cardNumber": "", // Card number (example: "XXXX XXXX XXXX XXXX")
          "cardCVV": "", // Card CVV
          "cardExpMonth": "", // Card expiration month (example: "07")
          "cardExpYear": "", // Card expirtation year (example: "25")
          "cardType": "" // Card type (Amex, Discover, Mastercard, Visa)
        }
      }
    }
  ],
  "discordWebhook": "" // Discord webhook (optional)
};

module.exports = config;