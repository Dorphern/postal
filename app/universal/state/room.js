import { RoomInviteState } from '../lib/client'
import Client from '../lib/client'
import { getRoomById, getRoomsState } from './rooms'
import { getContactsById } from './contacts'
import { getAuthState } from './auth'

export const getRoomEvents = roomId => state => {
  const room = getRoomById(roomId)(state)
  return [...room.timeline, ...room.state]
}

export const makeRoomDisplayNameSelector = () => {}

export const getRoomDisplayName = roomId => state => {
  const room = getRoomById(roomId)(state)

  if (room.name != null) {
    return room.name
  }

  const auth = getAuthState(state)

  const members = Object.values(room.members)
  const membersSample = members
    .splice(0, 6)
    // Don't include the auth user
    .filter(member => member.userId !== auth.userId)

  return membersSample.map(m => m.displayName).join(', ')
}

export const getRoomAvatar = roomId => state => {
  const room = getRoomById(roomId)(state)

  if (room.avatar != null) {
    return room.avatar
  }

  // Only use member avatars if it's a direct room
  if (room.isDirect) {
    const auth = getAuthState(state)
    const members = Object.values(room.members)
    const memberAvatarUrls = members
      .filter(m => m.userId !== auth.userId && m.avatarUrl)
      .slice(0, 2)
      .map(m => Client.getMediaThumbnailUrl(m?.avatarUrl))

    if (memberAvatarUrls.length > 0) {
      return memberAvatarUrls
    }
  }

  const roomName = getRoomDisplayName(roomId)(state)
  return getInitials(roomName)
}

export const latestPrivateChatWithUserSelector = (state, userId) => {
  const rooms = Object.values(getRoomsState(state).roomsById)

  let room = null
  rooms.forEach(r => {
    const isPrivateRoomWithUser =
      Object.values(r.members).length === 2 && userId in r.members
    const isJoined = r.inviteState === RoomInviteState.Joined
    if (
      isPrivateRoomWithUser &&
      isJoined &&
      (room == null || room.latestMessage < r.latestMessage)
    ) {
      room = r
    }
  })

  return room?.id
}

export const getEventReadByUserIds = (roomId, eventId) => state => {
  const room = getRoomById(roomId)(state)

  const readByUserId = room.ephemeral?.readByUserId ?? {}
  const userIds = Object.keys(readByUserId).filter(
    userId => readByUserId[userId].eventId === eventId,
  )

  return userIds
}

export const getMemberAvatar = (roomId, userId) => state => {
  if (userId == null || roomId == null) {
    return null
  }

  const members = getRoomMembers(roomId)(state)
  const member = members[userId]

  return getContactAvatar(member)
}

export const selectContactProfile = (state, userId) => {
  const contact = getContactsById(state)[userId]
  return getContactProfile(contact)
}

export const selectContactAvatar = (state, userId) => {
  const contact = getContactsById(state)[userId]
  return getContactAvatar(contact)
}

export const getContactProfile = contact => {
  if (contact) {
    return {
      displayName: getContactDisplayName(contact),
      avatar: getContactAvatar(contact),
    }
  }
  return null
}

export const getContactAvatar = contact => {
  if (contact?.avatarUrl != null) {
    return [Client.getMediaThumbnailUrl(contact.avatarUrl)]
  }

  const displayName = getContactDisplayName(contact)

  return getInitials(displayName)
}

export const getContactDisplayName = contact =>
  contact?.displayName ?? contact?.userId ?? 'Unkown'

export const getInitials = name => {
  const strippedName = name.replace(/[#\-\_@]/g, ' ').trim()
  const match = strippedName.match(/^([^\s\\]).*?([^\s\\])?[^\s\\]*$/i)
  if (match != null) {
    return match.slice(1, 3).join('')
  }
  return null
}

export const getRoomLatestMessage = roomId => state => {
  const latestMessage = getRoomById(roomId)(state)?.latestMessage
  if (latestMessage != null) {
    const room = getRoomById(roomId)(state)
    const auth = getAuthState(state)

    const sender = room.members[latestMessage.sender]
    return {
      ...latestMessage,
      senderDisplayName:
        sender?.userId === auth.userId
          ? 'You'
          : sender?.displayName ?? 'Unknown',
    }
  }
}

export const selectIsReadByAuth = (state, roomId) => {
  const room = getRoomById(roomId)(state)
  const auth = getAuthState(state)
  const latestMessage = room?.latestMessage
  const authReadEvent = room.ephemeral?.readByUserId[auth.userId]

  if (
    latestMessage == null ||
    latestMessage.sender === auth.userId ||
    authReadEvent?.eventId === latestMessage.eventId
  ) {
    return true
  }

  return authReadEvent?.readAt >= latestMessage.serverTimestamp
}

export const getRoomMembers = roomId => state => {
  return getRoomById(roomId)(state)?.members || {}
}
