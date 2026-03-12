# Core Helper Modules

These three helpers are composed into every `BasePage` as `this.form`, `this.errors`, and `this.navigation`.

---

## ErrorHandler (`this.errors`)

Use to assert validation errors after submitting invalid data.

```typescript
// Returns text of `${fieldName}-error` data-testid, or null if not found (5s timeout)
async getFieldError(fieldName: string): Promise<string | null>

// Returns text of `form-error` data-testid, or null if not found (5s timeout)
async getFormError(): Promise<string | null>

// Convenience wrapper: delegates to getFieldError if fieldName provided, else getFormError
async getErrorMessage(fieldName?: string): Promise<string | null>
```

---

## FormInteractor (`this.form`)

Use to fill form fields and submit forms. The primary method is `fillField` — it covers all 12 field types via `BaseField` enum.

```typescript
interface FieldInteractionOptions {
  fieldName: string;        // Maps to data-testid prefix
  fieldType: BaseField;     // Enum from @finstreet/forms
  value?: string | boolean | number | unknown;
  clickFirstItem?: boolean; // COMBOBOX only: click item-0 (true) or item-1 (false, default)
}

async fillField(options: FieldInteractionOptions): Promise<void>
async submit(): Promise<void>  // Clicks dataTestIds.buttons.submitButton
```

### Field type → data-testid mapping

| BaseField | data-testid used |
|---|---|
| `INPUT` | `${fieldName}-input` |
| `PASSWORD` | `${fieldName}-password` |
| `NUMBER` | `${fieldName}-number` |
| `TEXTAREA` | `${fieldName}-textarea` |
| `CHECKBOX` | `${fieldName}-checkbox` |
| `YES_NO_RADIO_GROUP` | `${fieldName}-yes-no-radio-group__item-yes/no` |
| `RADIO_GROUP` | `${fieldName}-radio-group__item-${value}` |
| `SELECT` | `${fieldName}-select__trigger/content/item-${value}` |
| `COMBOBOX` | `${fieldName}-combobox__input` → `__item-0` or `__item-1` (5s wait) |
| `DATEPICKER` | `${fieldName}-datepicker` |
| `SELECTABLE_CARDS` | `${fieldName}-selectable-cards__card-${value}` |
| `FILE_UPLOAD` | `${fieldName}-file-upload` |

### Additional methods

```typescript
// Use when a select dropdown is already visible in the DOM (no trigger click needed)
async selectVisibleOption(testId: string, value: string): Promise<void>

// Use when the exact value is unknown and any first option is acceptable
async selectFirstOption(testId: string): Promise<void>
```

---

## NavigationHelper (`this.navigation`)

Use for page navigation, URL assertions, and waiting for redirects.

```typescript
async goto(path: string): Promise<void>
async reload(): Promise<void>                             // reload + waitForNavigation
async waitForNavigation(): Promise<void>                  // waitForLoadState("networkidle")
async waitForUrl(url: string, timeout?: number): Promise<void>          // waits until pathname includes url
async waitForRedirect(fromPath: string, timeout?: number): Promise<void> // waits until pathname no longer includes fromPath (default 10s)
async clickBackButton(nextUrl: string): Promise<void>     // clicks back button, then waits for nextUrl
async navigateToSection(testId: string, route: string): Promise<void>   // clickByTestId + waitForUrl + waitForNavigation
```
