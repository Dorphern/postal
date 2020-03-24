import React from 'react'
import styled from 'styled-components/native'
import PropTypes from 'prop-types'
import { LinearGradient } from 'expo-linear-gradient'

import { getAvatarColor } from '../lib/userColor'

const Avatar = ({ avatar, size, style }) => {
  const borderRadius = Math.round(size * 0.33)

  const containerStyles = {
    width: size,
    height: size,
    ...style,
  }

  if (avatar == null) {
    return <Container style={containerStyles} />
  }

  if (typeof avatar === 'string') {
    const { backgroundLight, backgroundDark, foreground } = getAvatarColor(
      avatar,
    )
    return (
      <InitialsContainer
        style={{ ...containerStyles, borderRadius }}
        colors={[backgroundLight, backgroundDark]}
      >
        <Initials
          style={{ color: foreground, fontSize: Math.round(size * 0.4) }}
        >
          {avatar}
        </Initials>
      </InitialsContainer>
    )
  }

  return (
    <Container style={containerStyles}>
      {avatar.length === 1 && (
        <Picture source={{ uri: avatar[0] }} style={{ borderRadius }} />
      )}
      {avatar.length === 2 && (
        <>
          <Avatar1 source={{ uri: avatar[0] }} />
          <Avatar2 source={{ uri: avatar[1] }} />
        </>
      )}
    </Container>
  )
}

Avatar.defaultProps = {
  size: 40,
}

Avatar.propTypes = {
  size: PropTypes.number,
  avatar: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
}

export default Avatar

const Container = styled.View`
  position: relative;
  overflow: hidden;
`

const Picture = styled.Image`
  width: 100%;
  height: 100%;
`

const Avatar1 = styled(Picture)`
  border-radius: 11px;
  position: absolute;
  top: 0;
  left: 0;
  width: 70%;
  height: 70%;
`

const Avatar2 = styled(Picture)`
  border-radius: 11px;
  position: absolute;
  bottom: 0;
  right: 0;
  width: 70%;
  height: 70%;
`

const InitialsContainer = styled(LinearGradient)`
  align-items: center;
  justify-content: center;
`

const Initials = styled.Text`
  font-weight: bold;
  text-align: center;
  color: #eafbe0;
  text-transform: uppercase;
`
