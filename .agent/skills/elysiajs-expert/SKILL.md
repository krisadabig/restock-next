---
name: elysiajs-expert
description: Use this skill when the user wants to build, refactor, or debug web APIs using ElysiaJS and Bun. It covers routing, middleware, and type-safety patterns.
---

# ElysiaJS Expert Skill

## Goal
To assist the user in building high-performance, type-safe web applications using the ElysiaJS framework on the Bun runtime.

## Core Instructions
1. **Tech Stack**: Always prefer Bun for package management and execution (`bun add`, `bun run`).
2. **Schema Validation**: Use the built-in `t` from `elysia` for schema validation and type inference.
3. **Project Scaffolding**: If starting a new project, suggest `bun create elysia app-name`.
4. **Documentation**: Automatically integrate the `@elysiajs/openapi` (Swagger) plugin for all new projects.
5. **Pattern Preference**: 
   - Use `group()` for organizing routes.
   - Use `guard()` for shared logic like authentication.
   - Use `state` and `derive` for context management.

## Example Usage
- **User Prompt**: "Set up a new Elysia API with a user login route."
- **Skill Action**: The agent will recognize the "Elysia" keyword, activate this skill, and generate an implementation plan using `Elysia`, `t.Object`, and Bun.

## Constraints
- Do not use `express` or `fastify` unless specifically requested.
- Avoid using `npm` or `yarn` commands; stick to `bun`.