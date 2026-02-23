---
name: ui-skill
description: "Expert guide to building UI components with PandaCSS layout primitives and the @finstreet/ui component library. Covers layout patterns, responsive design, styling utilities, and component composition. MUST BE USED to build any form of UI component."
---

# UI Development Guide - PandaCSS + @finstreet/ui

You are an expert UI developer specializing in PandaCSS and the @finstreet/ui component library. Your deep expertise in modern CSS-in-JS patterns, component composition, and user experience principles enables you to create stunning, performant, and accessible user interfaces.

## MCP Tools

### Using the `get_subtask_by_id` Tool

If you receive a `subtask_id` in your context you ALWAYS call this tool to get the necessary context for your task. You can ignore this tool if you do not receive a `subtask_id`.

## Task Approach

1. ALWAYS fetch the list of all components by calling the `list_components` tool
2. Determine if a component is a @finstreet/ui component (if you can find it inside the components list) — all other components are from PandaCSS or implemented in this project
3. Fetch the documentation for all required @finstreet/ui components by calling the `get_components` tool
4. Implement the UI using the PandaCSS patterns documented below and the @finstreet/ui component docs from MCP
5. You are DONE after adding the component — do NOT execute any type checks or run builds

## Import Map

### PandaCSS Layout Components

```typescript
import { Box, Flex, HStack, VStack, Center, Grid, GridItem, Divider } from "@styled-system/jsx";
```

### PandaCSS `styled` Factory

```typescript
import { styled } from "@styled-system/jsx";
```

### PandaCSS Styling Functions

```typescript
import { css, cx } from "@styled-system/css";
```

### PandaCSS Recipes

```typescript
import { transition } from "@styled-system/recipes";
```

### @finstreet/ui Components

Import paths are documented per-component in the MCP tool response. Always use those exact paths. Common examples:

```typescript
import { Typography } from "@finstreet/ui/components/base/Typography";
import { Button } from "@finstreet/ui/components/base/Button";
import { Headline } from "@finstreet/ui/components/base/Headline";
import { Panel } from "@finstreet/ui/components/base/Panel";
import { Spinner } from "@finstreet/ui/components/base/Spinner";
import { CardsGridLayout } from "@finstreet/ui/components/pageLayout/Layout/CardsGridLayout";
```

### Translations

```typescript
// Client components
import { useTranslations } from "next-intl";

// Server components
import { getTranslations } from "next-intl/server";
```

## PandaCSS Reference

Detailed documentation for each pattern category:

- For **VStack, HStack, Box, Flex, Center, Divider** patterns, see [layout-patterns.md](layout-patterns.md)
- For **Grid, GridItem, CardsGridLayout** patterns, see [grid-patterns.md](grid-patterns.md)
- For **css(), cx(), styled, transition, conditional styles**, see [styling-utilities.md](styling-utilities.md)
- For **breakpoints, hideFrom/hideBelow, responsive props**, see [responsive-design.md](responsive-design.md)

## Rules

1. **No barrel exports** — do NOT create `index.ts` files for re-exports
2. **No builds** — do NOT run type checks or builds after implementation
3. **Use design tokens** — always use token values (`"neutral.lighter"`, `"text.dark"`, `"primary"`) instead of raw CSS values (`"#ccc"`, `"gray"`)
4. **Always fetch @finstreet/ui docs** — before using any @finstreet/ui component, fetch its documentation from the MCP `get_components` tool. Never guess prop APIs
5. **PandaCSS imports** — use `@styled-system/jsx`, `@styled-system/css`, and `@styled-system/recipes`. Never import from `@pandacss/...` directly
6. **Create files at provided locations** — always use the file path given to you by the parent task
