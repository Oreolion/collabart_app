/**
 * Generate a CA + end-entity certificate chain for C2PA signing.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

const scriptsDir = __dirname;

function generateChain() {
  const tmpDir = os.tmpdir();
  const prefix = `c2pa-${Date.now()}`;
  const rootKey = path.join(tmpDir, `${prefix}-root-key.pem`);
  const rootCert = path.join(tmpDir, `${prefix}-root-cert.pem`);
  const rootConfig = path.join(tmpDir, `${prefix}-root.cnf`);
  const eeKey = path.join(tmpDir, `${prefix}-ee-key.pem`);
  const eeCsr = path.join(tmpDir, `${prefix}-ee.csr`);
  const eeCert = path.join(tmpDir, `${prefix}-ee-cert.pem`);
  const eeConfig = path.join(tmpDir, `${prefix}-ee.cnf`);

  // Root CA config
  fs.writeFileSync(rootConfig, `
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_ca
[req_distinguished_name]
[v3_ca]
basicConstraints = critical, CA:TRUE
keyUsage = critical, keyCertSign, cRLSign
`);

  // EE config
  fs.writeFileSync(eeConfig, `
[req]
distinguished_name = req_distinguished_name
[req_distinguished_name]
[exts]
basicConstraints = critical, CA:FALSE
keyUsage = critical, digitalSignature
extendedKeyUsage = codeSigning
`);

  try {
    // Root CA
    execSync(`openssl ecparam -name prime256v1 -genkey -noout -out "${rootKey}"`, { encoding: "utf-8" });
    execSync(
      `openssl req -new -x509 -key "${rootKey}" -out "${rootCert}" -days 3650 -subj "/CN=eCollabs C2PA Root CA/O=eCollabs/C=US" -config "${rootConfig}"`,
      { encoding: "utf-8" }
    );

    // End-entity key (PKCS#8)
    execSync(`openssl ecparam -name prime256v1 -genkey -noout -out "${eeKey}.raw"`, { encoding: "utf-8" });
    execSync(`openssl pkcs8 -topk8 -nocrypt -in "${eeKey}.raw" -out "${eeKey}"`, { encoding: "utf-8" });

    // CSR
    execSync(
      `openssl req -new -key "${eeKey}" -out "${eeCsr}" -subj "/CN=eCollabs C2PA Signer/O=eCollabs/C=US"`,
      { encoding: "utf-8" }
    );

    // Sign with Root CA
    execSync(
      `openssl x509 -req -in "${eeCsr}" -CA "${rootCert}" -CAkey "${rootKey}" -CAcreateserial -out "${eeCert}" -days 3650 -extfile "${eeConfig}" -extensions exts`,
      { encoding: "utf-8" }
    );

    return {
      rootCertPem: fs.readFileSync(rootCert, "utf-8"),
      eeCertPem: fs.readFileSync(eeCert, "utf-8"),
      eeKeyPem: fs.readFileSync(eeKey, "utf-8"),
    };
  } finally {
    [
      rootKey, rootCert, rootConfig,
      eeKey, `${eeKey}.raw`, eeCsr, eeCert, eeConfig,
      `${rootCert}.srl`,
    ].forEach((f) => {
      try { fs.unlinkSync(f); } catch {}
    });
  }
}

try {
  const { rootCertPem, eeCertPem, eeKeyPem } = generateChain();

  // Write full chain cert (ee + root) for C2PA
  fs.writeFileSync(path.join(scriptsDir, "c2pa-cert.pem"), eeCertPem + rootCertPem);
  fs.writeFileSync(path.join(scriptsDir, "c2pa-key.pem"), eeKeyPem);

  console.log("✅ Certificate chain written:");
  console.log("  - scripts/c2pa-cert.pem  (EE cert + Root CA)");
  console.log("  - scripts/c2pa-key.pem   (EE private key)");
  console.log("");
  console.log("Set these as Convex environment variables:");
  console.log("  C2PA_CERT_PEM=<contents of c2pa-cert.pem>");
  console.log("  C2PA_KEY_PEM=<contents of c2pa-key.pem>");
} catch (err) {
  console.error("Failed to generate certificate chain:", err.message);
  process.exit(1);
}
