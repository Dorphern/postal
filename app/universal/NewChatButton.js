import React, { useEffect, useRef } from 'react'
import { Keyboard } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import styled from 'styled-components/native'

const SearchBar = () => {
  const inputRef = useRef(null)

  const blurInput = () => {
    inputRef.current.blur()
  }

  useEffect(() => {
    const didHideListener = Keyboard.addListener('keyboardDidHide', blurInput)
    return () => didHideListener.remove()
  })

  return (
    <Container>
      <TextInput placeholder="Search..." ref={inputRef} />
      <SearchIcon />
    </Container>
  )
}

export default SearchBar

const SearchIcon = () => <Ionicons name="md-search" size={24} color="#585265" />

const Container = styled.View`
  background-color: #e5e4e7;
  border-radius: 10px;
  width: 100%;
  padding: 8px 12px;
  justify-content: center;
  align-items: center;
  flex-direction: row;
`

const TextInput = styled.TextInput.attrs({
  placeholderTextColor: '#5A5663',
  multiline: true,
})`
  flex: 1;
  font-size: 16px;
  max-height: 120px;
  color: #585265;
`

