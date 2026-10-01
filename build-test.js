// Bundles the pure (DOM-free) modules for node so test/ and test-identify.js can require them.
const esbuild = require('esbuild');

esbuild
    .build({
        entryPoints: ['src/testids.ts', 'src/utils.ts'],
        bundle: true,
        platform: 'node',
        format: 'cjs',
        outdir: 'dist-test',
        logLevel: 'warning'
    })
    .catch(() => process.exit(1));
