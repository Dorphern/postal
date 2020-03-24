import React from 'react'

import { useChatContext } from './ChatContext'
import TimelineEntrySeperator, { SHORT_TIME } from './TimelineEntrySeperator'
import ReadBy from './ReadBy'
import Message from './Message'

const TimelineEntry = React.memo(({ event, prevEvent, nextEvent }) => {
  const { roomId } = useChatContext()
  let entry = null

  const shortTimeAgo =
    (event.serverTimestamp - prevEvent?.serverTimestamp || 0) <= SHORT_TIME
  const nextSameSender = nextEvent?.sender === event.sender && shortTimeAgo

  switch (event.type) {
    case Event.Message: {
      entry = (
        <Message
          key={event.id}
          sender={event.sender}
          content={event.content}
          nextSameSender={nextSameSender}
        />
      )
      break
    }
    default:
      entry = (
        <MessageContainer key={event.id}>
          <MessageText children="Unsupported Content" sent={false} />
        </MessageContainer>
      )
  }

  if (entry != null) {
    const readElement =
      nextEvent == null && roomId != null && event.eventId ? (
        <ReadBy
          key={`${event.id}-read`}
          roomId={roomId}
          eventId={event.eventId}
          eventSender={event.sender}
        />
      ) : null

    return [
      readElement,
      entry,
      <TimelineEntrySeperator
        key={`${event.id}-seperator`}
        event={event}
        prevEvent={prevEvent}
      />,
    ]
  }

  return null
})

export default TimelineEntry

TimelineEntry.whyDidYouRender = true

const Event = {
  MemberMembership: 'm.room.member', //  Membership
  Message: 'm.room.message',
  RomName: 'm.room.name',
  RoomAvatar: ' m.room.avatar',
  CallInvite: 'm.call.invite',
}

