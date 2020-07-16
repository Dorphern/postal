import * as Permissions from 'expo-permissions'
import Constants from 'expo-constants'
import { Notifications } from 'expo'

export const registerForPushNotifications = async () => {
  if (!Constants.isDevice) {
    alert('Must use physical device for Push Notifications')
  } else {
    try {
      await assertPermission(Permissions.NOTIFICATIONS)
      const token = await Notifications.getExpoPushTokenAsync()
      console.log(token)

      console.log('OS', Platform.OS)
    } catch (err) {
      console.log('eer', err)
    }
  }

  if (Platform.OS === 'android') {
    Notifications.createChannelAndroidAsync('messages', {
      name: 'messages',
      sound: true,
      priority: 'max',
      vibrate: [0, 250, 250, 250],
    })
  }
}

const assertPermission = async (permission) => {
  const { status: existingStatus } = await Permissions.getAsync(permission)
  let finalStatus = existingStatus
  if (existingStatus !== 'granted') {
    const { status } = await Permissions.askAsync(permission)
    finalStatus = status
  }
  if (finalStatus !== 'granted') {
    throw new Error(`Could not get permission for ${permission}`)
  }
}
