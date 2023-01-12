'use strict';
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const fs = require('fs');
const HttpsProxyAgent = require('https-proxy-agent');
const puppeteer = require('puppeteer');
const totp = require('totp-generator');
const config = require('./config');

const stateCodes = { 'alabama': '1', 'alaska': '2', 'american samoa': '3', 'arizona': '4', 'arkansas': '5', 'armed forces americas': '7', 'armed forces europe': '9', 'armed forces pacific': '11', 'california': '12', 'colorado': '13', 'connecticut': '14', 'delaware': '15', 'district of columbia': '16', 'federated states of micronesia': '17', 'florida': '18', 'georgia': '19', 'guam': '20', 'hawaii': '21', 'idaho': '22', 'illinois': '23', 'indiana': '24', 'iowa': '25', 'kansas': '26', 'kentucky': '27', 'louisiana': '28', 'maine': '29', 'marshall islands': '30', 'maryland': '31', 'massachusetts': '32', 'michigan': '33', 'minnesota': '34', 'mississippi': '35', 'missouri': '36', 'montana': '37', 'nebraska': '38', 'nevada': '39', 'new hampshire': '40', 'new jersey': '41', 'new mexico': '42', 'new york': '43', 'north carolina': '44', 'north dakota': '45', 'northern mariana islands': '46', 'ohio': '47', 'oklahoma': '48', 'oregon': '49', 'palau': '50', 'pennsylvania': '51', 'puerto rico': '253', 'rhode island': '53', 'south carolina': '54', 'south dakota': '55', 'tennessee': '56', 'texas': '57', 'utah': '58', 'vermont': '59', 'virgin islands': '60', 'virginia': '61', 'washington': '62', 'west virginia': '63', 'wisconsin': '64', 'wyoming': '65' };
const proxyData = fs.readFileSync('proxylist.txt', 'UTF-8');
const proxies = proxyData.split(/\r?\n/);
const deliveryName = config.userInfo.delivery.deliveryName;
const deliveryPhone = config.userInfo.delivery.deliveryPhone;
const deliveryAddress = config.userInfo.delivery.deliveryAddress;
const deliveryCity = config.userInfo.delivery.deliveryCity;
const deliveryPostalCode = config.userInfo.delivery.deliveryPostalCode;
const twoFactorSecret = config.accountInfo.twoFactorSecret;

let billingName = deliveryName;
let billingPhone = deliveryPhone;
let billingAddress = deliveryAddress;
let billingCity = deliveryCity;
let billingPostalCode = deliveryPostalCode;
let cookie = '';
let productId = '';

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

function formatProxy(proxy) {
  const proxySplit = proxy.split(':');
  const proxyLength = proxySplit.length;

  if (proxyLength == 4) {
    return 'http://' + proxySplit[2] + ':' + proxySplit[3] + '@' + proxySplit[0] + ':' + proxySplit[1];
  } else if (proxyLength == 2) {
    return 'http://' + proxySplit[0] + ':' + proxySplit[1];
  }
}

function getHeaders(cookie) {
  return {
    'sec-ch-ua': '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'DNT': '1',
    'Upgrade-Insecure-Requests': '1',
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'host': 'www.adafruit.com',
    'Cookie': cookie
  };
}

async function initialize(email, password, taskProxy) {
  taskProxy = taskProxy.replace('http://', '');
  let proxy = ''
  let proxyCredentials = ''
  let proxyUser = ''
  let proxyPass = ''

  if (taskProxy.includes('@')) {
    proxy = taskProxy.split('@')[1];
    proxyCredentials = taskProxy.split('@')[0];
    proxyUser = proxyCredentials.split(':')[0];
    proxyPass = proxyCredentials.split(':')[1];
  } else {
    proxy = taskProxy;
  }
  
  let langauge = '';
  let amazonPayConnectedAuth = '';
  let loggedIn = '';
  let apaySessionSet = '';
  let cartCount = '';
  let cartCountNumber = '';
  let accountsRememberUserToken = '';
  let accountsSessionId = '';
  let adafruitAccountsSession = '';
  let zenid = '';

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--proxy-server=' + proxy]
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1366,
    height: 768
  });
  if (taskProxy.includes('@')) {
    await page.authenticate({ username: proxyUser, password: proxyPass });
  }
  await page.goto('https://accounts.adafruit.com/users/sign_in');
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
  await page.focus('#user_otp_attempt');
  await page.keyboard.type(totp(twoFactorSecret));
  await page.click('#edit_user > p:nth-child(5) > input');
  await page.waitForSelector('#account > div.account-dropdown.dropdown', {
    timeout: 0
  });
  await page.goto('https://www.adafruit.com/shopping_cart', {
    waitUntil: 'load'
  });
  const cookies = await page.cookies();
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
      cartCountNumber = cookies[i].value;
    }
  }
  const pageContent = await page.content();
  const securityToken = await pageContent.split('name="securityToken" value="').pop().split('"')[0];
  let cartProductIds = [];
  if (cartCountNumber > 0) {
    cartProductIds = pageContent.match(/(?<=<span class="product_id">PID: )(.*)(?=<\/span>)/g);
  }
  browser.close();
  cookie = langauge + amazonPayConnectedAuth + apaySessionSet + loggedIn + accountsRememberUserToken + accountsSessionId + adafruitAccountsSession + zenid + cartCount;
  proxy = 'http://' + taskProxy;
  clearCart(securityToken, cartCountNumber, cartProductIds, proxy);
}

async function clearCart(securityToken, cartCount, cartProductIds, proxy) {
  if (cartCount > 0) {
    try {
      for (let i = 0; i < cartProductIds.length; i++) {
        const form = {
          'action': 'delete_product',
          'pid': cartProductIds[i],
          'return_full_cart': '1',
          'securityToken': securityToken
        };
        await fetch('https://www.adafruit.com/api/wildCart.php', {
          method: 'POST',
          agent: new HttpsProxyAgent(proxy),
          body: new URLSearchParams(form),
          headers: getHeaders('cart_count=' + cartCount + '; zenid=' + cookie.split('zenid=').pop().split(';')[0])
        });
      }

      cookie = cookie.replace('cart_count=' + cartCount, 'cart_count=0');
    } catch (error) {
      console.log(error);
    }
  }
  addToCart(securityToken, proxy);
}

async function addToCart(securityToken, proxy) {
  const form = {
    'action': 'add_product',
    'pid': productId,
    'qty': '1',
    'securityToken': securityToken,
    'source_id': productId,
    'source_page': 'product'
  };
  const response = await fetch('https://www.adafruit.com/added', {
    method: 'POST',
    agent: new HttpsProxyAgent(proxy),
    body: new URLSearchParams(form),
    headers: getHeaders(cookie)
  });

  const statusCodeNum = await String(response.status)[0];

  if (statusCodeNum == 2 || statusCodeNum == 3) {
    console.log('Item added to cart');
    getCSRF(proxy);
  }
}

async function getCSRF(proxy) {
  cookie = cookie.replace('cart_count=0', 'cart_count=1');
  const response = await fetch('https://www.adafruit.com/checkout?step=2', {
    method: 'GET',
    agent: new HttpsProxyAgent(proxy),
    body: null,
    headers: getHeaders(cookie)
  });

  const statusCodeNum = await String(response.status)[0];

  if (statusCodeNum == 2 || statusCodeNum == 3) {
    const responseBody = await response.text();
    const csrfToken = responseBody.split('name="csrf_token" value="').pop().split('"')[0];
    submitInfo(csrfToken, proxy);
  }
}

async function submitInfo(csrfToken, proxy) {
  const form = {
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
  const response = await fetch('https://www.adafruit.com/checkout', {
    method: 'POST',
    agent: new HttpsProxyAgent(proxy),
    body: new URLSearchParams(form),
    headers: getHeaders(cookie)
  });

  const statusCodeNum = await String(response.status)[0];

  if (statusCodeNum == 2 || statusCodeNum == 3) {
    stepThree(csrfToken, proxy);
  }
}

async function stepThree(csrfToken, proxy) {
  const response = await fetch('https://www.adafruit.com/checkout?step=3', {
    method: 'GET',
    agent: new HttpsProxyAgent(proxy),
    body: null,
    headers: getHeaders(cookie)
  });

  const statusCodeNum = await String(response.status)[0];

  if (statusCodeNum == 2 || statusCodeNum == 3) {
    submitShipping(csrfToken, proxy);
  }
}

async function submitShipping(csrfToken, proxy) {
  const form = {
    'action': 'save_three',
    'csrf_token': csrfToken,
    'shipping': 'usps_First-Class Package Service - Retail&lt;sup&gt;&#8482;&lt;/sup&gt;'
  };
  const response = await fetch('https://www.adafruit.com/checkout', {
    method: 'POST',
    agent: new HttpsProxyAgent(proxy),
    body: new URLSearchParams(form),
    headers: getHeaders(cookie)
  });

  const statusCodeNum = await String(response.status)[0];

  if (statusCodeNum == 2 || statusCodeNum == 3) {
    stepFour(csrfToken, proxy);
  }
}

async function stepFour(csrfToken, proxy) {
  const response = await fetch('https://www.adafruit.com/checkout?step=4', {
    method: 'GET',
    agent: new HttpsProxyAgent(proxy),
    body: null,
    headers: getHeaders(cookie)
  });

  const statusCodeNum = await String(response.status)[0];

  if (statusCodeNum == 2 || statusCodeNum == 3) {
    submitPayment(csrfToken, proxy);
  }
}

async function submitPayment(csrfToken, proxy) {
  const form = {
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
  const response = await fetch('https://www.adafruit.com/checkout', {
    method: 'POST',
    agent: new HttpsProxyAgent(proxy),
    body: new URLSearchParams(form),
    headers: getHeaders(cookie)
  });

  const statusCodeNum = await String(response.status)[0];

  if (statusCodeNum == 2 || statusCodeNum == 3) {
    console.log('Submitted payment');
    console.log('Checking out');
    checkoutProcess(csrfToken, proxy);
  }
}

async function checkoutProcess(csrfToken, proxy) {
  const zenId = cookie.split('zenid=').pop().split(';')[0];
  const form = {
    'cc_cvv': config.userInfo.cardInfo.cardCVV,
    'cc_expires': config.userInfo.cardInfo.cardExpMonth + config.userInfo.cardInfo.cardExpYear,
    'cc_nickname': '',
    'cc_number': config.userInfo.cardInfo.cardNumber.replace(/\s/g, ''),
    'cc_owner': config.userInfo.cardInfo.cardName,
    'cc_type': config.userInfo.cardInfo.cardType,
    'csrf_token': csrfToken,
    'zenid': zenId
  };
  const response = await fetch('https://www.adafruit.com/index.php?main_page=checkout_process', {
    method: 'POST',
    agent: new HttpsProxyAgent(proxy),
    body: new URLSearchParams(form),
    headers: getHeaders(cookie)
  });

  const statusCodeNum = await String(response.status)[0];

  if (statusCodeNum == 2 || statusCodeNum == 3) {
    checkoutSuccess(proxy);
  }
}

async function checkoutSuccess(proxy) {
  const response = await fetch('https://www.adafruit.com/index.php?main_page=checkout_success', {
    method: 'GET',
    agent: new HttpsProxyAgent(proxy),
    body: null,
    headers: getHeaders(cookie)
  });

  const statusCodeNum = await String(response.status)[0];

  if (statusCodeNum == 2 || statusCodeNum == 3) {
    const responseBody = await response.text();
    if (responseBody.includes('Thank you very much for your order!')) {
      if (config.discordWebhook.length > 0) {
        sendWebhook();
      }
      console.log('Successful checkout');
    }
  }
}

async function sendWebhook() {
  let item = '';

  if (productId == 4564) {
    item = 'Raspberry Pi 4 Model B - 8 GB RAM';
  } else if (productId == 4296) {
    item = 'Raspberry Pi 4 Model B - 4 GB RAM';
  } else if (productId == 4292) {
    item = 'Raspberry Pi 4 Model B - 2 GB RAM';
  } else if (productId == 4295) {
    item = 'Raspberry Pi 4 Model B - 1 GB RAM';
  }

  const myEmbed = new EmbedBuilder().setColor('#3F4CE6').setTitle('** :tada: Successful Adafruit Checkout! :tada: **').setThumbnail('https://cdn-shop.adafruit.com/970x728/4564-00.jpg').addFields({
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
  console.log('Monitoring...');
  try {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    let taskOn = 0;

    while (taskOn == 0) {
      const proxy = formatProxy(proxies[randInt(0, proxies.length - 1)])
      const taskProxy = new HttpsProxyAgent(proxy)

      const response = await fetch('https://www.adafruit.com/product/4564', {
        agent: taskProxy,
        method: 'GET',
        body: null,
        headers: getHeaders(null)
      });

      if (response.status == 200) {
        const responseBody = await await response.text();
        const rpi8 = await responseBody.split('8GB </span>').pop().split('</span>')[0];
        const rpi4 = await responseBody.split('4GB </span>').pop().split('</span>')[0];
        const rpi2 = await responseBody.split('2GB </span>').pop().split('</span>')[0];
        const rpi1 = await responseBody.split('1GB </span>').pop().split('</span>')[0];

        if (!rpi8.includes('Out of stock')) {
          console.log('Stock detected for Raspberry Pi 4 Model B - 8 GB RAM');
          taskOn = 1;
          productId = 4564;
          await initialize(config.accountInfo.email, config.accountInfo.password, proxy);
        } else if (!rpi4.includes('Out of stock')) {
          console.log('Stock detected for Raspberry Pi 4 Model B - 4 GB RAM');
          taskOn = 1;
          productId = 4296;
          await initialize(config.accountInfo.email, config.accountInfo.password, proxy);
        } else if (!rpi2.includes('Out of stock')) {
          console.log('Stock detected for Raspberry Pi 4 Model B - 2 GB RAM');
          taskOn = 1;
          productId = 4292;
          await initialize(config.accountInfo.email, config.accountInfo.password, proxy);
        } else if (!rpi1.includes('Out of stock')) {
          console.log('Stock detected for Raspberry Pi 4 Model B - 1 GB RAM');
          taskOn = 1;
          productId = 4295;
          await initialize(config.accountInfo.email, config.accountInfo.password, proxy);
        }
      } else {
        console.log('Error: ' + response.status);
      }
      await delay(randInt(2500, 5000));
    }
  } catch (e) {
    console.log(e);
    monitor();
  }
}

function start() {
  monitor();
}

start();