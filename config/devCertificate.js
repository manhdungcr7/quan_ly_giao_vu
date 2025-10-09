const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');

const CERT_DIR = path.join(__dirname, 'certs');
const KEY_PATH = path.join(CERT_DIR, 'localhost-key.pem');
const CERT_PATH = path.join(CERT_DIR, 'localhost-cert.pem');

function ensureCertificate() {
  if (!fs.existsSync(CERT_DIR)) {
    fs.mkdirSync(CERT_DIR, { recursive: true });
  }

  const certExists = fs.existsSync(KEY_PATH) && fs.existsSync(CERT_PATH);

  if (!certExists) {
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const options = {
      algorithm: 'sha256',
      days: 365,
      keySize: 2048,
      extensions: [
        {
          name: 'basicConstraints',
          cA: true
        },
        {
          name: 'subjectAltName',
          altNames: [
            { type: 2, value: 'localhost' },
            { type: 7, ip: '127.0.0.1' }
          ]
        }
      ]
    };

    const pems = selfsigned.generate(attrs, options);
    fs.writeFileSync(KEY_PATH, pems.private, { encoding: 'utf8', mode: 0o600 });
    fs.writeFileSync(CERT_PATH, pems.cert, { encoding: 'utf8', mode: 0o600 });
  }
}

function getDevCertificate() {
  ensureCertificate();
  return {
    key: fs.readFileSync(KEY_PATH, 'utf8'),
    cert: fs.readFileSync(CERT_PATH, 'utf8')
  };
}

module.exports = {
  getDevCertificate
};
