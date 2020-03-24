import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components/native'
import { TouchableWithoutFeedback } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export const ScreenCard = styled.SafeAreaView`
  flex: 1;
  background-color: ${p => p.theme.colors.cardBg};
  border-radius: 15px;
`

const HeaderFooter = styled.View`
  padding: 16px 16px;
`

export const ScreenHeader = styled(
  ({ leftIcon, title, children, ...props }) => {
    return (
      <HeaderFooter {...props}>
        {leftIcon && <LeftIconWrapper>{leftIcon}</LeftIconWrapper>}
        {title && <ScreenHeaderCopy children={title} />}
        {children}
      </HeaderFooter>
    )
  },
)`
  padding: 12px 16px;
  flex-direction: row;
  align-items: center;
`

const LeftIconWrapper = styled.View`
  margin-right: 10px;
`

export const ScreenHeaderCopy = styled.Text`
  font-weight: bold;
  font-size: 22px;
  color: ${p => p.theme.colors.titleFg};
`

export const BackIcon = React.memo(({ onPress, ...props }) => {
  const theme = useContext(ThemeContext)
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <MaterialCommunityIcons
        name="arrow-left"
        color={theme.colors.titleFg}
        size={24}
        {...props}
      />
    </TouchableWithoutFeedback>
  )
})

export const ScreenFooter = styled(HeaderFooter)`
  flex-direction: row;
`
