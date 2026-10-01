// Driver for ngx-schema-form forms (application / event / contact-portal forms), keyed on the stable
// `data-testid="sf-<canonicalPathNotation>"` (ET-10135). It is the content-script counterpart of
// e2e/pages/schema-form.page.ts in enrollment_angular: what to fill comes from the form's own JSON
// schema, how to fill comes from the widget id. Value choice and the fiddly widgets (phone, calendar,
// uploads) are delegated to the host script through SchemaFormHost, so behaviour stays identical to
// the heuristic filler.

import {
    SF_FIELD_ROOT_SELECTOR,
    WIDGET_STRATEGIES,
    clampToLength,
    extractSchemaFromResponse,
    fitsSchema,
    generateValue,
    lookupByCanonicalPath,
    sfFieldPathFromAnyTestId,
    sfOptionTestIdPrefix,
    sfOptionValueFromTestId,
    sfPathFromTestId,
    strategyFromTag,
    widgetIdOf,
    type FillStrategy,
    type SchemaNode
} from './testids';

const SCHEMA_NODE_ID = 'qa-autofill-schema';

export type FieldOutcome = 'filled' | 'skipped' | 'error';

export interface FieldResult {
    path: string;
    widget: string;
    outcome: FieldOutcome;
    detail?: string;
}

export interface ValidationError {
    path: string;
    message: string;
}

export interface SchemaFormHost {
    dryRun: boolean;
    denylist: string[];
    wait(ms: number): Promise<void>;
    /** Heuristic value for a text-like field (learned > recipe > profile), or '' when unknown. */
    resolveText(element: HTMLElement, path: string): string;
    /** Chooses one of the offered option elements (select panel / radio group), or null. */
    chooseOption(options: HTMLElement[], element: HTMLElement, path: string): HTMLElement | null;
    fillPhone(input: HTMLInputElement): Promise<void>;
    fillDate(input: HTMLInputElement, value: string): Promise<void>;
    setValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void;
    dispatchEvents(element: HTMLElement): void;
    createUploadFiles(): File[];
    closeOverlays(): Promise<void>;
    note(message: string): void;
}

export function readCapturedSchema(): SchemaNode | undefined {
    const node = document.getElementById(SCHEMA_NODE_ID);
    if (!node?.textContent) return undefined;
    try {
        return extractSchemaFromResponse({ form: JSON.parse(node.textContent) });
    } catch {
        return undefined;
    }
}

export function hasSchemaFormFields(): boolean {
    return document.querySelector(SF_FIELD_ROOT_SELECTOR) !== null;
}

function isRendered(element: Element): boolean {
    if (!(element instanceof HTMLElement)) return true;
    if (element.getClientRects().length === 0) return false;
    const style = window.getComputedStyle(element);
    return style.visibility !== 'hidden' && style.display !== 'none';
}

function isDisabledControl(element: HTMLElement): boolean {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
        if (element.disabled) return true;
    }
    return element.getAttribute('aria-disabled') === 'true' || element.classList.contains('mat-mdc-select-disabled');
}

function labelOf(element: Element): string {
    return (element.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function isDenied(element: Element, denylist: string[]): boolean {
    const text = labelOf(element);
    return text.length > 0 && denylist.some((entry) => text.includes(entry));
}

/** Click target that reliably toggles Material controls: the inner native input when there is one. */
function clickableOf(element: HTMLElement): HTMLElement {
    return element.querySelector<HTMLElement>('input[type="checkbox"], input[type="radio"]') ?? element;
}

function isChecked(element: HTMLElement): boolean {
    return (
        element.classList.contains('mat-mdc-checkbox-checked') ||
        element.classList.contains('mat-checkbox-checked') ||
        element.classList.contains('mat-mdc-radio-checked') ||
        element.querySelector('input:checked') !== null ||
        element.getAttribute('aria-checked') === 'true'
    );
}

function optionElements(path: string, root: ParentNode = document): HTMLElement[] {
    return Array.from(root.querySelectorAll<HTMLElement>(`[data-testid^="${sfOptionTestIdPrefix(path)}"]`)).filter(
        (el) => el.dataset.testid !== undefined
    );
}

/** An enum `0` option is a schema-level "Other.." / "None" sentinel that demands a free-text follow-up. */
function withoutSentinel(options: HTMLElement[], path: string): HTMLElement[] {
    const real = options.filter((el) => sfOptionValueFromTestId(path, el.dataset.testid || '') !== '0');
    return real.length > 0 ? real : options;
}

async function waitFor<T>(host: SchemaFormHost, probe: () => T | null | undefined, timeoutMs: number, stepMs = 120): Promise<T | null> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        const found = probe();
        if (found) return found;
        await host.wait(stepMs);
    }
    return probe() ?? null;
}

export class SchemaFormDriver {
    constructor(private readonly host: SchemaFormHost, private schema: SchemaNode | undefined = readCapturedSchema()) {}

    refreshSchema(): void {
        this.schema = readCapturedSchema() ?? this.schema;
    }

    get hasSchema(): boolean {
        return Boolean(this.schema);
    }

    schemaFor(path: string): SchemaNode | undefined {
        return this.schema ? lookupByCanonicalPath(this.schema, path) : undefined;
    }

    private widgetOf(element: HTMLElement, path: string): string | undefined {
        return widgetIdOf(this.schemaFor(path)) ?? element.getAttribute('data-widget-type') ?? undefined;
    }

    /** A second pass must not re-toggle anything already set, but must re-fill a value that is flagged invalid. */
    private isAlreadyFilled(element: HTMLElement, tag: string): boolean {
        const invalid = element.classList.contains('ng-invalid') || element.closest('.mat-form-field-invalid, .mat-mdc-form-field-invalid, .ng-invalid') !== null;
        let hasValue: boolean;
        if (tag === 'mat-select') {
            const text = element.querySelector('.mat-select-value-text, .mat-mdc-select-value-text');
            hasValue = (text?.textContent ?? '').trim().length > 0;
        } else if (tag === 'mat-checkbox') {
            hasValue = isChecked(element);
        } else if (tag === 'mat-radio-group') {
            hasValue = element.querySelector('.mat-radio-checked, .mat-mdc-radio-checked, input:checked') !== null;
        } else {
            hasValue = Boolean((element as HTMLInputElement | HTMLTextAreaElement).value);
        }
        return hasValue && !invalid;
    }

    private textValueFor(element: HTMLElement, path: string, fallback: string): { value: string; detail: string } {
        const node = this.schemaFor(path);
        const heuristic = this.host.resolveText(element, path);
        if (heuristic && fitsSchema(heuristic, node)) return { value: heuristic, detail: 'profile' };
        if (node) {
            const generated = generateValue(node);
            if (generated.value) return { value: generated.value, detail: generated.strategy };
        }
        return { value: node ? clampToLength(fallback, node) : fallback, detail: 'fallback' };
    }

    private async fillSelect(element: HTMLElement, path: string): Promise<string> {
        await this.host.closeOverlays();
        element.click();

        // `type: 'array'` renders a MULTI-select that enforces `minItems`.
        const node = this.schemaFor(path);
        const wanted = node?.type === 'array' ? Math.max(node.minItems ?? 1, 1) : 1;

        const panelReady = await waitFor(this.host, () => (optionElements(path).length > 0 ? true : null), 3000);
        if (!panelReady) throw new Error('no options in panel');

        const picked: string[] = [];
        for (let i = 0; i < wanted; i++) {
            const remaining = optionElements(path).filter((el) => !picked.includes(sfOptionValueFromTestId(path, el.dataset.testid || '')));
            if (remaining.length === 0) break;
            const candidates = withoutSentinel(remaining, path).filter((el) => el.getAttribute('aria-disabled') !== 'true');
            const choice = this.host.chooseOption(candidates.length > 0 ? candidates : remaining, element, path);
            if (!choice) break;
            picked.push(sfOptionValueFromTestId(path, choice.dataset.testid || ''));
            choice.click();
            await this.host.wait(220);
        }
        await this.host.closeOverlays();
        if (picked.length === 0) throw new Error('no selectable option');
        return picked.length === 1 ? `option ${picked[0]}` : `options ${picked.join(', ')} (minItems ${wanted})`;
    }

    private async fillRadio(path: string): Promise<string> {
        const options = optionElements(path).filter((el) => el.getAttribute('aria-disabled') !== 'true');
        if (options.length === 0) throw new Error('no radio options found');
        const root = document.querySelector<HTMLElement>(`[data-testid="sf-${path}"]`) ?? options[0];
        const choice = this.host.chooseOption(withoutSentinel(options, path), root, path);
        if (!choice) throw new Error('no radio option chosen');
        clickableOf(choice).click();
        this.host.dispatchEvents(choice);
        return `option ${sfOptionValueFromTestId(path, choice.dataset.testid || '')}`;
    }

    /**
     * A `type: 'array'` checkbox widget is a GROUP; `minItems` is enforced next to it. Count what is
     * already checked and add only what is missing — a blind click on pass two would un-check it.
     */
    private fillCheckboxGroup(path: string, minItems: number): { filled: boolean; detail: string } {
        const options = optionElements(path);
        const need = Math.max(minItems, 1);
        let checked = options.filter(isChecked).length;
        if (checked >= need) return { filled: false, detail: `already checked ${checked}/${need}` };

        const ordered = [...withoutSentinel(options, path), ...options.filter((el) => !withoutSentinel(options, path).includes(el))];
        for (const option of ordered) {
            if (checked >= need) break;
            if (isChecked(option) || isDenied(option, this.host.denylist)) continue;
            clickableOf(option).click();
            checked++;
        }
        return { filled: true, detail: `checked ${checked}/${need} of ${options.length} option(s)` };
    }

    private async fillFiles(element: HTMLElement, path: string, minItems: number): Promise<{ filled: boolean; detail: string }> {
        const rows = () => document.querySelectorAll(`[data-testid^="sf-${path}-file-"]`);
        const need = Math.max(minItems, 1);
        const existing = rows().length;
        if (existing >= need) return { filled: false, detail: `already has ${existing}/${need} file(s)` };

        const input = element.querySelector<HTMLInputElement>('input[type="file"]') ?? (element instanceof HTMLInputElement ? element : null);
        if (!input) return { filled: false, detail: 'dropzone has no file input (widget not initialised?)' };

        for (let uploaded = existing; uploaded < need; uploaded++) {
            const files = this.host.createUploadFiles();
            const transfer = new DataTransfer();
            transfer.items.add(files[0]);
            input.files = transfer.files;
            input.dispatchEvent(new Event('change', { bubbles: true }));
            // Each attachment is a real awaited POST behind a blocking spinner: wait for the row to render.
            const appeared = await waitFor(this.host, () => (rows().length > uploaded ? true : null), 30_000, 250);
            if (!appeared) return { filled: false, detail: `upload ${uploaded + 1}/${need} never rendered a file row` };
        }
        return { filled: true, detail: `uploaded ${need - existing} file(s), ${rows().length} attached` };
    }

    /**
     * signature_pad ignores `ctx.stroke()`; it records pointer events and `save()` keeps the drawing only
     * if the stroke holds at least 10 points — hence a many-segment zig-zag of real pointer events.
     */
    private async fillSignature(element: HTMLElement, path: string): Promise<{ filled: boolean; detail: string }> {
        const canvas = element instanceof HTMLCanvasElement ? element : element.querySelector('canvas');
        if (!canvas) return { filled: false, detail: 'no canvas inside signature widget' };

        const context = canvas.getContext('2d');
        if (context && canvas.width > 0 && canvas.height > 0) {
            const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] > 0 && (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250)) {
                    return { filled: false, detail: 'already signed' };
                }
            }
        }

        const box = canvas.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) return { filled: false, detail: 'signature canvas has no size' };

        const points = 16;
        const left = box.left + box.width * 0.15;
        const span = box.width * 0.7;
        const middle = box.top + box.height / 2;
        const amplitude = box.height * 0.25;
        const fire = (type: string, x: number, y: number, buttons: number) =>
            canvas.dispatchEvent(
                new PointerEvent(type, {
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                    pointerId: 1,
                    pointerType: 'mouse',
                    isPrimary: true,
                    clientX: x,
                    clientY: y,
                    button: type === 'pointermove' ? -1 : 0,
                    buttons
                })
            );

        fire('pointerdown', left, middle, 1);
        for (let i = 1; i <= points; i++) {
            await this.host.wait(12);
            fire('pointermove', left + (span * i) / points, middle + (i % 2 === 0 ? amplitude : -amplitude), 1);
        }
        fire('pointerup', left + span, middle, 0);
        await this.host.wait(150);

        const root = document.querySelector<HTMLElement>(`[data-testid="sf-${path}"]`);
        return root?.classList.contains('required-signature')
            ? { filled: false, detail: `drew ${points} segments but the widget still reports an invalid signature` }
            : { filled: true, detail: `drew ${points}-segment stroke` };
    }

    private async fillDate(element: HTMLElement, path: string): Promise<string> {
        const input = (element instanceof HTMLInputElement ? element : element.querySelector('input')) as HTMLInputElement | null;
        if (!input) throw new Error('date widget has no input');
        const candidate = this.host.resolveText(element, path);
        const value = /^\d{4}-\d{2}-\d{2}$/.test(candidate) ? candidate : '2008-05-15';
        await this.host.fillDate(input, value);
        return `calendar ${value}`;
    }

    private async fillText(element: HTMLElement, path: string, isPhone: boolean): Promise<string> {
        const input = (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
            ? element
            : element.querySelector('input, textarea')) as HTMLInputElement | HTMLTextAreaElement | null;
        if (!input) throw new Error('no input inside widget');

        if (isPhone && input instanceof HTMLInputElement) {
            await this.host.fillPhone(input);
            return 'phone';
        }
        const { value, detail } = this.textValueFor(element, path, 'QA Test Value');
        this.host.setValue(input, value);
        this.host.dispatchEvents(input);
        if (input.classList.contains('chip') || (input.getAttribute('class') ?? '').includes('chip')) {
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
        }
        await this.host.wait(30);
        return input.classList.contains('ng-invalid') ? `${detail} | STILL INVALID with ${JSON.stringify(input.value)}` : detail;
    }

    async fillField(element: HTMLElement): Promise<FieldResult> {
        const path = sfPathFromTestId(element.dataset.testid ?? '');
        const tag = element.tagName.toLowerCase();
        const inputType = element instanceof HTMLInputElement ? element.type || 'text' : '';
        const widget = this.widgetOf(element, path);
        const strategy: FillStrategy | undefined = (widget ? WIDGET_STRATEGIES[widget] : undefined) ?? strategyFromTag(tag, inputType);
        const label = widget ?? `<tag:${tag}>`;
        const result = (outcome: FieldOutcome, detail?: string): FieldResult => ({ path, widget: label, outcome, detail });

        if (strategy === undefined) return result('skipped', `no fill strategy for widget "${label}" (<${tag}>)`);
        if (strategy === 'container') return result('skipped', 'container/non-interactive widget');
        if (strategy === 'unsupported') return result('skipped', `widget "${label}" needs dedicated support`);
        if (this.isAlreadyFilled(element, tag)) return result('skipped', 'already filled');
        if (this.host.dryRun) return result('filled', `dry-run ${strategy}`);

        try {
            switch (strategy) {
                case 'select':
                    return result('filled', await this.fillSelect(element, path));
                case 'radio':
                    return result('filled', await this.fillRadio(path));
                case 'checkbox': {
                    if (optionElements(path).length > 0) {
                        const group = this.fillCheckboxGroup(path, this.schemaFor(path)?.minItems ?? 1);
                        return result(group.filled ? 'filled' : 'skipped', group.detail);
                    }
                    if (isDenied(element, this.host.denylist)) return result('skipped', 'checkbox label is denylisted');
                    clickableOf(element).click();
                    return result('filled');
                }
                case 'date':
                    return result('filled', await this.fillDate(element, path));
                case 'signature': {
                    const signature = await this.fillSignature(element, path);
                    return result(signature.filled ? 'filled' : 'skipped', signature.detail);
                }
                case 'file': {
                    const upload = await this.fillFiles(element, path, this.schemaFor(path)?.minItems ?? 1);
                    return result(upload.filled ? 'filled' : 'skipped', upload.detail);
                }
                case 'range': {
                    const input = element as HTMLInputElement;
                    this.host.setValue(input, input.max || '50');
                    this.host.dispatchEvents(input);
                    return result('filled', 'range set to max');
                }
                case 'numeric': {
                    const node = this.schemaFor(path);
                    const generated = node ? generateValue(node) : undefined;
                    const input = (element instanceof HTMLInputElement ? element : element.querySelector('input')) as HTMLInputElement | null;
                    if (!input) throw new Error('no input inside widget');
                    this.host.setValue(input, generated?.value || '5');
                    this.host.dispatchEvents(input);
                    return result('filled', generated?.strategy ?? 'numeric fallback');
                }
                case 'phone':
                    return result('filled', await this.fillText(element, path, true));
                case 'text': {
                    // Without a widget id a readonly / datepicker-bound input looks like plain text.
                    const dateLike =
                        widget === undefined &&
                        (element.hasAttribute('ng-reflect-mat-datepicker') || element.getAttribute('readonly') !== null);
                    if (dateLike) return result('filled', await this.fillDate(element, path));
                    return result('filled', await this.fillText(element, path, false));
                }
            }
        } catch (error) {
            return result('error', error instanceof Error ? error.message : String(error));
        }
        return result('skipped', 'unhandled strategy');
    }

    /** Fills every visible, enabled `sf-*` field currently rendered (one stepper step's worth). */
    async fillVisibleFields(): Promise<FieldResult[]> {
        const results: FieldResult[] = [];
        const candidates = Array.from(document.querySelectorAll<HTMLElement>(SF_FIELD_ROOT_SELECTOR));
        for (const element of candidates) {
            if (!element.isConnected || !isRendered(element) || isDisabledControl(element)) continue;
            await this.host.closeOverlays();
            results.push(await this.fillField(element));
        }
        return results;
    }
}

/**
 * Every VISIBLE validation error, attributed to its field. Material renders `mat-error` nodes
 * unconditionally and hides them until the control errors, so the sweep filters on layout.
 */
export function collectSchemaValidationErrors(): ValidationError[] {
    const errors: ValidationError[] = [];
    document.querySelectorAll<HTMLElement>('mat-error').forEach((node) => {
        if (node.getClientRects().length === 0) return;
        const message = (node.textContent ?? '').replace(/\s+/g, ' ').trim();
        if (!message) return;
        let owner: Element | null = null;
        for (let parent = node.parentElement; parent && !owner; parent = parent.parentElement) {
            owner = parent.querySelector('[data-testid^="sf-"]');
        }
        const testId = owner?.getAttribute('data-testid') ?? '';
        errors.push({ path: testId ? sfFieldPathFromAnyTestId(testId) : '<unknown field>', message });
    });
    return errors;
}

/** Visible, enabled stepper "next" button by its stable test id (there is one per step; only one is visible). */
export function findStepperNextButton(): HTMLElement | null {
    const buttons = Array.from(document.querySelectorAll<HTMLElement>('[data-testid="stepper-next-button"]'));
    return buttons.find((button) => isRendered(button) && !isDisabledControl(button)) ?? null;
}

export function findStepperSubmitButton(): HTMLElement | null {
    const buttons = Array.from(document.querySelectorAll<HTMLElement>('[data-testid="applications-form-submit"], [data-testid="fillable-form-submit"]'));
    return buttons.find((button) => isRendered(button) && !isDisabledControl(button)) ?? null;
}
