# Loading Patterns Reference

This document contains the code templates for each loading page type. Read the page's content first, identify the type from the decision tree in SKILL.md, then follow the matching template here.

## Table of Contents

1. [List Loading](#1-list-loading)
2. [Form Sub-Page Loading](#2-form-sub-page-loading)
3. [Detail Overview Loading](#3-detail-overview-loading)
4. [Description List Loading](#4-description-list-loading)
5. [Cards Grid Loading](#5-cards-grid-loading)
6. [Custom Content Loading](#6-custom-content-loading)

---

## 1. List Loading

For pages that display a list/table with `Suspense` and `ListSkeleton`.

This is the simplest pattern — **only one file** needed (the page-level `loading.tsx`). It delegates to the shared `ListLoading` component.

### Page-level `loading.tsx`

```tsx
import { ListLoading } from "@/shared/components/ListLoading";
import { getTranslations } from "next-intl/server";

export default async function {RouteSegments}Loading() {
  const t = await getTranslations("{translationNamespace}");
  return <ListLoading title={t("title")} />;
}
```

**Key details:**
- Always `async` because `getTranslations` is a server function
- The translation namespace matches the page's namespace (look at the page's `getTranslations` call)
- The title key is typically `"title"` — check the page's `PageHeaderTitle` to confirm
- No feature-level component needed

### What `ListLoading` renders

The shared component renders: a page header with the title, a 4-column filter/search skeleton row, a column header row, and 6 data rows — all using `BoxSkeleton` and `TextSkeleton` with `Divider` separators.

---

## 2. Form Sub-Page Loading

For sub-pages that contain a form with `FormLayout` and a `Form` component.

### Page-level `loading.tsx`

```tsx
import { {FeatureName}Loading } from "@/features/{feature}/components/{FeatureName}Loading";

export default function {RouteSegments}Loading() {
  return <{FeatureName}Loading />;
}
```

### Feature-level loading component

```tsx
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";
import { getTranslations } from "next-intl/server";
import { SubPageHeaderSkeleton } from "@/shared/components/SubPageHeaderSkeleton";
import { FormSkeleton } from "@/shared/components/FormSkeleton";
import {
  FormLayout,
  FormLayoutArea,
} from "@finstreet/ui/components/pageLayout/Layout/FormLayout";

export async function {FeatureName}Loading() {
  const t = await getTranslations("{translationNamespace}");

  return (
    <>
      <SubPageHeaderSkeleton title={t("{titleKey}")} />
      <PageContent>
        <FormLayout>
          <FormLayoutArea gridArea={"form"}>
            <FormSkeleton />
          </FormLayoutArea>
        </FormLayout>
      </PageContent>
    </>
  );
}
```

**Key details:**
- Uses `SubPageHeaderSkeleton` which renders a back button, title, and a text skeleton subtitle
- `FormLayout` + `FormLayoutArea` with `gridArea="form"` matches the page's form layout
- `FormSkeleton` is a shared component that renders checkbox, input, radio, textarea, and button skeletons
- If the page has a `Typography` description between the header and form, add it before `FormLayout`:
  ```tsx
  <Typography>{t("description")}</Typography>
  ```
- Translation namespace and title key come from the page's `getTranslations` / header props
- Prefer async server component with `getTranslations` unless hooks are needed

### Variant: Form with description text

When the actual page renders a `Typography` description (e.g., `AssignSignatureLoading`):

```tsx
"use client";

import { useTranslations } from "next-intl";
import { SubPageHeaderSkeleton } from "@/shared/components/SubPageHeaderSkeleton";
import { Typography } from "@finstreet/ui/components/base/Typography";
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";
import { FormLayout, FormLayoutArea } from "@finstreet/ui/components/pageLayout/Layout/FormLayout";
import { FormSkeleton } from "@/shared/components/FormSkeleton";

export const {FeatureName}Loading = () => {
  const t = useTranslations("{translationNamespace}");
  return (
    <>
      <SubPageHeaderSkeleton title={t("title")} />
      <PageContent>
        <Typography>{t("description")}</Typography>
        <FormLayout>
          <FormLayoutArea gridArea={"form"}>
            <FormSkeleton />
          </FormLayoutArea>
        </FormLayout>
      </PageContent>
    </>
  );
};
```

---

## 3. Detail Overview Loading

For overview pages that display `TaskGroup` containers with task panels and actions.

This is the most complex pattern. It mirrors the page's task group structure with `BoxSkeleton` blocks.

### Page-level `loading.tsx`

```tsx
import { {FeatureName}OverviewLoading } from "@/features/{feature}/components/{FeatureName}OverviewLoading";

export default function {RouteSegments}Loading() {
  return <{FeatureName}OverviewLoading />;
}
```

### Feature-level loading component

```tsx
"use client";

import { routes } from "@/routes";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderBackButton,
  PageHeaderTitle,
} from "@finstreet/ui/components/pageLayout/PageHeader";
import { useTranslations } from "next-intl";
import { Box, HStack, VStack } from "@styled-system/jsx";
import { BoxSkeleton } from "@finstreet/ui/components/base/Skeletons/BoxSkeleton";
import { AvatarSkeleton } from "@finstreet/ui/components/base/Skeletons/AvatarSkeleton";
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";
import { TaskGroup } from "@finstreet/ui/components/patterns/TaskGroup";
import {
  TasksAndActionsLayout,
  TasksAndActionsLayoutArea as Area,
} from "@finstreet/ui/components/pageLayout/Layout/TasksAndActionsLayout";

export const {FeatureName}OverviewLoading = () => {
  const t = useTranslations("{translationNamespace}");
  return (
    <>
      <PageHeader>
        <PageHeaderBackButton href={routes.{backRoute}}>
          {t("header.back")}
        </PageHeaderBackButton>
        <PageHeaderTitle>
          <HStack justify={"space-between"} alignItems={"start"}>
            <Box>
              <Box py={1}>
                <BoxSkeleton width={200} height={42} />
              </Box>
              <VStack alignItems={"flex-start"} gap={1}>
                <BoxSkeleton width={100} height={5} />
                <BoxSkeleton width={150} height={5} />
                <BoxSkeleton width={50} height={5} />
              </VStack>
            </Box>
            <HStack pt={1}>
              <BoxSkeleton width={200} height={5} />
              <AvatarSkeleton size={"s"} />
            </HStack>
          </HStack>
        </PageHeaderTitle>
        <PageHeaderActions fullWidth={true}>
          <BoxSkeleton width={"100%"} height={42} />
        </PageHeaderActions>
      </PageHeader>
      <PageContent>
        <VStack gap={10} alignItems="stretch">
          {/* One TaskGroup per group on the actual page */}
          <TaskGroup label={t("{taskGroupLabelKey}")}>
            <TasksAndActionsLayout>
              <Area gridArea={"tasks"}>
                <VStack gap={4} alignItems={"stretch"}>
                  {/* One BoxSkeleton per task panel in the group */}
                  <BoxSkeleton width={"100%"} height={90} />
                  <BoxSkeleton width={"100%"} height={90} />
                </VStack>
              </Area>
              <Area gridArea={"actions"}>
                <BoxSkeleton width={"100%"} height={70} />
              </Area>
            </TasksAndActionsLayout>
          </TaskGroup>
          {/* Repeat for each task group... */}
        </VStack>
      </PageContent>
    </>
  );
};
```

**Key details:**
- Always a client component (`"use client"`) because it uses `useTranslations`
- The header skeleton mirrors the overview page's custom header: back button, title area with skeletons for the financing case number and subtitle info, plus a status/avatar area
- Each `TaskGroup` uses the same label translation key as the actual page
- Count the task panels in each group on the real page → that's how many `BoxSkeleton` items to put in the tasks area
- Task panel skeletons are typically `height={90}`, action skeletons `height={70}`
- If a task group has no actions area, omit the actions `Area`
- The back button `href` should use the appropriate route for the list page

---

## 4. Description List Loading

For pages that display key-value pairs using `DescriptionsList`.

### Page-level `loading.tsx`

```tsx
import { {FeatureName}Loading } from "@/features/{feature}/components/{FeatureName}Loading";

export default function {RouteSegments}Loading() {
  return <{FeatureName}Loading />;
}
```

### Feature-level loading component

```tsx
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";
import { getTranslations } from "next-intl/server";
import { SubPageHeaderSkeleton } from "@/shared/components/SubPageHeaderSkeleton";
import { TextSkeleton } from "@finstreet/ui/components/base/Skeletons/TextSkeleton";
import {
  DescriptionsList,
  DescriptionsListTerm,
  DescriptionsListDetails,
} from "@finstreet/ui/components/patterns/DescriptionsList";
import { VStack, Divider, Grid } from "@styled-system/jsx";

export async function {FeatureName}Loading() {
  const t = await getTranslations("{translationNamespace}");

  return (
    <>
      <SubPageHeaderSkeleton title={t("title")} />
      <PageContent>
        <VStack gap={4} alignItems={"stretch"}>
          <TextSkeleton lines={1} fontSize={"xl"} />
          <Divider color={"neutral.light"} />
          <Grid gap={12} columns={{ base: 1, sm: 2 }}>
            {Array.from({ length: {itemCount} }).map((_, index) => (
              <DescriptionsList key={index}>
                <DescriptionsListTerm>
                  <TextSkeleton lines={1} />
                </DescriptionsListTerm>
                <DescriptionsListDetails>
                  <TextSkeleton lines={1} fontSize={"l"} />
                </DescriptionsListDetails>
              </DescriptionsList>
            ))}
          </Grid>
        </VStack>
      </PageContent>
    </>
  );
}
```

**Key details:**
- The `{itemCount}` should match approximately how many description items the real page shows (typically 6-8)
- Uses a responsive 2-column grid (`columns={{ base: 1, sm: 2 }}`)
- Each item has a term (label) and detail (value) skeleton
- The section title skeleton (`fontSize: "xl"`) represents the section heading

---

## 5. Cards Grid Loading

For pages that display content in a card grid using `CardsGridLayout`.

### Page-level `loading.tsx`

```tsx
import { {FeatureName}Loading } from "@/features/{feature}/components/{FeatureName}Loading";

export default function {RouteSegments}Loading() {
  return <{FeatureName}Loading />;
}
```

### Feature-level loading component

```tsx
"use client";

import { SubPageHeaderSkeleton } from "@/shared/components/SubPageHeaderSkeleton";
import { BoxSkeleton } from "@finstreet/ui/components/base/Skeletons/BoxSkeleton";
import { Typography } from "@finstreet/ui/components/base/Typography";
import { CardsGridLayout } from "@finstreet/ui/components/pageLayout/Layout/CardsGridLayout";
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";
import { useTranslations } from "next-intl";

export function {FeatureName}Loading() {
  const t = useTranslations("{translationNamespace}");

  return (
    <>
      <SubPageHeaderSkeleton title={t("title")} />
      <PageContent>
        <Typography as={"p"}>{t("description")}</Typography>
        <CardsGridLayout columns={2}>
          <BoxSkeleton width={"100%"} height={"{cardHeight}"} />
          <BoxSkeleton width={"100%"} height={"{cardHeight}"} />
        </CardsGridLayout>
      </PageContent>
    </>
  );
}
```

**Key details:**
- Client component because it uses `useTranslations`
- The description text is real translated text (not a skeleton) — descriptions are static and known at load time
- `columns={2}` matches the typical cards grid layout
- Card skeleton height should approximate the real card height (e.g., `"200"` for compact cards, `"400"` for detailed cards)
- Number of `BoxSkeleton` items should represent a typical initial state (usually 2)

---

## 6. Custom Content Loading

For pages with unique content that doesn't fit the above patterns (document exchange, contracts, timeline, etc.). The approach is the same: mirror the page layout with `BoxSkeleton` blocks sized to match the actual content.

### Page-level `loading.tsx`

Same thin-wrapper pattern as above.

### Feature-level loading component

```tsx
"use client";

import { SubPageHeaderSkeleton } from "@/shared/components/SubPageHeaderSkeleton";
import { BoxSkeleton } from "@finstreet/ui/components/base/Skeletons/BoxSkeleton";
import { Typography } from "@finstreet/ui/components/base/Typography";
import { PageContent } from "@finstreet/ui/components/pageLayout/PageContent";
import { VStack } from "@styled-system/jsx";
import { useTranslations } from "next-intl";

export default function {FeatureName}Loading() {
  const t = useTranslations("{translationNamespace}");

  return (
    <>
      <SubPageHeaderSkeleton title={t("title")} />
      <PageContent>
        <Typography>{t("description")}</Typography>
        <VStack gap={contentGap} alignItems={"stretch"}>
          {/* Repeat BoxSkeleton for each content block, sized to match */}
          <BoxSkeleton width={"100%"} height={"{blockHeight}"} />
          <BoxSkeleton width={"100%"} height={"{blockHeight}"} />
        </VStack>
      </PageContent>
    </>
  );
}
```

**Guidelines for sizing:**
- Document blocks: `height={"250"}` — documents are tall cards with upload areas
- Contract blocks: `height={230}` — contracts show signature fields
- Timeline items: `height={"100"}` — compact timeline entries
- Action buttons at the bottom: use `HStack justifyContent={"space-between"}` with two `BoxSkeleton width={"200px"} height={15}`

The key principle: look at what the real page renders and approximate each distinct visual block with a `BoxSkeleton` of similar dimensions.
