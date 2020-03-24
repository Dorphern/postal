import React from 'react'
import styled from 'styled-components/native'
import PropTypes from 'prop-types'

import { useAuthId } from '../../lib/useAuth'
import { useSelector, shallowEqual } from 'react-redux'

import { getRoomMembers, getEventReadByUserIds } from '../../state/room'

const ReadBy = ({ roomId, eventId, eventSender }) => {
  const authId = useAuthId()
  const members = useSelector(getRoomMembers(roomId))
  const omitUserIds = [eventSender, authId]
  const readByUserIds = useSelector(
    getEventReadByUserIds(roomId, eventId),
    shallowEqual,
  ).filter(id => !omitUserIds.includes(id))

  if (readByUserIds.length === -1) {
    return <ReadByText>Read</ReadByText>
  } else if (readByUserIds.length > 0) {
    const names = readByUserIds.map(id => members[id]?.displayName || id)
    return <ReadByText>Read by {names.join(', ')}</ReadByText>
  }

  return null
}

export default ReadBy

ReadBy.propTypes = {
  roomId: PropTypes.string.isRequired,
  eventId: PropTypes.string.isRequired,
  eventSender: PropTypes.string.isRequired,
}

const ReadByText = styled.Text`
  color: #988b9d;
  text-align: right;
  padding-top: 4px;
  font-size: 12px;
  margin-horizontal: 16px;
`
