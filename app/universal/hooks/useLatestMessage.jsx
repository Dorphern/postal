import { useSelector } from 'react-redux'

import { getRoomLatestMessage } from '../state/room'

const isSameEvent = (a, b) => a.eventId === b.eventId

export const useLatestMessage = roomId =>
  useSelector(getRoomLatestMessage(roomId), isSameEvent)
