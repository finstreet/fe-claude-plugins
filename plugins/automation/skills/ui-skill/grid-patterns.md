# Grid Patterns

Grid components are imported from `@styled-system/jsx`.

```typescript
import { Grid, GridItem } from "@styled-system/jsx";
```

## Grid with `columns` Prop

Simplest approach - evenly-sized columns with responsive support.

```tsx
// Responsive card grid: 1 column on mobile, 2 on large screens
<Grid columns={{ base: 1, sm: 2 }} gap={4}>
  {items.map((item) => <Card key={item.id} item={item} />)}
</Grid>

// Mobile card layout inside a Panel
<Grid columns={2} rowGap={8} columnGap={4}>
  <GridItem>
    <VStack width={"100%"} alignItems={"flex-start"} gap={1}>
      <Typography fontSize={"s"} color={"text.dark"}>{label}</Typography>
      <Typography fontWeight="bold" fontSize={"l"}>{value}</Typography>
    </VStack>
  </GridItem>
  <GridItem>
    <VStack width={"100%"} alignItems={"flex-start"} gap={1}>
      <Typography fontSize={"s"} color={"text.dark"}>{label2}</Typography>
      <Typography>{value2}</Typography>
    </VStack>
  </GridItem>
  <GridItem colSpan={2}>
    <VStack width={"100%"} alignItems={"flex-start"} gap={1}>
      <Typography fontSize={"s"} color={"text.dark"}>{label3}</Typography>
      <Typography>{value3}</Typography>
    </VStack>
  </GridItem>
</Grid>
```

## Grid with `gridTemplateColumns`

Explicit column sizing for non-uniform layouts.

```tsx
// Key-value display: label takes available space, value is auto-sized
<Grid gridTemplateColumns={"1fr auto"} gap={0}>
  {displayValues.map((item) => (
    <Fragment key={item.label}>
      <GridItem>
        <Typography>{item.label}</Typography>
      </GridItem>
      <GridItem>
        <Typography fontWeight={"bold"}>{item.value}</Typography>
      </GridItem>
    </Fragment>
  ))}
</Grid>

// Header with edit button
<Grid gridTemplateColumns={"1fr min-content"} gap={4}>
  <Typography fontWeight={"bold"} fontSize={"l"}>{title}</Typography>
  <EditButton />
</Grid>

// Loading skeleton columns
<Grid gridTemplateColumns={"repeat(3, 2fr) 1fr"} px={4}>
  <BoxSkeleton height={16} width={"100%"} />
  <BoxSkeleton height={16} width={"100%"} />
  <BoxSkeleton height={16} width={"100%"} />
  <BoxSkeleton height={16} width={"50%"} />
</Grid>

// Even columns
<Grid gap={12} gridTemplateColumns={"repeat(4, 1fr)"} pt={2} pb={1}>
  <TextSkeleton lines={1} />
  <TextSkeleton lines={1} />
  <TextSkeleton lines={1} />
  <TextSkeleton lines={1} />
</Grid>
```

## Grid with `gridTemplateAreas`

Named areas for complex data table layouts. Used with `InteractiveListGrid`.

```tsx
const gridTemplateAreas =
  '"financingCase financingCase details details nameOfGdWE nameOfGdWE applicant applicant status status status actions"';

// Column headers
<InteractiveListGrid gridTemplateAreas={gridTemplateAreas}>
  <InteractiveListColumn gridArea={"financingCase"}>
    <Typography as="p" color="text.dark" fontWeight="medium">
      {t("columns.financingCase")}
    </Typography>
  </InteractiveListColumn>
  <InteractiveListColumn gridArea={"details"}>
    <Typography as="p" color="text.dark" fontWeight="medium">
      {t("columns.details")}
    </Typography>
  </InteractiveListColumn>
  {/* ... more columns */}
</InteractiveListGrid>

// Row data
<InteractiveListGrid gridTemplateAreas={gridTemplateAreas}>
  <InteractiveListColumn gridArea={"financingCase"}>
    <VStack width={"100%"} alignItems={"flex-start"} gap={1}>
      <Typography fontWeight="bold" fontSize={"l"}>{item.id}</Typography>
      <Typography color="text.light">
        <DateFormat value={item.createdAt.toString()} type="date" />
      </Typography>
    </VStack>
  </InteractiveListColumn>
  {/* ... more columns */}
</InteractiveListGrid>
```

## GridItem

Controls individual grid cell behavior.

**Key props:** `colSpan`, `display`, `alignItems`

```tsx
// Span multiple columns
<GridItem colSpan={2}>
  <VStack width={"100%"} alignItems={"flex-start"} gap={1}>
    <Typography fontSize={"s"}>{label}</Typography>
    <Typography>{longValue}</Typography>
  </VStack>
</GridItem>
```

## CardsGridLayout

`@finstreet/ui` wrapper for responsive card grids. Always uses `columns` prop with responsive object.

```typescript
import { CardsGridLayout } from "@finstreet/ui/components/pageLayout/Layout/CardsGridLayout";
```

```tsx
<VStack alignItems={"stretch"} gap={4}>
  <CardsGridLayout columns={{ base: 1, lg: 2 }}>
    {items.map((item) => (
      <ItemPanel key={item.id} item={item} />
    ))}
    {isEditable && <EmptyItemCard />}
  </CardsGridLayout>
</VStack>
```
