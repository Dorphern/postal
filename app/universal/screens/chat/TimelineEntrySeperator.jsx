import React from 'react'
import ms from 'ms'
import styled from 'styled-components/native'

import { relativeFormatWithTime } from '../../lib/prettyTime'

export const SHORT_TIME = ms('1m')
export const LONG_TIME = ms('15m')

const TimelineEntrySeperator = ({ prevEvent, event }) => {
  const prevTime = prevEvent?.serverTimestamp ?? 0
  const eventTime = event.serverTimestamp
  const deltaTime = eventTime - prevTime

  const newPerson = prevEvent?.sender === event.sender

  if (deltaTime <= SHORT_TIME && newPerson) {
    return <SmallSpacer />
  } else if (deltaTime < LONG_TIME) {
    return <MediumSpacer />
  }

  return <Timestamp>{relativeFormatWithTime(eventTime)}</Timestamp>
}

export default TimelineEntrySeperator

// Styles
// ==========================
const SmallSpacer = styled.View`
  height: 2px;
`

const MediumSpacer = styled.View`
  height: 12px;
`

const Timestamp = styled.Text`
  color: #988b9d;
  text-align: center;
  padding-top: 24px;
  padding-bottom: 12px;
  font-size: 12px;
`

