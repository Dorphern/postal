import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components/native'
import { View, Text } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import reactStringReplace from 'react-string-replace'

const TextMessage = ({ content, wasSent }) => {
  const body = trim(content.body)
  const isEmoji = getIsEmojiMessage(body)

  if (isEmoji) {
    return <EmojiMessage children={body} />
  }

  return (
    <MessageBubble sent={wasSent}>
      <MessageText text={body} sent={wasSent} />
    </MessageBubble>
  )
}

export default TextMessage

// Styles
// ==========================
const EmojiMessage = styled.Text`
  font-size: 40px;
`

const MessageBubble = styled(({ sent, ...props }) => <View {...props} />)`
  max-width: 80%;
  background-color: ${p =>
    p.sent ? p.theme.colors.sentMessageBg : p.theme.colors.messageBg};
  border-radius: 6px;
  padding: 8px 12px;
  align-self: center;
`

export const MessageText = styled(
  React.memo(({ sent, text, ...props }) => {
    const theme = useContext(ThemeContext)

    const gotoHyperlink = url => () =>
      WebBrowser.openBrowserAsync(url, {
        toolbarColor: theme.colors.cardBg,
      })
    const replacedText = reactStringReplace(
      text,
      /(https?:\/\/\S+)/g,
      (match, i) => (
        <Link key={match + i} onPress={gotoHyperlink(match)}>
          {match}
        </Link>
      ),
    )

    return (
      <Text textBreakStrategy="simple" {...props}>
        {replacedText}
      </Text>
    )
  }),
)`
  color: ${p =>
    p.sent ? p.theme.colors.sentMessageFg : p.theme.colors.messageFg};
  font-size: 15px;
  line-height: 20px;
`

const Link = styled.Text`
  text-decoration-line: underline;
`

// Utils
// ==========================
const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g
const getIsEmojiMessage = message => {
  return message.replace(emojiRegex, '').length === 0 && message.length > 0
}

const trim = message => message.replace(/^\s+|\s+$/g, '')

