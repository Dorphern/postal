import _orderBy from 'lodash/orderBy'
import _set from 'lodash/set'

import Client, { RoomInviteState } from './client'

// TODO: Handle a user leaving a room

export const formatSyncData = data => {
  const cursor = data.cursor

  const rooms = {}
  const events = []

  Object.keys(data.rooms).forEach(inviteState => {
    const roomsById = data.rooms[inviteState]

    Object.keys(roomsById).forEach(id => {
      const { timeline, state, ephemeral } = roomsById[id]
      const ephemeralEvents = ephemeral?.events || []

      const sortedEvents = pruneAndFormatEvents(id, [
        ...timeline.events,
        ...state.events,
      ])
      const roomChanges = getRoomChanges({ sortedEvents, ephemeralEvents })

      rooms[id] = {
        id,
        inviteState,
        ...roomChanges,
      }

      events.push(...sortedEvents)
    })
  })

  const contacts = {}
  Object.values(rooms).forEach(room => {
    Object.values(room.members ?? {}).forEach(member => {
      contacts[member.userId] = member
    })
  })

  // Set rooms and contacts direct
  const directEvent = data.accountData?.events.find(e => e.type === 'm.direct')
  if (directEvent != null) {
    const roomIds = Object.values(directEvent.content).flat()
    roomIds.forEach(roomId => {
      _set(rooms, [roomId, 'isDirect'], true)
    })

    const contactIds = Object.keys(directEvent.content)
    contactIds.forEach(userId => {
      _set(contacts, [userId, 'isDirect'], true)
    })
  }

  const result = {
    cursor,
    rooms,
    events,
    contacts,
  }

  return result
}

const pruneAndFormatEvents = (roomId, events) => {
  const formattedEvents = events.map(formatEvent(roomId))

  return _orderBy(formattedEvents, 'serverTimestamp', 'desc')
}

export const formatEvent = roomId => event => {
  const {
    event_id: eventId,
    content,
    sender,
    type,
    origin_server_ts,
    ...value
  } = event
  return {
    eventId,
    sender,
    roomId,
    type,
    serverTimestamp: origin_server_ts,
    content,
    value,
  }
}

const getRoomChanges = ({ ephemeralEvents, sortedEvents }) => {
  const members = getMembers({ sortedEvents, ephemeralEvents })
  const avatar = getAvatar(sortedEvents)
  const latestMessage = getLatestMessage(sortedEvents)
  const name = getName(sortedEvents)
  const ephemeral = getEphemeral(ephemeralEvents)

  return {
    name,
    members,
    avatar,
    latestMessage,
    ephemeral,
  }
}

const getEphemeral = ephemeralEvents => {
  const ephemeral = {}
  const typingEvent = ephemeralEvents.find(e => e.type === 'm.typing')

  if (typingEvent != null) {
    ephemeral.typingUserIds = typingEvent?.content.user_ids
  }

  const receiptEvent = ephemeralEvents.find(e => e.type === 'm.receipt')
  if (receiptEvent != null) {
    ephemeral.readByUserId = {}
    const eventIds = Object.keys(receiptEvent.content)

    eventIds.forEach(eventId => {
      const readByUserId = receiptEvent.content[eventId]['m.read']
      Object.keys(readByUserId).forEach(userId => {
        ephemeral.readByUserId[userId] = {
          eventId,
          readAt: readByUserId[userId].ts,
        }
      })
    })
  }

  return ephemeral
}

export const getAvatar = sortedEvents => {
  const avatarEvent = sortedEvents.find(e => e.type === 'm.room.avatar')
  const avatarUrl = avatarEvent?.content.url

  if (avatarUrl != null) {
    return [Client.getMediaThumbnailUrl(avatarUrl)]
  }

  return undefined
}

export const getLatestMessage = sortedEvents => {
  const latestMessage = sortedEvents.find(e => e.type === 'm.room.message')

  if (latestMessage != null) {
    const { eventId, serverTimestamp, content, sender } = latestMessage
    return { eventId, serverTimestamp, content, sender }
  }

  return undefined
}

export const getName = sortedEvents => {
  const nameEvent = sortedEvents.find(e => e.type === 'm.room.name')

  const roomName = nameEvent?.content.name
  if (roomName != null) {
    return roomName
  }

  return undefined
}

const getMembers = ({ sortedEvents }) => {
  const allowedMemberships = [RoomInviteState.Joined, RoomInviteState.Invited]
  const membersById = {}
  sortedEvents
    .filter(
      ev =>
        ev.type === 'm.room.member' &&
        allowedMemberships.includes(ev.content.membership),
    )
    .forEach(
      ({
        content: { avatar_url, displayname },
        serverTimestamp,
        value: { state_key: userId },
      }) => {
        const info = {
          userId,
          avatarUrl: avatar_url,
          displayName: displayname ?? userId,
          updatedAt: serverTimestamp,
        }

        if (info.userId in membersById) {
          membersById[info.userId] = {
            ...info,
            ...membersById[info.userId],
          }
        } else {
          membersById[info.userId] = info
        }
      },
    )

  return membersById
}
