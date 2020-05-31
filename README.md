# Enjoy Driver App

### IOS
npm install -g ios-sim
ionic cordova platform add ios

ionic cordova prepare ios

open -a Simulator
ionic cordova run ios -l --external


### Android

#### Java version
```
brew tap homebrew/cask-versions

brew search java 
brew search jdk

brew cask info java
brew cask info adoptopenjdk

brew cask install java
```

#### Launch emulator
```
emulator -list-avds
emulator -avd Pixel_2_API_R
```

#### Install App
```
ionic cordova platform add android

ionic cordova prepare android
ionic cordova run android -l [--verbose]

adb logcat
```

### Pending Task
- [ ] Tabs
  - [ ] Available orders
    - [ ] List of restaurants 'ready to go' orders
    - [ ] Select an order to switch state to 'on going'
  - [ ] Current Order
    - [ ] Change state to 'deliverd'
  - [ ] Past Orders
- [ ] Translations
  - [ ] Currency code
  - [ ] Choose status
  - [ ] Order Status
    - [ ] ongoing
    - [ ] cancel
    - [ ] delivered