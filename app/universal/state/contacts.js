import { mergeDeep } from '../lib/mergeDeep'

import { RESET } from './auth'

// Actions
const SYNC = 'contacts/SYNC'

// Reducer
const initialState = {
  contactsById: {},
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case RESET:
      return initialState

    case SYNC:
      return {
        ...state,
        contactsById: mergeDeep(state.contactsById, action.contactsById),
      }

    default:
      return state
  }
}

export default reducer

// Selectors
// ==========================
export const getContactsState = state => {
  return state.contacts
}

export const getContactsById = state => {
  return getContactsState(state).contactsById
}

// Actions
// ==========================
export const syncContacts = ({ contacts }) => {
  return { type: SYNC, contactsById: contacts }
}

