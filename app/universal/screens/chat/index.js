import React from 'react'
import { useRoute } from '@react-navigation/native'

import { ChatProvider } from './ChatContext'
import ChatScreen from './ChatScreen'

const ChatIndex = () => {
  const { params } = useRoute()
  const { roomId } = params

  return (
    <ChatProvider roomId={roomId}>
      <ChatScreen />
    </ChatProvider>
  )
}

export default ChatIndex
