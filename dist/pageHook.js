"use strict";
(() => {
  // src/pageHook.ts
  var SCHEMA_NODE_ID = "qa-autofill-schema";
  var SCHEMA_URL_PATTERN = /\/fillable-form\//;
  function publish(url, text) {
    try {
      const body = JSON.parse(text);
      const envelope = body && typeof body === "object" ? body : void 0;
      const document = envelope?.data ?? body;
      const schema = document?.form ?? document?.formTemplate;
      if (!schema?.properties)
        return;
      let node = window.document.getElementById(SCHEMA_NODE_ID);
      if (!node) {
        node = window.document.createElement("script");
        node.id = SCHEMA_NODE_ID;
        node.setAttribute("type", "application/json");
        (window.document.documentElement || window.document).appendChild(node);
      }
      node.setAttribute("data-url", url);
      node.textContent = JSON.stringify(schema);
    } catch {
    }
  }
  var originalFetch = window.fetch;
  if (typeof originalFetch === "function") {
    window.fetch = function(...args) {
      const promise = originalFetch.apply(window, args);
      try {
        const input = args[0];
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        if (SCHEMA_URL_PATTERN.test(url)) {
          promise.then((response) => response.clone().text().then((text) => publish(url, text))).catch(() => void 0);
        }
      } catch {
      }
      return promise;
    };
  }
  var originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    try {
      const target = String(url);
      if (SCHEMA_URL_PATTERN.test(target)) {
        this.addEventListener("load", () => {
          if (typeof this.responseText === "string")
            publish(target, this.responseText);
        });
      }
    } catch {
    }
    return originalOpen.call(this, method, url, ...rest);
  };
})();
