# Adafruit Bot

An [Adafruit](https://www.adafruit.com/) request based bot that is geared to acquiring Raspberry Pis.

## Configuration

You will need to provide your information in order for this program to run. All of this information will be stored locally on your machine.

### Account

If you don't already have one, you will need to create an [Adafruit](https://www.adafruit.com/) account and make sure that it is verified and has 2FA enabled.

### Proxies

1. Open the `proxylist.txt` file.
2. Enter your proxies and separate them by a new line.
3. Format the proxies as `http://username:password@ip:port` or `http://ip:port`.

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
  
You will then see a window pop up, let the login process complete until it asks you to verify 2FA, verify it and wait until the window closes. Once this is done, you are set.
 
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.