# ROS Mobile Control Hub

**A powerful, modern, and mobile-first interface for controlling and visualizing your ROS/ROS2 robots directly from your phone.**

The ROS Mobile Control Hub is a web-based application designed to connect to any ROS system on your local network. It provides an intuitive interface for teleoperation, a multi-modal visualization engine for topics, and tools for publishing messages, transforming your smartphone into a versatile robotics dashboard.

![ROS Mobile Control Hub Screenshot](https://user-images.githubusercontent.com/assets/222946/218861214-e22e625a-4b20-4b22-a725-b82d3122c6c1.png)
*(Image placeholder: A screenshot of the app running on a mobile device)*

---

## ✨ Features

- **Seamless ROS Integration**: Connects to ROS 1 & ROS 2 via the `rosbridge_suite`.
- **Intuitive Teleoperation**: Dual D-pad controls for precise linear and angular velocity, publishing directly to `/cmd_vel`. Includes a prominent **Emergency Stop** button.
- **Multi-Modal Visualization Engine**:
    - **📈 Live Plotting**: Automatically discovers and plots any numerical data from any topic in real-time.
    - **📸 Live Video Streaming**: Renders a live feed from `sensor_msgs/CompressedImage` topics.
    - **🧊 3D Point Cloud Viewer**: Visualizes `sensor_msgs/PointCloud2` data in an interactive 3D space.
- **Flexible Publishing Tools**:
    - A dedicated **Command** tab for sending simple, single-shot messages (`String`, `Bool`, `Empty`).
    - A generic **Publisher** tab for sending custom JSON messages to any topic.
- **Mobile-First & Installable**:
    - Fully responsive design for a great experience on any screen size.
    - Can be "installed" on your phone's home screen as a Progressive Web App (PWA) for an app-like feel and offline access.
- **Ready for Native Deployment**: Built with Capacitor, it can be compiled into a true native iOS or Android app and is fully compatible with CI/CD services like **Ionic Appflow**.

---

## 🚀 Quick Start (For Users)

Get up and running in 5 minutes. No development environment needed!

### On Your ROS Computer:

1.  **Find Your IP Address**: Open a terminal and find your computer's local network IP address.
    ```bash
    ip addr show
    ```
    (Look for an address like `192.168.1.123` under your `wlan0` or `eth0` interface).

2.  **Launch ROS Bridge**: In a new terminal, start the `rosbridge` websocket server.
    ```bash
    # For ROS 1
    roslaunch rosbridge_server rosbridge_websocket.launch

    # For ROS 2
    ros2 launch rosbridge_server rosbridge_websocket_launch.py
    ```
    This will start a server on `ws://<your_ip>:9090`.

3.  **Serve the App Files**: In another terminal, navigate to the folder containing the app's files (`index.html`, etc.) and start a simple web server.
    ```bash
    # If you have Python 3
    python3 -m http.server 8000

    # Or, if you have Node.js
    npx serve -l 8000
    ```
    This will host the app at `http://<your_ip>:8000`.

### On Your Mobile Phone:

1.  **Connect to the Same Wi-Fi** as your ROS computer. This is essential!
2.  **Open Your Browser** (Chrome, Safari, etc.).
3.  **Navigate to the App**: In the address bar, type your computer's IP address and the port from the previous step. For example: `http://192.168.1.123:8000`.
4.  **Connect to ROS**:
    - The app will load. In the connection bar, change the IP address to match your computer's IP. The full URL should be `ws://192.168.1.123:9090`.
    - Tap **Connect**. The status indicator should turn green.

You are now ready to control and visualize your robot!

---

## 📲 Installing as a Mobile App (PWA)

For a native app-like experience (full screen, home screen icon), you can install the PWA.

-   **On Android (Chrome)**: A prompt to **"Install app"** or **"Add to Home Screen"** will appear automatically or in the browser menu (⋮).
-   **On iOS (Safari)**: Tap the **Share** button (icon with an arrow pointing up) and select **"Add to Home Screen"**.

---

## 🛠️ For Developers: Building Natively with Capacitor

To build this project as a native iOS or Android app, you'll need to set up a local development environment.

### Prerequisites

-   [Node.js (LTS)](https://nodejs.org/)
-   **For Android**: [Android Studio](https://developer.android.com/studio)
-   **For iOS (macOS only)**: [Xcode](https://developer.apple.com/xcode/) and CocoaPods (`sudo gem install cocoapods`)

### Build Steps

1.  **Clone & Install Dependencies**:
    ```bash
    git clone <your-repo-url>
    cd ros-mobile-control-hub
    npm install
    ```

2.  **Add Native Platforms**:
    ```bash
    # Add the android/ and ios/ folders to your project
    npx cap add android
    npx cap add ios
    ```

3.  **Build and Sync Web Assets**: Every time you change the web code, you must build it and copy it to the native projects.
    ```bash
    # This command copies the files into a `www` directory for Capacitor
    npm run build

    # This command copies the `www` contents into the native projects
    npx cap sync
    ```
    *Tip: The provided `sync:android` and `sync:ios` scripts in `package.json` combine these steps.*

4.  **Run in IDE**: Open the native projects in their respective IDEs to run on an emulator or a physical device.
    ```bash
    # Open in Android Studio
    npx cap open android

    # Open in Xcode
    npx cap open ios
    ```

### Connecting to Ionic Appflow

This project is structured for seamless integration with Ionic Appflow for cloud-native builds.

1.  **Commit Native Folders**: The `.gitignore` file is configured to correctly commit the `android/` and `ios/` folders. Ensure they are tracked in your Git repository.
2.  **Connect Repository**: Push your repository to GitHub/Bitbucket and connect it to a new app in your Ionic Appflow dashboard.
3.  **Trigger Builds**: You can now trigger cloud builds for `.apk`, `.aab`, and `.ipa` files directly from Appflow.

---

## 📜 License

This project is licensed under the MIT License. See the LICENSE file for details.

