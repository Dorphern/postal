import React, { useContext, useMemo } from 'react'

const ChatContext = React.createContext(null)

export const ChatProvider = ({ roomId, children }) => {
  const value = useMemo(() => {
    return { roomId }
  }, [roomId])

  return <ChatContext.Provider value={value} children={children} />
}

export const useChatContext = () => useContext(ChatContext)
