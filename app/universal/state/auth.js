import Client from '../lib/client'

// Actions
export const RESET = 'auth/RESET'

const SAVE_SYNC_CURSOR = 'auth/SAVE_SYNC_CURSOR'

const CONNECT_START = 'auth/CONNECT_START'
const CONNECT_FAILED = 'auth/CONNECT_FAILED'
const CONNECT_FINISHED = 'auth/CONNECT_FINISHED'
const LOGIN_AND_CONNECT_FINISHED = 'auth/LOGIN_AND_CONNECT_FINISHED'

const INCREMENT_TRANSACTION_ID = 'auth/INCREMENT_TRANSACTION_ID'

const SYNC_START = 'auth/SYNC_START'
const SYNC_PROGRESS = 'auth/SYNC_PROGRESS'
const SYNC_COMPLETE = 'auth/SYNC_COMPLETE'

// Reducer
const initialState = {
  homeserverUrl: null,
  userId: null,
  accessToken: null,
  isConnecting: false,
  nextTransactionId: 0,
  syncProgress: 1,
  syncCursor: null,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case RESET:
      return initialState

    case SAVE_SYNC_CURSOR:
      return {
        ...state,
        syncCursor: action.syncCursor,
      }

    case CONNECT_FAILED:
      return {
        ...state,
        isConnecting: false,
      }

    case CONNECT_FINISHED:
      return {
        ...state,
        isConnecting: false,
      }

    case LOGIN_AND_CONNECT_FINISHED:
      return {
        ...state,
        ...action.auth,
        isConnecting: false,
        transactionId: 0,
      }

    case CONNECT_START:
      return {
        ...state,
        isConnecting: true,
      }

    case INCREMENT_TRANSACTION_ID:
      return {
        ...state,
        nextTransactionId: (state.nextTransactionId || 0) + 1,
      }

    case SYNC_PROGRESS:
      return {
        ...state,
        syncProgress: action.progress,
      }

    case SYNC_COMPLETE:
      return {
        ...state,
        syncProgress: 1,
      }

    default:
      return state
  }
}

export default reducer

// Selectors
// ==========================
export const getAuthState = state => {
  return state.auth
}

export const getIsAuthenticated = state => {
  return getAuthState(state).accessToken != null
}

export const selectAuthId = state => getAuthState(state).userId

export const getSyncProgress = state => getAuthState(state).syncProgress

export const selectIsSyncing = state => {
  const syncProgress = getSyncProgress(state)
  const hasCursor = getAuthState(state).syncCursor != null
  const isAuthenticated = getIsAuthenticated(state)
  return (syncProgress < 1 || !hasCursor) && isAuthenticated
}

const getNextTransactionId = state => {
  return getAuthState(state).nextTransactionId || 0
}

// Actions
// ==========================
const connectStart = () => ({ type: CONNECT_START })
const connectFailed = () => ({ type: CONNECT_FAILED })
const connectFinished = () => ({ type: CONNECT_FINISHED })
const loginAndConnectFinished = auth => ({
  type: LOGIN_AND_CONNECT_FINISHED,
  auth,
})

export const resetAuth = () => ({ type: RESET })
export const saveSyncCursor = syncCursor => ({
  type: SAVE_SYNC_CURSOR,
  syncCursor,
})

export const startSync = () => ({ type: SYNC_START })
export const syncProgress = progress => ({ type: SYNC_PROGRESS, progress })
export const completeSync = () => ({ type: SYNC_COMPLETE })

export const fetchNextTransactionId = () => {
  return async (dispatch, getState) => {
    const id = getNextTransactionId(getState())
    dispatch({ type: INCREMENT_TRANSACTION_ID })
    return id
  }
}

export const connectToServer = ({ userId, password } = {}) => {
  return async (dispatch, getState) => {
    try {
      const storedAuth = getAuthState(getState())

      dispatch(connectStart())
      if (storedAuth.accessToken == null) {
        const auth = await Client.loginAndConnect({ userId, password })
        dispatch(loginAndConnectFinished(auth))
      } else {
        await Client.connect(storedAuth)
        dispatch(connectFinished())
      }
    } catch (error) {
      console.log(error)
      dispatch(connectFailed())
    }
  }
}
