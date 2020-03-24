import React, { useMemo } from 'react'
import styled from 'styled-components'
import { MaterialIcons } from '@expo/vector-icons'
import { useSelector, shallowEqual } from 'react-redux'
import { useNavigation } from '@react-navigation/native'

import { selectJoinedRoomIds } from '../../state/rooms'
import { ScreenCard, ScreenFooter, ScreenHeader } from '../../components/Screen'
import FlatList from '../../components/FlatList'
import Button from '../../components/Button'

import NewChatButton from './NewChatButton'
import ChatPreview from './ChatPreview'

const ChatsScreen = () => {
  const navigation = useNavigation()
  const gotoNewChat = useMemo(() => () => navigation.push('NewChat'), [])

  const roomIds = useSelector(selectJoinedRoomIds, shallowEqual)

  return (
    <ScreenCard>
      <ScreenHeader title="Chats" />
      <FlatList
        data={roomIds}
        inverted
        keyExtractor={(roomId, i) => roomId}
        renderItem={({ item: roomId }) => <ChatPreview roomId={roomId} />}
      />
      <ScreenFooter style={{ justifyContent: 'flex-end' }}>
        {/* <SearchBar /> */}
        <Button
          icon={props => <MaterialIcons name="edit" {...props} />}
          onPress={gotoNewChat}
        />
      </ScreenFooter>
    </ScreenCard>
  )
}

export default ChatsScreen

const EditIcon = () => {
  ;<MaterialIcons name="edit" size={24} color="#585265" />
}
