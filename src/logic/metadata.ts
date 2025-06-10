/**
 * Attach structured graph metadata under the namespace 'app.miro.structgraph'.
 */
export function attachMetadata(widget: any, data: unknown) {
  if (!widget.metadata) {
    widget.metadata = {} as any;
  }
  widget.metadata['app.miro.structgraph'] = data;
  // Widgets must be updated to persist metadata
  if (miro && miro.board && miro.board.widgets && miro.board.widgets.update) {
    return miro.board.widgets.update(widget);
  }
  return widget;
}
