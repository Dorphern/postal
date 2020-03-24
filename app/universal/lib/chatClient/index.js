import axios from 'axios'
import querystring from 'querystring'
import _orderBy from 'lodash/orderBy'

import { findOptimum } from '../../utils'

const DEFAULT_SERVER = 'https://matrix.org'

const ErrorCode = {
  TooManyRequests: 'M_LIMIT_EXCEEDED',
}

const Action = {
  Login: 'login',
  Sync: 'sync',
}

const matrixRequest = async (
  action,
  { homeserver, accessToken, method = 'GET', data, query } = {},
) => {
  const baseUrl = `https://${homeserver}/_matrix/client/r0/${action}`

  const urlQuery = { ...query }
  if (accessToken != null) {
    urlQuery.access_token = accessToken
  }

  const urlQueryString =
    Object.keys(urlQuery).length > 0
      ? `?${querystring.stringify(urlQuery)}`
      : ''
  const url = baseUrl + urlQueryString

  const res = await axios({ method, url, data, validateStatus: () => true })
  if (res.data.error) {
    const errCode = res.data.errcode
    if (errCode === ErrorCode.TooManyRequests) {
      const againIn = Math.floor(res.data.retry_after_ms / 1000)
      throw new Error(`ServerError: ${res.data.error} try again in ${againIn}s`)
    }
    throw new Error(`ServerError: ${res.data.error}`)
  }

  return res.data
}

const Client = {
  login: async ({ userId, password } = {}) => {
    const [_, user, homeserver] = userId.match(/\@(.+?):(.+)/)

    const data = await matrixRequest(Action.Login, {
      homeserver,
      method: 'POST',
      data: { type: 'm.login.password', user, password },
    })

    if (data.access_token) {
      return {
        homeserver,
        userId,
        user,
        accessToken: data.access_token,
      }
    }

    throw new Error('Authentication Failed')
  },

  fetchRooms: async ({ homeserver, accessToken }) => {
    const filter = JSON.stringify({
      room: {
        timeline: {
          types: [
            'm.room.name',
            'm.room.member',
            'm.room.avatar',
            'm.room.message',
          ],
          limit: 100,
        },
        state: { types: ['m.room.member', 'm.room.name', 'm.room.avatar'] },
      },
    })

    const data = await matrixRequest(Action.Sync, {
      homeserver,
      accessToken,
      query: { filter },
    })

    const roomsById = data.rooms.join

    const rooms = Object.keys(roomsById).map(id => {
      const room = roomsById[id]

      const roomEvents = [...room.state.events, ...room.timeline.events]

      const name = roomNameFromEvents(roomEvents)
      const avatarUrl = roomAvatarFromEvents(roomEvents)
      const members = roomMembersFromEvents(roomEvents)

      const latestMessage = findOptimum(
        room.timeline.events,
        (entry, vs) =>
          entry.type === 'm.room.message' &&
          (vs == null || entry.origin_server_ts > vs.origin_server_ts),
      )

      return {
        id,
        name,
        avatarUrl,
        timeline: room.timeline.events,
        members,
        latestMessage,
        updatedAt:
          latestMessage?.origin_server_ts || roomEvents[0].origin_server_ts,
      }
    })

    const sortedRooms = _orderBy(rooms, r => r.updatedAt, 'desc')

    return sortedRooms
  },

  mediaThumbnailUrl: (auth, url) => {
    const baseUrl = `https://${auth.homeserver}/_matrix/media/r0/thumbnail`

    if (url?.startsWith('mxc://')) {
      const [_, serverName, mediaId] = url.match(/mxc:\/\/(.+?)\/(.+?)\#?/)
      return `${baseUrl}/${serverName}/${mediaId}?width=120&height=120&method=crop`
    }

    return null
  },
}

export default Client

const roomNameFromEvents = events => {
  const nameEvent = events.find(event => event.type === 'm.room.name')
  return nameEvent?.content.name || null
}

const roomAvatarFromEvents = events => {
  const avatarEvent = events.find(event => event.type === 'm.room.avatar')
  return avatarEvent?.content.url || null
}

const roomMembersFromEvents = (events, membership = 'join') => {
  const membersById = {}
  events
    .filter(
      ev => ev.type === 'm.room.member' && ev.content.membership === membership,
    )
    .forEach(
      ({ content: { avatar_url, displayname }, sender, origin_server_ts }) => {
        const info = {
          userId: sender,
          avatarUrl: avatar_url,
          displayName: displayname,
          updatedAt: origin_server_ts,
        }

        if (info.userId in membersById) {
          membersById[info.userId] = {
            ...membersById[info.userId],
            ...info,
          }
        } else {
          membersById[info.userId] = info
        }
      },
    )
  return membersById
}
