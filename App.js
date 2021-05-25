import { createAppContainer, createSwitchNavigation, createSwitchNavigator } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import LoadingScreen from './screens/LoadingScreen'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import HomeScreen from './screens/HomeScreen'

import * as firebase from 'firebase'

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

const AppStack = createStackNavigator({
  Home: HomeScreen
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