import _mapValues from 'lodash/mapValues'
import _orderBy from 'lodash/orderBy'

import { mergeDeep } from '../lib/mergeDeep'

import { RoomInviteState } from '../lib/client'

import { RESET } from './auth'

// Actions
const SYNC = 'rooms/SYNC'

// Reducer
const initialState = {
  roomsById: {},
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case RESET:
      return initialState

    case SYNC:
      return {
        ...state,
        roomsById: mergeDeep(state.roomsById, action.roomsById),
      }

    default:
      return state
  }
}

export default reducer

// Selectors
// ==========================
export const getRoomsState = state => {
  return state.rooms
}

export const getRoomById = id => state => {
  return getRoomsState(state).roomsById[id]
}

export const selectJoinedRoomIds = state => {
  const rooms = Object.values(getRoomsState(state).roomsById).filter(
    room => room.inviteState === RoomInviteState.Joined,
  )

  const sorted = _orderBy(
    rooms,
    r => {
      return r.latestMessage?.serverTimestamp ?? 0
    },
    'desc',
  )

  return sorted.map(r => r.id)
}

// Actions
// ==========================
export const syncRooms = ({ rooms }) => {
  return { type: SYNC, roomsById: rooms }
}
