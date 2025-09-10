"""OpenTelemetry configuration for the application."""

from __future__ import annotations

import os
from importlib import import_module
from typing import Any

from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor  # noqa: F401
from opentelemetry.instrumentation.sqlite3 import SQLite3Instrumentor  # noqa: F401
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from fastapi import FastAPI
from opentelemetry import trace

_otel_instrumented = False

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
    """Configure exporters and instrument the application (idempotent)."""

    global _otel_instrumented
    if _otel_instrumented:
        return

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

    # Avoid overriding an already-configured tracer provider
    from opentelemetry.sdk.trace import TracerProvider as SDKTracerProvider

    current = trace.get_tracer_provider()
    if not isinstance(current, SDKTracerProvider):
        trace.set_tracer_provider(provider)

    _otel_instrumented = True
