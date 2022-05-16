import { createAppContainer, createSwitchNavigation, createSwitchNavigator } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import LoadingScreen from './screens/LoadingScreen'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import HomeScreen from './screens/HomeScreen'
//import GameScreen from './screens/GameScreen'
import GameCreateScreen from './screens/GameCreateScreen'
import GameJoinScreen from './screens/GameJoinScreen'
import GameLobbyScreen from './screens/GameLobbyScreen'
import DebtScreen from './screens/DebtScreen'
import { SocketContext } from './components/socketContext'
import * as Colyseus from "colyseus.js"

import * as firebase from 'firebase'

import { useFonts, Roboto_400Regular } from '@expo-google-fonts/roboto';

const host = 'ws://192.168.0.101:3000'
global.client = new Colyseus.Client(host)

var firebaseConfig = {
  apiKey: "AIzaSyBnoXWzm92fEYcR5nEJYVSEt8rP3WfxVvk",
  authDomain: "iou-poker-development.firebaseapp.com",
  projectId: "iou-poker-development",
  storageBucket: "iou-poker-development.appspot.com", 
  messagingSenderId: "308689079238",
  appId: "1:308689079238:web:a9569a7579258c5d2740c7"
}

firebase
  .initializeApp(firebaseConfig)
  .firestore()

  //load fonts
  let [fontsLoaded] = useFonts({
    Roboto_400Regular,
  });

  global.fontsLoaded = fontsLoaded

const AppStack = createStackNavigator({
  Home: HomeScreen,
  GameCreate: GameCreateScreen,
  GameLobby: GameLobbyScreen,
  GameJoin: GameJoinScreen,
  //Game: GameScreen,
  Debt: DebtScreen
})

const AuthStack = createStackNavigator({
  Login: LoginScreen,
  Register: RegisterScreen
})

export default createAppContainer(
      createSwitchNavigator(
        {
          Loading: LoadingScreen,
          App: AppStack,
          Auth: AuthStack
        },
        {
          initialRouteName: "Loading"
        }
      )  
)