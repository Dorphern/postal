import React, { useEffect, useState } from 'react'
import styled from 'styled-components/native'
import { useNavigation } from '@react-navigation/native'

import Client from '../../lib/client'

import { getContactAvatar, getContactDisplayName } from '../../state/room'

import Avatar from '../../components/Avatar'

const SearchResultItem = React.memo(({ contact }) => {
  const navigation = useNavigation()
  const [fetchedProfile, setFetchedProfile] = useState(null)

  useEffect(() => {
    if (contact.isNew) {
      Client.fetchProfile(contact.userId)
        .then(setFetchedProfile)
        .catch(err => setFetchedProfile(null))
    } else {
      setFetchedProfile(null)
    }
  }, [contact.userId, contact.isNew])

  const displayName = getContactDisplayName(fetchedProfile ?? contact)
  const avatar = getContactAvatar(fetchedProfile ?? contact)

  const navigateToChat = () => {
    navigation.replace('StartChat', { userId: contact.userId })
  }

  return (
    <Container onPress={navigateToChat}>
      <Avatar avatar={avatar} size={40} />
      <Summary>
        <Name>{displayName}</Name>
        <UserId>{contact.userId}</UserId>
      </Summary>
    </Container>
  )
})

export default SearchResultItem

// Styles
// ==========================
const Container = styled.TouchableOpacity`
  padding-vertical: 8px;
  padding-horizontal: 16px;
  flex-direction: row;
  align-items: center;
`

const Summary = styled.View`
  padding-left: 8px;
`

const Name = styled.Text.attrs({
  numberOfLines: 1,
  ellipsizeMode: 'tail',
})`
  font-size: 15px;
  font-weight: bold;
  color: ${p => p.theme.colors.fg};
`

const UserId = styled.Text.attrs({
  numberOfLines: 1,
  ellipsizeMode: 'tail',
})`
  color: ${p => p.theme.colors.mutedFg};
  font-size: 12px;
  font-weight: normal;
`
