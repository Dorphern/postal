import React from 'react'
import { Easing } from 'react-native'

import { useSelector } from 'react-redux'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'

import { getIsAuthenticated, selectIsSyncing } from './state/auth'
import Client from './lib/client'

import ChatsScreen from './screens/chats'
import ChatScreen from './screens/chat'
import NewChatScreen from './screens/newChat'
import StartChatScreen from './screens/startChat'

import SignInScreen from './screens/signIn'
import SyncScreen from './screens/sync'

const Stack = createStackNavigator()

const getScreens = () => {
  const isAuthenticated = useSelector(getIsAuthenticated)
  const isSyncing = useSelector(selectIsSyncing)

  if (isSyncing) {
    return <Stack.Screen name="SyncProgress" component={SyncScreen} />
  }

  if (isAuthenticated && Client.homeserver != null) {
    return (
      <>
        <Stack.Screen name="Chats" component={ChatsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="NewChat" component={NewChatScreen} />
        <Stack.Screen name="StartChat" component={StartChatScreen} />
      </>
    )
  }

  return <Stack.Screen name="SignIn" component={SignInScreen} />
}

const Navigator = () => {
  const screens = getScreens()

  return (
    <NavigationContainer>
      <Stack.Navigator
        headerMode="none"
        screenOptions={{
          cardStyle: { backgroundColor: 'transparent' },
          cardStyleInterpolator: myCardInterpolator,
          transitionSpec: {
            open: transitionConfigIn,
            close: transitionConfigOut,
          },
        }}
      >
        {screens}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default Navigator

const transitionConfigIn = {
  animation: 'timing',
  config: {
    duration: 350,
    easing: Easing.out(Easing.poly(5)),
  },
}

const transitionConfigOut = {
  animation: 'timing',
  config: {
    duration: 200,
    easing: Easing.in(Easing.linear),
  },
}

const myCardInterpolator = ({ current, next, layouts }) => {
  return {
    cardStyle: {
      opacity: current.progress,
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.width / 2, 0],
          }),
        },
      ],
    },
    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    },
  }
}
