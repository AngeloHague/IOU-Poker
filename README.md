# Steps to install and use IOU Poker

**Step 1.** Clone this repo

**Step 2.** Download and activate ngrok from [their website](https://ngrok.com/download) and add to PATH

**Step 3.** Open a terminal in the `backend` folder, install dependencies, and then run server
```
npm install
npm start
```

**Step 3.** Open a second terminal and use ngrok to tunnel the server's port (3000)
```
ngrok http 3000
```

**Step 4.** Go into `frontend/App.js` and update the code's host url to your ngrok url 
```
const host = 'http://YOUR_NGROK_URL.ngrok.io/'
```

**Step 5.** Open a third terminal in the `frontend` folder, install dependencies, and then launch expo
```
npm install
expo start
```

**Step 6.** Use an emulator or your mobile device to connect to the app using expo