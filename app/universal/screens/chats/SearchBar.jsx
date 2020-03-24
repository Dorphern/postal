import React, { useEffect, useRef } from 'react'
import { Keyboard } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
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

const SearchIcon = () => (
  <MaterialIcons name="search" size={24} color="#585265" />
)

const Container = styled.View`
  flex: 1;
  background-color: #f0eff0;
  border-radius: 10px;
  padding: 0 12px;
  min-height: 40px;
  margin-right: 16px;
  justify-content: center;
  align-items: center;
  flex-direction: row;
`

const TextInput = styled.TextInput.attrs({
  placeholderTextColor: '#5A5663',
})`
  flex: 1;
  font-size: 16px;
  max-height: 120px;
  color: #585265;
`
