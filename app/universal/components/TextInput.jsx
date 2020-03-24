import React, { useEffect, useRef, useState, useContext } from 'react'
import { Keyboard } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import styled, { ThemeContext } from 'styled-components/native'

const TextInput = ({ preIcon, postIcon, style, ...props }) => {
  const inputRef = useRef(null)
  const [inputHeight, setInputHeight] = useState(18)
  const theme = useContext(ThemeContext)

  const blurInput = () => {
    inputRef.current.blur()
  }

  useEffect(() => {
    const didHideListener = Keyboard.addListener('keyboardDidHide', blurInput)
    return () => didHideListener.remove()
  })

  const onContentSizeChange = ({ nativeEvent }) => {
    const newHeight = Math.floor(nativeEvent.contentSize.height)
    setInputHeight(newHeight)
  }

  const postIconElement =
    typeof postIcon === 'string' ? (
      <MaterialCommunityIcons
        name={postIcon}
        size={24}
        color={theme.colors.mutedFg}
        style={{ marginLeft: 8, marginRight: 12 }}
      />
    ) : (
      postIcon
    )

  return (
    <Container
      style={style}
      hasPost={!!postIconElement}
      disabled={props.disabled}
    >
      {preIcon && (
        <MaterialCommunityIcons
          name={preIcon}
          size={18}
          color={theme.colors.mutedFg}
          style={{ marginRight: 8 }}
        />
      )}
      <Input
        {...props}
        style={{ height: inputHeight }}
        ref={inputRef}
        onContentSizeChange={onContentSizeChange}
      />
      {postIconElement}
    </Container>
  )
}

export default TextInput

const Container = styled.View`
  background-color: ${p => p.theme.colors.inputBg};
  border-radius: 10px;
  padding-vertical: 0;
  padding-left: 12px;
  padding-right: ${p => (p.hasPost ? 0 : 12)}px;
  min-height: 40px;
  justify-content: center;
  align-items: center;
  flex-direction: row;

  ${p =>
    p.disabled &&
    `
    background-color: ${p => p.inputDisabledBg};
  `}
`

const Input = styled.TextInput.attrs(p => ({
  placeholderTextColor: p.disabled ? p.inputDisabledFg : p.inputPlaceholder,
}))`
  flex: 1;
  font-size: 16px;
  max-height: 120px;
  min-height: 18px;
  color: ${p => p.theme.colors.inputFg};
  text-align-vertical: top;
  padding: 9px 0;

  ${p => p.disabled && `color: ${p.theme.colors.inputDisabledFg};`}
`
