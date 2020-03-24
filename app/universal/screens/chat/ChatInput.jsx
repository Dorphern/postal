import React, { useState } from 'react'
import styled from 'styled-components/native'
import { View, TouchableWithoutFeedback, Animated, Easing } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import TextInput from '../../components/TextInput'

const ChatInput = ({ sendMessage, disabled }) => {
  const [chatInput, setChatInput] = useState('')
  const [hideSend, setHideSend] = useState(false)

  const trimmedMessage = trim(chatInput)
  const hasInput = trimmedMessage.length > 0

  const send = async () => {
    sendMessage({
      type: 'm.text',
      body: trimmedMessage,
    })
    setHideSend(true)

    setChatInput('')
  }

  const changeInput = value => {
    setChatInput(value)
    setHideSend(false)
  }

  const showSendIcon = !hideSend && !disabled

  return (
    <TextInput
      value={chatInput}
      onChangeText={changeInput}
      placeholder="Type a message..."
      multiline
      style={textInputStyle}
      postIcon={showSendIcon && <SendIcon onPress={send} show={hasInput} />}
      textBreakStrategy="simple"
      disabled={disabled}
    />
  )
}
const textInputStyle = { flex: 1 }

export default ChatInput

const SendIcon = React.memo(styled(({ onPress, style, show }) => {
  const [fadeAnim] = useState(new Animated.Value(0))

  React.useEffect(() => {
    const animation = show
      ? {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.poly(3)),
        }
      : {
          toValue: 0,
          duration: 100,
          easing: Easing.in(Easing.poly(3)),
        }

    Animated.timing(fadeAnim, animation).start()
  }, [show])

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={style}>
        <Animated.View
          style={{
            transform: [{ scale: fadeAnim || 0 }],
            opacity: fadeAnim,
          }}
        >
          <MaterialSendIcon />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  )
})`
  align-self: stretch;
  align-items: center;
  justify-content: center;
  padding-right: 12px;
  padding-left: 12px;
`)

const MaterialSendIcon = props => (
  <MaterialCommunityIcons name="send" size={24} color="#554691" {...props} />
)

const trim = message => message.replace(/^\s+|\s+$/g, '')
