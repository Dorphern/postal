import { useSelector } from 'react-redux'

import { selectAuthId } from '../state/auth'

export const useAuthId = () => {
  return useSelector(selectAuthId)
}
