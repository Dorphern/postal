import React, { useState, useEffect } from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import { useTimeline } from './useTimeline'

import { useChatContext } from './ChatContext'

import { getRoomDisplayName, getRoomAvatar } from '../../state/room'
import { useLatestMessage } from '../../hooks/useLatestMessage'

import ChatScreenCard from './ChatScreenCard'

const ChatScreen = () => {
  const [endIsVisible, setEndIsVisible] = useState(null)
  const { roomId } = useChatContext()
  const { events, sendMessage, updateReadMarker } = useTimeline(roomId)
  const displayName = useSelector(getRoomDisplayName(roomId))
  const avatar = useSelector(getRoomAvatar(roomId), shallowEqual)
  const latestMessage = useLatestMessage(roomId)

  useEffect(() => {
    if (endIsVisible) {
      updateReadMarker(latestMessage)
    }
  }, [latestMessage.eventId, endIsVisible])

  return (
    <ChatScreenCard
      avatar={avatar}
      displayName={displayName}
      events={events}
      sendMessage={sendMessage}
      onChangeEndVisible={setEndIsVisible}
    />
  )
}

export default ChatScreen

