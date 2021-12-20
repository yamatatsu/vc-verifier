import jose from "node-jose";
import pako from "pako";
import fetch from "node-fetch";

const code = process.argv[2];

main(code);

async function main(code: string) {
  // reverse it @see https://github.com/smart-on-fhir/health-cards/blob/0acc3ccc0c40de20fc9c75bf9305c8cda080ae1f/generate-examples/src/index.ts#L213-L217
  const jws = split2Char(code.replace("shc:/", ""))
    .map((str) => Number(str) + 45)
    .map((n) => String.fromCharCode(n))
    .join("");
  // console.debug("jws:", jws);

  const jwks: any = await fetchJwks();
  // console.debug("jwks:", jwks);
  const keystore = await jose.JWK.asKeyStore(jwks);
  const verifier = jose.JWS.createVerify(keystore);

  const verified = await verifier.verify(jws);
  // console.debug("verified", verified);

  const payload = Buffer.from(pako.inflateRaw(verified.payload)).toString(
    "utf-8"
  );
  console.info(JSON.stringify(JSON.parse(payload), null, 2));
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
