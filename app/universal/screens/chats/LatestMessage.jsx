import React from 'react'
import styled from 'styled-components/native'
import { shortRelativeFormat } from '../../lib/prettyTime'

const LatestMessage = ({ latestMessage, unread }) => {
  return (
    <Container>
      <Text unread={unread}>
        {latestMessage != null
          ? latestMessage?.senderDisplayName + ': ' + latestMessage.content.body
          : 'Say hi!'}
      </Text>
      {latestMessage?.serverTimestamp != null && (
        <Time>{shortRelativeFormat(latestMessage.serverTimestamp)}</Time>
      )}
    </Container>
  )
}

export default LatestMessage

LatestMessage.whyDidYouRender = true

// Styles
// ==========================
const Container = styled.View`
  flex-direction: row;
  align-items: center;
`

const Text = styled.Text.attrs({
  numberOfLines: 1,
  ellipsizeMode: 'tail',
})`
  font-size: 14px;
  line-height: 18px;
  font-weight: ${p => (p.unread ? 'bold' : 'normal')};
  color: ${p => (p.unread ? p.theme.colors.fg : p.theme.colors.mutedFg)};
  flex: 1;
`

const Time = styled.Text`
  font-size: 12px;
  font-weight: normal;
  color: ${p => p.theme.colors.mutedFg};
  margin-left: 10px;
`
