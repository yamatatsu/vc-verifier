import jose from "node-jose";
import pako from "pako";

const code = process.argv[2];

main(code);

async function main(code: string) {
  // reverse it @see https://github.com/smart-on-fhir/health-cards/blob/0acc3ccc0c40de20fc9c75bf9305c8cda080ae1f/generate-examples/src/index.ts#L213-L217
  const jws = decode2Jws(code);
  // console.debug("jws:", jws);

  const jwks = await fetchJwks();
  // console.debug("jwks:", jwks);

  const payload = await verify(jws, jwks);

  const json = Buffer.from(pako.inflateRaw(payload)).toString("utf-8");
  console.info(JSON.stringify(JSON.parse(json), null, 2));
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

async function verify(jws: string, jwks: any): Promise<Buffer> {
  const keystore = await jose.JWK.asKeyStore(jwks);
  const verifier = jose.JWS.createVerify(keystore);

  const verified = await verifier.verify(jws);
  return verified.payload;
}
