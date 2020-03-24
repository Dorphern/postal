import querystring from 'querystring'

import { Action } from './actions'
import { getMatrixRequestError } from './errors'

const RoomPreset = {
  Private: 'private_chat',
  TrustedPrivate: 'trusted_private_chat',
  Public: 'public_chat',
}

export const createHomeserver = ({
  homeserverUrl,
  userId: authId,
  accessToken,
}) => {
  const request = async (action, { data, query } = {}) => {
    const { path, method } = action
    return homeserverRequest(path, {
      homeserverUrl,
      accessToken,
      method,
      data,
      query,
    })
  }

  const login = async ({ user, password }) => {
    const data = await request(Action.Login, {
      data: { type: 'm.login.password', user, password },
    })

    if (data.access_token) {
      return {
        homeserverUrl,
        user,
        accessToken: data.access_token,
      }
    }

    throw new Error('Authentication Failed')
  }

  const sync = async (since = null, timeout = 0) => {
    const query = { filter: JSON.stringify(SYNC_FILTER) }

    if (since != null) {
      query.since = String(since)
    }
    if (timeout) {
      query.timeout = timeout
    }

    const data = await request(Action.Sync, { query })

    return {
      accountData: data.account_data,
      rooms: data.rooms,
      cursor: data.next_batch,
    }
  }

  const sendEvent = async ({ roomId, txnId, type, data }) => {
    const path = `rooms/${roomId}/send/${type}/${txnId}`
    const res = await request({ path, method: 'PUT' }, { data })
    return { eventId: res.event_id }
  }

  const fetchProfile = async ({ userId }) => {
    const res = await request(Action.FetchProfile({ userId }))
    return { userId, displayName: res.displayname, avatarUrl: res.avatar_url }
  }

  const sendMessage = async ({ type, body, ...rest }) =>
    sendEvent({
      ...rest,
      type: 'm.room.message',
      data: {
        msgtype: type,
        body,
      },
    })

  const createPrivateRoom = async ({ inviteUserIds }) => {
    const data = {
      preset: RoomPreset.TrustedPrivate,
      invite: inviteUserIds,
      is_direct: true,
    }
    const { room_id: roomId } = await request(Action.CreateRoom, { data })
    await storeDirectRoom({ userIds: inviteUserIds, roomId })

    return { roomId }
  }

  const storeDirectRoom = async ({ roomId, userIds }) => {
    const direct = await request(Action.FetcDirect({ authId }))
    const data = direct

    userIds.forEach(id => {
      if (id in data) {
        data[id].push(roomId)
      } else {
        data[id] = [roomId]
      }
    })

    await request(Action.UpdateDirect({ authId }), { data })
  }

  const updateReadMarker = async ({ roomId, eventId }) => {
    // TODO: Implement retry on fail with rate limiting and try again after x ms
    await request(Action.UpdateReadMarker({ roomId, eventId }))
  }

  const getMediaThumbnailUrl = (
    url,
    opts = { width: 120, height: 120, method: 'crop' },
  ) => {
    const baseUrl = `${homeserverUrl}/_matrix/media/r0/thumbnail`

    if (url?.startsWith('mxc://')) {
      const [_, serverName, mediaId] = url.match(/mxc:\/\/(.+?)\/([^#]+)/)
      const query = querystring.stringify(opts)
      return `${baseUrl}/${serverName}/${mediaId}?${query}`
    }

    return null
  }

  return {
    authId,
    getMediaThumbnailUrl,
    request,
    login,
    sync,
    createPrivateRoom,
    updateReadMarker,
    fetchProfile,
    sendEvent,
    sendMessage,
  }
}

export const homeserverRequest = async (
  path,
  { homeserverUrl, accessToken, method = 'GET', data, query } = {},
) => {
  const baseUrl = `${homeserverUrl}/_matrix/client/r0/${path}`

  const urlQuery = { ...query }
  if (accessToken != null) {
    urlQuery.access_token = accessToken
  }

  const urlQueryString =
    Object.keys(urlQuery).length > 0
      ? `?${querystring.stringify(urlQuery)}`
      : ''
  const url = baseUrl + urlQueryString

  const fetchRes = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: data != null ? JSON.stringify(data) : null,
  })

  const resJson = await fetchRes.json()

  if (fetchRes.ok) {
    return resJson
  } else {
    const error = getMatrixRequestError(resJson)
    throw error
  }

  /*
    const res = await axios({
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      },
      url,
      data,
      validateStatus: () => true,
    })
    console.log('axioos res')
    if (res.data.error) {
      const errCode = res.data.errcode
      if (errCode === ErrorCode.TooManyRequests) {
        const againIn = Math.floor(res.data.retry_after_ms / 1000)
        throw new Error(
          `ServerError: ${res.data.error} try again in ${againIn}s`,
        )
      }
      throw new Error(`ServerError: ${res.data.error}`)
    }
    return res.data
    */
  //return fetchRes
}

const SYNC_FILTER = {
  room: {
    timeline: {
      types: [
        'm.room.name',
        'm.room.member',
        'm.room.avatar',
        'm.room.message',
      ],
      limit: 50,
    },
    state: {
      limit: 50,
      types: ['m.room.member', 'm.room.name', 'm.room.avatar'],
      lazy_load_members: true,
    },
  },
}
