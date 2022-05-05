import React, { ReactNode, useEffect, useRef } from 'react'
import { useState } from 'react'
import disableScroll from 'disable-scroll'
import { useSpring, animated } from 'react-spring'
import { useGesture } from 'react-use-gesture'
import { useSeatingMapContext } from './context'
import { useContainerDimensions } from '../hooks/useContainerDimensions'
// @ts-ignore
import reactImageSize from 'react-image-size'

export const getGoldenRatioOfSize = (margin: number, windowWidth: number, imageWidth: number) => {
    if (imageWidth === 0) return 1
    return Math.abs((windowWidth * (1 - 2 * margin)) / imageWidth)
}

export const getCenterPosition = (height: number, width: number, size: { width: number, height: number }) => {
    let leftMargin = width / 2 - size.width / 2
    let topMargin = height / 2 - size.height / 2
    let scale = getGoldenRatioOfSize(1, width, size.width)
    return {
      x: leftMargin,
      y: topMargin,
      scale,
    }
  }

  export const getSizeOfImage = async (url: string): Promise<{ width: number, height: number } | undefined> => {
    try {
      let { width, height } = await reactImageSize(url)
      return { width: width, height: height }
    } catch (err: any) {
      console.warn(err)
    }
  }

export const clamp = (value: number, min: number = -Infinity, max: number = Infinity): number => {
  return Math.min(Math.max(value, min), max)
}

interface Props {
  children?: ReactNode
  src?: string
  viewPortHeight?: string
  viewPortWidth?: string
}

const SeatingMap = ({ children, viewPortHeight = '36rem', viewPortWidth = viewPortHeight, src = '' }: Props) => {
  const ref: any = useRef()
  const { width, height } = useContainerDimensions(ref)
  const [canScroll, setCanScroll] = useState(true)
  const { size, setSize, _scale, setScale, disable, point } = useSeatingMapContext()
  const [{ x, y, scale }, api] = useSpring(() => ({
    x: height / 2,
    y: width / 2,
    scale: 1,
  }))

  const bind = useGesture(
    {
      onDrag: ({ movement: [x, y], dragging }: any) => {
        if (disable) return
        api.start({ x, y, immediate: dragging })
      },
      onWheel: ({ delta: [dx, dy], memo = scale.get() }: any) => {
        //pure scroll wheel
        if (dy !== 0) {
          const s = clamp(memo + -dy / 70, 0.1, 10)
          setScale(s)
          api.start({ scale: s })
          return memo
        }
      },
      onPinch: ({ movement: [d], memo = scale.get() }: any) => {
        //touch-pinch or scroll + ctrl CAUTION: this will throw preventDefault error to console
        const s = clamp(memo + d / 500, 0.1, 10)
        setScale(s)
        api.start({ scale: s })
        return memo
      },
    },
    {
      eventOptions: { passive: false },
      drag: {
        initial: () => [x.get(), y.get()],
        rubberband: 0.2,
      },
    }
  )

  useEffect(() => {
    api.start(getCenterPosition(height, width, size))
  }, [size])

  useEffect(() => {
    if (point) {
      let scale = 1
      let offsetX = width / 2 - point.x * size.width * scale
      let offsetY = height / 2 - point.y * size.height * scale
      setScale(scale)
      api.start({ x: offsetX, y: offsetY, scale })
    }
  }, [point])

  useEffect((): any => {
    const fetch = async () => {
      let _size = await getSizeOfImage(src)
      if (_size) setSize(_size)
    }
    if (src) fetch()
  }, [src])

  //prevent browser scroll when in tablemap
  useEffect((): any => {
    canScroll ? disableScroll.off() : disableScroll.on()
  }, [canScroll])

  const resetMap = () => {
    api.start(getCenterPosition(height, width, size))
  }

  const mutateScale = (factor: number) => {
    const s = clamp(_scale * factor, 0.1, 10)
    setScale(s)
    api.start({ scale: s })
  }

  const zoomIn = () => mutateScale(1.2)

  const zoomOut = () => mutateScale(0.8)

  return (
    <div
      ref={ref}
      id="viewport"
      className="overflow-hidden shadow-sm rounded-md flex h-full border"
      style={{
        height: viewPortHeight,
        minHeight: viewPortHeight,
        touchAction: 'none',
      }}
      onMouseDown={(e) => e.preventDefault()}
      onTouchStart={(e) => e.preventDefault()}
      onTouchEnd={(e) => e.preventDefault()}
      onMouseEnter={() => setCanScroll(false)}
      onMouseLeave={() => setCanScroll(true)}
    >
      <animated.div
        {...bind()}
        className="light-shadow"
        style={{
          x,
          y,
          scale,
          touchAction: 'none',
          minHeight: size.height,
          minWidth: size.width,
          backgroundImage: `url(${src})`,
          backgroundRepeat: 'no-repeat',
        }}
      >
        {children}
      </animated.div>
    </div>
  )
}

export default SeatingMap
