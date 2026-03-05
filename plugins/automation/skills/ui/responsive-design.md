# Responsive Design

## Breakpoints

PandaCSS uses mobile-first breakpoints (min-width):

| Token | Width   | Typical Use          |
|-------|---------|---------------------|
| `sm`  | 640px   | Large phones         |
| `md`  | 768px   | Tablets              |
| `lg`  | 1024px  | Desktops             |
| `xl`  | 1280px  | Wide desktops        |
| `2xl` | 1536px  | Ultra-wide screens   |

## Responsive Props

Any style prop accepts a responsive object with breakpoint keys. Always starts with `base` (mobile-first).

```tsx
// Direction changes at md breakpoint
<Box
  display={"flex"}
  flexDirection={{ base: "column", md: "row" }}
  gap={{ base: 4, md: 20 }}
  pb={{ base: 8, md: 40 }}
/>

// Alignment changes at lg breakpoint
<HStack
  alignItems={{ base: "stretch", lg: "flex-end" }}
  flexDirection={{ base: "column", lg: "row" }}
/>

// Responsive grid columns
<Grid columns={{ base: 1, sm: 2 }} gap={4}>
  {children}
</Grid>

// Responsive card layout
<CardsGridLayout columns={{ base: 1, lg: 2 }}>
  {cards}
</CardsGridLayout>
```

## Visibility: `hideFrom` / `hideBelow`

Control element visibility at breakpoints. Applied via the `css` prop.

| Utility     | Behavior                                      |
|-------------|-----------------------------------------------|
| `hideFrom`  | Hidden at and above the specified breakpoint   |
| `hideBelow` | Hidden below the specified breakpoint          |

```tsx
// Show only on mobile (hidden from lg and up)
<Box css={{ hideFrom: "lg" }}>
  <MobileContent />
</Box>

// Show only on desktop (hidden below lg)
<Box css={{ hideBelow: "lg" }}>
  <DesktopContent />
</Box>
```

## Dual-View Pattern

Render separate mobile and desktop layouts using `hideFrom`/`hideBelow`. This is the standard pattern for responsive list items.

```tsx
const renderItem = (item: ItemType) => (
  <>
    {/* Mobile: Card layout */}
    <Panel css={{ hideFrom: "lg" }}>
      <Grid columns={2} rowGap={8} columnGap={4}>
        <GridItem>
          <VStack width={"100%"} alignItems={"flex-start"} gap={1}>
            <Typography fontSize={"s"} color={"text.dark"}>
              {t("columns.label")}
            </Typography>
            <Typography fontWeight="bold" fontSize={"l"} color={"text.black"}>
              {item.value}
            </Typography>
          </VStack>
        </GridItem>
        <GridItem colSpan={2}>
          <VStack width={"100%"} alignItems={"flex-start"} gap={1}>
            <Typography fontSize={"s"} color={"text.dark"}>
              {t("columns.fullWidthLabel")}
            </Typography>
            <Typography>{item.longValue}</Typography>
          </VStack>
        </GridItem>
      </Grid>
    </Panel>

    {/* Desktop: Table row layout */}
    <Box py={4} css={{ hideBelow: "lg" }}>
      <InteractiveListGrid gridTemplateAreas={gridTemplateAreas}>
        <InteractiveListColumn gridArea={"label"}>
          <Typography fontWeight="bold">{item.value}</Typography>
        </InteractiveListColumn>
        {/* ... more columns */}
      </InteractiveListGrid>
    </Box>
  </>
);
```

## Responsive Actions Pattern

Render different action layouts for mobile (collapsible) vs desktop (inline).

```tsx
// Desktop: horizontal filter bar
<Box css={{ hideBelow: "lg" }}>
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
</Box>

// Mobile: collapsible panel
<Box css={{ hideFrom: "lg" }}>
  <Panel p={0}>
    <Collapsible>
      <CollapsibleToggle>
        <Box p={4}>
          <Typography color={"text.primary"} as={"p"}>
            {t("filterLabel")}
          </Typography>
        </Box>
      </CollapsibleToggle>
      <CollapsibleContent>
        <Box p={4}>
          <VStack gap={4} width="full" alignItems={"stretch"} py={4}>
            {filterFields}
            <Button onClick={reset} variant={"text"}>{t("reset")}</Button>
          </VStack>
        </Box>
      </CollapsibleContent>
    </Collapsible>
  </Panel>
</Box>
```
