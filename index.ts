import { inflateRawSync } from "node:zlib";
import jose from "node-jose";

const code = process.argv[2];

main(code);

async function main(code: string) {
  // reverse it @see https://github.com/smart-on-fhir/health-cards/blob/0acc3ccc0c40de20fc9c75bf9305c8cda080ae1f/generate-examples/src/index.ts#L213-L217
  const jws = decode2Jws(code);

  const [header, payload, signature] = jws.split(".");
  console.debug(
    "header:",
    formatJson(Buffer.from(header, "base64url").toString("utf-8"))
  );
  console.debug(
    "claims:",
    formatJson(
      inflateRawSync(Buffer.from(payload, "base64url")).toString("utf-8")
    )
  );
  console.debug(
    "signature:",
    signature.slice(0, 10) + "...",
    `(length: ${signature.length})`
  );

  const jwks = await fetchJwks();
  console.debug("jwks:", JSON.stringify(jwks, null, 2));

  await verify(jws, jwks);

  console.info("Success!");
}

function decode2Jws(code: string): string {
  return split2Char(code.replace("shc:/", ""))
    .map((str) => Number(str) + 45)
    .map((n) => String.fromCharCode(n))
    .join("");
}

function split2Char(code: string): string[] {
  if (!code) {
    return [];
  }
  const head = code.slice(0, 2);
  const tail = code.slice(2);
  return [head, ...split2Char(tail)];
}

async function fetchJwks() {
  const jwksUrl = "https://vc.vrs.digital.go.jp/issuer/.well-known/jwks.json";
  const res = await fetch(jwksUrl);
  const jwks = await res.json();
  return jwks;
}

async function verify(
  jws: string,
  jwks: any
): Promise<jose.JWS.VerificationResult> {
  const keystore = await jose.JWK.asKeyStore(jwks);
  const verifier = jose.JWS.createVerify(keystore);
  return verifier.verify(jws);
}

function formatJson(str: string): string {
  return JSON.stringify(JSON.parse(str), null, 2);
}
