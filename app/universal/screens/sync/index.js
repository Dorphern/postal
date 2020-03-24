import React, { useState } from 'react'
import styled from 'styled-components/native'

import { useSelector } from 'react-redux'

import { getSyncProgress } from '../../state/auth'

import { ScreenCard } from '../../components/Screen'

const SyncScreen = () => {
  const syncProgress = useSelector(getSyncProgress)

  return (
    <Container>
      <Header>Hang Tight!</Header>
      <Sub>We're fetching all your chats...</Sub>
      <ProgressBar>
        <ProgressFill style={{ width: `${syncProgress * 100}%` }} />
      </ProgressBar>
    </Container>
  )
}

export default SyncScreen

const Container = styled(ScreenCard)`
  padding: 32px;
  align-items: center;
  justify-content: center;
`

const Header = styled.Text`
  font-weight: bold;
  font-size: 22px;
  color: #5b5b5b;
  margin-bottom: 8px;
`

const Sub = styled.Text`
  font-size: 16px;
  color: #a6a6a6;
  margin-bottom: 34px;
`

const ProgressBar = styled.View`
  width: 100%;
  height: 20px;
  border-radius: 6px;
  background-color: #edecee;
  overflow: hidden;
`

const ProgressFill = styled.View`
  background-color: #786ab1;
  height: 100%;
  width: 0px;
`
