import React from 'react'
import styled from 'styled-components/native'
import { View } from 'react-native'
import { useSelector, shallowEqual } from 'react-redux'

import Avatar from '../../components/Avatar'

import { useAuthId } from '../../lib/useAuth'
import { selectContactAvatar } from '../../state/room'

import { getMessageComponent } from './messageComponents'
import NoticeMessage from './messageComponents/NoticeMessage'

const Message = ({ sender, content, nextSameSender }) => {
  const authId = useAuthId()
  const senderAvatar = useSelector(
    state => selectContactAvatar(state, sender),
    shallowEqual,
  )

  const wasSent = sender === authId

  const MessageComponent = getMessageComponent(content.msgtype)

  return (
    <MessageContainer sent={wasSent}>
      {!wasSent && (
        <SenderAvatar avatar={nextSameSender ? null : senderAvatar} />
      )}
      {MessageComponent == null ? (
        <NoticeMessage content={{ body: 'Unsupported Content' }} />
      ) : (
        <MessageComponent content={content} wasSent={wasSent} />
      )}
    </MessageContainer>
  )
}

export default Message

Message.whyDidYouRender = true

// Styles
// ==========================
export const MessageContainer = styled(({ sent, ...props }) => (
  <View {...props} />
))`
  flex-direction: row;
  align-items: flex-end;
  justify-content: ${p => (p.sent ? 'flex-end' : 'flex-start')};
  margin-horizontal: 16px;
  min-height: 30px;
`

const SenderAvatar = props => (
  <Avatar size={30} style={{ marginRight: 4 }} {...props} />
)
