# Platform Permissions — noise_meter + permission_handler

Run `flutter create --platforms android,ios .` inside `flutter_app/` to generate the
platform directories, then add the entries below.

## Android — android/app/src/main/AndroidManifest.xml

Inside `<manifest>` before `<application>`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
<uses-permission android:name="android.permission.INTERNET"/>
```

## iOS — ios/Runner/Info.plist

Inside the root `<dict>`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>HearGuard necesita acceso al micrófono para medir el nivel de ruido en tiempo real.</string>
```
