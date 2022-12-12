# Adafruit Bot

An [Adafruit](https://www.adafruit.com/) bot that is geared to acquiring Raspberry Pis.

## Configuration

You will need to provide your information in order for this program to run. All of this information will be stored locally on your machine.

### Account

If you don't already have one, you will need to create an [Adafruit](https://www.adafruit.com/) account and make sure that it is verified and has 2FA enabled.

### Proxies

1. Create a file named `proxylist.txt` in the main folder.
2. Enter your proxies and separate them by a new line.

### Two-factor Authentication

1. Enable two-factor authentication in account settings.
2. Click the "No Camera?" option.
3. Copy the code and insert it in the `config.js` file as "twoFactorSecret".
4. Scan the QR code with your authenticator app.
5. Enter the authentication code.

###  User information

1. Open the `config.js` file.
2. Enter the correct information in the correct areas. 

## Starting

To start the program, open a terminal and run these commands:

* Set directory to program directory:
  ```sh
  cd "C:/Path/To/Program/Folder"
  ```
* Install the dependencies (you only have to do this once):
  ```sh
  npm install
  ```
* Run with the following command:
  ```sh
  npm start
  ```
 
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.