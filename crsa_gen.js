"use strict";
/*
 * Copyright 2003-2015 Adrian H, Ray AF and Raisa NF
 * Private property of PT SOFTINDO Jakarta
 * All right reserved
 */

var Primes = [];
function eraSieve(max) {
  var D = [], primes = [];
  for (var q = 2; q < max; q++) {
    if (D[q]) {
      for (var i = 0; i < D[q].length; i++) {
         var p = D[q][i];
         if (D[p + q]) D[p + q].push(p);
         else D[p + q] = [p];
      }
      delete D[q];
    }
    else {
      primes.push(q);
      if (q * q < max) D[q * q] = [q];
    }
  }
  return primes;
}

function _binSeek(A, val, i, j) {
  if (i > j) return -i;
  // i negative denotes error-found
  // abs(i) may still be used for near like search
  var k = (i + j) >> 1;
  var a = A[k];
  if (a > val) return _binSeek(A, val, i, k - 1);
  else if (a < val) return _binSeek(A, val, k + 1, j);
  else return k;
}

function quickIndex(A, val) { return _binSeek(A, val, 0, A.length); }

function nearestIndex(A, val, scanDown) {
  var i = quickIndex(A, val);
  if (i >= 0) return i;
  i = -i;

  if (typeof scanDown === 'undefined') scanDown = true;
  var n = A.length-1;
  if (i > n) i = n;
  if (scanDown)
    while (i >= 0 && A[i] > val) i--;
  else
    while (i <= n && A[i] < val) i++;
  return i > n ? -i : i;
}

function _leastx(n){
  if (isNaN(n) || !isFinite(n)) return NaN;
  if (n == 0) return 0;
  if (n % 1 || n * n < 2) return 1;
  if (n % 2 == 0) return 2;
  if (n % 3 == 0) return 3;
  if (n % 5 == 0) return 5;
  var m = Math.sqrt(n);
  for (var i=7; i<=m; i+=30) {
    if (n % i == 0) return i;
    if (n % (i + 4) == 0) return i + 4;
    if (n % (i + 6) == 0) return i + 6;
    if (n % (i + 10) == 0) return i + 10;
    if (n % (i + 12) == 0) return i + 12;
    if (n % (i + 16) == 0) return i + 16;
    if (n % (i + 22) == 0) return i + 22;
    if (n % (i + 24) == 0) return i + 24;
  }
  return n;
};

function isPrime(n) {
  if (isNaN(n) || !isFinite(n) || n % 1 || n < 2) return false;
  if (Primes.length && n <= Primes[Primes.length - 1])
    return quickIndex(Primes, n) >= 0;
  if (n == _leastx(n)) return true;
  return false;
}

function _shuffle(A) {
  for (var i = A.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var m = A[i]; A[i] = A[j]; A[j] = temp;
  }
  return A;
}

function _catStr(S, subStr, delim) {
  if (typeof delim === 'undefined' || delim == '') delim =', ';
  if (S != '') S += delim;
  return S + subStr;
}

function _setrStatus(R) {
  var MAXPQ = (1 << 30) - 1;
  function tooBig(val) { return (val > MAXPQ); }
  var S = '';
  R.size = _bsr(R.pq);
  if (!isPrime(R.prime1)) S = _catStr(S, 'p1!prime');
  if (!isPrime(R.prime2)) S = _catStr(S, 'p2!prime');
  if (R.prime1 == R.prime2) S = _catStr(S, 'prime1=prime2');
  if (!isPrime(R.key1)) S = _catStr(S, 'key1!prime');
  //if (!isPrime(R.key2)) S = _catStr(S, 'key2!prime');
  if (tooBig(R.totient)) S = _catStr(S, 'pq>MAX');
  if (tooBig(R.key1)) S = _catStr(S, 'key1>MAX');
  if (tooBig(R.key2)) S = _catStr(S, 'key2>MAX');
  if (_isNeg(R.totient)) S = _catStr(S, 'pq>OVERFLOW');
  if (_isNeg(R.key1)) S = _catStr(S, 'key1>OVERFLOW');
  if (_isNeg(R.key2)) S = _catStr(S, 'key2>OVERFLOW');
  if (R.key1 < 3) S = _catStr(S, 'key1<3');
  if (R.key2 < 3) S = _catStr(S, 'key2<3');
  if (R.key1 >= R.pq) S = _catStr(S, 'key1>pq');
  if (R.key2 >= R.pq) S = _catStr(S, 'key2>pq');
  if (S) R.ERRORS = S;
  return(R);
}

function _isNum(n)  { return typeof n === 'number'; }
function _isInt(n)  { return _isNum(n) && n == parseInt(n); }
function _isBool(n) { return typeof n === 'boolean'; }
function _isNeg(n)  { return n < 0 || n > 0x7fffffff; }

function genrKey1(privKey, bits, validOnly, minLen) {
  var BITS_MIN = 5;
  var BITS_MAX = 16; // becomes 28bits key-length
  var BITS_DEFAULT = BITS_MAX;
  var START_INDEX = 3; // valid start from Primes[3] = 7

  if (Primes.length < 1) Primes = eraSieve(1 << BITS_MAX);

  bits = _isInt(bits) && (bits >= BITS_MIN) && (bits <= BITS_MAX) ? bits : BITS_DEFAULT;
  var x = bits - BITS_MIN;

  if (!_isInt(privKey) || privKey < 1) privKey = false;

  var k = START_INDEX + x * x; // 3,4,5,12,19,28,39,52,67,84,103,124
  var N = nearestIndex(Primes, 1 << bits) - k;

  var bitl_one_and_half = bits * 7 >> 2; // * 3 >> 1; // one-and-half of bits-wide
  var bitl_mask = (1 << bitl_one_and_half) - 1;
  minLen = _isInt(minLen) ? (1 << (minLen & 0x1f)) - 1 : bitl_mask;
  if (minLen < 0 || minLen > bitl_mask) minLen = bitl_mask;
  // no longer constraint: if (minLen > _MAXINT53_SQR_) minLen = _MAXINT53_SQR_;

  validOnly = _isBool(validOnly) ? validOnly : true;
  var p, q, pq, e, m, d; ctr = 0;
  var PQMAX = (1 << 30) - 1; // | 1 << 28;
  do {
    do {
      if (ctr++ > 1000) return; // to many tries!
      p = Primes[parseInt(Math.random() * N + k)];
      q = Primes[parseInt(Math.random() * N + k)];
      pq = p * q;
      m = (p - 1) * (q - 1);
    } while (validOnly && (m < minLen || pq > PQMAX || pq < 0 || p == q));

    if (!e)
      e = privKey ? privKey : Primes[parseInt(Math.random() * N + k)];

    d = modInverse(e, m);

  } while (validOnly && (!d || d == e || _isNeg(d) || _isNeg(e)));
  var R = {prime1: p, prime2: q, pq: pq, totient: m, key2: d, key1: e};
  return _setrStatus(R);
}

function makeKey2(p, q, e) {
  var pq = p * q;
  var m = (p - 1) * (q - 1);
  var d = modInverse(e, m);
  var R = {prime1: p, prime2: q, pq: pq, totient: m, key2: d, key1: e};
  return _setrStatus(R);
}

function _isStr(n)   { return typeof n === 'string'; }
function _isNumEx(n) { return (typeof n === 'undefined') && !isNaN(parseFloat(n)) && isFinite(n); }

