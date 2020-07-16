import React, { useEffect, useState } from 'react'
import styled, { ThemeProvider } from 'styled-components/native'
import { Platform, StatusBar } from 'react-native'

import { PersistGate } from 'redux-persist/integration/react'
import { Provider, useSelector, useDispatch } from 'react-redux'

import { migrateToLatest } from './lib/storage'
import { store, persistor } from './state/configureStore'
import { getAuthState, connectToServer } from './state/auth'
import { selectTheme } from './state/settings'

import NotificationHandler from './NotificationHandler'

import Navigator from './Navigator'

const themeMap = {
  light: require(`./components/styles/light`).theme,
  dark: require(`./components/styles/dark`).theme,
}

const Main = () => {
  const [storageMigrated, setStorageMigrated] = useState(false)
  const auth = useSelector(getAuthState)
  const dispatch = useDispatch()

  const themeKey = useSelector(selectTheme)
  const theme = themeMap[themeKey]

  useEffect(() => {
    if (auth.accessToken != null && !auth.isConnecting) {
      dispatch(connectToServer())
    }
  }, [auth.accessToken])

  useEffect(() => {
    migrateToLatest()
      .then(() => setStorageMigrated(true))
      .catch(() => console.log('failed to migrate!'))
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <AppFrame>
        <NotificationHandler />
        {Platform.OS === 'android' && <AndroidStatusBarHeight />}
        <SafeArea behavior="padding" enabled>
          <AppBackground>{storageMigrated && <Navigator />}</AppBackground>
        </SafeArea>
      </AppFrame>
    </ThemeProvider>
  )
}

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Main />
      </PersistGate>
    </Provider>
  )
}

export default App

const AppFrame = styled.View`
  background-color: #000;
  flex: 1;
`

const AppBackground = styled.View`
  background-color: ${(p) => p.theme.colors.appBg};
  flex: 1;
  justify-content: center;
  border-radius: 15px;
  overflow: hidden;
`

const SafeArea = styled.KeyboardAvoidingView`
  flex: 1;
`

const AndroidStatusBarHeight = styled.View`
  height: ${StatusBar.currentHeight}px;
`
