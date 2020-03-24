import React from 'react'
import { Dimensions } from 'react-native'
import styled from 'styled-components/native'

import Client from '../../../lib/client'

const deviceWidth = Math.round(Dimensions.get('window').width)
const deviceHeight = Math.round(Dimensions.get('window').height)

const MAX_WIDTH_RATIO = 0.7
const MAX_HEIGHT_RATIO = 0.5

const maxWidth = deviceWidth * MAX_WIDTH_RATIO
const maxHeight = deviceHeight * MAX_HEIGHT_RATIO

const ImageMessage = React.memo(({ content }) => {
  const matrixUrl = content.info.thumbnail_url ?? content.url

  const url = Client.getMediaThumbnailUrl(matrixUrl, {
    width: 600,
    height: 600,
    method: 'contain',
  })
  const { w, h } = content.info.thumbnail_info ?? content.info
  const aspectRatio = w / h

  let width = Math.min(maxWidth, w)
  const height = width / aspectRatio
  if (height > maxHeight) {
    width = maxHeight * aspectRatio
  }

  return <Image source={{ uri: url }} style={{ aspectRatio, width }} />
})

export default ImageMessage

// Styles
// ==========================
const Image = styled.Image`
  border-radius: 5px;
`
