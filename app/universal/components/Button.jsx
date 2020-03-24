import React, { useState, useContext } from 'react'
import styled, { ThemeContext } from 'styled-components/native'

import { View, Text, TouchableWithoutFeedback } from 'react-native'

const Button = ({ label, onPress, disabled, icon, primary, ...props }) => {
  const [isDown, setIsDown] = useState(false)
  const theme = useContext(ThemeContext)

  const pressIn = () => setIsDown(true)
  const pressOut = () => setIsDown(false)

  return (
    <TouchableWithoutFeedback
      onPressIn={!disabled ? pressIn : undefined}
      onPressOut={!disabled ? pressOut : undefined}
      onPress={!disabled ? onPress : undefined}
    >
      <Container
        isDown={isDown}
        primary={primary}
        disabled={disabled}
        icon={icon != null}
        {...props}
      >
        {icon != null ? (
          icon({
            color: theme.colors.mutedFg,
            size: 24,
          })
        ) : (
          <TextLabel primary={primary} disabled={disabled}>
            {label}
          </TextLabel>
        )}
      </Container>
    </TouchableWithoutFeedback>
  )
}

export default Button

const Container = styled(({ isDown, primary, disabled, icon, ...props }) => (
  <View {...props} />
))`
  border-radius: 10px;
  height: 40px;
  justify-content: center;
  align-items: center;
  padding-horizontal: 16px;

  ${p =>
    p.icon &&
    `
    padding-horizontal: 0;
    width: 40px;
  `}

  ${p =>
    p.primary &&
    `
    background-color: ${
      p.isDown
        ? p.theme.colors.primaryButtonBgDown
        : p.theme.colors.primaryButtonBg
    };
  `}

  ${p =>
    !p.primary &&
    `
    background-color: ${
      p.isDown ? p.theme.colors.inputBgDown : p.theme.colors.inputBg
    };
  `}

  ${p =>
    p.disabled &&
    `
    background-color: ${p.theme.colors.inputDisabledBg};
  `}
`

const TextLabel = styled(({ primary, disabled, ...props }) => (
  <Text {...props} />
))`
  font-weight: bold;

  ${p => p.primary && `color: ${p.theme.colors.primaryButtonFg};`}

  ${p => p.disabled && `color: ${p.theme.colors.inputDisabledFg};`}
`
