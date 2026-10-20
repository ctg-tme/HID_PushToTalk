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

 * Author(s):               Robert(Bobby) McGonigle Jr
 *                          Technical Marketing Engineering, Technical Leader
 *                          Cisco Systems
 * 
 * Date: October 20, 2026
 * Revised: October 20, 2026
 * Version: 1.0.0
 * 
 * Description: Press and hold any key on an HID Keyboard to Talk
*/

import xapi from 'xapi';


const config = {
  debugKeys: false, // Key values print to the console discovery
  allKeys: true,
  select_keys: [ // Enter specific Keys by their value in this arrray. Set allKeys to false to use
    "KEY_SPACE"
  ]
}

let isPushed = false;

async function handlePTT(state) {
  if (!isPushed && state.toLowerCase() == 'off') {
    await xapi.Command.Audio.Microphones.Mute();
  }
}

async function handleKeys({ Key, Type, Code }) {
  if (config.debugKeys) {
    console.info('Key Info:', Key, Type, Code);
  }
  if (Type.toLowerCase() == 'pressed') {
    isPushed = true
    if (config.allKeys) {
      await xapi.Command.Audio.Microphones.Unmute();
    } else if (config.select_keys.includes(Key)) {
      await xapi.Command.Audio.Microphones.Unmute();
    }
  } else {
    isPushed = false;
    await xapi.Command.Audio.Microphones.Mute();
  }
}


async function setConfig() {
  await xapi.Config.Peripherals.InputDevice.Mode.set('On');
  console.warn('InputDevice Mode set On. This can interfere with Keyboards and Mice used in a Docked mode on some products');
}

async function init() {
  await setConfig();

  await xapi.Command.Audio.Microphones.Mute();

  xapi.Status.Audio.Microphones.Mute.on(handlePTT)

  xapi.Event.UserInterface.InputDevice.Key.Action.on(handleKeys);

}

init();