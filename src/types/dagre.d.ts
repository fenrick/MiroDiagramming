declare module 'dagre' {
  namespace dagre {
    namespace graphlib {
      interface GraphLabel {
        rankdir?: 'TB' | 'BT' | 'LR' | 'RL'
        align?: string
        nodesep?: number
        ranksep?: number
        edgesep?: number
        ranker?: string
      }

      interface EdgeReference {
        v: string
        w: string
        name?: string
      }

      class Graph<NodeValue = unknown, EdgeValue = unknown> {
        constructor(options?: { directed?: boolean; multigraph?: boolean; compound?: boolean })

        setGraph(label: GraphLabel): this
        graph(): GraphLabel

        setDefaultEdgeLabel(factory: () => EdgeValue): this

        setNode(nodeId: string, value?: NodeValue): this
        node(nodeId: string): (NodeValue & { x?: number; y?: number }) | undefined
        nodes(): string[]

        setEdge(v: string, w: string, value?: EdgeValue, name?: string): this
        edge(reference: EdgeReference): EdgeValue | undefined
        edges(): EdgeReference[]
      }
    }

    function layout<NodeValue, EdgeValue>(graph: graphlib.Graph<NodeValue, EdgeValue>): void
  }

  const dagre: {
    graphlib: typeof dagre.graphlib
    layout: typeof dagre.layout
  }

  export = dagre
  export as namespace dagre
}
