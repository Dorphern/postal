import { Expo } from 'expo-server-sdk'
import { iosAppId, androidAppId } from '../config.js'

const expo = new Expo()

export default async (req, res) => {
  if (req.method.toLowerCase() !== 'post') {
    res.status(404).end()
    return
  }

  const rejected = []
  const messages = messagesFromBody(req.body).filter(({ to }) => {
    if (!isValidPushToken(to)) {
      rejected.push(to)
      return false
    }

    return true
  })

  console.log(messages)

  const sendRejects = await sendMessages(messages)

  res.json([...rejected, ...sendRejects])
}

const messagesFromBody = ({ notification }) => {
  const {
    roomId,
    type,
    eventId,
    room_name: roomName,
    sender_display_name: senderDisplayName,
  } = notification

  if (type !== 'm.room.message') {
    return []
  }

  const devices = notification.devices.filter(matchesDeviceId)

  const body = getMessageBody(notification.content || {})

  if (body == null) {
    return []
  }

  const priority = notification === 'low' ? 'normal' : 'high'

  return devices.map(({ pushkey, tweaks }) => ({
    ttl: 3600 * 2, // Keep the notification alive for 2 hours if not delivered
    to: pushkey,
    sound: (tweaks && tweaks.sound) || 'default',
    priority,
    title: roomName || roomId,
    subtitle: senderDisplayName || 'New message',
    body,
    channelId: 'messages', // use default
    data: { roomId, eventId },
    _displayInForeground,
  }))
}

const matchesDeviceId = (device) =>
  [iosAppId, androidAppId].includes(device.app_id)

const isValidPushToken = (pushToken) => Expo.isExpoPushToken(pushToken)

const getMessageBody = ({ msgtype, body }) => {
  if (['m.text', 'm.notice', 'm.emot'].includes(msgtype)) {
    return body
  }

  if (msgtype === 'm.image') {
    return 'Sent an image.'
  }

  if (msgtype === 'm.file') {
    return 'Sent an file.'
  }

  if (msgtype === 'm.audio') {
    return 'Sent an audio clip.'
  }

  if (msgtype === 'm.video') {
    return 'Sent a video.'
  }

  return 'Sent a message'
}

const sendMessages = async (messages) => {
  const chunks = expo.chunkPushNotifications(messages)
  const tickets = []
  const rejected = []
  for (let chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
      console.log(ticketChunk)
      tickets.push(...ticketChunk)
      // NOTE: If a ticket contains an error code in ticket.details.error, you
      // must handle it appropriately. The error codes are listed in the Expo
      // documentation:
      // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
    } catch (error) {
      console.error(error)
    }
  }
  return rejected
}
