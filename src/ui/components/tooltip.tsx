import React from 'react'

type TooltipProperties = Readonly<{
  content: React.ReactNode
  children: React.ReactElement
}>

/** Minimal tooltip using native title attribute for now. */
export function Tooltip({ content, children }: TooltipProperties): React.ReactElement {
  return React.cloneElement(children, { title: typeof content === 'string' ? content : undefined })
}
