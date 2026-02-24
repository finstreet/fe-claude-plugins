# Example Conversations

These examples show how the `/ticket-spec` skill guides a PO through feature specification. Each example demonstrates a different scope.

---

## Example 1: Single Component — A Contact Form

**Scope:** PO needs one form with a few fields.

---

**Claude:** Welcome! I'll help you create a structured JIRA ticket for your feature. Can you describe what you need in your own words?

**PO:** We need a contact form where the user can enter their name, email, phone number, and a message.

**Claude:** Got it — a contact form with 4 fields. Let me ask a few questions to get the details right.

**Field 1: Name**
- What label should it show? → "Full Name"
- Is it required? → Yes
- Any placeholder text? → "Enter your full name"

**Field 2: Email**
- Label? → "Email Address"
- Required? → Yes
- Placeholder? → "name@example.com"

**Field 3: Phone Number**
- Label? → "Phone Number"
- Required? → No, it's optional
- Placeholder? → "+49 123 456789"

**Field 4: Message**
- This sounds like multi-line text — should I make it a textarea? → Yes
- Label? → "Your Message"
- Required? → Yes
- Placeholder? → "How can we help you?"

**Claude:** Here's what I have:

### Contact Form

| # | Field | Label | Type | Required | Placeholder |
|---|-------|-------|------|----------|-------------|
| 1 | `fullName` | Full Name | input | Yes | "Enter your full name" |
| 2 | `email` | Email Address | input | Yes | "name@example.com" |
| 3 | `phoneNumber` | Phone Number | input | No | "+49 123 456789" |
| 4 | `message` | Your Message | textarea | Yes | "How can we help you?" |

Does this look correct? Would you like to change anything?

**PO:** Looks good!

**Claude:** I'll create the JIRA ticket now.

*Creates one issue with type FORM and the metadata above.*

---

**Result:** One JIRA issue created:
- `[FORM] Contact Form`

---

## Example 2: Full Feature — Financing Application Wizard

**Scope:** PO describes a multi-step application process that needs a wizard, multiple pages, forms, API calls, and an overview dashboard.

---

**Claude:** Welcome! I'll help you create a structured JIRA ticket for your feature. Can you describe what you need in your own words?

**PO:** We're building a financing application. The customer goes through a multi-step wizard: first they enter personal details, then property information, then financial details, and finally they review and submit. There should be an overview page where they can see all the steps. We need API calls to save and load the application data.

**Claude:** This is a substantial feature. Based on your description, I'm identifying the following components:

1. **Multi-Step Wizard** (INQUIRY_PROCESS) — The overall step-by-step flow
2. **Overview Dashboard** (TASK_GROUP) — Landing page showing all steps
3. **Personal Details Page** (PAGE) — Step 1 page
4. **Personal Details Form** (FORM) — Form on step 1
5. **Property Info Page** (PAGE) — Step 2 page
6. **Property Info Form** (FORM) — Form on step 2
7. **Financial Details Page** (PAGE) — Step 3 page
8. **Financial Details Form** (FORM) — Form on step 3
9. **Review Page** (PAGE) — Step 4 page
10. **Save Application API** (REQUEST) — Save/load endpoints

Does this breakdown look right? Anything to add or remove?

**PO:** Yes, that's right. But we also need a confirmation modal when they submit.

**Claude:** Added:

11. **Submit Confirmation Modal** (MODAL) — Confirm before final submission

Let me walk through each component now.

---

### Inquiry Process: Financing Application

**Steps:**

| # | Step | Route | Title | Description |
|---|------|-------|-------|-------------|
| 1 | `personalDetails` | `personal-details` | Personal Details | Enter your personal information |
| 2 | `propertyInfo` | `property-info` | Property Information | Tell us about the property |
| 3 | `financialDetails` | `financial-details` | Financial Details | Provide your financial situation |
| 4 | `review` | `review` | Review & Submit | Review your application |

**Progress bar groups:**
1. "Your Information" (covers steps 1-2)
2. "Finances" (covers step 3)
3. "Review" (covers step 4)

Does this look right?

**PO:** Perfect.

---

### Personal Details Form

What fields does the personal details form need?

**PO:** First name, last name, date of birth, and a dropdown for marital status (single, married, divorced, widowed).

**Claude:**

| # | Field | Label | Type | Required |
|---|-------|-------|------|----------|
| 1 | `firstName` | First Name | input | Yes |
| 2 | `lastName` | Last Name | input | Yes |
| 3 | `dateOfBirth` | Date of Birth | datepicker | Yes |
| 4 | `maritalStatus` | Marital Status | select | Yes |

**Marital Status options:**
- Single
- Married
- Divorced
- Widowed

**PO:** Add email and phone number too.

**Claude:** Updated:

| # | Field | Label | Type | Required |
|---|-------|-------|------|----------|
| 1 | `firstName` | First Name | input | Yes |
| 2 | `lastName` | Last Name | input | Yes |
| 3 | `email` | Email Address | input | Yes |
| 4 | `phoneNumber` | Phone Number | input | No |
| 5 | `dateOfBirth` | Date of Birth | datepicker | Yes |
| 6 | `maritalStatus` | Marital Status | select | Yes |

---

*(Similar Q&A continues for Property Info Form, Financial Details Form, Pages, API Requests, Modal, and Overview...)*

---

### Submit Confirmation Modal

**Claude:**
- What title should the modal show? → "Submit Application"
- Any subheading? → "Please review your information before submitting"
- Confirm button text? → "Submit Application"
- What data does the modal need? → The application ID
- Should it have a dedicated open button? → No, the review page triggers it

---

### Review

**Claude:** Here's the complete feature breakdown:

| # | Component | Type |
|---|-----------|------|
| 1 | Financing Application Process | INQUIRY_PROCESS |
| 2 | Application Overview | TASK_GROUP |
| 3 | Personal Details Page | PAGE |
| 4 | Personal Details Form | FORM |
| 5 | Property Info Page | PAGE |
| 6 | Property Info Form | FORM |
| 7 | Financial Details Page | PAGE |
| 8 | Financial Details Form | FORM |
| 9 | Review Page | PAGE |
| 10 | Save Application API | REQUEST |
| 11 | Submit Confirmation Modal | MODAL |

Ready to create the JIRA tickets?

**PO:** Yes, go ahead!

---

**Result:** JIRA tickets created:
- **Parent:** "Financing Application Feature" (with component table and business context)
- **Subtasks:**
  - `[INQUIRY_PROCESS] Financing Application Process`
  - `[TASK_GROUP] Application Overview`
  - `[PAGE] Personal Details Page`
  - `[FORM] Personal Details Form`
  - `[PAGE] Property Info Page`
  - `[FORM] Property Info Form`
  - `[PAGE] Financial Details Page`
  - `[FORM] Financial Details Form`
  - `[PAGE] Review Page`
  - `[REQUEST] Save Application API`
  - `[MODAL] Submit Confirmation Modal`

---

## Example 3: Iterative — Adding a Component to an Existing Feature

**Scope:** PO wants to add a delete confirmation modal to an existing feature that already has JIRA tickets.

---

**Claude:** Welcome! I'll help you create a structured JIRA ticket for your feature. Can you describe what you need in your own words?

**PO:** We already have a financing cases list. I need to add a delete confirmation modal that pops up when the user clicks the delete button on a row.

**Claude:** Got it — a deletion confirmation modal. Let me collect the details.

- **Modal name:** → "Delete Financing Case"
- **Title text:** → "Delete Financing Case"
- **Subheading:** → "This action cannot be undone. The case and all associated data will be permanently deleted."
- **Confirm button:** → "Delete"
- **What data does it need?** → The financing case ID and the case number (to show which case is being deleted)
- **Open button needed?** → No, it's triggered from the list row action

**Claude:** Here's the summary:

### Delete Financing Case Modal

| Property | Value |
|----------|-------|
| Title | Delete Financing Case |
| Subheading | This action cannot be undone. The case and all associated data will be permanently deleted. |
| Confirm Button | Delete |
| Open Button | No |

**Data:**
| Key | Type |
|-----|------|
| `financingCaseId` | `string` |
| `caseNumber` | `string` |

**Content:** Display the case number and a warning message before deletion.

Does this look correct?

**PO:** Yes, exactly.

**Claude:** Should I add this as a subtask to an existing JIRA parent issue? If so, what's the parent issue key?

**PO:** Yes, add it to FC-123.

**Claude:** I'll create the subtask under FC-123 now.

---

**Result:** One JIRA subtask created under FC-123:
- `[MODAL] Delete Financing Case Modal`
