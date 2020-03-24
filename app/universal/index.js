import React from 'react'
import { registerRootComponent } from 'expo'
import { activateKeepAwake } from 'expo-keep-awake'

if (__DEV__) {
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  //whyDidYouRender(React, {
  //trackAllPureComponents: true,
  //})

  activateKeepAwake()
}

const App = require('./App')

registerRootComponent(App.default)
