# Steps to install and use IOU Poker

**Step 1.** Clone this repo

**Step 2.** Open a terminal in the `backend` folder, install dependencies, and then run server (port 3000 by default - you can change this in backend/index.ts if desired)
```
npm install
npm start
```

**Step 3.** Ensure you have expo-cli installed
```
npm install --global expo-cli
```

**Step 4.** In the `frontend` folder, open App.js and change the host variable to your local IP address and whichever port the backend serve is being run on (default 3000) 
```
const host = 'ws://[YOUR_IP_ADDRESS]:[PORT]'
```

**Step 5.** Open a terminal in the `frontend` folder, install dependencies, and then launch expo
```
npm install
expo install
expo start
```

**Step 6.** Use an emulator or a mobile device on the network to connect to the app using expo