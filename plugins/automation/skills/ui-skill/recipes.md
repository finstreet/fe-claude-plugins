# Recipes

PandaCSS recipes create reusable, variant-driven style functions. There are two categories, each with a single-element and multi-slot variant:

| | Single element | Multi-slot |
|---|---|---|
| **Atomic** (code-level) | `cva` | `sva` |
| **Config** (panda.config) | `defineRecipe` | `defineSlotRecipe` |

**Atomic recipes** (`cva`/`sva`) are defined inline in your component files. They generate all variant CSS upfront.

**Config recipes** (`defineRecipe`/`defineSlotRecipe`) are defined in `panda.config.ts`. They use just-in-time generation — only variants actually used in your code produce CSS. They also support responsive/conditional variant values.

---

## Atomic Recipes (`cva`)

Create a style function that returns a single class string based on variant selection.

```typescript
import { cva, type RecipeVariantProps } from "@styled-system/css";
```

### Configuration

```typescript
const recipe = cva({
  base: { /* ... */ },              // Base styles applied to all variants
  variants: { /* ... */ },          // Named variant groups with style options
  defaultVariants: { /* ... */ },   // Fallback variant values when not specified
  compoundVariants: [ /* ... */ ],  // Styles applied for specific variant combinations
});
```

### Basic Example

```typescript
const badge = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "full",
    fontWeight: "medium",
  },
  variants: {
    status: {
      success: { background: "success", color: "white" },
      warning: { background: "warning", color: "text.black" },
      error: { background: "error", color: "white" },
    },
    size: {
      sm: { px: 2, py: 0.5, fontSize: "xs" },
      md: { px: 3, py: 1, fontSize: "s" },
      lg: { px: 4, py: 2, fontSize: "m" },
    },
  },
  defaultVariants: {
    status: "success",
    size: "md",
  },
});
```

### Usage

Calling the recipe returns a class string:

```tsx
// Explicit variants
<span className={badge({ status: "error", size: "lg" })}>Critical</span>

// Defaults applied (status: "success", size: "md")
<span className={badge()}>OK</span>
```

### Boolean Variants

Use `"true"` / `"false"` as variant keys. PandaCSS converts them to boolean props:

```typescript
const card = cva({
  base: { borderRadius: "default", p: 4 },
  variants: {
    elevated: {
      true: { boxShadow: "lg" },
      false: { border: "light" },
    },
  },
});

// Usage — pass a boolean
<div className={card({ elevated: true })} />
```

### Compound Variants

Apply styles when a specific combination of variants is active:

```typescript
const button = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  variants: {
    variant: {
      primary: { background: "primary", color: "white" },
      outline: { border: "light", background: "transparent" },
    },
    size: {
      sm: { px: 3, py: 1, fontSize: "s" },
      lg: { px: 6, py: 3, fontSize: "l" },
    },
  },
  compoundVariants: [
    {
      variant: "outline",
      size: "lg",
      css: {
        borderWidth: 2,
      },
    },
  ],
  defaultVariants: {
    variant: "primary",
    size: "sm",
  },
});
```

Compound variants also support **array values** for OR logic — match any of the listed values:

```typescript
compoundVariants: [
  {
    variant: ["outline", "ghost"],   // matches outline OR ghost
    size: "lg",
    css: { fontWeight: "bold" },
  },
],
```

### Type Extraction

Extract variant props as a TypeScript type for component interfaces:

```typescript
import { cva, type RecipeVariantProps } from "@styled-system/css";

const badge = cva({
  base: { display: "inline-flex" },
  variants: {
    status: {
      success: { background: "success" },
      error: { background: "error" },
    },
    size: {
      sm: { fontSize: "s" },
      lg: { fontSize: "l" },
    },
  },
});

// All variant props as optional
type BadgeVariants = RecipeVariantProps<typeof badge>;
// { status?: "success" | "error" | undefined; size?: "sm" | "lg" | undefined }

type BadgeProps = BadgeVariants & {
  children: React.ReactNode;
};
```

### Runtime Helpers

Every `cva` recipe exposes these properties:

```typescript
const recipe = cva({ /* ... */ });

// Array of variant group names
recipe.variantKeys;    // ["status", "size"]

// Map of variant names to their available values
recipe.variantMap;     // { status: ["success", "error"], size: ["sm", "lg"] }

// Separate variant props from other props (useful for forwarding rest props)
const [variantProps, restProps] = recipe.splitVariantProps(props);

// Get resolved variant props (with defaults applied)
recipe.getVariantProps({ status: "error" });
// { status: "error", size: "md" }  (size filled from defaultVariants)
```

### `splitVariantProps` Pattern

Separate variant props from HTML/component props when building wrappers:

```tsx
type BadgeProps = RecipeVariantProps<typeof badge> & React.HTMLAttributes<HTMLSpanElement>;

const Badge = (props: BadgeProps) => {
  const [variantProps, restProps] = badge.splitVariantProps(props);
  return <span className={badge(variantProps)} {...restProps} />;
};

// Usage — variant props extracted, rest forwarded to <span>
<Badge status="error" size="lg" onClick={handleClick} data-testid="badge">
  Critical
</Badge>
```

### Composing with `cx()`

Combine a recipe with additional one-off styles or other class strings:

```tsx
import { css, cx } from "@styled-system/css";

<button
  className={cx(
    badge({ status: "success", size: "md" }),
    css({ mt: 4 }),
    transition(),
  )}
>
  {label}
</button>
```

### Limitation

Atomic recipes (`cva`) do **not** support responsive or conditional variant values:

```tsx
// This does NOT work with cva
badge({ size: { base: "sm", md: "lg" } })  // ERROR
```

Use config recipes (`defineRecipe`) if you need responsive variants.

---

## Config Recipes (`defineRecipe`)

Config recipes are defined in `panda.config.ts` and benefit from just-in-time CSS generation — only variants actually used in your code produce CSS output.

```typescript
// In recipe definition file
import { defineRecipe } from "@pandacss/dev";
```

### Configuration

```typescript
const recipe = defineRecipe({
  className: "button",         // Required — used in generated class names
  description: "Button styles", // Optional — appears in generated JSDoc
  jsx: ["Button", "IconButton"], // Optional — JSX components using this recipe
  base: { /* ... */ },
  variants: { /* ... */ },
  defaultVariants: { /* ... */ },
  compoundVariants: [ /* ... */ ],
});
```

| Option | Description |
|--------|-------------|
| `className` | Name used in generated CSS classes (e.g., `.button--size-lg`) |
| `description` | JSDoc comment in generated code |
| `jsx` | Array of JSX component names to track for usage detection. Defaults to capitalized recipe name |
| `base` | Base styles (same as `cva`) |
| `variants` | Variant groups (same as `cva`) |
| `defaultVariants` | Default values (same as `cva`) |
| `compoundVariants` | Compound conditions (same as `cva`) |

### Defining in panda.config.ts

```typescript
// src/recipes/buttonRecipe.ts
import { defineRecipe } from "@pandacss/dev";

export const buttonRecipe = defineRecipe({
  className: "button",
  description: "The styles for the Button component",
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  variants: {
    visual: {
      solid: { background: "primary", color: "white" },
      outline: { border: "light" },
    },
    size: {
      sm: { padding: 4, fontSize: "s" },
      lg: { padding: 8, fontSize: "l" },
    },
  },
  defaultVariants: {
    visual: "solid",
    size: "sm",
  },
});
```

```typescript
// panda.config.ts
import { defineConfig } from "@pandacss/dev";
import { buttonRecipe } from "./src/recipes/buttonRecipe";

export default defineConfig({
  theme: {
    extend: {
      recipes: {
        button: buttonRecipe,
      },
    },
  },
});
```

After adding, run `panda codegen` to regenerate the styled-system output.

### Usage

Import from the generated recipes directory:

```typescript
import { button } from "@styled-system/recipes";

<button className={button({ visual: "outline", size: "lg" })}>
  Click me
</button>
```

### Responsive Variants

Config recipes support responsive variant values (atomic `cva` does not):

```tsx
import { button } from "@styled-system/recipes";

// Size changes at md breakpoint
<button className={button({ size: { base: "sm", md: "lg" } })}>
  Responsive Button
</button>
```

**Important constraint:** Using `compoundVariants` in a config recipe disables responsive variant values for that recipe.

### Generated CSS

Config recipes produce semantic class names under the `recipes` cascade layer:

```css
@layer recipes {
  .button { display: flex; align-items: center; }
  .button--visual-solid { background: var(--colors-primary); }
  .button--size-lg { padding: var(--spacing-8); }
}
```

### Key Advantage Over `cva`

Only used variant combinations generate CSS. If your code only uses `button({ size: "sm" })`, the `size: "lg"` styles are never emitted.

---

## Atomic Slot Recipes (`sva`)

Create style functions for multi-part components where each "slot" gets its own class string.

```typescript
import { sva } from "@styled-system/css";
```

### Configuration

```typescript
const recipe = sva({
  slots: ["root", "control", "label"],   // Required — named parts
  base: { /* per-slot base styles */ },
  variants: { /* per-slot variant styles */ },
  defaultVariants: { /* ... */ },
  compoundVariants: [ /* ... */ ],
});
```

### Basic Example

```typescript
const card = sva({
  slots: ["root", "header", "body", "footer"],
  base: {
    root: {
      borderRadius: "default",
      border: "light",
      overflow: "hidden",
    },
    header: {
      p: 4,
      borderBottom: "light",
      fontWeight: "bold",
    },
    body: {
      p: 4,
    },
    footer: {
      p: 4,
      borderTop: "light",
      display: "flex",
      justifyContent: "flex-end",
      gap: 2,
    },
  },
  variants: {
    variant: {
      elevated: {
        root: { boxShadow: "lg", border: "none" },
      },
      outline: {
        root: { border: "light" },
      },
    },
    size: {
      sm: {
        header: { p: 2, fontSize: "s" },
        body: { p: 2 },
        footer: { p: 2 },
      },
      lg: {
        header: { p: 6, fontSize: "l" },
        body: { p: 6 },
        footer: { p: 6 },
      },
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "sm",
  },
});
```

### Usage

Calling the recipe returns an object with a class string per slot:

```tsx
const styles = card({ variant: "elevated", size: "lg" });

<div className={styles.root}>
  <div className={styles.header}>
    <Typography fontWeight="bold">{title}</Typography>
  </div>
  <div className={styles.body}>
    {children}
  </div>
  <div className={styles.footer}>
    <Button variant="secondary">{t("cancel")}</Button>
    <Button variant="primary">{t("confirm")}</Button>
  </div>
</div>
```

### Compound Variants

Compound variants in slot recipes apply per-slot styles via a `css` object keyed by slot name:

```typescript
const checkbox = sva({
  slots: ["root", "control", "label"],
  base: {
    root: { display: "flex", alignItems: "center", gap: 2 },
    control: { borderWidth: 1, borderRadius: "sm" },
    label: { marginStart: 2 },
  },
  variants: {
    size: {
      sm: {
        control: { width: 8, height: 8 },
        label: { fontSize: "s" },
      },
      md: {
        control: { width: 10, height: 10 },
        label: { fontSize: "m" },
      },
    },
    checked: {
      true: {
        control: { background: "primary", borderColor: "primary" },
      },
    },
  },
  compoundVariants: [
    {
      size: "sm",
      checked: true,
      css: {
        control: { borderColor: "success" },
      },
    },
  ],
});
```

### `splitVariantProps`

Works the same as `cva` — separate variant props from rest props:

```tsx
type CheckboxProps = RecipeVariantProps<typeof checkbox> & {
  children: React.ReactNode;
  value?: string;
};

const Checkbox = (props: CheckboxProps) => {
  const [variantProps, restProps] = checkbox.splitVariantProps(props);
  const styles = checkbox(variantProps);

  return (
    <label className={styles.root}>
      <input type="checkbox" className={css({ srOnly: true })} {...restProps} />
      <div className={styles.control} />
      <span className={styles.label}>{restProps.children}</span>
    </label>
  );
};
```

### Limitation

Same as `cva` — atomic slot recipes do **not** support responsive variant values. Use `defineSlotRecipe` if needed.

---

## Config Slot Recipes (`defineSlotRecipe`)

Slot recipes defined in `panda.config.ts` with JIT generation and semantic class names.

```typescript
// In recipe definition file
import { defineSlotRecipe } from "@pandacss/dev";
```

### Configuration

```typescript
const recipe = defineSlotRecipe({
  className: "checkbox",           // Required — base for generated class names
  description: "Checkbox styles",  // Optional — JSDoc
  jsx: ["Checkbox"],               // Optional — component tracking
  slots: ["root", "control", "label"],
  base: { /* per-slot styles */ },
  variants: { /* per-slot variants */ },
  defaultVariants: { /* ... */ },
  compoundVariants: [ /* ... */ ],
});
```

### Defining in panda.config.ts

```typescript
// src/recipes/checkboxRecipe.ts
import { defineSlotRecipe } from "@pandacss/dev";

export const checkboxRecipe = defineSlotRecipe({
  className: "checkbox",
  description: "The styles for the Checkbox component",
  slots: ["root", "control", "label"],
  base: {
    root: { display: "flex", alignItems: "center", gap: 2 },
    control: { borderWidth: 1, borderRadius: "sm" },
    label: { marginStart: 2 },
  },
  variants: {
    size: {
      sm: {
        control: { width: 8, height: 8 },
        label: { fontSize: "s" },
      },
      md: {
        control: { width: 10, height: 10 },
        label: { fontSize: "m" },
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
```

```typescript
// panda.config.ts
import { defineConfig } from "@pandacss/dev";
import { checkboxRecipe } from "./src/recipes/checkboxRecipe";

export default defineConfig({
  theme: {
    extend: {
      slotRecipes: {
        checkbox: checkboxRecipe,
      },
    },
  },
});
```

### Usage

```typescript
import { checkbox } from "@styled-system/recipes";

const styles = checkbox({ size: "md" });

<label className={styles.root}>
  <input type="checkbox" className={css({ srOnly: true })} />
  <div className={styles.control} />
  <span className={styles.label}>Accept terms</span>
</label>
```

### Generated CSS

Config slot recipes produce semantic, slot-scoped class names:

```css
@layer recipes {
  @layer base {
    .checkbox__root { display: flex; align-items: center; gap: var(--spacing-2); }
    .checkbox__control { border-width: 1px; border-radius: var(--radii-sm); }
    .checkbox__label { margin-inline-start: var(--spacing-2); }
  }

  .checkbox__control--size-sm { width: var(--spacing-8); height: var(--spacing-8); }
  .checkbox__label--size-md { font-size: var(--font-sizes-m); }
}
```

### Responsive Variants

Config slot recipes support responsive variant values:

```tsx
const styles = checkbox({ size: { base: "sm", lg: "md" } });
```

**Important constraint:** Using `compoundVariants` disables responsive variant values.

---

## When to Use Which

| Scenario | Use |
|----------|-----|
| Single element with visual variants, defined in component file | `cva` |
| Multi-part component, defined in component file | `sva` |
| Single element, shared across many components, needs responsive variants | `defineRecipe` |
| Multi-part component, shared across many components, needs responsive variants | `defineSlotRecipe` |
| One-off styles without variants | `css()` (see [styling-utilities.md](styling-utilities.md)) |
| Wrapping HTML/React elements with style props | `styled` (see [styling-utilities.md](styling-utilities.md)) |

**Rules of thumb:**
- Prefer `cva`/`sva` for component-scoped recipes — simpler, no config changes needed
- Use `defineRecipe`/`defineSlotRecipe` when you need responsive variants or want to minimize generated CSS in large recipe definitions
- Config recipes require running `panda codegen` after changes
