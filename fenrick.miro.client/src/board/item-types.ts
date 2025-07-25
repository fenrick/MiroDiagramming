{
  BaseItem, Connector, Frame, Group
}
from;
"@mirohq/websdk-types";

/** Union covering all widget types used when tracking undo operations. */
export type BoardEntity = BaseItem | Group | Connector | Frame;
