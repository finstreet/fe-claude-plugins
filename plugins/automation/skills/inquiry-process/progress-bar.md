# Progress Bar Component

File: `components/{Purpose}ProgressBar.tsx`

The ProgressBar renders all steps of the inquiry process, highlighting the current step and marking completed ones. It reads the current path to determine which step is active and uses `usePortal()` to build route paths.

## Template

```tsx
'use client'

import {
  ProgressBar,
  ProgressBarGroup,
} from "@finstreet/ui/components/patterns/ProgressBar";
import { ProgressStep } from "@/shared/components/ProgressStep";
import { useTranslations } from 'next-intl'
import { usePathname, useParams } from 'next/navigation'
import { {Purpose}InquiryProcessSteps } from '@/features/{purpose}InquiryProcess/{Purpose}InquiryProcess.types'
import { usePortal } from "@/shared/context/portal/portalContext";
import { routes } from "@/routes";
import { ProgressBarStep } from "@finstreet/ui/components/patterns/ProgressBar";

const useProgressBarSteps = (): Record<
  {Purpose}InquiryProcessSteps,
  ProgressBarStep<{Purpose}InquiryProcessSteps>
> => {
  const t = useTranslations('{purpose}InquiryProcess.progressBar.steps')
  const path = usePathname()
  const { inquiryId } = useParams()
  const { portal } = usePortal()

  return {
    [{Purpose}InquiryProcessSteps.STEP_ONE]: {
      id: {Purpose}InquiryProcessSteps.STEP_ONE,
      label: t('stepOne'),
      current: path === routes[portal].{purpose}.stepOne(inquiryId as string),
    },
    [{Purpose}InquiryProcessSteps.STEP_TWO]: {
      id: {Purpose}InquiryProcessSteps.STEP_TWO,
      label: t('stepTwo'),
      current: path === routes[portal].{purpose}.stepTwo(inquiryId as string),
    },
  }
}

export function {Purpose}ProgressBar() {
  const progressBarSteps = useProgressBarSteps()
  const t = useTranslations('{purpose}InquiryProcess.progressBar')

  return (
    <ProgressBar>
      <ProgressBarGroup label={t("title")}>
        <ProgressStep step={progressBarSteps[{Purpose}InquiryProcessSteps.STEP_ONE]} />
        <ProgressStep step={progressBarSteps[{Purpose}InquiryProcessSteps.STEP_TWO]} />
      </ProgressBarGroup>
    </ProgressBar>
  )
}
```

## With props (e.g., conditional groups based on authentication)

Some inquiry processes show different steps depending on whether the user is authenticated. In that case, add a prop:

```tsx
type {Purpose}ProgressBarProps = {
  isAuthenticated: boolean
}

export function {Purpose}ProgressBar({ isAuthenticated }: {Purpose}ProgressBarProps) {
  const progressBarSteps = useProgressBarSteps()
  const t = useTranslations('{purpose}InquiryProcess.progressBar')

  return (
    <ProgressBar>
      <ProgressBarGroup label={t("title")}>
        <ProgressStep step={progressBarSteps[{Purpose}InquiryProcessSteps.STEP_ONE]} />
        <ProgressStep step={progressBarSteps[{Purpose}InquiryProcessSteps.STEP_TWO]} />
      </ProgressBarGroup>
      {!isAuthenticated ? (
        <ProgressBarGroup label={t("subtitle")}>
          <ProgressStep step={progressBarSteps[{Purpose}InquiryProcessSteps.STEP_THREE]} />
        </ProgressBarGroup>
      ) : null}
    </ProgressBar>
  )
}
```

## Full example

```tsx
// features/factoringInquiryProcess/components/FactoringProgressBar.tsx

'use client'

import {
  ProgressBar,
  ProgressBarGroup,
  ProgressBarStep,
} from "@finstreet/ui/components/patterns/ProgressBar";
import { ProgressStep } from "@/shared/components/ProgressStep";
import { useTranslations } from 'next-intl'
import { usePathname, useParams } from 'next/navigation'
import { FactoringInquiryProcessSteps } from '@/features/factoringInquiryProcess/FactoringInquiryProcess.types'
import { usePortal } from "@/shared/context/portal/portalContext";
import { routes } from "@/routes";

const useProgressBarSteps = (): Record<
  FactoringInquiryProcessSteps,
  ProgressBarStep<FactoringInquiryProcessSteps>
> => {
  const t = useTranslations('factoringInquiryProcess.progressBar.steps')
  const path = usePathname()
  const { inquiryId } = useParams()
  const { portal } = usePortal()

  return {
    [FactoringInquiryProcessSteps.FACTORING_NEED]: {
      id: FactoringInquiryProcessSteps.FACTORING_NEED,
      label: t('factoringNeed'),
      current: path === routes[portal].factoring.factoringNeed(inquiryId as string),
    },
    [FactoringInquiryProcessSteps.CONTACT_DATA]: {
      id: FactoringInquiryProcessSteps.CONTACT_DATA,
      label: t('contactData'),
      current: path === routes[portal].factoring.contactData(inquiryId as string),
    },
    [FactoringInquiryProcessSteps.COMPANY_DATA]: {
      id: FactoringInquiryProcessSteps.COMPANY_DATA,
      label: t('companyData'),
      current: path === routes[portal].factoring.companyData(inquiryId as string),
    },
    [FactoringInquiryProcessSteps.FACTORING_CONDITIONS]: {
      id: FactoringInquiryProcessSteps.FACTORING_CONDITIONS,
      label: t('factoringConditions'),
      current: path === routes[portal].factoring.factoringConditions(inquiryId as string),
    },
  }
}

export function FactoringProgressBar() {
  const progressBarSteps = useProgressBarSteps()
  const t = useTranslations('factoringInquiryProcess.progressBar')

  return (
    <ProgressBar>
      <ProgressBarGroup label={t("title")}>
        <ProgressStep step={progressBarSteps[FactoringInquiryProcessSteps.FACTORING_NEED]} />
        <ProgressStep step={progressBarSteps[FactoringInquiryProcessSteps.CONTACT_DATA]} />
        <ProgressStep step={progressBarSteps[FactoringInquiryProcessSteps.COMPANY_DATA]} />
        <ProgressStep step={progressBarSteps[FactoringInquiryProcessSteps.FACTORING_CONDITIONS]} />
      </ProgressBarGroup>
    </ProgressBar>
  )
}
```

## Rules

- Mark the file with `'use client'` — it uses hooks
- Use `usePathname()` to determine the current step (not state)
- Use `usePortal()` to resolve role-based routes
- The `useProgressBarSteps` inner hook returns a `Record` typed to the steps enum — every enum key must have an entry
- Group steps under `ProgressBarGroup` with a translated label
- Render each step via `<ProgressStep>`, not directly via `<ProgressBarStep>`
