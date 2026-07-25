/**
 * Headless accessibility/behaviour helpers.
 *
 * "Headless in core, styled via the Vue wrapper": these functions carry the
 * framework-agnostic, testable a11y contract for each primitive. The Vue package
 * spreads their output onto real elements and adds token-backed styling.
 */

export interface ButtonA11yOptions {
  disabled?: boolean
}

/**
 * Button a11y attributes. Per the registry note, a disabled button must expose
 * `aria-disabled` in addition to the native `disabled` attribute.
 */
export function getButtonAttrs({ disabled }: ButtonA11yOptions = {}) {
  return {
    disabled: disabled || undefined,
    'aria-disabled': disabled || undefined,
  } as const
}

export interface InputA11yOptions {
  invalid?: boolean
  disabled?: boolean
  describedBy?: string
}

/** Input a11y attributes — `invalid` surfaces as `aria-invalid="true"`. */
export function getInputAttrs({ invalid, disabled, describedBy }: InputA11yOptions = {}) {
  return {
    'aria-invalid': invalid ? 'true' : undefined,
    'aria-describedby': describedBy,
    disabled: disabled || undefined,
  } as const
}

let dialogSeq = 0

/** Stable-per-process id generator for wiring aria-labelledby on dialogs. */
export function nextDialogId(prefix = 'ds-dialog'): string {
  dialogSeq += 1
  return `${prefix}-${dialogSeq}`
}

export interface DialogA11yOptions {
  titleId?: string
}

/** Dialog a11y attributes — role, modal flag, and the labelledby wiring. */
export function getDialogAttrs({ titleId }: DialogA11yOptions = {}) {
  return {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': titleId,
  } as const
}
