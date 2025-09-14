/** @vitest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'

import { JsonDropZone } from '../src/ui/components/JsonDropZone'

test('invokes callback when file selected', async () => {
  const handle = vi.fn()
  render(<JsonDropZone onFiles={handle} />)
  const input = screen.getByTestId('file-input')
  const file = new File(['{}'], 'test.json', { type: 'application/json' })
  await act(async () => fireEvent.change(input, { target: { files: [file] } }))
  expect(handle).toHaveBeenCalled()
  expect(handle.mock.calls[0][0]).toEqual([file])
})

test('drag accept toggles text and triggers drop', async () => {
  const handle = vi.fn()
  render(<JsonDropZone onFiles={handle} />)
  const zone = screen.getByLabelText('File drop area')
  const file = new File(['{}'], 'data.json', { type: 'application/json' })
  const data = {
    files: [file],
    items: [{ kind: 'file', type: 'application/json', getAsFile: () => file }],
    types: ['Files'],
  } as DataTransfer
  await act(async () => {
    fireEvent.dragEnter(zone, { dataTransfer: data })
    await Promise.resolve()
  })
  expect(screen.getByText('Drop your JSON file here')).toBeInTheDocument()
  await act(async () => {
    fireEvent.drop(zone, { dataTransfer: data })
    await Promise.resolve()
  })
  expect(handle.mock.calls[0][0]).toEqual([file])
  expect(screen.getByText('Or drop your JSON file here')).toBeInTheDocument()
})

test('drag reject toggles reject style', async () => {
  render(<JsonDropZone onFiles={vi.fn()} />)
  const zone = screen.getByLabelText('File drop area')
  const file = new File(['hi'], 'text.txt', { type: 'text/plain' })
  const data = {
    files: [file],
    items: [{ kind: 'file', type: 'text/plain', getAsFile: () => file }],
    types: ['Files'],
  } as DataTransfer
  await act(async () => {
    fireEvent.dragEnter(zone, { dataTransfer: data })
    await Promise.resolve()
  })
  expect(zone.style.borderColor).toBe('rgb(107, 23, 32)')
  await act(async () => {
    fireEvent.dragLeave(zone, { dataTransfer: data })
    await Promise.resolve()
  })
  expect(zone.style.borderColor).toBe('rgba(26, 27, 30, 0.4)')
})
