import MessageType from '../../../constants/MessageType'

import NoticeMessage from './NoticeMessage'
import TextMessage from './TextMessage'
import ImageMessage from './ImageMessage'

const messageComponent = {
  [MessageType.Notice]: NoticeMessage,
  [MessageType.Text]: TextMessage,
  [MessageType.Image]: ImageMessage,
}

export const getMessageComponent = type => messageComponent[type] ?? null
