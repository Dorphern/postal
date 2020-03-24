import React from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import styled from 'styled-components/native'
import { useNavigation } from '@react-navigation/native'

import {
  getRoomDisplayName,
  getRoomAvatar,
  selectIsReadByAuth,
} from '../../state/room'

import Avatar from '../../components/Avatar'
import { useLatestMessage } from '../../hooks/useLatestMessage'

import LatestMessage from './LatestMessage'

const ChatPreview = ({ roomId }) => {
  const navigation = useNavigation()

  const displayName = useSelector(getRoomDisplayName(roomId))
  const avatar = useSelector(getRoomAvatar(roomId), shallowEqual)
  const latestMessage = useLatestMessage(roomId)
  const isRead = useSelector(state => selectIsReadByAuth(state, roomId))

  const navigateToChat = () => navigation.push('Chat', { roomId })

  return (
    <Container onPress={navigateToChat}>
      <Avatar avatar={avatar} size={50} />
      <Summary>
        <Name>{displayName}</Name>
        <LatestMessage latestMessage={latestMessage} unread={!isRead} />
      </Summary>
    </Container>
  )
}

export default ChatPreview

// Styles
// ==========================
const Container = styled.TouchableOpacity`
  padding-vertical: 8px;
  padding-horizontal: 16px;
  flex-direction: row;
  align-items: center;
`

const Summary = styled.View`
  flex: 1;
  padding-left: 10px;
`

const Name = styled.Text.attrs({
  numberOfLines: 1,
  ellipsizeMode: 'tail',
})`
  font-size: 14px;
  font-weight: bold;
  color: ${p => p.theme.colors.fg};
`
