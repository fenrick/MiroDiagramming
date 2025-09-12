import { expect, test } from 'vitest'
import { BoardBuilder } from '../src/board/board-builder'

test('findNode surfaces invalid parameters', async () => {
  const builder = new BoardBuilder()
  await expect(builder.findNode(1 as any, 2 as any)).rejects.toThrow('type=1')
})

test('findNodeInSelection surfaces invalid parameters', async () => {
  const builder = new BoardBuilder()
  await expect(builder.findNodeInSelection(1 as any, 2 as any)).rejects.toThrow('label=2')
})

test('createNode reports invalid position', async () => {
  const builder = new BoardBuilder()
  await expect(builder.createNode({ type: 't', label: 'l' }, {} as any)).rejects.toThrow(
    'Invalid position: {}',
  )
})

test('createNode reports invalid node', async () => {
  const builder = new BoardBuilder()
  await expect(builder.createNode({} as any, { x: 0, y: 0 } as any)).rejects.toThrow(
    'Invalid node: {}',
  )
})

test('createEdges reports invalid edges', async () => {
  const builder = new BoardBuilder()
  await expect(builder.createEdges(null as any, {} as any)).rejects.toThrow('Invalid edges: null')
})

test('createEdges reports invalid node map', async () => {
  const builder = new BoardBuilder()
  await expect(builder.createEdges([], null as any)).rejects.toThrow('Invalid node map: null')
})
