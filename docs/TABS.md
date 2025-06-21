# Tab Overview

The sidebar interface groups functionality into five tabs. Each tab is
implemented as a React component under `src/tabs/` and exposes a simple UI that
calls into the processing modules.

| Tab Component | Purpose                                                        |
| ------------- | -------------------------------------------------------------- |
| `DiagramTab`  | Import a graph description and build the diagram on the board. |
| `CardsTab`    | Load a list of cards from JSON and create card widgets.        |
| `ResizeTab`   | Resize selected widgets or apply a stored size across items.   |
| `StyleTab`    | Apply fill and border styles to the current selection.         |
| `GridTab`     | Arrange widgets into a grid and optionally group them.         |

The tabs are rendered by `DiagramApp` which controls which tab is active. Each
component focuses on a single concern and delegates work to helper classes such
as `BoardBuilder` or `CardProcessor`. Because the logic is encapsulated the tabs
remain small and easy to test.
