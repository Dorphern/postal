import React, { useMemo } from 'react'
import styled from 'styled-components/native'
import { useNavigation } from '@react-navigation/native'

import {
  ScreenCard,
  ScreenFooter,
  ScreenHeader,
  BackIcon,
  ScreenHeaderCopy,
} from '../../components/Screen'

import Avatar from '../../components/Avatar'

import Timeline from './Timeline'
import ChatInput from './ChatInput'

const ChatScreenCard = ({
  avatar,
  displayName,
  statusMessage,
  events,
  sendMessage,
  disableSend,
  onChangeEndVisible,
}) => {
  const navigation = useNavigation()
  const navigateBack = useMemo(() => () => navigation.goBack(), [])

  return (
    <ScreenCard>
      <ScreenHeader leftIcon={<BackIcon onPress={navigateBack} />}>
        <Avatar avatar={avatar} />
        <RoomProfile>
          <RoomName>{displayName}</RoomName>
          {statusMessage && <ProfileStatus>{statusMessage}</ProfileStatus>}
        </RoomProfile>
      </ScreenHeader>
      <Timeline events={events} onChangeEndVisible={onChangeEndVisible} />
      <ScreenFooter>
        <ChatInput sendMessage={sendMessage} disabled={disableSend} />
      </ScreenFooter>
    </ScreenCard>
  )
}

export default ChatScreenCard

const RoomName = styled(ScreenHeaderCopy)`
  font-weight: normal;
`

const RoomProfile = styled.View`
  margin-left: 10px;
`

const ProfileStatus = styled.Text`
  color: #8f8f8f;
  font-size: 12px;
`
