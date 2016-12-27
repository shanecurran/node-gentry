var fhe = require("./index.js")();

// Explain the crypto defaults
fhe.explainParameters();

// Run a quick encrypt / decrypt cycle to check if the bit is encrypted and decrypted correctly
for (var i = 0; i < 10; i++) {
	if (fhe.runTest() === false) {
		throw new Error("Encryption / decryption cycle produced invalid result");
	}
}
console.log();
console.log("All tests passed...");