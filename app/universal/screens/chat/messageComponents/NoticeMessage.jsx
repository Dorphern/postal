import React from 'react'
import styled from 'styled-components/native'

import { MessageText } from './TextMessage'

const NoticeMessage = ({ content }) => {
  return <Text text={content.body} />
}

export default NoticeMessage

// Styles
// ==========================

const Text = styled(MessageText)`
  color: ${p => p.theme.colors.mutedFg};
  font-style: italic;
  align-self: center;
`
