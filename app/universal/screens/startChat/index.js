import React, { useState } from 'react'
import { useRoute } from '@react-navigation/native'
import { useStore, useDispatch } from 'react-redux'

import { latestPrivateChatWithUserSelector } from '../../state/room'
import { fetchNextTransactionId } from '../../state/auth'

import { useAuthId } from '../../lib/useAuth'
import Client from '../../lib/client'

import { ChatProvider } from '../chat/ChatContext'

import ChatScreen from '../chat/ChatScreen'
import ChatScreenCard from '../chat/ChatScreenCard'
import { sendChatMessage, getMessageEvent } from '../chat/useTimeline'

import { useProfile } from './useProfile'

const StartChatScreen = () => {
  const dispatch = useDispatch()
  const store = useStore()
  const authId = useAuthId()
  const { params } = useRoute()
  const { userId } = params
  const [isCreating, setIsCreating] = useState(false)
  const [tempEvent, setTempEvent] = useState(null)
  const [roomId, setRoomId] = useState(null)

  const profile = useProfile(userId)

  const startChat = async message => {
    setIsCreating(true)

    try {
      let newRoomId = latestPrivateChatWithUserSelector(
        store.getState(),
        userId,
      )

      if (newRoomId == null) {
        // As we don't have a current room, we create a temp message event
        // so the user percieves the message as being sent
        const tempEvent = getMessageEvent({
          sender: authId,
          roomId: null,
          ...message,
        })
        setTempEvent(tempEvent)

        const inviteUserIds = [userId]
        const { roomId } = await Client.createPrivateRoom({ inviteUserIds })
        newRoomId = roomId
      }

      // Send message
      const transactionId = await dispatch(fetchNextTransactionId())

      sendChatMessage({
        ...message,
        sender: authId,
        roomId: newRoomId,
        transactionId,
      })

      setRoomId(newRoomId)
      setIsCreating(false)
    } catch (error) {
      console.log('error', error)
      setIsCreating(false)
    }
  }

  return (
    <ChatProvider roomId={roomId}>
      {roomId != null ? (
        <ChatScreen />
      ) : (
        <ChatScreenCard
          events={tempEvent ? [tempEvent] : []}
          displayName={profile?.displayName}
          avatar={profile?.avatar}
          statusMessage="New Message"
          sendMessage={startChat}
          disableSend={isCreating}
        />
      )}
    </ChatProvider>
  )
}

export default StartChatScreen

