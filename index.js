var bigInt = require("big-integer");
var rand   = require("csprng");

/**
  * @author Shane Curran
  * Produced for qCrypt (https://getqcrypt.com/)
  * Last revision: Tue 27 dec 22:52:42 UTC
  * License: GPL v3
  */
var qcrypt_fhe = function (options) {
	var qcrypt_functions = {
		crypto_defaults: {
			rho: typeof options !== "undefined" && typeof options.rho !== "undefined" ? bigInt(options.rho) : bigInt(2),
			rho_prime: typeof options !== "undefined" && typeof options.rho_prime !== "undefined" ? bigInt(options.rho_prime) : bigInt(3),
			nu: typeof options !== "undefined" && typeof options.nu !== "undefined" ? bigInt(options.nu) : bigInt(9),
			gamma: typeof options !== "undefined" && typeof options.gamma !== "undefined" ? bigInt(options.gamma) : bigInt(9),
			tau: typeof options !== "undefined" && typeof options.tau !== "undefined" ? bigInt(options.tau) : bigInt(6)
		},

		explainParameters: function () {
			console.log("Public key integer bit size: ", this.crypto_defaults.gamma.toString());
			console.log("Secret key bit size: ", this.crypto_defaults.nu.toString());
			console.log("Noise bit size: ", this.crypto_defaults.rho.toString());
			console.log("Secondary noise parameter: ", this.crypto_defaults.rho_prime.toString());
			console.log("Number of integers in public key: ", this.crypto_defaults.tau.add(1).toString());
			console.log("Maximum error: ", (bigInt(2).pow(this.crypto_defaults.rho).minus(1).times(this.crypto_defaults.tau.plus(1)) + (bigInt(2).pow(this.crypto_defaults.rho_prime).minus(1))).toString());
		},

		sortNumber: function (a, b) {
			return a.abs().minus(b.abs()).toString();
		},

		getD: function (p) {
			var q = bigInt.randBetween(0, bigInt(2).pow(this.crypto_defaults.gamma).over(p));
			var r = bigInt.randBetween(bigInt(2).pow(this.crypto_defaults.rho).times(-1).plus(1), bigInt(2).pow(this.crypto_defaults.rho).minus(1));
			var x = p.times(q).plus(r);
			return x;
		},

		getRem: function (a, b) {
		    var q = parseInt(Math.round(a / b));
		    return bigInt(a - q * b);
		},

		genSecret: function () { 
			return bigInt.randBetween(bigInt(2).pow(this.crypto_defaults.nu.minus(2)), bigInt(2).pow(this.crypto_defaults.nu.minus(1))).times(2).plus(1);
		},

		// This, of all sections, needs work!
		genPublic: function (secret) {
			while (true) {
				var xi = [];

				// Populate xi with values
				for (var i = 0; i <= this.crypto_defaults.tau.valueOf(); i++) {
					xi.push(this.getD(secret));
				}

				// Order xi in increasing order, then reverse
				xi.sort(this.sortNumber).reverse();
				var max_x = bigInt(xi[0]);
				var max_i = bigInt(0);

				for (i = 0; i < xi.length; i++) {
			        var x = xi[i];
			        if (x.gt(max_x)) {
			            max_x = x;
			            max_i = i;
			        }
				}

				xi[0] = xi[max_i];
				xi[max_i] = xi[0];

				// This is really weird but sometimes the key values aren't big enough, so I'm leaving this
				// in temporarily :)
				// Never write code like this, ever!
				// (You didn't see this)
				if (xi[0] < 5) continue; // 5 is just an arbitrary number I picked... because it worked

				// The first value of the public key must be odd
				if (xi[0].mod(2).valueOf() === 0) continue;

				// First value of public key % secret key must be even
			    if (this.getRem(xi[0].valueOf(), secret.valueOf()).mod(2).valueOf() === 1) continue;

			    if (xi[0].mod(secret).valueOf() === 0) continue;
				break;
			}
			
			return xi;
		},

		genKeyPair: function () {
			var secret = this.genSecret();
			var public = this.genPublic(secret);

			return {
				secret: secret,
				public: public
			};
		},

		encryptBit: function (public, message) {
			message = bigInt(message);
		    // random subset
		    var subset = [];
		    for (var a = 0; a < this.crypto_defaults.tau.plus(1).valueOf(); a++) {
		    	if (Math.random() >= 0.5) {
		    		subset.push(a);
		    	}
		    }

		    var sum = bigInt(0);
		    for (var i in subset) {
		    	sum = sum.add(public[subset[i]]);
		    }
		    
		   	var random = bigInt.randBetween(bigInt(2).pow(this.crypto_defaults.rho_prime).times(-1).plus(1), bigInt(2).pow(this.crypto_defaults.rho_prime).minus(1));
		    var c = message.plus(bigInt(2).times(random)).plus(bigInt(2).times(sum));
		    c = this.getRem(c, public[0]);

		    return c;
		},

		decryptBit: function (private, ciphertext) {
		    return this.mod(this.getRem(ciphertext, private), 2);
		},

		// This is a third party modulo function because of the weird way JavaScript handles negative mods
		// Thanks to Shanimal on StackOverflow
		// Original URL: http://stackoverflow.com/a/13163436/1780656
		mod: function (n, m) {
		    var remain = n % m;
		    return Math.floor(remain >= 0 ? remain : remain + m);
		},

		runTest: function () {
			var secret = this.genSecret();
			var public = this.genPublic(secret);

			// Generate a random bit (0 or 1)
			var message = Math.round(Math.random());

			var ciphertext = this.encryptBit(public, message);
			var decrypted = this.decryptBit(secret, ciphertext);

			return message === decrypted;
		}
	};

	return qcrypt_functions;
}

module.exports = qcrypt_fhe;