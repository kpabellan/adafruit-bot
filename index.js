"use strict";
const Discord = require('discord.js');
const fetch = require('node-fetch');
const fs = require('fs');
const HttpsProxyAgent = require('https-proxy-agent');
const puppeteer = require('puppeteer');
const config = require('./config');
const { Console } = require('console');

const stateCodes = {"alabama": "1", "alaska": "2", "american samoa": "3", "arizona": "4", "arkansas": "5", "armed forces americas": "7", "armed forces europe": "9", "armed forces pacific": "11", "california": "12", "colorado": "13", "connecticut": "14", "delaware": "15", "district of columbia": "16", "federated states of micronesia": "17", "florida": "18", "georgia": "19", "guam": "20", "hawaii": "21", "idaho": "22", "illinois": "23", "indiana": "24", "iowa": "25", "kansas": "26", "kentucky": "27", "louisiana": "28", "maine": "29", "marshall islands": "30", "maryland": "31", "massachusetts": "32", "michigan": "33", "minnesota": "34", "mississippi": "35", "missouri": "36", "montana": "37", "nebraska": "38", "nevada": "39", "new hampshire": "40", "new jersey": "41", "new mexico": "42", "new york": "43", "north carolina": "44", "north dakota": "45", "northern mariana islands": "46", "ohio": "47", "oklahoma": "48", "oregon": "49", "palau": "50", "pennsylvania": "51", "puerto rico": "253", "rhode island": "53", "south carolina": "54", "south dakota": "55", "tennessee": "56", "texas": "57", "utah": "58", "vermont": "59", "virgin islands": "60", "virginia": "61", "washington": "62", "west virginia": "63", "wisconsin": "64", "wyoming": "65"};
const proxyData = fs.readFileSync('proxylist.txt', 'UTF-8');
const proxies = proxyData.split(/\r?\n/);
const deliveryName = config.userInfo.delivery.deliveryName;
const deliveryPhone = config.userInfo.delivery.deliveryPhone;
const deliveryAddress = config.userInfo.delivery.deliveryAddress;
const deliveryCity = config.userInfo.delivery.deliveryCity;
const deliveryPostalCode = config.userInfo.delivery.deliveryPostalCode;
let billingName = deliveryName;
let billingPhone = deliveryPhone;
let billingAddress = deliveryAddress;
let billingCity = deliveryCity;
let billingPostalCode = deliveryPostalCode;
let cookie = '';

if (config.userInfo.differentBillingAsDelivery == 1) {
  billingName = config.userInfo.billing.billingName;
  billingPhone = config.userInfo.billing.billingPhone;
  billingAddress = config.userInfo.billing.billingAddress;
  billingCity = config.userInfo.billing.billingCity;
  billingPostalCode = config.userInfo.billing.billingPostalCode;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getStateCode(state) {
  for (let states in stateCodes) {
    if (state == states) {
      return stateCodes[state];
    }
  }
}

async function getCookie(email, password) {
  let langauge = '';
  let amazonPayConnectedAuth = '';
  let loggedIn = '';
  let apaySessionSet = '';
  let cartCount = '';
  let accountsRememberUserToken = '';
  let accountsSessionId = '';
  let adafruitAccountsSession = '';
  let zenid = '';
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--app=https://accounts.adafruit.com/users/sign_in']
  });
  const [page] = await browser.pages();
  await page.setViewport({
    width: 1366,
    height: 768
  });
  await page.waitForSelector('#user_login', {
    timeout: 0
  });
  await page.focus('#user_login');
  await page.keyboard.type(email);
  await page.waitForSelector('#user_password', {
    timeout: 0
  });
  await page.focus('#user_password');
  await page.keyboard.type(password);
  await page.waitForSelector('#new_user > p:nth-child(6) > input', {
    timeout: 0
  });
  await page.click('#new_user > p:nth-child(6) > input');
  await page.waitForSelector('#user_otp_attempt', {
    timeout: 0
  });
  await page.click('#user_otp_attempt');
  await page.waitForSelector('#account > div.account-dropdown.dropdown', {
    timeout: 0
  });
  await page.goto('https://www.adafruit.com/shopping_cart', {
    waitUntil: 'load'
  });
  let cookies = await page.cookies();

  for (let i = 0; i < cookies.length; i++) {
    if (cookies[i].name == 'language') {
      langauge = cookies[i].name + '=' + cookies[i].value + '; ';
    } else if (cookies[i].name == 'amazon-pay-connectedAuth') {
      amazonPayConnectedAuth = cookies[i].name + '=' + cookies[i].value + '; ';
    } else if (cookies[i].name == 'apay-session-set') {
      apaySessionSet = cookies[i].name + '=' + cookies[i].value + '; ';
    } else if (cookies[i].name == 'logged_in') {
      loggedIn = cookies[i].name + '=' + cookies[i].value + '; ';
    } else if (cookies[i].name == 'accounts_remember_user_token') {
      accountsRememberUserToken = cookies[i].name + '=' + cookies[i].value + '; ';
    } else if (cookies[i].name == '_accounts_session_id') {
      accountsSessionId = cookies[i].name + '=' + cookies[i].value + '; ';
    } else if (cookies[i].name == '_adafruit_accounts_session') {
      adafruitAccountsSession = cookies[i].name + '=' + cookies[i].value + '; ';
    } else if (cookies[i].name == 'zenid') {
      zenid = cookies[i].name + '=' + cookies[i].value + '; ';
    } else if (cookies[i].name == 'cart_count') {
      cartCount = cookies[i].name + '=' + cookies[i].value + '; ';
    }
  }

  browser.close();
  cookie = langauge + amazonPayConnectedAuth + apaySessionSet + loggedIn + accountsRememberUserToken + accountsSessionId + adafruitAccountsSession + accountsRememberUserToken + zenid + cartCount;
  console.log('Logged in: ' + config.accountInfo.email);
}

async function initiliaze(productId) {
  let response = await fetch('https://www.adafruit.com/shopping_cart', {
    method: 'POST',
    body: null,
    headers: {
      'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'DNT': '1',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'host': 'www.adafruit.com',
      'Cookie': cookie
    }
  });
  let statusCodeNum = await String(response.status)[0];

  if (statusCodeNum == 2 || statusCodeNum == 3) {
    let responseBody = await response.text();
    let securityToken = responseBody.split('name="securityToken" value="').pop().split('"')[0];
    addToCart(productId, securityToken);
  }
}

async function addToCart(productId, securityToken) {
  let form = {
    'action': 'add_product',
    'pid': productId,
    'qty': '1',
    'securityToken': securityToken,
    'source_id': productId,
    'source_page': 'product'
  };
  let response = await fetch('https://www.adafruit.com/added', {
    method: 'POST',
    body: new URLSearchParams(form),
    headers: {
      'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'Upgrade-Insecure-Requests': '1',
      'DNT': '1',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'host': 'www.adafruit.com',
      'Cookie': cookie
    }
  });
  let statusCodeNum = await String(response.status)[0];

  if (statusCodeNum == 2 || statusCodeNum == 3) {
    console.log('Item added to cart');
    getCSRF(productId);
  }
}

async function getCSRF(productId) {
  let checkoutCookie = cookie.replace('cart_count=0', 'cart_count=1');
  let response = await fetch('https://www.adafruit.com/checkout?step=2', {
    method: 'GET',
    body: null,
    headers: {
      'Upgrade-Insecure-Requests': '1',
      'DNT': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'host': 'www.adafruit.com',
      'Cookie': checkoutCookie
    }
  });
  let statusCodeNum = await String(response.status)[0];

  if (statusCodeNum == 2 || statusCodeNum == 3) {
    let responseBody = await response.text();
    let csrfToken = responseBody.split('name="csrf_token" value="').pop().split('"')[0];
    submitInfo(productId, checkoutCookie, csrfToken);
  }
}

async function submitInfo(productId, checkoutCookie, csrfToken) {
  let form = {
    'action': 'save_two',
    'billing_address1': billingAddress,
    'billing_address2': '',
    'billing_address_id': 'new',
    'billing_city': billingCity,
    'billing_company': '',
    'billing_country': '223',
    'billing_name': billingName,
    'billing_phone': billingPhone,
    'billing_postcode': billingPostalCode,
    'billing_state': getStateCode(config.userInfo.billing.billingState.toLowerCase()),
    'billing_use_anyway': '1',
    'csrf_token': csrfToken,
    'delivery_address1': deliveryAddress,
    'delivery_address2': '',
    'delivery_address_id': 'new',
    'delivery_city': deliveryCity,
    'delivery_company': '',
    'delivery_country': '223',
    'delivery_name': deliveryName,
    'delivery_phone': deliveryPhone,
    'delivery_postcode': deliveryPostalCode,
    'delivery_state': getStateCode(config.userInfo.delivery.deliveryState.toLowerCase()),
    'delivery_use_anyway': '1',
    'udab': config.userInfo.differentBillingAsDelivery
  };
  let response = await fetch('https://www.adafruit.com/checkout', {
    method: 'POST',
    body: new URLSearchParams(form),
    headers: {
      'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'Upgrade-Insecure-Requests': '1',
      'DNT': '1',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'host': 'www.adafruit.com',
      'Cookie': checkoutCookie
    }
  });
  let statusCodeNum = await String(response.status)[0];

  if (statusCodeNum == 2 || statusCodeNum == 3) {
    stepThree(productId, checkoutCookie, csrfToken);
  }
}

async function stepThree(productId, checkoutCookie, csrfToken) {
  let response = await fetch('https://www.adafruit.com/checkout?step=3', {
    method: 'GET',
    body: null,
    headers: {
      'Upgrade-Insecure-Requests': '1',
      'DNT': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'host': 'www.adafruit.com',
      'Cookie': checkoutCookie
    }
  });
  let statusCodeNum = await String(response.status)[0];

  if (statusCodeNum == 2 || statusCodeNum == 3) {
    submitShipping(productId, checkoutCookie, csrfToken);
  }
}

async function submitShipping(productId, checkoutCookie, csrfToken) {
  let form = {
    'action': 'save_three',
    'csrf_token': csrfToken,
    'shipping': 'usps_First-Class Package Service - Retail&lt;sup&gt;&#8482;&lt;/sup&gt;'
  };
  let response = await fetch('https://www.adafruit.com/checkout', {
    method: 'POST',
    body: new URLSearchParams(form),
    headers: {
      'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'Upgrade-Insecure-Requests': '1',
      'DNT': '1',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'host': 'www.adafruit.com',
      'Cookie': checkoutCookie
    }
  });
  let statusCodeNum = await String(response.status)[0];

  if (statusCodeNum == 2 || statusCodeNum == 3) {
    stepFour(productId, checkoutCookie, csrfToken);
  }
}

async function stepFour(productId, checkoutCookie, csrfToken) {
  let response = await fetch('https://www.adafruit.com/checkout?step=4', {
    method: 'GET',
    body: null,
    headers: {
      'Upgrade-Insecure-Requests': '1',
      'DNT': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'host': 'www.adafruit.com',
      'Cookie': checkoutCookie
    }
  });
  let statusCodeNum = await String(response.status)[0];

  if (statusCodeNum == 2 || statusCodeNum == 3) {
    submitPayment(productId, checkoutCookie, csrfToken);
  }
}

async function submitPayment(productId, checkoutCookie, csrfToken) {
  let form = {
    'action': 'save_four',
    'authorizenet_aim_cc_cvv': config.userInfo.cardInfo.cardCVV,
    'authorizenet_aim_cc_expires_month': config.userInfo.cardInfo.cardExpMonth,
    'authorizenet_aim_cc_expires_year': config.userInfo.cardInfo.cardExpYear,
    'authorizenet_aim_cc_nickname': '',
    'authorizenet_aim_cc_number': config.userInfo.cardInfo.cardNumber,
    'authorizenet_aim_cc_owner': config.userInfo.cardInfo.cardName,
    'card-type': config.userInfo.cardInfo.cardType,
    'csrf_token': csrfToken,
    'payment': 'authorizenet_aim',
    'po_payment_type': 'replacement'
  };
  let response = await fetch('https://www.adafruit.com/checkout', {
    method: 'POST',
    body: new URLSearchParams(form),
    headers: {
      'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'Upgrade-Insecure-Requests': '1',
      'DNT': '1',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'host': 'www.adafruit.com',
      'Cookie': checkoutCookie
    }
  });
  let statusCodeNum = await String(response.status)[0];

  if (statusCodeNum == 2 || statusCodeNum == 3) {
    console.log('Submitted payment');
    console.log('Checking out');
    checkoutProcess(productId, checkoutCookie, csrfToken);
  }
}

async function checkoutProcess(productId, checkoutCookie, csrfToken) {
  let zenId = checkoutCookie.split('zenid=').pop().split(';')[0];
  let form = {
    'cc_cvv': config.userInfo.cardInfo.cardCVV,
    'cc_expires': config.userInfo.cardInfo.cardExpMonth + config.userInfo.cardInfo.cardExpYear,
    'cc_nickname': '',
    'cc_number': config.userInfo.cardInfo.cardNumber.replace(/\s/g, ''),
    'cc_owner': config.userInfo.cardInfo.cardName,
    'cc_type': config.userInfo.cardInfo.cardType,
    'csrf_token': csrfToken,
    'zenid': zenId
  };
  let response = await fetch('https://www.adafruit.com/index.php?main_page=checkout_process', {
    method: 'POST',
    body: new URLSearchParams(form),
    headers: {
      'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'Upgrade-Insecure-Requests': '1',
      'DNT': '1',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'host': 'www.adafruit.com',
      'Cookie': checkoutCookie
    }
  });
  let statusCodeNum = await String(response.status)[0];

  if (statusCodeNum == 2 || statusCodeNum == 3) {
    checkoutSuccess(productId, checkoutCookie)
  }
}

async function checkoutSuccess(productId, checkoutCookie) {
  let response = await fetch('https://www.adafruit.com/index.php?main_page=checkout_success', {
    method: 'GET',
    body: null,
    headers: {
      'Upgrade-Insecure-Requests': '1',
      'DNT': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'host': 'www.adafruit.com',
      'Cookie': checkoutCookie
    }
  });
  let statusCodeNum = await String(response.status)[0];

  if (statusCodeNum == 2 || statusCodeNum == 3) {
    let responseBody = await response.text();

    if (responseBody.includes('Thank you very much for your order!')) {
      if (config.discordWebhook.length > 0) {
        sendWebhook(productId);
      }

      console.log('Successful checkout');
    }
  }
}


async function sendWebhook(itemId) {
  let item = '';

  if (itemId == 4565) {
    item = 'Raspberry Pi 4 Model B - 8 GB RAM';
  } else if (itemId == 4296) {
    item = 'Raspberry Pi 4 Model B - 4 GB RAM';
  } else if (itemId == 4292) {
    item = 'Raspberry Pi 4 Model B - 2 GB RAM';
  } else if (itemId == 4295) {
    item = 'Raspberry Pi 4 Model B - 1 GB RAM';
  }

  const myEmbed = new Discord.MessageEmbed().setColor('#3F4CE6').setTitle('** :tada:  Successful Adafruit Checkout! :tada: **').setThumbnail('https://cdn-shop.adafruit.com/970x728/4564-00.jpg').addFields({
    name: 'Product: ',
    value: item,
    inline: false
  }, {
    name: 'Account email: ',
    value: '||' + config.accountInfo.email + '||',
    inline: false
  }).setFooter({
    text: 'Developed by kpabellan'
  }).setTimestamp();
  let params = {
    embeds: [myEmbed]
  };
  fetch(config.discordWebhook, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(params)
  });
}

async function monitor() {
  try {
    console.log('Monitoring...');
    let taskOn = 0;

    while (taskOn == 0) {
      let response = await fetch('https://www.adafruit.com/product/4564', {
        agent: new HttpsProxyAgent(proxies[randInt(0, proxies.length - 1)]),
        method: 'GET',
        body: null,
        headers: {
          'Upgrade-Insecure-Requests': '1',
          'DNT': '1',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-User': '?1',
          'Sec-Fetch-Dest': 'document',
          'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'host': 'www.adafruit.com'
        }
      });

      if (response.status == 200) {
        let responseBody = await await response.text();
        let rpi8 = await responseBody.split('8GB </span>').pop().split('</span>')[0];
        let rpi4 = await responseBody.split('4GB </span>').pop().split('</span>')[0];
        let rpi2 = await responseBody.split('2GB </span>').pop().split('</span>')[0];
        let rpi1 = await responseBody.split('1GB </span>').pop().split('</span>')[0];

        if (!rpi8.includes('Out of stock')) {
          console.log('Stock detected for Raspberry Pi 4 Model B - 8 GB RAM');
          taskOn = 1;
          initiliaze(4564);
        } else if (!rpi4.includes('Out of stock')) {
          console.log('Stock detected for Raspberry Pi 4 Model B - 4 GB RAM');
          taskOn = 1;
          initiliaze(4296);
        } else if (!rpi2.includes('Out of stock')) {
          console.log('Stock detected for Raspberry Pi 4 Model B - 2 GB RAM');
          taskOn = 1;
          initiliaze(4292);
        } else if (!rpi1.includes('Out of stock')) {
          console.log('Stock detected for Raspberry Pi 4 Model B - 1 GB RAM');
          taskOn = 1;
          initiliaze(4295);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  } catch(e) {
    console.log(e)
    monitor();
  }
}

async function start() {
  await getCookie(config.accountInfo.email, config.accountInfo.password);
  await monitor();
}

start();