import { useState, useEffect } from 'react'

import { useStore } from 'react-redux'
import Client from '../../lib/client'
import { selectContactProfile, getContactProfile } from '../../state/room'

export const useProfile = userId => {
  const store = useStore()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (userId != null) {
      const storeProfile = selectContactProfile(store.getState(), userId)
      if (storeProfile != null) {
        setProfile(storeProfile)
      } else {
        Client.fetchProfile(userId)
          .then(profile => setProfile(getContactProfile(profile)))
          .catch(err => setProfile(null))
      }
    } else {
      setProfile(null)
    }
  }, [userId])

  return profile
}
