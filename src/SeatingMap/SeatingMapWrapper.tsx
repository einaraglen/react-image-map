import React, { ReactNode } from 'react'
import SeatingMap from '.'
import { SeatingMapProvider } from './context'

interface Props {
  children: ReactNode
  disabled?: boolean
  src: string
  viewPortHeight?: string;
  viewPortWidth?: string;
  value?: any;
}

const SeatingMapWrapper = ({ children, disabled = false, src, viewPortHeight = '36rem', viewPortWidth = viewPortHeight, value }: Props) => {

  return (
    <SeatingMapProvider value={value} >
      <SeatingMap {...{ src, disabled, viewPortHeight, viewPortWidth }}>
        {children}
      </SeatingMap>
    </SeatingMapProvider>
  )
}

export default SeatingMapWrapper
