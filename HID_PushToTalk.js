/********************************************************
Copyright (c) 2025 Cisco and/or its affiliates.
This software is licensed to you under the terms of the Cisco Sample
Code License, Version 1.1 (the "License"). You may obtain a copy of the
License at
               https://developer.cisco.com/docs/licenses
All use of the material herein must be in accordance with the terms of
the License. All rights not expressly granted by the License are
reserved. Unless required by applicable law or agreed to separately in
writing, software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied.
*********************************************************

 * Author(s):               Robert (Bobby) McGonigle Jr.
 *                          Technical Marketing Engineering, Technical Leader
 *                          Cisco Systems
 *
 * Date: October 20, 2026
 * Revised: October 20, 2026
 * Version: 1.0.0
 *
 * Description: Press and hold a key on a connected HID keyboard to talk.
 */

import xapi from 'xapi';

/**
 * Configuration for keyboard-based push-to-talk.
 *
 * Set `allKeys` to `false` and list key names in `selectKeys` to restrict
 * push-to-talk to specific keys. Enable `debugKeys` to log key events and
 * discover the key names reported by a connected keyboard.
 * @type {{debugKeys: boolean, allKeys: boolean, selectKeys: string[]}}
 */
const config = {
  /** Log key names, event types, and key codes to the macro console. */
  debugKeys: true,
  /** Treat every key on the connected keyboard as a push-to-talk key. */
  allKeys: true,
  /** Key names allowed for push-to-talk when `allKeys` is false. */
  selectKeys: [
    'KEY_SPACE',
  ],
};

/** Whether the most recent keyboard action was a key press. */
let isPushed = false;

/**
 * Details reported by a RoomOS input-device key action event.
 * @typedef {Object} InputDeviceKeyEvent
 * @property {string} Key The key name reported by the keyboard.
 * @property {string} Type The action, such as `Pressed` or `Released`.
 * @property {string|number} [Code] The key code reported by RoomOS, if present.
 */

/**
 * Keep the microphone muted if it becomes unmuted while no PTT key is held.
 * RoomOS reports the microphone mute state as a string.
 * @param {string} state Current microphone mute state.
 * @returns {Promise<void>} Resolves when the corrective command completes.
 */
async function handlePTT(state) {
  if (!isPushed && state.toLowerCase() === 'off') {
    await xapi.Command.Audio.Microphones.Mute();
  }
}

/**
 * Determine whether a keyboard key is enabled for push-to-talk.
 * @param {string} keyName Key name reported in the input-device event.
 * @returns {boolean} True when the key is allowed to control the microphone.
 */
function isKeyEnabled(keyName) {
  return config.allKeys || config.selectKeys.includes(keyName);
}

/**
 * Handle a keyboard key action and update the microphone state.
 * An enabled key press unmutes the microphones. A key release mutes them.
 * @param {InputDeviceKeyEvent} event Key action received from RoomOS.
 * @returns {Promise<void>} Resolves when any required microphone command completes.
 */
async function handleKeys(event) {
  const { Key, Type, Code } = event;

  if (config.debugKeys) {
    console.info('Key info:', Key, Type, Code);
  }

  if (Type.toLowerCase() === 'pressed') {
    isPushed = true;
    if (isKeyEnabled(Key)) {
      await xapi.Command.Audio.Microphones.Unmute();
    }
  } else {
    isPushed = false;
    await xapi.Command.Audio.Microphones.Mute();
  }
}

/**
 * Enable RoomOS input-device events for connected keyboards.
 * This setting can affect keyboard and mouse use in docked mode on some
 * products.
 * @returns {Promise<void>} Resolves when the setting command completes.
 */
async function setConfig() {
  await xapi.Config.Peripherals.InputDevice.Mode.set('On');
  console.warn(
    'InputDevice Mode is set to On. On some products, this can interfere with keyboards and mice used in docked mode.',
  );
}

/**
 * Configure the device, start muted, and subscribe to microphone and key events.
 * @returns {Promise<void>} Resolves after initialization and subscriptions.
 */
async function init() {
  await setConfig();
  await xapi.Command.Audio.Microphones.Mute();

  xapi.Status.Audio.Microphones.Mute.on(handlePTT);
  xapi.Event.UserInterface.InputDevice.Key.Action.on(handleKeys);
}

init();
