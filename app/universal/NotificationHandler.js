import React, { useEffect } from 'react'
import { Notifications } from 'expo'
import { useSelector } from 'react-redux'

import { getIsAuthenticated } from './state/auth'
import { registerForPushNotifications } from './lib/pushNotifications'

const NotificationHandler = () => {
  const isAuthenticated = useSelector(getIsAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications()
    }
  }, [isAuthenticated])

  useEffect(() => {
    const onNotification = ({ origin, data }) => {
      if (origin === 'selected' && data?.roomId) {
        navigation.replace('Chat', {
          roomId: data.roomId,
          eventId: data.eventId,
        })
      }
    }

    const { remove } = Notifications.addListener(onNotification)
    return remove
  }, [])

  return null
}

export default NotificationHandler
