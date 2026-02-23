---
name: modal
description: "Complete guide to implementing modals in the finstreet context. Covers the store, modal component, and optional open button. Use when building or modifying any modal."
---

# Modal — Complete Guide

Every modal consists of up to three files:

1. **Store** — Zustand store to control open state and typed data
2. **Modal** — The modal UI component
3. **Open Button** — *(optional)* Only create this when explicitly requested

## Directory Structure

```
{parentDirectory}/
  ├── store.ts
  ├── {ModalName}Modal.tsx
  └── Open{ModalName}ModalButton.tsx   ← only if requested
```

## 1. Store

File: `store.ts`

```typescript
import { create } from "zustand";

type {ModalName}ModalData = {
  financingCaseId: string;
} | null;

interface {ModalName}ModalStore {
  isOpen: boolean;
  data: {ModalName}ModalData;
  setIsOpen: (isOpen: boolean) => void;
  setData: (data: {ModalName}ModalData) => void;
}

export const use{ModalName}Modal = create<{ModalName}ModalStore>((set) => ({
  isOpen: false,
  data: null,
  setIsOpen: (isOpen) => set({ isOpen }),
  setData: (data) => set({ data, isOpen: true }),
}));
```

- `data` holds the typed payload the modal needs (e.g., IDs passed from the trigger)
- `setData` always sets `isOpen: true` — opening and setting data happen together
- Shape the `{ModalName}ModalData` type to match exactly what the modal content needs

## 2. Modal Component

File: `{ModalName}Modal.tsx`

```tsx
"use client";

import {
  Modal,
  ModalContent,
  ModalTitle,
} from "@finstreet/ui/components/patterns/Modal";
import { use{ModalName}Modal } from "./store";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Headline } from "@finstreet/ui/components/base/Headline";
import { Typography } from "@finstreet/ui/components/base/Typography";
import { VStack } from "@styled-system/jsx";

export const {ModalName}Modal = () => {
  const { isOpen, data, setIsOpen } = use{ModalName}Modal();
  const t = useTranslations("{translation.namespace}");

  if (!data) {
    return null;
  }

  const { financingCaseId } = data;

  return (
    <Modal open={isOpen} onClose={() => setIsOpen(false)}>
      <ModalTitle>
        {/* See title patterns below */}
      </ModalTitle>
      <ModalContent>
        {/* Modal content here */}
      </ModalContent>
    </Modal>
  );
};
```

### ModalTitle variants

Use exactly one of these based on whether a subheading is present in the context:

**With title and subheading:**
```tsx
<ModalTitle>
  <VStack gap={1} alignItems={"flex-start"}>
    <Headline>{t("title")}</Headline>
    <Typography color={"text.dark"}>{t("subheading")}</Typography>
  </VStack>
</ModalTitle>
```

**Title only (no subheading):**
```tsx
<ModalTitle>
  {t("title")}
</ModalTitle>
```

### Rules

- Always guard with `if (!data) return null` before destructuring data
- Wrap async content (e.g., forms with server actions) in `<Suspense>`
- Hardcoded strings are acceptable — translations are cleaned up separately

## 3. Open Button *(optional)*

File: `Open{ModalName}ModalButton.tsx`

**Only create this file when explicitly asked to.**

```tsx
"use client";

import { use{ModalName}Modal } from "./store";
import { Button } from "@finstreet/ui/components/base/Button";
import { useTranslations } from "next-intl";

type Open{ModalName}ModalButtonProps = {
  financingCaseId: string;
};

export const Open{ModalName}ModalButton = ({
  financingCaseId,
}: Open{ModalName}ModalButtonProps) => {
  const { setData } = use{ModalName}Modal();
  const t = useTranslations("{translation.namespace}");

  return (
    <Button onClick={() => setData({ financingCaseId })}>
      {t("button")}
    </Button>
  );
};
```

- Call `setData` (not `setIsOpen`) from the button — `setData` already opens the modal
- Props must match the `{ModalName}ModalData` type from the store
