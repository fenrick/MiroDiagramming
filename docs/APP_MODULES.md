# App Module Reference

---

## 0 Purpose

This document summarises the files under `web/client/src/app/`. These
modules initialise the React UI and integrate with the Miro Web SDK.

## 1 Directory Overview

```
web/client/src/app/
```

- App.tsx
- diagram-app.ts

## 2 Module Purpose

| File           | Purpose                                                      |
| -------------- | ------------------------------------------------------------ |
| App.tsx        | React root component that renders the tabbed user interface. |
| diagram-app.ts | Singleton that registers Web SDK events and opens the panel. |
