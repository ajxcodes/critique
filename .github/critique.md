# Critique Repository Review Standards

This repository adheres to strict software engineering and architecture guidelines:

## 1. Architectural Integrity
- **Layer Separation**:
  - `domain`: Pure business logic, value objects, domain errors, and constants. 100% free of external I/O, child processes, or framework coupling.
  - `ports`: Abstract interfaces and contracts.
  - `infrastructure`: Concrete adapters (I/O, filesystem, child processes, network requests, GitHub SDK).
  - `application`: Orchestrating use cases and services.
  - `presentation`: CLI and GitHub Action entrypoints.
- **Dependency Rule**: Dependencies only point inwards towards domain.

## 2. Code Quality & Invariants
- **Zero Magic Constants**: All model names, URL endpoints, timeout values, severity strings, and status codes must be defined as named constants in `src/domain/constants.ts`.
- **Immutability**: Domain value objects must enforce immutability with `Object.freeze()`.
- **Validation**: Value objects must validate invariants on construction and throw strongly-typed `ValidationError`.
- **Error Handling**: Custom error hierarchy extending `CritiqueError`. Zero uncaught unhandled exceptions.

## 3. Testing & Verification
- Unit test coverage for all domain value objects and application services.
- Deterministic tests using mocked command executors and fetch clients.
