# Connector Templates Cheat Sheet

- default: shape=curved strokeStyle=normal startCap=none endCap=arrow
- flow: shape=curved strokeStyle=dashed startCap=none endCap=arrow
- assignment: shape=curved strokeStyle=normal startCap=none endCap=arrow
- realization: shape=curved strokeStyle=dashed startCap=none endCap=arrow
- access: shape=curved strokeStyle=normal startCap=none endCap=arrow
- influence: shape=curved strokeStyle=dotted startCap=none endCap=arrow
- association: shape=curved strokeStyle=normal startCap=none endCap=none
    - Mermaid: A -- B
- inheritance: shape=curved strokeStyle=normal startCap=none endCap=arrow
    - Mermaid: Class A <|-- B
- composition: shape=curved strokeStyle=normal startCap=diamond endCap=arrow
    - Mermaid: A \*-- B
- aggregation: shape=curved strokeStyle=normal startCap=circle endCap=arrow
    - Mermaid: A o-- B
- dependency: shape=curved strokeStyle=dashed startCap=none endCap=arrow
    - Mermaid: A ..> B
