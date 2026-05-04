/**
 * Generate a self-signed EC P-256 certificate for C2PA signing.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

const scriptsDir = __dirname;

function generateWithOpenSSL() {
  const tmpKey = path.join(os.tmpdir(), `c2pa-key-${Date.now()}.pem`);
  const tmpKeyPkcs8 = path.join(os.tmpdir(), `c2pa-key-pkcs8-${Date.now()}.pem`);
  const tmpCert = path.join(os.tmpdir(), `c2pa-cert-${Date.now()}.pem`);

  try {
    // Generate EC key
    execSync(`openssl ecparam -name prime256v1 -genkey -noout -out "${tmpKey}"`, { encoding: "utf-8" });
    // Convert to PKCS#8 (PRIVATE KEY header)
    execSync(`openssl pkcs8 -topk8 -nocrypt -in "${tmpKey}" -out "${tmpKeyPkcs8}"`, { encoding: "utf-8" });
    // Generate self-signed cert
    execSync(
      `openssl req -new -x509 -key "${tmpKeyPkcs8}" -out "${tmpCert}" -days 3650 -subj "/CN=eCollabs C2PA Signer/O=eCollabs/C=US"`,
      { encoding: "utf-8" }
    );

    const keyPem = fs.readFileSync(tmpKeyPkcs8, "utf-8");
    const certPem = fs.readFileSync(tmpCert, "utf-8");
    return { certPem, keyPem };
  } finally {
    try { fs.unlinkSync(tmpKey); } catch {}
    try { fs.unlinkSync(tmpKeyPkcs8); } catch {}
    try { fs.unlinkSync(tmpCert); } catch {}
  }
}

try {
  const { certPem, keyPem } = generateWithOpenSSL();

  fs.writeFileSync(path.join(scriptsDir, "c2pa-cert.pem"), certPem);
  fs.writeFileSync(path.join(scriptsDir, "c2pa-key.pem"), keyPem);

  console.log("✅ Certificate files written:");
  console.log("  - scripts/c2pa-cert.pem");
  console.log("  - scripts/c2pa-key.pem");
  console.log("");
  console.log("Set these as Convex environment variables:");
  console.log("  C2PA_CERT_PEM=<contents of c2pa-cert.pem>");
  console.log("  C2PA_KEY_PEM=<contents of c2pa-key.pem>");
} catch (err) {
  console.error("Failed to generate certificate:", err.message);
  process.exit(1);
}
