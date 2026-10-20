# HID Push-to-Talk for RoomOS

This example macro turns a connected HID keyboard into a push-to-talk control for a Cisco RoomOS device. Pressing an enabled key unmutes the microphones; releasing a key mutes them again.

## Configure the keys

Edit the `config` object near the top of [`HID_PushToTalk.js`](HID_PushToTalk.js):

- Set `allKeys` to `true` to use every key reported by the keyboard.
- Set `allKeys` to `false` and add key names to `selectKeys` to use only selected keys. The example is configured to use `KEY_SPACE`.
- Set `debugKeys` to `true` to print key names, event types, and codes in the macro console. Use this to find the names reported by your keyboard.

The available key names depend on the keyboard and the events reported by the RoomOS device.

## Extend the example

This example can be forked to append a function to any key on the keyboard. Use the key-event log to identify the key name, then add key-specific behavior in `handleKeys` before the `isKeyEnabled` check. That lets the custom action run for its chosen key even when that key is not enabled for push-to-talk.

```js
if (Key === 'KEY_SPACE' && Type.toLowerCase() === 'pressed') {
  // Add the RoomOS command or function for this key here.
}
```

Replace `KEY_SPACE` with the key name you want to handle. Check for `released` instead of `pressed` if the action should run when the key is released.

## Install on a RoomOS device

1. Add `HID_PushToTalk.js` as a macro on the RoomOS device.
2. Connect a compatible HID keyboard.
3. If needed, enable `debugKeys`, run the macro, press the desired key, and use the macro console output to determine its reported key name.
4. Configure `allKeys` or `selectKeys`, then enable or restart the macro.

The macro sets `Peripherals InputDevice Mode` to `On` so RoomOS can report keyboard events. On some products, this setting can interfere with keyboards and mice used in docked mode.

## License

This example is provided under the [Cisco Sample Code License, Version 1.1](https://developer.cisco.com/docs/licenses). See [`LICENSE`](LICENSE) for the license text.
