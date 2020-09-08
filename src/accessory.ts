import {
  HAP,
  API,
  Service,
  AccessoryPlugin,
  AccessoryConfig,
  Logging,
  CharacteristicEventTypes,
  CharacteristicValue,
  CharacteristicSetCallback,
  CharacteristicGetCallback,
} from 'homebridge';

import { Gpio } from 'onoff';

import { ACCESSORY_NAME } from './settings';

const garageOutPin = new Gpio(26, 'out');
garageOutPin.writeSync(Gpio.LOW);

let hap: HAP;

enum State {
  OPEN = 0,
  CLOSED = 1,
  OPENING = 2,
  CLOSING = 3,
  STOPPED = 4,
}

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
  hap = api.hap;
  api.registerAccessory(ACCESSORY_NAME, GarageDoorHack);
};

class GarageDoorHack implements AccessoryPlugin {
  private readonly log: Logging;
  private readonly name: string;
  private doorState = State.CLOSED;
  private targetDoorState = State.CLOSED;

  private readonly garageDoorOpenerService: Service;
  private readonly informationService: Service;

  constructor(log: Logging, config: AccessoryConfig, api: API) {
    this.log = log;
    this.name = config.name;

    this.garageDoorOpenerService = new hap.Service.GarageDoorOpener(this.name);
    this.garageDoorOpenerService
      .getCharacteristic(hap.Characteristic.CurrentDoorState)
      .on(
        CharacteristicEventTypes.GET,
        this.handleCurrentDoorStateGet.bind(this),
      );

    this.garageDoorOpenerService
      .getCharacteristic(hap.Characteristic.TargetDoorState)
      .on(
        CharacteristicEventTypes.GET,
        this.handleTargetDoorStateGet.bind(this),
      )
      .on(
        CharacteristicEventTypes.SET,
        this.handleTargetDoorStateSet.bind(this),
      );

    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, 'Custom Manufacturer')
      .setCharacteristic(hap.Characteristic.Model, 'Custom Model');

    log.info('Garage Door Hack finished initializing!');
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [this.informationService, this.garageDoorOpenerService];
  }

  /**
   * Handle requests to get the current value of the "Current Door State" characteristic
   */
  handleCurrentDoorStateGet(callback: CharacteristicGetCallback) {
    this.log.debug('Triggered GET CurrentDoorState', State[this.doorState]);

    // set this to a valid value for CurrentDoorState
    callback(null, this.doorState);
  }

  /**
   * Handle requests to get the current value of the "Target Door State" characteristic
   */
  handleTargetDoorStateGet(callback: CharacteristicGetCallback) {
    this.log.debug(
      'Triggered GET TargetDoorState',
      State[this.targetDoorState],
    );

    // set this to a valid value for TargetDoorState
    callback(null, this.targetDoorState);
  }

  /**
   * Handle requests to set the "Target Door State" characteristic
   */
  handleTargetDoorStateSet(
    value: CharacteristicValue,
    callback: CharacteristicSetCallback,
  ) {
    this.targetDoorState = value as State;
    this.log.debug(
      'Triggered SET TargetDoorState:',
      State[this.targetDoorState],
    );
    if (this.targetDoorState === State.OPEN) {
      triggerPhysicalButton();
      this.garageDoorOpenerService.setCharacteristic(
        hap.Characteristic.CurrentDoorState,
        hap.Characteristic.CurrentDoorState.OPENING,
      );
      this.doorState = State.OPENING;
      setTimeout(() => {
        this.garageDoorOpenerService.setCharacteristic(
          hap.Characteristic.CurrentDoorState,
          hap.Characteristic.CurrentDoorState.OPEN,
        );
      }, 5000);
    } else if (this.targetDoorState === State.CLOSED) {
      triggerPhysicalButton();
      this.garageDoorOpenerService.setCharacteristic(
        hap.Characteristic.CurrentDoorState,
        hap.Characteristic.CurrentDoorState.CLOSING,
      );
      this.doorState = State.CLOSING;
      setTimeout(() => {
        this.garageDoorOpenerService.setCharacteristic(
          hap.Characteristic.CurrentDoorState,
          hap.Characteristic.CurrentDoorState.CLOSED,
        );
      }, 5000);
    } else if (this.targetDoorState === State.OPENING) {
      this.garageDoorOpenerService.setCharacteristic(
        hap.Characteristic.CurrentDoorState,
        hap.Characteristic.CurrentDoorState.OPEN,
      );
    } else if (this.targetDoorState === State.CLOSING) {
      this.garageDoorOpenerService.setCharacteristic(
        hap.Characteristic.CurrentDoorState,
        hap.Characteristic.CurrentDoorState.CLOSED,
      );
    }
    callback(null);
  }
}

/**
 * Function triggers a digital button press for a total of 100ms.
 * _-_ When the button is opened, the pin is pulled down.
 * When the button is closed (pressed ), it's connected to 3V3.
 */
async function triggerPhysicalButton() {
  garageOutPin.writeSync(Gpio.HIGH);
  await sleep(100);
  garageOutPin.writeSync(Gpio.LOW);
}

/**
 * Function transforms a Promise to async sleep
 * @param ms Number of miliseconds to sleep
 */
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * If exiting let's close the pin connection
 */
process.on('SIGINT', _ => {
  garageOutPin.unexport();
});