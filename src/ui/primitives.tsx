import React from 'react'

type TextProperties = Readonly<{
  children: React.ReactNode
  size?: 'small' | 'medium'
}>

export function Text({ children, size = 'medium' }: TextProperties): React.JSX.Element {
  const fontSize = size === 'small' ? 'var(--font-size-medium)' : 'var(--font-size-large)'
  return <span style={{ fontSize }}>{children}</span>
}

type HeadingProperties = Readonly<{
  level?: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
}>

const getHeadingTag = (level: HeadingProperties['level']): keyof JSX.IntrinsicElements => {
  const tags: readonly (keyof JSX.IntrinsicElements[]) = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
  const safeIndex = Math.min(Math.max((level ?? 2) - 1, 0), tags.length - 1)
  return tags[safeIndex]
}

export function Heading({ level = 2, children }: HeadingProperties): React.JSX.Element {
  const Tag = getHeadingTag(level)
  return React.createElement(Tag, { style: { margin: 0 } }, children)
}

type GridProperties = Readonly<{
  columns?: number
  gap?: number | string
  children: React.ReactNode
}>

export function Grid({
  columns = 1,
  gap = 'var(--space-100)',
  children,
}: GridProperties): React.JSX.Element {
  const templateColumns = `repeat(${String(columns)}, minmax(0, 1fr))`
  const gapValue = typeof gap === 'number' ? `${String(gap)}px` : gap
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: templateColumns,
        gap: gapValue,
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  )
}

type GridItemProperties = Readonly<{
  children: React.ReactNode
  columnStart?: number
  columnEnd?: number
}>

Grid.Item = function GridItem({
  children,
  columnStart,
  columnEnd,
}: GridItemProperties): React.JSX.Element {
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

type FlexProperties = Readonly<{
  children: React.ReactNode
  direction?: 'row' | 'column'
  gap?: number
  align?: 'stretch' | 'center' | 'flex-start' | 'flex-end'
  justify?: 'flex-start' | 'center' | 'space-between'
  wrap?: 'nowrap' | 'wrap'
  style?: React.CSSProperties
}>

export function Flex({
  children,
  direction = 'row',
  gap = 0,
  align = 'stretch',
  justify = 'flex-start',
  wrap = 'nowrap',
  style,
}: FlexProperties): React.JSX.Element {
  const gapValue = `${String(gap)}px`
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction,
        gap: gapValue,
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

export type SliderProperties = Readonly<{
  value: number
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number) => void
}>

export function Slider({
  value,
  min,
  max,
  step,
  onValueChange,
}: SliderProperties): React.JSX.Element {
  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onValueChange?.(Number(event.target.value))}
      aria-label="Value"
      style={{ width: '100%' }}
    />
  )
}

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

export {
  ArrowLeftIcon as IconArrowArcLeft,
  ChevronRightIcon as IconChevronRight,
  ArrowRightIcon as IconArrowRight,
  GridIcon as IconGrid,
  DoubleArrowRightIcon as IconChevronRightDouble,
  MixerHorizontalIcon as IconSlidersX,
  LockClosedIcon as IconLockClosed,
  PlusIcon as IconPlus,
  Pencil1Icon as IconPen,
  LayersIcon as IconSquaresTwoOverlap,
} from '@radix-ui/react-icons'
