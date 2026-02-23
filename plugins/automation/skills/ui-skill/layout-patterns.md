# Layout Patterns

All layout components are imported from `@styled-system/jsx`.

```typescript
import { VStack, HStack, Box, Flex, Center, Divider } from "@styled-system/jsx";
```

## VStack

Vertical stack - arranges children in a column with consistent spacing.

**Key props:** `gap`, `alignItems`, `width`

```tsx
// Form-style stacked content
<VStack alignItems={"stretch"} gap={4}>
  <CardsGridLayout columns={{ base: 1, lg: 2 }}>
    {items.map((item) => <ItemPanel key={item.id} item={item} />)}
  </CardsGridLayout>
  <Flex justifyContent={"flex-end"} mt={12}>
    <ConfirmButton />
  </Flex>
</VStack>

// Text content stack
<VStack gap={4} alignItems={"flex-start"}>
  <Headline as={"h1"}>{t("title")}</Headline>
  <Typography as={"p"} fontSize={"l"}>{t("description")}</Typography>
  <Box mt={2}>
    <BackButton />
  </Box>
</VStack>

// Label + value pair
<VStack width={"100%"} alignItems={"flex-start"} gap={1}>
  <Typography fontSize={"s"} color={"text.dark"}>
    {t("columns.label")}
  </Typography>
  <Typography fontWeight="bold" fontSize={"l"} color={"text.black"}>
    {value}
  </Typography>
</VStack>

// Filter actions (mobile layout)
<VStack gap={4} width="full" alignItems={"stretch"} py={4}>
  {children}
</VStack>
```

## HStack

Horizontal stack - arranges children in a row with consistent spacing.

**Key props:** `gap`, `justifyContent`, `alignItems`

```tsx
// Basic horizontal group
<HStack gap={4}>
  <StatusCake totalSteps={total} doneSteps={current} size={32} />
  <Typography>{statusLabel}</Typography>
</HStack>

// Responsive filter bar
<HStack
  gap={4}
  width="full"
  alignItems={{ base: "stretch", lg: "flex-end" }}
  flexDirection={{ base: "column", lg: "row" }}
  py={4}
>
  {filterFields}
  <Button onClick={reset} variant={"text"}>{t("reset")}</Button>
</HStack>

// Button group with spacer
<HStack gap={4} justifyContent={"flex-end"}>
  <Button variant="secondary">{t("cancel")}</Button>
  <Button variant="primary">{t("submit")}</Button>
</HStack>
```

## Box

General-purpose container for spacing, constraints, and flex behaviors.

**Key props:** `p`, `m`, `mt`, `mb`, `py`, `px`, `width`, `display`, `flexGrow`

```tsx
// Spacing wrapper
<Box mt={2}>
  <BackButton />
</Box>

// Centered empty state
<Box py={12} textAlign="center">
  <Typography as={"p"} color="text.light">{t("noItems")}</Typography>
</Box>

// Flex container with alignment
<Box
  display={"flex"}
  alignItems={"center"}
  justifyContent={"stretch"}
  flexDirection={{ base: "column", md: "row" }}
  gap={{ base: 4, md: 20 }}
  pb={{ base: 8, md: 40 }}
  px={8}
>
  <Illustration />
  <Content />
</Box>

// Row item with padding + responsive visibility
<Box py={4} css={{ hideBelow: "lg" }}>
  <InteractiveListGrid gridTemplateAreas={gridTemplateAreas}>
    {columns}
  </InteractiveListGrid>
</Box>

// Fixed-height flex child
<Box height={15} display={"flex"} justifyContent={"flex-end"} alignItems={"stretch"}>
  <Button onClick={reset} variant={"text"}>{t("reset")}</Button>
</Box>

// Absolute positioning
<Box position={"relative"} width={"400px"} height={"400px"}>
  <StyledIcon position={"absolute"} top={"10%"} left={"2.5%"} />
</Box>
```

## Flex

Shorthand flex container. Equivalent to `Box` with `display: flex`.

**Key props:** `justify`, `align`, `gap`, `direction`

```tsx
// Right-aligned action
<Flex justifyContent={"flex-end"} mt={12}>
  <ConfirmButton />
</Flex>
```

## Center

Centers its children both horizontally and vertically. Commonly used for loading spinners.

```tsx
import { Spinner } from "@finstreet/ui/components/base/Spinner";

<Center>
  <Spinner />
</Center>
```

## Divider

Horizontal rule with color token support.

**Key props:** `color`

```tsx
// Section separator (neutral)
<Divider color={"neutral.light"} />

// Content separator (darker)
<Divider color="text.light" />
```
