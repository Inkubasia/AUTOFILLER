// Runs in the page's MAIN world at document_start (see manifest.json) so it can wrap fetch / XHR.
// The app fetches the whole form JSON schema from `GET applications/:formId/fillable-form/:docId`;
// the content script lives in an isolated world and cannot see that response, so the hook parks
// the latest copy in a hidden <script type="application/json"> node both worlds can read. A DOM node
// (instead of a postMessage) keeps it race-free: the schema may land before the content script loads.

const SCHEMA_NODE_ID = 'qa-autofill-schema';
const SCHEMA_URL_PATTERN = /\/fillable-form\//;

function publish(url: string, text: string): void {
    try {
        const body = JSON.parse(text);
        const envelope = body && typeof body === 'object' ? (body as { data?: unknown }) : undefined;
        const document = (envelope?.data ?? body) as { form?: { properties?: unknown }; formTemplate?: { properties?: unknown } } | undefined;
        const schema = document?.form ?? document?.formTemplate;
        if (!schema?.properties) return;

        let node = window.document.getElementById(SCHEMA_NODE_ID);
        if (!node) {
            node = window.document.createElement('script');
            node.id = SCHEMA_NODE_ID;
            node.setAttribute('type', 'application/json');
            (window.document.documentElement || window.document).appendChild(node);
        }
        node.setAttribute('data-url', url);
        node.textContent = JSON.stringify(schema);
    } catch {
        // not JSON, or not the schema — ignore
    }
}

const originalFetch = window.fetch;
if (typeof originalFetch === 'function') {
    window.fetch = function (this: unknown, ...args: Parameters<typeof fetch>): Promise<Response> {
        const promise = originalFetch.apply(window, args);
        try {
            const input = args[0];
            const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
            if (SCHEMA_URL_PATTERN.test(url)) {
                promise.then((response) => response.clone().text().then((text) => publish(url, text))).catch(() => undefined);
            }
        } catch {
            // never let the hook break the app's own request
        }
        return promise;
    };
}

const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, method: string, url: string | URL, ...rest: unknown[]) {
    try {
        const target = String(url);
        if (SCHEMA_URL_PATTERN.test(target)) {
            this.addEventListener('load', () => {
                if (typeof this.responseText === 'string') publish(target, this.responseText);
            });
        }
    } catch {
        // ignore
    }
    return (originalOpen as (...args: unknown[]) => void).call(this, method, url, ...rest);
} as typeof XMLHttpRequest.prototype.open;
