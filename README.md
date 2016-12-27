# node-gentry
A reference library for the qCrypt implementation of Fully Homomorphic Encryption (FHE) by Craig Gentry. Built for (qCrypt)[https://getqcrypt.com/].

## Install
```bash
npm install fhe
```

## Information
This library makes use of the (BigInteger.js library by Peter Olson)[https://github.com/peterolson/BigInteger.js].
Inspired by a (Python demonstration by Christopher Swenson)[https://gist.github.com/swenson/1231675bd2617060540c056687428ca8].

*This library is intended for education purposes _ONLY_ and is _NOT_ suitable for production use.*

## Usage
```javascript
var fhe         = require("fhe");

// Simple explainer for the FHE parameters
// (debug purposes)
fhe.explainParameters();

// Run a test encryption / decryption bit cycle
// This method returns a boolean as a result
// true  === success
// false === something went wrong
console.log(fhe.runTest());

/**
  * For custom implementations
  */
// Generate a keypair (public key and private key)
var keyPair     = fhe.genKeyPair();

// Encrypt a bit
var bit = 1;
var ciphertext  = fhe.encryptBit(keyPair.public, bit);

// Decrypt the bit
var decrypted   = fhe.decryptBit(keyPair.secret, ciphertext);

// Verify the decrypted bit is the same as the original
console.log(decrypted === bit);
```