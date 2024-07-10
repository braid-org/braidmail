import tag from '@braid/tag'
import '../vendor/sjcl.js'
import '../vendor/bn.js'
import '../vendor/ecc.js'

const $ = tag('basic-encryption', {
})

$.draw(target => {
  var curve = sjcl.ecc.curves.c256;

  // Generate key pairs for both parties
  var keyPair1 = sjcl.ecc.elGamal.generateKeys(curve, 0);
  var keyPair2 = sjcl.ecc.elGamal.generateKeys(curve, 0);

  // Extract the public and private keys for both parties
  var publicKey1 = keyPair1.pub;
  var privateKey1 = keyPair1.sec;
  var publicKey2 = keyPair2.pub;
  var privateKey2 = keyPair2.sec;

  // Derive shared secrets
  var sharedSecret1 = privateKey1.dh(publicKey2);
  var sharedSecret2 = privateKey2.dh(publicKey1);

  // Convert shared secrets to symmetric keys
  var symmetricKey1 = sjcl.codec.base64.fromBits(sharedSecret1);
  var symmetricKey2 = sjcl.codec.base64.fromBits(sharedSecret2);

  // Ensure both shared secrets are identical
  console.log("Shared Secret 1:", symmetricKey1);
  console.log("Shared Secret 2:", symmetricKey2);

  // Use the shared secret to encrypt a message
  var plaintext = "Hello, this is a secret message!";
  var encryptedMessage = sjcl.encrypt(symmetricKey1, plaintext);
  console.log("Encrypted Message:", encryptedMessage);

  // Decrypt the message using the shared secret
  var decryptedMessage = sjcl.decrypt(symmetricKey2, encryptedMessage);
  console.log("Decrypted Message:", decryptedMessage);

  return `
    encrypted:
    ${encryptedMessage}
    <hr>
    decrypted:
    ${decryptedMessage}
    <hr>
    public keys:
    ${publicKey1}
    ${publicKey2}
    <hr>
    private key:
    ${privateKey1}
    ${privateKey2}
  `
})

$.when('click', 'button', async (event) => {
})

$.style(`
  & {
    display: block;
  }

  & button {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: dodgerblue;
    text-shadow: 1px 1px rgba(0,0,0,.85);
    border: none;
    border-radius: 1rem;
    color: white;
    transition: background-color 200ms ease-in-out;
    padding: 1rem;
    width: 100%;
  }

  & button:focus,
  & button:hover {
    background-color: rebeccapurple;
  }
`)

function schedule(x) { setTimeout(x, 1) }
