const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const privateKey = secp.utils.randomPrivateKey();
const publicKey = secp.getPublicKey(privateKey);

const privateKeyHex = toHex(privateKey);
const publicKeyHex = toHex(publicKey);
const publicKeyKeccak256 = keccak256(publicKey);

const publicAddress = toHex(
  publicKeyKeccak256.slice(
    publicKeyKeccak256.length - 20,
    publicKeyKeccak256.length
  )
);

console.log("private key: ", privateKeyHex);
console.log("public key: ", publicKeyHex);
console.log("publicAddress: ", `0x${publicAddress}`);
