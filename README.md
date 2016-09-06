/*
 * Copyright 2003-2015 Adrian H, Ray AF and Raisa NF
 * Private property of PT SOFTINDO Jakarta
 * All right reserved
 *
 */


This is a micro implementation of asymmetric encryption with public
and private key pair with JavaScript. For educational purpose only,
not in any least sense tries to be used as a security device.

NOTES:
Javascript native integer capacity is 53 bits wide.
Maximum key-length produced would be half of that (26 bits)
(Under such a small key-length private/public key pairs are very
easy to be found out, security is pretty much negligible).

Update: 2015.01.01
  no longer a restriction, using custom 64/32 bit assembly emulator.

Quick hints:
  1. Pick any two prime numbers: p and q
  2. Get modulus by multplying those primes: M = p * q
  3. Get quotient by multplying those primes: T = (p-1) * (q-1)
  4. Pick any private/public key:  key1
  5. Compute public/private key with modular inverse against T: key2
  6. Done.
  Any value encrypted with key1 could then be decrypted by key2 (and
  vice-versa). Encryption/decryption is accomplished using modular
  exponentation with key1/key2 as exponent and M as modulus.

Main functions:
 - modInverse / modInverseTable
   Get modular Inverse from given coprime dan totient, modInverse
   function simply a wrapper which calls modInverseTable to
   take and sanitize proper result, 0 return indicates error.

 - modExp
   Get modular exponentation from given base, exponent and modulus,
   incorrect result will be produced if modulus value larger
   than javascript's max integer operation (2^26.5).

   On modular exponent function (modExp), the base_value keep being
   multiplied (and moduled afterwise) by modulus_value. As a rule
   of thumb, modulus_value should be lower than square-root of the
   53 bit MAXINT value. Actually, the modulus_value is taken from
   multiplication of prime1-1 and prime2-1 pair, thus total prime1
   + prime2 bits-wide should be lower than 26.

   Modulus in modExp also acts as max valid value for en/decryption
   purpose. This implementation capable to carry (en/decrypts)
   24 bit information (in generic 32 bit integer) at one operation.

   Update: 2015.01.02
     _modExp2 uses _mul64 and _mod64by32, capable to process full
     32 bit modulo by its 64 bit internal processing, when limit
     53 bit reached, those functions taken control albeit with
     (supposedly) slower bit-shift mechanism. Just notice that
     to avoid confusion on output, while not absolute necessary,
     the modulo/totient/keys should still better be a javascript's
     31 bit positive integer, max. 0x7fffffff (2147483647),

 - genrKey (auto), makeKey (custom)
   Note:
     This is a server/provider function, should not be distributed
     with client, clients/consumers do not need it.

   Generate object contains: prime1 (p), prime2 (q), modulus (pq),
   totient, and key1/key2 pair of public and private key. Does not
   really matters which one is, for light client processing, you
   can just pick the shorter auto generated key1 as public and the
   longer key2 for private; or the other way around: manually enter
   your private key1 (since theoretically, the private key should
   better also be prime to prevent easy factoring).
   If there are any dubious value produced, simple errors or warnings
   will be catched and stored ERRORS property.

   Custom p, q and key1 should be provided using makeKey, whereas
   with genrKey you may specify arguments (all optionals): private
   key, bits-proc, validOnly and minimum modulus value.

   Bits-proc and minLen value concerned with how much information
   can be en/decrypted in one single operation, the key-length
   produced may vary between bits-proc to bits-proc * 2. For instance,
   with max. 16 bits-proc preprocessor, the 25-26 bits key-length
   produced can handle 24b its or 3 bytes data. minLen value will be
   adjusted according to this bits-proc argument.
   (this is a bit cumbersome, just leave them default and you good to go)

   Update: 2015.01.02
     MinLen extended to 7/4 or 28 bit for 16 bits-proc

   validOnly argument checks the correctness of result, if it is set
   to false, the produced object may contain any arbitrary values
   which may not make sense such as prime1 equal with prime2.

 - encrypt24/decrypt24, sample encrypt/decrypt implementation
   May be used only for 16 bit prepocessor of genrKey (28 bit load),
   or use custom makeKey to set modulus (or pq) for wider key-length.
   encrypt24 function will always make 4bytes fold result, since this
   is a binary data, all bytes are significant. Some careless base64
   encoder/decoder we have tried, known to be failed (you might better
   use function _hex/_entoCharCodes and _charCodestoEn/Hex helper
   provided here which are 8 bit safe).
   This function accepts only array of bytes (this may held true as
   with any other low level routines), if you speaks some exotic
   multibyte characters, you have to prepare it yourself and convert
   (coded/decoded) them forth and back into string/array of bytes.

   Update: 2015.01.02
     encrypt28/decrypt28 stores 28 bit information, MinLen widen
     to 7/4 part of prepocessor bits-proc. Fixed str length problem.

   Update: 2015.01.03
     encrypt30/decrypt30 stores 30 bit information, the keys MUST be
     chosen manually by makeKey or turn validity off, and make sure
     it covers 30 bits wide. It needs much more computational
     resources (upon encrypt/decrypt) with only a slight benefit
     (only 2 bits wider) compared to 28 bit version.
