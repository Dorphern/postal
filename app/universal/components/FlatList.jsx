import React from 'react'
import styled from 'styled-components/native'

import Spacer from './Spacer'

const FlatList = props => (
  <StyledList
    ListFooterComponent={<Spacer height={8} />}
    ListHeaderComponent={<Spacer height={8} />}
    {...props}
  />
)

export default FlatList

const StyledList = styled.FlatList`
  flex: 1;
`
