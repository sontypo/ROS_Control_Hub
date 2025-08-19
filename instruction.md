Here is a complete guide to building and running your ROS Mobile Control Hub.
Prerequisites: Your Development Environment
Before you begin, you need to set up your computer for mobile development. This is a one-time setup.
Node.js and npm: Capacitor is built on Node.js.
Download and install the LTS version of Node.js. This package includes npm.
Verify the installation by opening a new terminal and running node -v and npm -v.
Code Editor: A good editor like Visual Studio Code is highly recommended.
Native SDKs:
For Android:
Download and install Android Studio.
Follow the setup wizard. It will install the Android SDK, platform tools, and an emulator.
You will also need a Java Development Kit (JDK). Android Studio often bundles this, but if not, install a recent version like OpenJDK 17.
For iOS (macOS Only):
Install Xcode from the Mac App Store.
Install CocoaPods, which Xcode uses to manage native dependencies. Open a terminal and run:
code
Bash
download
content_copy
expand_less
sudo gem install cocoapods
Step 1: Project Setup
Let's get your project files organized and install the necessary dependencies.
Create a Project Folder: On your computer, create a new folder for your project. Let's call it ros-control-hub.
Add Your Files: Place all the files I've provided into this ros-control-hub folder. Your folder structure should look like this:
code
Code
download
content_copy
expand_less
ros-control-hub/
├── components/
│   ├── CommandControl.js
│   ├── ConnectionManager.js
│   ├── ... (all other component files)
├── services/
│   └── RosService.js
├── capacitor.config.ts
├── index.html
├── index.js
├── package.json
└── ... (all other root files)
Install Dependencies: Open your terminal, navigate into your project folder (cd ros-control-hub), and run:
code
Bash
download
content_copy
expand_less
npm install
This command reads your package.json file and downloads all the required tools (React, Capacitor, etc.) into a new node_modules folder.
Step 2: Initialize Native Platforms
Now, we'll use Capacitor to create the native iOS and Android project shells.
Run the Build Script: The first step is to prepare your web files for Capacitor. The package.json has a simple script for this. In your terminal, run:
code
Bash
download
content_copy
expand_less
npm run build
This creates a www folder and copies your web app's assets (.js, .html, .css, etc.) into it. Capacitor only cares about what is in the www folder.
Add Platforms: In the same terminal, add the mobile platforms you want to build for.
code
Bash
download
content_copy
expand_less
# For Android
npx cap add android

# For iOS (macOS only)
npx cap add ios
You will now see new android and ios folders in your project. These are complete, native projects that wrap your web code. You only need to run this add command once.
Step 3: Build and Run on a Device/Emulator
This is the exciting part where you see the app run outside of a browser.
The Golden Rule: Every time you make a change to your web code (e.g., editing App.js), you must copy those changes to the native projects. The command for this is npx cap sync. Your package.json has convenient scripts that combine the build and sync steps.
Building for Android
Sync Your Web Code: Make sure your rosbridge is running on your ROS machine and you know its IP address. In your terminal, run:
code
Bash
download
content_copy
expand_less
npm run sync:android
Open in Android Studio: Open the native project in its IDE:
code
Bash
download
content_copy
expand_less
npx cap open android
Run the App:
Android Studio will open and build your project (this can take a minute the first time).
At the top of the Android Studio window, select a target device. This can be a virtual device (emulator) you create or your physical Android phone (if it's plugged in with USB Debugging enabled).
Click the green "Run" button (▶).
The app will install and launch on your selected device.
Connect to ROS:
The app will load, but it won't be connected.
In the connection input field, you must replace the default IP with the IP address of your computer running ROS. The URL should be ws://<YOUR_COMPUTER_IP>:9090.
Tap "Connect," and the status should turn green!
Building for iOS (macOS Only)
Sync Your Web Code:
code
Bash
download
content_copy
expand_less
npm run sync:ios
Open in Xcode:
code
Bash
download
content_copy
expand_less
npx cap open ios
Configure Signing:
Xcode will open your project.
Click on the project name in the left sidebar, then select the "Signing & Capabilities" tab.
You must select a "Team." If you have a free Apple Developer account, this will be your name. This is required to run the app on a physical device.
Run the App:
At the top of the Xcode window, select your target device (an iOS Simulator or your connected iPhone).
Click the "Run" button (▶).
The app will build, install, and launch.
Connect to ROS:
Just like with Android, you must change the IP address in the app's input field to your ROS computer's IP address (ws://<YOUR_COMPUTER_IP>:9090).
Tap "Connect."
Next Steps: Building with Ionic Appflow
Once you have tested your app locally and are ready for cloud builds, follow these steps:
Use Git: Appflow works by connecting to a Git repository.
Initialize a Git repository in your project folder: git init
Commit all your files: git add . and git commit -m "Initial commit"
Create a repository on a service like GitHub and push your code there.
Connect to Appflow:
Sign up for an Ionic Appflow account.
In the Appflow dashboard, create a new app and choose "Import existing app."
Connect it to the GitHub repository you just created.
Trigger a Build:
In the Appflow dashboard for your app, go to the "Builds" tab.
Select the commit you want to build from the list.
Click "New Build" and choose your target platform (iOS or Android) and build type (e.g., "Package" for a distributable file).
Note: For official builds, you will need to go to the "Deploy" > "Package Signing" section in Appflow and upload your Android Keystore and/or iOS Certificates.
Appflow will now pull your code and build the native .apk (Android) or .ipa (iOS) file for you in the cloud, which you can then download and distribute.
