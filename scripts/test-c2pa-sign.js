/**
 * Test C2PA signing with LocalSigner — try EE cert only + root as trust anchor.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { Builder, LocalSigner, Reader, createVerifySettings, createTrustSettings, mergeSettings } = require("@contentauth/c2pa-node");

const fullChain = fs.readFileSync(path.join(__dirname, "c2pa-cert.pem"), "utf-8");
const keyPem = fs.readFileSync(path.join(__dirname, "c2pa-key.pem"));

// Split the chain into individual certs
const certBlocks = fullChain.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g) || [];
console.log("Found certs in chain:", certBlocks.length);
const eeCert = Buffer.from(certBlocks[0], "utf-8");
const rootCert = certBlocks.length > 1 ? Buffer.from(certBlocks[1], "utf-8") : null;

// Create a minimal valid WAV file
const wavHeader = Buffer.alloc(44);
wavHeader.write("RIFF", 0);
wavHeader.writeUInt32LE(36, 4);
wavHeader.write("WAVE", 8);
wavHeader.write("fmt ", 12);
wavHeader.writeUInt32LE(16, 16);
wavHeader.writeUInt16LE(1, 20);
wavHeader.writeUInt16LE(1, 22);
wavHeader.writeUInt32LE(44100, 24);
wavHeader.writeUInt32LE(44100 * 1 * 16 / 8, 28);
wavHeader.writeUInt16LE(1 * 16 / 8, 32);
wavHeader.writeUInt16LE(16, 34);
wavHeader.write("data", 36);
wavHeader.writeUInt32LE(2, 40);
const wavData = Buffer.concat([wavHeader, Buffer.from([0, 0])]);

async function main() {
  const tmpDir = os.tmpdir();
  const inputPath = path.join(tmpDir, `c2pa-test-in-${Date.now()}.wav`);
  const outputPath = path.join(tmpDir, `c2pa-test-out-${Date.now()}.wav`);

  try {
    fs.writeFileSync(inputPath, wavData);

    const signer = LocalSigner.newSigner(eeCert, keyPem, "es256");
    console.log("LocalSigner created. Algorithm:", signer.alg());
    console.log("Certs:", signer.certs().length);

    const verifySettings = createVerifySettings({
      verifyAfterSign: false,
      verifyTrust: false,
    });
    const trustSettings = createTrustSettings({
      verifyTrustList: false,
      userAnchors: rootCert ? rootCert.toString("utf-8") : undefined,
    });
    const settings = mergeSettings(verifySettings, trustSettings);
    console.log("Settings:", settings);

    const builder = Builder.new(settings);
    builder.setIntent({
      create: "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia",
    });

    builder.addAssertion("c2pa.actions", {
      actions: [
        {
          action: "c2pa.created",
          softwareAgent: "eCollabs/1.0.0",
          digitalSourceType:
            "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia",
        },
      ],
    });

    const inputAsset = { path: inputPath };
    const outputAsset = { path: outputPath };

    console.log("Signing...");
    const manifest = builder.sign(signer, inputAsset, outputAsset);
    console.log("Signed!");
    console.log("Manifest definition:", JSON.stringify(builder.getManifestDefinition(), null, 2));

    const reader = await Reader.fromAsset(outputAsset, {
      verify: { verify_after_reading: false, verify_trust: false },
    });
    const store = reader.json();
    console.log("\nVerified manifest store:");
    console.log(JSON.stringify(store, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    try { fs.unlinkSync(inputPath); } catch {}
    try { fs.unlinkSync(outputPath); } catch {}
  }
}

main();
