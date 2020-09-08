<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>

# Homebridge Garage Door Hack

```
NOTE: This package can only be used with a Raspberry Pi.
```

Homebridge plugin the supports opening and closing a garage door thought the GPIO pins of the Raspberry Pi.

This package works by using pin 26 as a digital trigger. The image below shows the pin numbers of the Raspberry Pi.

![GPIO Pinout Diagram](https://raw.githubusercontent.com/raspberrypi/documentation/e6ee98ffc4d9f7900893ee4137d3a76ffd858bd2/usage/gpio/images/GPIO-Pinout-Diagram-2.png)


## Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g @toniotgz/homebridge-garage-door-hack`
3. Update your configuration file. See the sample below.

## Configuration

### Configuration sample:

```json
"accessories": [
  {
    "accessory": "GarageDoorHack",
    "name"     : "Garage Door"
  }
]
```

## Setup Development Environment

To develop Homebridge plugins you must have Node.js 12 or later installed, and a modern code editor such as [VS Code](https://code.visualstudio.com/). This plugin template uses [TypeScript](https://www.typescriptlang.org/) to make development easier and comes with pre-configured settings for [VS Code](https://code.visualstudio.com/) and ESLint. If you are using VS Code install these extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Install Development Dependencies

Using a terminal, navigate to the project folder and run this command to install the development dependencies:

```
npm install
```

## Build Plugin

TypeScript needs to be compiled into JavaScript before it can run. The following command will compile the contents of your [`src`](./src) directory and put the resulting code into the `dist` folder.

```
npm run build
```

## Link To Homebridge

Run this command so your global install of Homebridge can discover the plugin in your development environment:

```
npm link
```

You can now start Homebridge, use the `-D` flag so you can see debug log messages in your plugin:

```
homebridge -D
```

## Watch For Changes and Build Automatically

If you want to have your code compile automatically as you make changes, and restart Homebridge automatically between changes you can run:

```
npm run watch
```

This will launch an instance of Homebridge in debug mode which will restart every time you make a change to the source code. It will load the config stored in the default location under `~/.homebridge`. You may need to stop other running instances of Homebridge while using this command to prevent conflicts. You can adjust the Homebridge startup command in the [`nodemon.json`](./nodemon.json) file.
