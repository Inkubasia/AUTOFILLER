// Pure helpers around the stable data-testid conventions of enrollment_angular.
// No DOM access here, so everything is unit-testable under plain node (see test/).
//
//   application / event / contact-portal forms (ngx-schema-form):
//     sf-<canonicalPathNotation>            field root, e.g. sf-students.0.firstName
//     sf-<path>-option-<enum>               one option of a select / radio / checkbox group
//     sf-<path>-file-<name> / -delete-<name> / -clear   sub-elements, never fields
//   public webforms:
//     webform-<form>-<field>                form = general | prospectus | event-reg | student
//     webform-<form>-contact2-<field>       second contact block (event: webform-event-contact2-reg-<field>)

export interface SchemaNode {
    type?: string;
    widget?: string | { id?: string; [key: string]: unknown };
    properties?: Record<string, SchemaNode>;
    items?: SchemaNode;
    definitions?: Record<string, SchemaNode>;
    allOf?: SchemaNode[];
    $ref?: string;
    pattern?: string;
    format?: string;
    enum?: unknown[];
    oneOf?: unknown[];
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    minItems?: number;
    maxItems?: number;
    title?: string;
    required?: string[];
}

export const SF_PREFIX = 'sf-';
export const SF_FIELD_SUB_ELEMENT_MARKERS = ['-option-', '-file-', '-delete-', '-clear'];

/** CSS selector matching only field roots, not their option/file/delete/clear sub-elements. */
export const SF_FIELD_ROOT_SELECTOR =
    `[data-testid^="${SF_PREFIX}"]` + SF_FIELD_SUB_ELEMENT_MARKERS.map((marker) => `:not([data-testid*="${marker}"])`).join('');

export function isSfFieldRootTestId(testId: string | null | undefined): boolean {
    if (!testId || !testId.startsWith(SF_PREFIX)) return false;
    return !SF_FIELD_SUB_ELEMENT_MARKERS.some((marker) => testId.includes(marker));
}

export function sfPathFromTestId(testId: string): string {
    return testId.replace(/^sf-/, '');
}

/** `sf-a.b-option-3` or `sf-a.b-file-x.png` -> `a.b`; plain field ids pass through. */
export function sfFieldPathFromAnyTestId(testId: string): string {
    return sfPathFromTestId(testId)
        .replace(/-(?:option|file|delete)-.*$/, '')
        .replace(/-clear$/, '');
}

export function sfOptionTestIdPrefix(path: string): string {
    return `${SF_PREFIX}${path}-option-`;
}

export function sfOptionValueFromTestId(path: string, testId: string): string {
    return testId.slice(sfOptionTestIdPrefix(path).length);
}

// ---------------------------------------------------------------------------------------------
// Webform test ids
// ---------------------------------------------------------------------------------------------

export interface WebformTestId {
    form: 'general' | 'prospectus' | 'event' | 'student';
    /** 1 for the primary contact (and the student form), 2 for the second-contact block. */
    contact: 1 | 2;
    slug: string;
}

export function parseWebformTestId(testId: string | null | undefined): WebformTestId | null {
    if (!testId || !testId.startsWith('webform-')) return null;
    const rest = testId.slice('webform-'.length);

    let match = /^event-contact2-reg-(.+)$/.exec(rest);
    if (match) return { form: 'event', contact: 2, slug: match[1] };
    match = /^event-reg-(.+)$/.exec(rest);
    if (match) return { form: 'event', contact: 1, slug: match[1] };
    match = /^(general|prospectus)-contact2-(.+)$/.exec(rest);
    if (match) return { form: match[1] as 'general' | 'prospectus', contact: 2, slug: match[2] };
    match = /^(general|prospectus|student)-(.+)$/.exec(rest);
    if (match) return { form: match[1] as 'general' | 'prospectus' | 'student', contact: 1, slug: match[2] };
    return null;
}

/**
 * webform slug -> ProfileData key. Only unambiguous fields are listed; anything else (the `alumni`
 * wrapper, `code-of-conduct`, `contact1-form` containers, ...) falls through to the heuristic resolver.
 */
export const WEBFORM_SLUG_TO_PROFILE_KEY: Record<string, string> = {
    'salutation': 'salutationId',
    'first-name': 'firstName',
    'last-name': 'lastName',
    'gender': 'genderId',
    'relationship': 'relationshipId',
    'email': 'email',
    'mobile': 'mobile',
    'home-phone': 'homePhone',
    'work-phone': 'workPhone',
    'graduation-year': 'graduationYear',
    'name-at-school': 'nameAtSchool',
    'is-spouse': 'isSpouse',
    'address': 'address',
    'city': 'city',
    'postcode': 'postCode',
    'family-connections': 'familyConnectionId',
    'future-siblings': 'hasFutureSiblings',
    'hear-about-us': 'hearAboutUsId',
    'message': 'message',
    'send-confirmation': 'sendConfirmationContact2',
    'total-attendees': 'totalAttendees',
    'is-first-visit': 'isFirstVisit',
    'sub-tours': 'subTours',
    'event': 'eventId',
    'campus-id': 'campusId',
    'date-of-birth': 'dateOfBirth',
    'current-school-year': 'currentSchoolYearId',
    'indigenous-status': 'indigenousStatusId',
    'school-intake-year': 'schoolIntakeYearId',
    'special-needs': 'hasSpecialNeeds',
    'starting-period': 'startingPeriodId',
    'starting-year': 'startingYear',
    'submitted-application': 'submittedApplication',
    'other-interests': 'notes'
};

export function profileKeyForWebformTestId(testId: string | null | undefined): string | null {
    const parsed = parseWebformTestId(testId);
    if (!parsed) return null;
    return WEBFORM_SLUG_TO_PROFILE_KEY[parsed.slug] || null;
}

// ---------------------------------------------------------------------------------------------
// Form JSON-schema helpers (port of e2e/pages/schema-form.page.ts in enrollment_angular)
// ---------------------------------------------------------------------------------------------

export function widgetIdOf(node?: SchemaNode): string | undefined {
    if (!node?.widget) return undefined;
    return typeof node.widget === 'string' ? node.widget : node.widget.id;
}

/** Follows `$ref` (always `#/definitions/x`) and flattens `allOf`, so callers see one merged node. */
export function resolveNode(root: SchemaNode, node?: SchemaNode, depth = 0): SchemaNode | undefined {
    if (!node || depth > 10) return node;
    if (node.$ref) {
        const name = node.$ref.replace(/^#\/definitions\//, '');
        const target = root.definitions?.[name];
        if (target) return resolveNode(root, { ...target, ...node, $ref: undefined }, depth + 1);
    }
    if (node.allOf?.length) {
        const merged: SchemaNode = { ...node, allOf: undefined };
        for (const part of node.allOf) {
            const resolved = resolveNode(root, part, depth + 1);
            if (!resolved) continue;
            merged.properties = { ...(merged.properties ?? {}), ...(resolved.properties ?? {}) };
            Object.assign(merged, { ...resolved, properties: merged.properties });
        }
        return merged;
    }
    return node;
}

/**
 * Inverts ngx-schema-form's `canonicalPathNotation` (`/a/b/0/c` -> `a.b.0.c`) back into a schema node.
 * A numeric segment is an array index (step into `items`) unless a real property carries that key.
 */
export function lookupByCanonicalPath(root: SchemaNode, notation: string): SchemaNode | undefined {
    let node: SchemaNode | undefined = root;
    for (const segment of notation.split('.')) {
        node = resolveNode(root, node);
        if (!node) return undefined;
        node = node.properties?.[segment] ?? (/^\d+$/.test(segment) ? node.items : undefined);
    }
    return resolveNode(root, node);
}

/** The response of `GET applications/:formId/fillable-form/:docId`, wrapped or not. */
export function extractSchemaFromResponse(body: unknown): SchemaNode | undefined {
    const envelope = body as { data?: unknown } | undefined;
    const document = (envelope?.data ?? body) as { form?: SchemaNode; formTemplate?: SchemaNode } | undefined;
    const schema = document?.form ?? document?.formTemplate;
    return schema?.properties ? schema : undefined;
}

export interface GeneratedValue {
    value: string;
    strategy: string;
}

/** Probed against a field's `pattern`, most specific first. */
const PATTERN_CANDIDATES = ['0412345678', '412345678', '+61412345678', '4000', '12345', 'E2E Test Value', 'E2E', 'A1', '1'];

export function clampToLength(value: string, node: SchemaNode): string {
    let out = value;
    if (node.maxLength !== undefined && out.length > node.maxLength) out = out.slice(0, node.maxLength);
    if (node.minLength !== undefined && out.length < node.minLength) out = out.padEnd(node.minLength, 'x');
    return out;
}

/** Widgets whose value is chosen by clicking an option / overlay, never by typing. */
const OPTION_DRIVEN_WIDGETS = new Set([
    'select', 'special_select', 'radio', 'accentRadio', 'checkbox', 'boolean', 'year', 'spouse', 'date',
    'range', 'event', 'signature-capture', 'files-array', 'files-section', 'payment', 'payment-status'
]);

function testPattern(pattern: string, value: string): boolean {
    try {
        return new RegExp(pattern).test(value);
    } catch {
        return true; // an unparseable pattern must not block filling
    }
}

/** Picks a value satisfying what the schema declares: pattern, format, widget, numeric bounds, then filler text. */
export function generateValue(node: SchemaNode): GeneratedValue {
    const widget = widgetIdOf(node);

    if ((widget && OPTION_DRIVEN_WIDGETS.has(widget)) || node.enum || node.oneOf) {
        return { value: '', strategy: `option-driven(${widget ?? 'enum'})` };
    }

    if (node.pattern) {
        const match = PATTERN_CANDIDATES.find((candidate) => testPattern(node.pattern as string, candidate));
        if (match) return { value: clampToLength(match, node), strategy: `pattern(${node.pattern})` };
        return { value: clampToLength('QA Test Value', node), strategy: `pattern-unmatched(${node.pattern})` };
    }

    if (node.format === 'email') return { value: clampToLength('qa-test@example.com', node), strategy: 'format(email)' };
    if (node.format === 'uri') return { value: clampToLength('https://example.com', node), strategy: 'format(uri)' };

    if (widget === 'phone' || widget === 'tel') return { value: '412345678', strategy: `widget(${widget})` };
    if (widget === 'email') return { value: clampToLength('qa-test@example.com', node), strategy: 'widget(email)' };

    if (node.type === 'integer' || node.type === 'number' || widget === 'integer' || widget === 'number' || widget === 'amount') {
        const min = node.minimum ?? 1;
        const max = node.maximum ?? min + 10;
        return { value: String(Math.min(Math.max(5, min), max)), strategy: 'numeric-bounds' };
    }

    return { value: clampToLength('QA Test Value', node), strategy: 'fallback' };
}

/** Does a candidate (e.g. a profile value) satisfy the node's declared constraints? */
export function fitsSchema(value: string, node?: SchemaNode): boolean {
    if (!node) return true;
    if (node.pattern && !testPattern(node.pattern, value)) return false;
    if (node.maxLength !== undefined && value.length > node.maxLength) return false;
    if (node.minLength !== undefined && value.length < node.minLength) return false;
    if (node.type === 'integer' || node.type === 'number') {
        const n = Number(value);
        if (Number.isNaN(n)) return false;
        if (node.minimum !== undefined && n < node.minimum) return false;
        if (node.maximum !== undefined && n > node.maximum) return false;
    }
    if (node.format === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return false;
    return true;
}

// ---------------------------------------------------------------------------------------------
// Widget strategies
// ---------------------------------------------------------------------------------------------

export type FillStrategy =
    | 'text' | 'numeric' | 'range' | 'select' | 'radio' | 'checkbox' | 'date' | 'phone' | 'file' | 'signature'
    | 'container' | 'unsupported';

/** Keyed by every widget id `matwidgetregistry.ts` registers. */
export const WIDGET_STRATEGIES: Record<string, FillStrategy> = {
    string: 'text', search: 'text', tel: 'text', url: 'text', email: 'text', password: 'text', color: 'text',
    'date-time': 'text', time: 'text', textarea: 'text', chips: 'text',
    integer: 'numeric', number: 'numeric', amount: 'numeric',
    range: 'range',
    phone: 'phone',

    select: 'select', special_select: 'select', spouse: 'select', event: 'select', year: 'select',
    radio: 'radio', accentRadio: 'radio',
    checkbox: 'checkbox', boolean: 'checkbox',
    date: 'date',

    stepper: 'container', object: 'container', array: 'container', expansionPanel: 'container', info: 'container',
    hidden: 'container', readonly: 'container', button: 'container', 'signature-routing': 'container',
    address: 'container', 'files-section': 'container', signature: 'container',

    'files-array': 'file',
    'signature-capture': 'signature',

    payment: 'unsupported',
    'payment-status': 'unsupported'
};

/** Last resort when neither the schema nor `data-widget-type` names the widget. */
export function strategyFromTag(tag: string, inputType: string): FillStrategy | undefined {
    if (tag === 'mat-select') return 'select';
    if (tag === 'mat-radio-group') return 'radio';
    if (tag === 'mat-checkbox') return 'checkbox';
    if (tag === 'textarea') return 'text';
    if (tag === 'input') {
        if (inputType === 'range') return 'range';
        if (inputType === 'number') return 'numeric';
        return 'text';
    }
    return undefined;
}
