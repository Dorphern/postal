import React, { useState } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import styled from 'styled-components/native'

import { TouchableWithoutFeedback } from 'react-native'

const NewChatButton = ({ onPress }) => {
  const [isDown, setIsDown] = useState(false)

  const pressIn = () => setIsDown(true)
  const pressOut = () => setIsDown(false)

  return (
    <TouchableWithoutFeedback
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}
    >
      <Container isDown={isDown}>
        <NewChatIcon />
      </Container>
    </TouchableWithoutFeedback>
  )
}

export default NewChatButton

const NewChatIcon = () => (
  <MaterialIcons name="edit" size={24} color="#585265" />
)

const Container = styled.View`
  background-color: ${p => (p.isDown ? '#b6b2b8' : '#f0eff0')};
  border-radius: 10px;
  height: 40px;
  width: 40px;
  justify-content: center;
  align-items: center;
`
