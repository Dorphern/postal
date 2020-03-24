// Imports: Dependencies
import { AsyncStorage } from 'react-native'
import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import thunk from 'redux-thunk'
import { persistStore, persistReducer } from 'redux-persist'
import Client from '../lib/client'

import { syncRooms } from './rooms'
import { syncContacts } from './contacts'
import { syncProgress, saveSyncCursor, resetAuth } from './auth'

import { syncStorage } from '../lib/storage'

import * as reducers from './reducers'

const rootReducer = combineReducers(reducers)

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'rooms', 'contacts', 'settings'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(
  persistedReducer,
  composeEnhancers(applyMiddleware(thunk)),
)

let persistor = persistStore(store)

Client.on('sync', async (msg, { data, firstSync }) => {
  const { events, rooms, contacts, cursor } = data
  syncStorage({
    events,
    onProgress:
      firstSync && (progress => store.dispatch(syncProgress(progress))),
  }).catch(error => {
    console.log('got an error syncing', error)
  })
  store.dispatch(saveSyncCursor(cursor))
  store.dispatch(syncRooms({ rooms }))
  store.dispatch(syncContacts({ contacts }))
})

Client.on('error.unauthorized', () => {
  store.dispatch(resetAuth())
})

export { store, persistor }
