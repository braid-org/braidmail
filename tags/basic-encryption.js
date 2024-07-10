import tag from '@braid/tag'
import '../vendor/sjcl.js'
import '../vendor/bn.js'
import '../vendor/ecc.js'
import { showModal } from '@plan98/modal'

const ring = {
  publicKey1: null,
  publicKey2: null,
  privateKey1: null,
  privateKey2: null,
  sharedSecret1: null,
  sharedSecret2: null,
  symmetricKey1: null,
  symmetricKey2: null
}

const $ = tag('basic-encryption', {
  raw: '',
  encryptedMessage: '',
  decryptedMessage: '',
})

$.draw(target => {
  const {
    keysReady,
    secretsReady,
    encryptedMessage,
    decryptedMessage,
    raw
  } = $.learn()

  target.beforeUpdate = saveCursor
  target.afterUpdate = replaceCursor
  const keys = keysReady ? `
    <button data-key="publicKey1">
      Public Key 1
    </button>
    <button data-key="publicKey2">
      Public Key 1
    </button>
    <button data-key="privateKey1">
      Private Key 1
    </button>
    <button data-key="privateKey2">
      Private Key 1
    </button>

    Step 2:
    <button data-generate-secrets>
      Generate Secrets
    </button>

    <hr>
  ` : ''

  const secrets = secretsReady ? `
    <button data-key="sharedSecret1">
      Shared Secret 1
    </button>
    <button data-key="sharedSecret2">
      Shared Secret 2
    </button>
    <button data-key="symmetricKey1">
      Symmetric Key 1
    </button>
    <button data-key="symmetricKey2">
      Symmetric Key 2
    </button>

    Step 3:
    <form name="encrypt">
      <textarea name="raw">${raw}</textarea>
      <button type="submit">
        Encrypt
      </button>
    </form>
    <hr>
  ` : ''
  const decrypter= encryptedMessage ? `
    Step 4:
    <form name="decrypt">
      <textarea name="encrypted" disabled>${encryptedMessage}</textarea>
      <button type="submit">
        decrypt
      </button>
    </form>

    Result:
    <textarea name="decrypted" disabled>${decryptedMessage}</textarea>
  ` : ''

  return `
    Step 1:
    <button data-generate-keys>
      Generate Keys
    </button>
    <hr>
    ${keys}
    ${secrets}
    ${decrypter}
  `
})

$.when('input', 'textarea', (event) => {
  const raw = event.target.value
  $.teach({ raw })
})

$.when('click', '[data-generate-keys]', async (event) => {
  const curve = sjcl.ecc.curves.c256;

  // Generate key pairs for both parties
  const keyPair1 = sjcl.ecc.elGamal.generateKeys(curve, 0);
  const keyPair2 = sjcl.ecc.elGamal.generateKeys(curve, 0);

  // Extract the public and private keys for both parties
  ring.publicKey1 = keyPair1.pub;
  ring.privateKey1 = keyPair1.sec;
  ring.publicKey2 = keyPair2.pub;
  ring.privateKey2 = keyPair2.sec;


  $.teach({
    keysReady: true
  })
})

$.when('click', '[data-generate-secrets]', async (event) => {
  ring.sharedSecret1 = ring.privateKey1.dh(ring.publicKey2);
  ring.sharedSecret2 = ring.privateKey2.dh(ring.publicKey1);

  // Convert shared secrets to symmetric keys
  ring.symmetricKey1 = sjcl.codec.base64.fromBits(ring.sharedSecret1);
  ring.symmetricKey2 = sjcl.codec.base64.fromBits(ring.sharedSecret2);

  // Ensure both shared secrets are identical
  console.log("Shared Secret 1:", ring.symmetricKey1);
  console.log("Shared Secret 2:", ring.symmetricKey2);

  $.teach({
    secretsReady: true
  })
})


$.when('submit', '[name="encrypt"]', async (event) => {
  const { value } = event.target.raw
  // Use the shared secret to encrypt a message
  const encryptedMessage = sjcl.encrypt(ring.symmetricKey1, value);
  console.log("Encrypted Message:", encryptedMessage);
  $.teach({ encryptedMessage })
})



$.when('submit', '[name="decrypt"]', async (event) => {
  const { encryptedMessage } = $.learn()
  // Decrypt the message using the shared secret
  const decryptedMessage = sjcl.decrypt(ring.symmetricKey2, encryptedMessage);
  console.log("Decrypted Message:", decryptedMessage);

  $.teach({ decryptedMessage })
})




$.when('click', '[data-key]', (event) => {
  const { key } = event.target.dataset
  const data = ring[key]

  const body = typeof data === 'object' ? JSON.stringify(data.serialize ? data.serialize() : data,'', 4) : data
  showModal(`
    <div style="background: white;border-radius: 1rem; padding: 1rem">
      ${body}
    </div>
  `)
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

  & textarea {
    width: 100%;
    resize: none;
    height: 5rem;
  }
`)

let sel = []
function saveCursor(target) {
  if(target.contains(document.activeElement)) {
    target.dataset.paused = document.activeElement.name
    if(document.activeElement.tagName === 'TEXTAREA') {
      const textarea = document.activeElement
      sel = [textarea.selectionStart, textarea.selectionEnd];
    }
  }
}

function replaceCursor(target) {
  const paused = target.querySelector(`[name="${target.dataset.paused}"]`)
  
  if(paused) {
    paused.focus()

    if(paused.tagName === 'TEXTAREA') {
      paused.selectionStart = sel[0];
      paused.selectionEnd = sel[1];
    }
  }
}


function schedule(x) { setTimeout(x, 1) }
