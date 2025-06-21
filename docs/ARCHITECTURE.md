# Project Architecture

This document outlines the high level structure of the application and how the
main functions are divided across modules.

## Overview

The project is built in TypeScript using React. UI logic lives under `src/` and
test cases under `tests/`. Each module is designed with a single responsibility
so behaviour is easy to test and maintain.

### Core Modules

- **GraphProcessor** (`src/GraphProcessor.ts`)

  - Parses the JSON graph input and normalises nodes and edges.
  - Provides helper functions to extract metadata and create template mappings.

- **BoardBuilder** (`src/BoardBuilder.ts`)

  - Responsible for creating widgets on the board using data prepared by
    `GraphProcessor`.
  - Handles caching of widgets and offers utilities for updating or removing
    items.

- **CardProcessor** (`src/CardProcessor.ts`)

  - Loads card definitions from JSON files and converts them into board widgets.
  - Exposes undo support so recent imports can be reverted.

- **DiagramApp** (`src/DiagramApp.ts`)

  - Entry point for the sidebar UI and orchestration of the different tabs.
  - Maintains application state such as the current selection and registered
    tools.

- **Utility Modules**
  - `elk-layout.ts` and `layout-utils.ts` contain layout logic using the ELK
    engine.
  - `ui-utils.ts`, `style-tools.ts`, and other helpers encapsulate UI behaviour.

Each function within these files aims for a cyclomatic complexity below 8 and
focuses on a single task to keep the design modular.

## Testing

The `tests/` directory mirrors the source layout with extensive Jest suites.
Module and branch coverage is above 90% to ensure reliability. New functions
should include corresponding tests to maintain this coverage level.
