/**
 * Attach structured graph metadata under the namespace 'app.miro.structgraph'.
 */
export function attachMetadata(widget: any, data: unknown) {
  if (!widget.metadata) {
    widget.metadata = {} as any;
  }
  widget.metadata['app.miro.structgraph'] = data;
  widget.sync();
  return widget;
}
