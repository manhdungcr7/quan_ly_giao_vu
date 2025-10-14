const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');

const ENABLE_ENV = process.env.ENABLE_DEV_HTTPS === 'true' || process.env.ENABLE_DEV_HTTPS === '1';

const resolvePath = (value) => {
    if (!value) return null;
    if (path.isAbsolute(value)) return value;
    return path.resolve(__dirname, '..', value);
};

const readOptionalFile = (targetPath) => {
    if (!targetPath) return null;
    try {
        return fs.readFileSync(targetPath);
    } catch (error) {
        console.warn(`⚠️  Unable to read SSL file at ${targetPath}:`, error.message);
        return null;
    }
};

const buildFallbackCertificate = () => {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    let commonName = 'localhost';
    try {
        const parsed = new URL(appUrl);
        commonName = parsed.hostname;
    } catch (_) {
        // noop, keep localhost
    }

    const attrs = [{ name: 'commonName', value: commonName }];
    const pems = selfsigned.generate(attrs, {
        keySize: 2048,
        days: 365,
        algorithm: 'sha256',
        extensions: [{
            name: 'subjectAltName',
            altNames: [
                { type: 2, value: commonName },
                { type: 2, value: 'localhost' }
            ]
        }]
    });

    return {
        key: pems.private,
        cert: pems.cert,
        generated: true
    };
};

const loadCertificate = () => {
    const keyPath = resolvePath(process.env.SSL_KEY_PATH || process.env.DEV_SSL_KEY_PATH);
    const certPath = resolvePath(process.env.SSL_CERT_PATH || process.env.DEV_SSL_CERT_PATH);
    const passphrase = process.env.SSL_PASSPHRASE || process.env.DEV_SSL_PASSPHRASE || undefined;

    const key = readOptionalFile(keyPath);
    const cert = readOptionalFile(certPath);

    if (key && cert) {
        return {
            key,
            cert,
            passphrase,
            generated: false,
            source: {
                keyPath,
                certPath
            }
        };
    }

    const fallback = buildFallbackCertificate();
    return {
        key: fallback.key,
        cert: fallback.cert,
        generated: fallback.generated,
        passphrase: undefined,
        source: {
            generated: true
        }
    };
};

const sslConfig = {
    enabled: ENABLE_ENV,
    options: null,
    generated: false,
    source: null
};

if (sslConfig.enabled) {
    const certBundle = loadCertificate();
    sslConfig.options = {
        key: certBundle.key,
        cert: certBundle.cert,
        passphrase: certBundle.passphrase
    };
    sslConfig.generated = certBundle.generated;
    sslConfig.source = certBundle.source;
}

module.exports = sslConfig;
