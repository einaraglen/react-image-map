import React, { createContext, ReactNode, useContext, useState } from 'react'

const anonymous = () => {}

const contextDefaultValues: any = {
  size: { height: 0, width: 0 },
  _scale: 1,
  disable: false,
  point: undefined,
  setSize: anonymous,
  setScale: anonymous,
  setDisable: anonymous,
  setPoint: anonymous
}

const Context = createContext<any>(contextDefaultValues)

export const useSeatingMapContext = () => {
  return useContext(Context)
}

type Props = {
  value?: any;
  children: ReactNode
}

export const SeatingMapProvider = ({ children, value }: Props) => {
  const [size, setSize] = useState<any>({ height: 0, width: 0 })
  const [_scale, setScale] = useState<number>(1)
  const [disable, setDisable] = useState<boolean>(false)

  const base = {
    size,
    _scale,
    disable,
    setSize,
    setScale,
    setDisable,
  }

  return <Context.Provider value={{ ...base, ...value }}>{children}</Context.Provider>
}
