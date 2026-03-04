## Im Feeling – SwiftUI macOS app

The original macOS app lives in the `ImFeeling/` folder and is built with SwiftUI. It shows 5 emojis in a cross pattern representing different feelings; clicking an emoji opens its assigned Spotify playlist, with URLs persisted via `UserDefaults`.

Open `ImFeeling.xcodeproj` in Xcode and run the macOS scheme to use this version.

## Im Feeling – React Native for macOS app

A separate React Native project with [React Native for macOS](https://github.com/microsoft/react-native-macos) support lives in `im-feeling-macos-rn/ImFeeling`.

From the `im-feeling-macos-rn/ImFeeling` directory you can run:

```bash
yarn macos
```

This will build and run the `ImFeeling-macOS` target. For more details, see the `README.md` inside `im-feeling-macos-rn/ImFeeling`.

