"""OpenTelemetry configuration for the application."""

from __future__ import annotations

import os
from importlib import import_module
from typing import Any

from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.sqlite3 import SQLite3Instrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from fastapi import FastAPI
from opentelemetry import trace
from ..db.session import engine

JaegerExporter: Any
OTLPSpanExporter: Any
try:  # pragma: no cover - optional dependency
    JaegerExporter = import_module(
        "opentelemetry.exporter.jaeger.thrift"
    ).JaegerExporter
except ModuleNotFoundError:  # pragma: no cover - optional dependency
    JaegerExporter = None

try:  # pragma: no cover - optional dependency
    OTLPSpanExporter = import_module(
        "opentelemetry.exporter.otlp.proto.http.trace_exporter"
    ).OTLPSpanExporter
except ModuleNotFoundError:  # pragma: no cover - optional dependency
    OTLPSpanExporter = None


def setup_telemetry(app: FastAPI) -> None:
    """Configure exporters and instrument the application."""

    resource = Resource.create({"service.name": "miro-backend"})
    provider = TracerProvider(resource=resource)

    otlp_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
    if otlp_endpoint and OTLPSpanExporter is not None:
        provider.add_span_processor(
            BatchSpanProcessor(OTLPSpanExporter(endpoint=otlp_endpoint))
        )

    jaeger_host = os.getenv("JAEGER_AGENT_HOST")
    if jaeger_host and JaegerExporter is not None:
        jaeger_port = int(os.getenv("JAEGER_AGENT_PORT", "6831"))
        provider.add_span_processor(
            BatchSpanProcessor(
                JaegerExporter(agent_host_name=jaeger_host, agent_port=jaeger_port)
            )
        )

    trace.set_tracer_provider(provider)

    FastAPIInstrumentor.instrument_app(app)
    SQLAlchemyInstrumentor().instrument(engine=engine)
    SQLite3Instrumentor().instrument()
