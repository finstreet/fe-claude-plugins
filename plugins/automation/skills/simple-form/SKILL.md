---
name: simple-form
description: "Complete guide to implementing simple forms (action-only forms without input fields) in finstreet/boilerplate applications. Use when building or modifying any simple form."
---

# Simple Form — Complete Guide

A simple form is used when the user needs to take an action that has no input fields. Using the full form library (`@finstreet/forms`) would be overkill, so we use a lightweight pattern instead.

## MCP Tools

### Using the `get_subtask_by_id` Tool

If you receive a `subtask_id` in your context, ALWAYS call `mcp__plugin_automation_context-forge-mcp__get_subtask_by_id` to get the necessary context for your task. You can ignore this tool if you do not receive a `subtask_id`.

## Context you receive

You will receive a request that should be used in your context. There should already be a usage example so that you can easily implement it. In addition you will receive some explanatory text where and what to implement for the simple form.

## Where to put the simple form

Look into your context where this form should be implemented in. Next to this file you create a new file `{simpleFormName}SimpleForm.tsx`

## Implementation

Make sure to pass all properties that are needed for the request as props to the SimpleForm.

```tsx path="{simpleFormName}SimpleForm.tsx"
import { useState, useTransition } from "react";
import { useStopAutoArchivalModal } from "@/features/agree21/fsp/modals/stopAutoArchivalModal/store"; // this is for a context that says to close the modal after a successful request
import { HStack } from "@styled-system/jsx";
import { Banner } from "@finstreet/ui/components/base/Banner";
import { Button } from "@finstreet/ui/components/base/Button";

// All data that you need for the request should be passed via props to the SimpleForm
type Props = {
    financingCaseId: string;
}

export const StopAutoArchivalSimpleForm = ({financingCaseId}: Props) => {
    const { setIsOpen } = useStopAutoArchivalModal();
    const t = useTranslations("agree21.fsp.modals.cancelAutoArchival");
    const tButtons = useTranslations("buttons"); // you will use this if there is nothing else explicitly mentioned for the button translations --> these are the default ones! If nothing else is mentioned use `save` and `cancel` respectively
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<boolean>(false);

    const handleSubmit = () => {
        startTransition(async () => {
            const result = await stopAutoArchival({
                pathVariables: {
                financingCaseId,
                },
            });

            if (result.success) {
                setIsOpen(false);
            } else {
                setError(true);
            }
        });
  };

  return (
       {error ? <Banner type="error">{t("error")}</Banner> : null}
        <HStack mt={12} justifyContent={"space-between"}>
          <Button variant="text" onClick={() => setIsOpen(false)}>
            {tButtons("cancel")}
          </Button>
          <Button loading={isPending} onClick={handleSubmit}>
            {t("actions.stopArchival")}
          </Button>
        </HStack>
  )
}
```
