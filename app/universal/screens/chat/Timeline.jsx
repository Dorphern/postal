import React, { useState, useEffect } from 'react'
import styled from 'styled-components/native'
import _invert from 'lodash/invert'

import FlatList from '../../components/FlatList'

import TimelineEntry from './TimelineEntry'

const END_OFFSET = 12

const Timeline = React.memo(({ events, onChangeEndVisible }) => {
  const [isEndVisible, setIsEndVisible] = useState(true)
  const scroll = e => {
    const y = e?.nativeEvent?.contentOffset.y
    if (y <= END_OFFSET && !isEndVisible) {
      setIsEndVisible(true)
    } else if (y > END_OFFSET && isEndVisible) {
      setIsEndVisible(false)
    }
  }

  useEffect(() => {
    onChangeEndVisible && onChangeEndVisible(isEndVisible)
  }, [isEndVisible])

  return (
    <List
      data={events}
      inverted
      showsVerticalScrollIndicator={false}
      keyExtractor={(event, i) => event.id}
      onScroll={scroll}
      renderItem={({ item: event, index }) => (
        <TimelineEntry
          event={event}
          prevEvent={events[index + 1]}
          nextEvent={events[index - 1]}
        />
      )}
    />
  )
})

export default Timeline

Timeline.whyDidYouRender = true

const List = styled(FlatList)`
  flex: 1;
  padding-horizontal: 0;
`
