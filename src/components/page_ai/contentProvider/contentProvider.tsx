import React, { useState } from 'react'

interface Props {
  children: React.ReactNode
}

export interface Context {
  inputMessage: string
  setInputMessage: (inputMessage: string) => void
  step: number
  setStep: (step: number) => void
  handleChooseTheme: (description: string) => void
}

export const ContentContext = React.createContext<Context>({} as Context)

function ContentProvider({ children }: Props) {
  const [inputMessage, setInputMessage] = useState('')
  const [currentDescription, setCurrentDescription] = useState('')

  const [step, setStep] = useState(0)

  const handleChooseTheme = (description: string) => {
    setStep(1)
    setCurrentDescription(description)
  }

  return (
    <ContentContext.Provider
      value={{
        inputMessage,
        setInputMessage,
        step,
        setStep,
        handleChooseTheme,
      }}
    >
      {children}
    </ContentContext.Provider>
  )
}

export default ContentProvider
