import React from 'react'
import styled from 'styled-components/native'
import { useSelector } from 'react-redux'

import { getAuthState } from '../../state/auth'

const Membership = {
  Joined: 'join',
  Invited: 'invite',
  Knocked: 'knock',
  Left: 'leave',
  Banned: 'ban',
}

const MessageType = {
  Text: 'm.text',
  Emote: 'm.emote',
  Notice: 'm.notice',
  Image: ' m.image',
  File: 'm.file',
  Audio: 'm.audio',
  Video: 'm.video',
  Location: 'm.location',
}

const Event = {
  MemberMembership: 'm.room.member', //  Membership
  Message: 'm.room.message',
  RomName: 'm.room.name',
  RoomAvatar: ' m.room.avatar',
  CallInvite: 'm.call.invite',
}

const TimelineEntry = ({ event }) => {
  switch (event.type) {
    case Event.Message: {
      return (
        <SentMessage>
          <SentMessageText>
            {event.content.}
          </SentMessageText>
        </SentMessage>
      )
    }

    default:
      return null
  }

  return null
}

export default EventMessage

const SentMessage = styled.View`
  background-color: #d6d2e6;
  border-radius: 6px;
  padding: 8px 12px;
`

const SentMessageText = styled.Text`
  color: #554691;
`

const MessageReceived = styled.View``

// Styles
// ==========================
