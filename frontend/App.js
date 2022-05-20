// REACT
import React from 'react'
import { Text } from 'react-native'
import { createAppContainer, createSwitchNavigation, createSwitchNavigator } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
// SCREENS:
import LoadingScreen from './screens/Auth/LoadingScreen'
import LoginScreen from './screens/Auth/LoginScreen'
import RegisterScreen from './screens/Auth/RegisterScreen'
import HomeScreen from './screens/HomeScreen'
import GameCreateScreen from './screens/Game/GameCreateScreen'
import GameJoinScreen from './screens/Game/GameJoinScreen'
import GameLobbyScreen from './screens/Game/GameLobbyScreen'
import DebtScreen from './screens/DebtScreen'
// EXPO:
import { useFonts, Roboto_400Regular } from '@expo-google-fonts/roboto';
// COLYSEUS:
import * as Colyseus from "colyseus.js"

const host = 'ws://192.168.0.101:3000'
global.client = new Colyseus.Client(host)

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

const AppContainer = createAppContainer(
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

export default function App() {
//load fonts
let [fontsLoaded] = useFonts({
  Roboto_400Regular,
});

if (!fontsLoaded) {
  console.log('Loading fonts')
  return (
    <>
      <Text>Installing</Text>
    </>
  );
}


return (
  <AppContainer />
)}