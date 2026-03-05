# Styling Utilities

## `css()` Function

Generates class names from style objects. Import from `@styled-system/css`.

```typescript
import { css } from "@styled-system/css";
```

```tsx
<button
  className={css({
    py: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "light",
    borderRadius: "default",
    minH: "200",
    cursor: "pointer",
    background: { _hover: "neutral.lighter" },
  })}
>
  {children}
</button>
```

Use design tokens (e.g., `"light"`, `"default"`, `"neutral.lighter"`) instead of raw CSS values.

## `cx()` Function

Composes multiple class names. Import from `@styled-system/css`.

```typescript
import { css, cx } from "@styled-system/css";
```

```tsx
<button
  className={cx(
    css({
      py: 20,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      border: "light",
      borderRadius: "default",
      minH: "200",
      cursor: "pointer",
      background: { _hover: "neutral.lighter" },
    }),
    transition(),
  )}
>
  {children}
</button>
```

## `styled` Factory

Wraps HTML elements or React components with PandaCSS style props. Import from `@styled-system/jsx`.

```typescript
import { styled } from "@styled-system/jsx";
```

### Wrapping HTML elements

```tsx
// styled.button - clickable card
<styled.button
  display={"flex"}
  justifyContent={"center"}
  alignItems={"center"}
  border={"light"}
  borderRadius={"default"}
  py={12}
  minH={"160"}
  cursor={"pointer"}
  background={{ _hover: "neutral.lighter" }}
  className={transition()}
  onClick={handleClick}
>
  <Typography color={"text.dark"} fontWeight={"bold"}>
    {label}
  </Typography>
</styled.button>

// styled.span - inline text styling
<styled.span color={"text.light"} fontSize={"s"}>
  {subtitle}
</styled.span>

// styled.ul / styled.li - styled lists
<styled.ul listStyleType={"disc"} pl={6}>
  <styled.li>{item}</styled.li>
</styled.ul>
```

### Wrapping React components

Create a styled version of any React component to enable PandaCSS props:

```tsx
import { FaQuestion } from "react-icons/fa";

const StyledIcon = styled(FaQuestion);

<StyledIcon
  position={"absolute"}
  top={"10%"}
  left={"2.5%"}
  color={"primary"}
  fontSize={200}
/>
```

## `css` Prop

Apply inline styles on PandaCSS and @finstreet/ui components. Useful for one-off overrides.

```tsx
// Override whitespace behavior
<Typography
  color={"text.dark"}
  fontWeight={"bold"}
  css={{ whiteSpace: "normal" }}
  textAlign={"center"}
>
  {label}
</Typography>

// Responsive visibility (see responsive-design.md)
<Box css={{ hideBelow: "lg" }}>
  <DesktopContent />
</Box>
```

## `transition()` Recipe

Pre-defined transition recipe for hover/focus effects. Import from `@styled-system/recipes`.

```typescript
import { transition } from "@styled-system/recipes";
```

Use with `className` on native elements or `styled` components:

```tsx
// With cx() and css()
<button className={cx(css({ cursor: "pointer", background: { _hover: "neutral.lighter" } }), transition())}>
  {children}
</button>

// With styled factory
<styled.button
  cursor={"pointer"}
  background={{ _hover: "neutral.lighter" }}
  className={transition()}
>
  {children}
</styled.button>
```

## Conditional Styles

PandaCSS uses underscore-prefixed pseudo-class selectors inside style objects.

### Available conditions

| Condition    | CSS Pseudo-class |
|-------------|-----------------|
| `_hover`    | `:hover`        |
| `_focus`    | `:focus`        |
| `_active`   | `:active`       |
| `_disabled` | `:disabled`     |
| `_first`    | `:first-child`  |
| `_last`     | `:last-child`   |

### Usage

```tsx
// As a style prop value (object syntax)
<styled.button
  background={{ _hover: "neutral.lighter" }}
  color={{ _disabled: "text.light" }}
  cursor={"pointer"}
/>

// Inside css() function
css({
  background: { _hover: "neutral.lighter" },
  transform: { _active: "scale(0.98)" },
})
```
