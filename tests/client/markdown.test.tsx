// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { marked } from 'marked'

import { Markdown } from '../../src/ui/components/markdown'

describe('Markdown', () => {
  it('renders parsed HTML and applies a custom class name', () => {
    const parse = vi.spyOn(marked, 'parse').mockReturnValue('<p>converted</p>')

    const { container } = render(<Markdown source="**bold**" className="prose" />)
    const root = container.firstElementChild as HTMLElement

    expect(parse).toHaveBeenCalledWith('**bold**')
    expect(root).not.toBeNull()
    expect(root).toHaveClass('prose')
    expect(root).toContainHTML('<p>converted</p>')

    parse.mockRestore()
  })

  it('only re-parses markdown when the source changes', () => {
    const parse = vi
      .spyOn(marked, 'parse')
      .mockReturnValueOnce('<p>first</p>')
      .mockReturnValueOnce('<p>second</p>')

    const { rerender, container } = render(<Markdown source="first" />)
    expect(parse).toHaveBeenCalledTimes(1)
    expect(parse).toHaveBeenLastCalledWith('first')
    expect(container.firstElementChild?.textContent).toBe('first')

    rerender(<Markdown source="first" />)
    expect(parse).toHaveBeenCalledTimes(1)
    expect(container.firstElementChild?.textContent).toBe('first')

    rerender(<Markdown source="second" />)
    expect(parse).toHaveBeenCalledTimes(2)
    expect(parse).toHaveBeenLastCalledWith('second')
    expect(container.firstElementChild?.textContent).toBe('second')

    parse.mockRestore()
  })

  it('sanitizes unsafe HTML before injecting it', () => {
    const definition = "<img src='x' onerror='alert(1)' /><p>Safe</p>'"
    const { container } = render(<Markdown source={definition} />)
    const root = container.firstElementChild
    expect(root?.querySelector('img')?.getAttribute('onerror')).toBeNull()
    expect(root).toContainHTML('<p>Safe</p>')
  })
})
