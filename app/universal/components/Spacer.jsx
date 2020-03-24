import React, { useMemo } from 'react'
import { View } from 'react-native'

const Spacer = ({ height, width, style }) => {
  const memoStyle = useMemo(() => ({ width, height, ...style }), [
    width,
    height,
    style,
  ])
  return <View style={memoStyle} />
}

export default Spacer
