const crypto = require('crypto');
const { performance } = require('perf_hooks');

/**
 * openssl list -digest-algorithms
 *
 * RSA-MD4 => MD4
 * RSA-MD5 => MD5
 * RSA-MDC2 => MDC2
 * RSA-RIPEMD160 => RIPEMD160
 * RSA-SHA1 => SHA1
 * RSA-SHA1-2 => RSA-SHA1
 * RSA-SHA224 => SHA224
 * RSA-SHA256 => SHA256
 * RSA-SHA3-224 => SHA3-224
 * RSA-SHA3-256 => SHA3-256
 * RSA-SHA3-384 => SHA3-384
 * RSA-SHA3-512 => SHA3-512
 * RSA-SHA384 => SHA384
 * RSA-SHA512 => SHA512
 * RSA-SHA512/224 => SHA512-224
 * RSA-SHA512/256 => SHA512-256
 * RSA-SM3 => SM3
 * BLAKE2b512
 * BLAKE2s256
 * id-rsassa-pkcs1-v1_5-with-sha3-224 => SHA3-224
 * id-rsassa-pkcs1-v1_5-with-sha3-256 => SHA3-256
 * id-rsassa-pkcs1-v1_5-with-sha3-384 => SHA3-384
 * id-rsassa-pkcs1-v1_5-with-sha3-512 => SHA3-512
 * MD4
 * md4WithRSAEncryption => MD4
 * MD5
 * MD5-SHA1
 * md5WithRSAEncryption => MD5
 * MDC2
 * mdc2WithRSA => MDC2
 * ripemd => RIPEMD160
 * RIPEMD160
 * ripemd160WithRSA => RIPEMD160
 * rmd160 => RIPEMD160
 * SHA1
 * sha1WithRSAEncryption => SHA1
 * SHA224
 * sha224WithRSAEncryption => SHA224
 * SHA256
 * sha256WithRSAEncryption => SHA256
 * SHA3-224
 * SHA3-256
 * SHA3-384
 * SHA3-512
 * SHA384
 * sha384WithRSAEncryption => SHA384
 * SHA512
 * SHA512-224
 * sha512-224WithRSAEncryption => SHA512-224
 * SHA512-256
 * sha512-256WithRSAEncryption => SHA512-256
 * sha512WithRSAEncryption => SHA512
 * SHAKE128
 * SHAKE256
 * SM3
 * sm3WithRSAEncryption => SM3
 * ssl3-md5 => MD5
 * ssl3-sha1 => SHA1
 * whirlpool
 */

/** @type {Record<string, import('crypto').Hash>} */
const hash = {};
const methods = ['MD4', 'MD5', 'SHA1', 'SHA256', 'SM3', 'BLAKE2b512', 'BLAKE2s256'];
/** 10MB */
const sourceSize = 2 ** 10 * 2 ** 10 * 10;
const source = Buffer.alloc(sourceSize);
/** ms */
const runTime = 3e3;

for (method of methods) {
  hash[method] = crypto.createHash(method);
}

function getRandomLocation() {
  return Math.floor(Math.random() * sourceSize);
}

function getRandomBytes() {
  return Math.floor(Math.random() * 256);
}

function refreshRandomSource() {
  // crypto.randomFillSync(source);
  source[getRandomLocation()] = getRandomBytes();
}

function main() {
  let timeStart = performance.now();
  let runCount = 0;

  /** 填充性能 */
  while (performance.now() - timeStart < runTime) {
    refreshRandomSource();

    runCount += 1;
  }
  console.log(`refreshRandomSource performance is: ${runCount}/3s`);

  /** 每个hash的性能 */
  for (method of Object.keys(hash)) {
    timeStart = performance.now();
    runCount = 0;

    while (performance.now() - timeStart < runTime) {
      // refreshRandomSource();
      hash[method]
        // Added in: v13.1.0 or v12.16.0
        // it perform better a lot than crypto.createHash
        .copy()
        .update(source)
        .digest();

      runCount += 1;
    }

    console.log(`performance of ${method} is: ${runCount}/3s`);
  }
}

main();

// use crypto random
// refreshRandomSource performance is: 220/3s
// performance of MD4 is: 126/3s
// performance of MD5 is: 116/3s
// performance of SHA1 is: 135/3s
// performance of SHA256 is: 93/3s
// performance of SM3 is: 61/3s
// performance of BLAKE2b512 is: 112/3s
// performance of BLAKE2s256 is: 89/3s

// use math random
// refreshRandomSource performance is: 22898065/3s
// performance of MD4 is: 291/3s
// performance of MD5 is: 246/3s
// performance of SHA1 is: 348/3s
// performance of SHA256 is: 160/3s
// performance of SM3 is: 83/3s
// performance of BLAKE2b512 is: 225/3s
// performance of BLAKE2s256 is: 149/3s

// use none random
// refreshRandomSource performance is: 22622757/3s
// performance of MD4 is: 290/3s
// performance of MD5 is: 246/3s
// performance of SHA1 is: 345/3s
// performance of SHA256 is: 160/3s
// performance of SM3 is: 83/3s
// performance of BLAKE2b512 is: 225/3s
// performance of BLAKE2s256 is: 148/3s
