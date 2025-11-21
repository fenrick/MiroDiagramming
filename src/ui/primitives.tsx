import React from 'react'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  DoubleArrowRightIcon,
  GridIcon,
  LockClosedIcon,
  MixerHorizontalIcon,
  Pencil1Icon,
  PlusIcon,
  LayersIcon,
} from '@radix-ui/react-icons'

export function Text({
  children,
  size = 'medium',
}: {
  children: React.ReactNode
  size?: 'small' | 'medium'
}): React.JSX.Element {
  const fontSize = size === 'small' ? 'var(--font-size-medium)' : 'var(--font-size-large)'
  return <span style={{ fontSize }}>{children}</span>
}

export function Heading({
  level = 2,
  children,
}: {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
}): React.JSX.Element {
  const Tag = `h${level}` as const
  return <Tag style={{ margin: 0 }}>{children}</Tag>
}

export function Grid({
  columns = 1,
  gap = 'var(--space-100)',
  children,
}: {
  columns?: number
  gap?: number | string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: typeof gap === 'number' ? `${gap}px` : gap,
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  )
}

Grid.Item = function GridItem({
  children,
  columnStart,
  columnEnd,
}: {
  children: React.ReactNode
  columnStart?: number
  columnEnd?: number
}): React.JSX.Element {
  return (
    <div
      style={{
        gridColumnStart: columnStart,
        gridColumnEnd: columnEnd ? columnEnd + 1 : undefined,
      }}
    >
      {children}
    </div>
  )
}

export function Flex({
  children,
  direction = 'row',
  gap = 0,
  align = 'stretch',
  justify = 'flex-start',
  wrap = 'nowrap',
  style,
}: {
  children: React.ReactNode
  direction?: 'row' | 'column'
  gap?: number
  align?: 'stretch' | 'center' | 'flex-start' | 'flex-end'
  justify?: 'flex-start' | 'center' | 'space-between'
  wrap?: 'nowrap' | 'wrap'
  style?: React.CSSProperties
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction,
        gap: `${gap}px`,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export interface SliderProps {
  value: number
  min?: number
  max?: number
  step?: number
  onValueChange?: (v: number) => void
}

export function Slider({ value, min, max, step, onValueChange }: SliderProps): React.JSX.Element {
  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onValueChange?.(Number(e.target.value))}
      aria-label="Value"
      style={{ width: '100%' }}
    />
  )
}

export const IconPen = Pencil1Icon
export const IconChevronRight = ChevronRightIcon
export const IconChevronRightDouble = DoubleArrowRightIcon
export const IconGrid = GridIcon
export const IconArrowRight = ArrowRightIcon
export const IconArrowArcLeft = ArrowLeftIcon
export const IconPlus = PlusIcon
export const IconLockClosed = LockClosedIcon
export const IconSlidersX = MixerHorizontalIcon
export const IconSquaresTwoOverlap = LayersIcon

export const Form = {
  Field: ({ children }: { children: React.ReactNode }) => (
    <div style={{ marginBottom: 'var(--space-200)' }}>{children}</div>
  ),
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor} style={{ display: 'block', marginBottom: 'var(--space-50)' }}>
      {children}
    </label>
  ),
}
