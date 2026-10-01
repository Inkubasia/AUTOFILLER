const test = require('node:test');
const assert = require('node:assert');
const t = require('../dist-test/testids.js');

test('parseWebformTestId covers every form shape', () => {
    assert.deepStrictEqual(t.parseWebformTestId('webform-general-first-name'), { form: 'general', contact: 1, slug: 'first-name' });
    assert.deepStrictEqual(t.parseWebformTestId('webform-prospectus-contact2-home-phone'), { form: 'prospectus', contact: 2, slug: 'home-phone' });
    assert.deepStrictEqual(t.parseWebformTestId('webform-event-reg-total-attendees'), { form: 'event', contact: 1, slug: 'total-attendees' });
    assert.deepStrictEqual(t.parseWebformTestId('webform-event-contact2-reg-last-name'), { form: 'event', contact: 2, slug: 'last-name' });
    assert.deepStrictEqual(t.parseWebformTestId('webform-student-date-of-birth'), { form: 'student', contact: 1, slug: 'date-of-birth' });
    assert.strictEqual(t.parseWebformTestId('auth-login-email'), null);
});

test('webform slug maps to profile key, containers and unknowns do not', () => {
    assert.strictEqual(t.profileKeyForWebformTestId('webform-general-postcode'), 'postCode');
    assert.strictEqual(t.profileKeyForWebformTestId('webform-event-contact2-reg-send-confirmation'), 'sendConfirmationContact2');
    assert.strictEqual(t.profileKeyForWebformTestId('webform-student-special-needs'), 'hasSpecialNeeds');
    assert.strictEqual(t.profileKeyForWebformTestId('webform-general-contact1-form'), null);
    assert.strictEqual(t.profileKeyForWebformTestId('webform-general-alumni'), null);
});

test('sf field root vs sub-element ids', () => {
    assert.ok(t.isSfFieldRootTestId('sf-students.0.firstName'));
    assert.ok(!t.isSfFieldRootTestId('sf-gender-option-1'));
    assert.ok(!t.isSfFieldRootTestId('sf-docs-file-a.png'));
    assert.ok(!t.isSfFieldRootTestId('sf-docs-delete-a.png'));
    assert.ok(!t.isSfFieldRootTestId('sf-signature-clear'));
    assert.ok(!t.isSfFieldRootTestId('stepper-root'));
    assert.strictEqual(t.sfFieldPathFromAnyTestId('sf-a.b-option-3'), 'a.b');
    assert.strictEqual(t.sfFieldPathFromAnyTestId('sf-sig-clear'), 'sig');
    assert.strictEqual(t.sfOptionValueFromTestId('a.b', 'sf-a.b-option-3'), '3');
});

const schema = {
    definitions: { phoneStr: { type: 'string', widget: 'phone' } },
    properties: {
        students: {
            type: 'array',
            items: {
                properties: {
                    firstName: { type: 'string', maxLength: 5 },
                    postcode: { type: 'string', pattern: '^[0-9]{4}$' },
                    mobile: { $ref: '#/definitions/phoneStr' },
                    age: { type: 'integer', minimum: 7, maximum: 9 }
                }
            }
        },
        payment: { properties: { '98': { type: 'string' } } }
    }
};

test('lookupByCanonicalPath steps through arrays, refs and numeric keys', () => {
    assert.strictEqual(t.lookupByCanonicalPath(schema, 'students.0.firstName').maxLength, 5);
    assert.strictEqual(t.widgetIdOf(t.lookupByCanonicalPath(schema, 'students.0.mobile')), 'phone');
    assert.ok(t.lookupByCanonicalPath(schema, 'payment.98'));
    assert.strictEqual(t.lookupByCanonicalPath(schema, 'students.0.nope'), undefined);
});

test('generateValue satisfies pattern, length and numeric bounds', () => {
    const post = t.lookupByCanonicalPath(schema, 'students.0.postcode');
    assert.match(t.generateValue(post).value, /^[0-9]{4}$/);
    assert.ok(t.generateValue(t.lookupByCanonicalPath(schema, 'students.0.firstName')).value.length <= 5);
    assert.strictEqual(t.generateValue(t.lookupByCanonicalPath(schema, 'students.0.age')).value, '7');
    assert.strictEqual(t.generateValue({ widget: 'select' }).value, '');
});

test('fitsSchema rejects values the schema would reject', () => {
    const post = t.lookupByCanonicalPath(schema, 'students.0.postcode');
    assert.ok(t.fitsSchema('2000', post));
    assert.ok(!t.fitsSchema('ABCD', post));
    assert.ok(!t.fitsSchema('Jonathan', t.lookupByCanonicalPath(schema, 'students.0.firstName')));
    assert.ok(!t.fitsSchema('12', t.lookupByCanonicalPath(schema, 'students.0.age')));
    assert.ok(t.fitsSchema('anything', undefined));
});

test('extractSchemaFromResponse accepts wrapped and bare payloads', () => {
    const form = { properties: { a: {} } };
    assert.strictEqual(t.extractSchemaFromResponse({ data: { form } }), form);
    assert.strictEqual(t.extractSchemaFromResponse({ formTemplate: form }), form);
    assert.strictEqual(t.extractSchemaFromResponse({ data: { form: {} } }), undefined);
});

test('every registered widget id has a strategy', () => {
    for (const id of ['string', 'select', 'radio', 'checkbox', 'date', 'phone', 'files-array', 'signature-capture', 'payment', 'stepper']) {
        assert.ok(t.WIDGET_STRATEGIES[id], id);
    }
});
