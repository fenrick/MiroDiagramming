# Testing Guide

This project uses **pytest** for unit and integration tests. Integration tests run the
application with full startup and shutdown behaviour and exercise real HTTP
interactions.

## Writing integration tests

Integration tests live under `tests/integration/` and are marked with
`@pytest.mark.integration`. The shared fixtures spin up the FastAPI app using
its lifespan events and expose an `httpx.AsyncClient` backed by
`ASGITransport` for exercising routes. A dummy queue is also provided for
asserting background side-effects.

```python
import pytest
from httpx import AsyncClient
from .conftest import DummyQueue

@pytest.mark.integration
@pytest.mark.asyncio
async def test_create_shape(client_queue: tuple[AsyncClient, DummyQueue]) -> None:
    client, queue = client_queue
    # Arrange test state
    ...
    # Act on the API
    response = await client.post("/api/resource", json={"content": "box"})
    # Assert on response and queued side-effects
    assert response.status_code == 201
    assert len(queue.tasks) == 1
```

Run only the integration tests with:

```bash
poetry run pytest -m integration
```
