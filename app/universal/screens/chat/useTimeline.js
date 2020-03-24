import { useState, useEffect } from 'react'
import _orderBy from 'lodash/orderBy'
import { useDispatch } from 'react-redux'

import { guid } from '../../lib/guid'

import { useQuery } from '../../lib/storage'
import { useAuthId } from '../../lib/useAuth'

import { createTransaction } from '../../lib/storage'
import Client from '../../lib/client'

import { fetchNextTransactionId } from '../../state/auth'

export const useTimeline = roomId => {
  const dispatch = useDispatch()
  const authId = useAuthId()
  const [events, setEvents] = useState([])
  const [tempEvents, setTempEvents] = useState([])

  const queryEvents = useQuery(
    `SELECT * FROM events WHERE roomId = ? ORDER BY serverTimestamp DESC LIMIT 30`,
    [roomId],
  )

  useEffect(() => {
    const { events: timelineEvents } = getTimelineEvents(
      queryEvents,
      tempEvents,
    )
    if (timelineEvents.length > 0) {
      setEvents(timelineEvents)
    }
  }, [queryEvents])

  const sendMessage = async opts => {
    const transactionId = await dispatch(fetchNextTransactionId())

    const messageEvent = sendChatMessage({
      roomId,
      sender: authId,
      transactionId,
      ...opts,
    })

    const {
      events: timelineEvents,
      tempEvents: newTempEvents,
    } = getTimelineEvents(queryEvents, [messageEvent, ...tempEvents])
    setEvents(timelineEvents)
    setTempEvents(newTempEvents)
  }

  const updateReadMarker = message => {
    if (message.sender !== authId) {
      Client.updateReadMarker({ roomId, eventId: message.eventId })
    }
  }

  return {
    events,
    sendMessage,
    updateReadMarker,
  }
}

export const sendChatMessage = ({ transactionId, ...opts }) => {
  const messageEvent = getMessageEvent(opts)
  sendMessageEvent({ messageEvent, transactionId })
  return messageEvent
}

const getTimelineEvents = (queryEvents, tempEvents) => {
  const tempEventIds = tempEvents.map(e => e.id)

  const removeTempIds = queryEvents
    .map(e => e.id)
    .filter(id => tempEventIds.includes(id))

  const prunedTempEvents = tempEvents.filter(e => !removeTempIds.includes(e.id))

  const timelineEvents = [...prunedTempEvents, ...queryEvents].filter(
    isTimelineEvent,
  )

  return {
    events: _orderBy(timelineEvents, 'serverTimestamp', 'desc'),
    tempEvents: prunedTempEvents,
  }
}

const isTimelineEvent = event => ['m.room.message'].includes(event.type)

export const getMessageEvent = ({ sender, roomId, type, body }) => {
  return {
    id: guid(),
    roomId,
    sender,
    type: 'm.room.message',
    serverTimestamp: Date.now(),
    content: { body, msgtype: type },
  }
}

const sendMessageEvent = async ({ messageEvent, transactionId }) => {
  try {
    let localEventId = null
    await createTransaction(({ insert }) => {
      insert('events', messageEvent).then(id => {
        localEventId = id
      })
    })
    Client.sendMessage({
      roomId: messageEvent.roomId,
      type: messageEvent.content.msgtype,
      body: messageEvent.content.body,
      transactionId,
    })
      .then(({ eventId }) =>
        createTransaction(({ query, update }) => {
          update('events', { eventId }, localEventId)
        }),
      )
      .catch(error => {
        console.log('error', error)
      })
  } catch (error) {
    console.log('error', error)
  }
}
