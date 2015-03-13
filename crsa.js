"use strict";
/*
 * Copyright 2003-2015 Adrian H, Ray AF and Raisa NF
 * Private property of PT SOFTINDO Jakarta
 * All right reserved
 */

function modInverseTable(d, M) {
  var _q, _r;
  var a = M, b = d, A = [];

  A.push({base: a, quot: 0, mod: null});

  for (var i = 1; i < 256; i++) {
    _r = parseInt(a % b);
    _q = parseInt(a / b);

    A.push({base: b, quot: _q});

    if (_r > 1) { a = b; b = _r; }
    else {
      A.push({base: _r, quot: b});
      break;
    } // _r == 0 means ERROR!

  }

  // the rest are no use if r = 0 (error)
  // we use it to ease debugging, no harm nevertheless
  A[1].mod = 1;
  A[2].mod = -A[1].quot;

  var a1, a2;
  for (i = 3; i < A.length; i++) {
    a1 = A[i-1];
    a2 = A[i-2];
    A[i].mod = a2.mod - a1.quot * a1.mod;
  }

// Result is stored in A[last].mod. To sanitize negative value, it should
// be added first to Modulus (M), then mod against M once more last time.
  return(A);
}

function modInverse(d, M) {
  var A = modInverseTable(d, M);
  var a = A[A.length-1];
  if (a.base == 0) return 0; // 'ERR';
  if (a.mod > 0) return a.mod;
  return a.mod + M;
}

  function _bsr(n, calc) {
    if (n < 0 || n > 0x80000000) return calc ? 0x80000000 : 31;
    if (n < 2) return calc ? n : n - 1; // n=zero, will return -1
    for(var r = 2, i = 2; i < 32; i++) {
      r += r;
      if (r > n)
        return calc ? r / 2 : i - 1;
    }
    return calc ? 0x40000000 : 30 ;
  }

  function _mul64(A, B) {
    B &= 0xffffffff;
    if (B < 0) B += 0x100000000;
    var bl = B & 0xFFFF;
    var bh = B >>> 16;

    if (A < 0) A += 0x100000000;
    var q1 = A * bl;
    var q2 = A * bh;

    var q1Hi = parseInt(q1 / 0x100000000);
    var q1Lo = q1 - (q1Hi * 0x100000000);

    var q2Hi = parseInt(q2 / 0x10000);
    var q2Lx = q2 - (q2Hi * 0x10000);
    var q2Lo = q2Lx * 0x10000;

    var d0x = q1Lo + q2Lo;
    var d0carry = d0x >= 0x100000000 ? 1 : 0;

    var d0 = d0carry ? d0x - 0x100000000 : d0x;
    var d1 = q1Hi + q2Hi + d0carry;

    //d0 &= -1; d1 &= -1;
    return {Lo: d0, Hi: d1};
  }

function _modExp2(A, B, mod) {
  function _mod64by32(Q, m) {
    var dx = Q.Hi, ax = Q.Lo;
    var di = 0; // si_NOTUSED = 0,
    var bx = m; // cx_NOTUSED = 0,

    di = dx; dx = ax; ax = 0;
    if (bx < 0) bx += 0x100000000;
    if (di < 0) di += 0x100000000;

    var SHIFT = 32; //_bsr(di);
    var bx2 = parseInt(bx/2);
    while (di < bx2 && di > 0) {
      var dx_neg = dx < 0 || dx > 0x7fffffff;
      di = di << 1 | +dx_neg;
      dx <<= 1;
      SHIFT--;
    }

    while (di >= bx) {
      //var si_carry = (si & 1) << 31;
      var di_carry = (di & 1) << 31;
      var dx_carry = (dx & 1) << 31;
      //si = (si >> 1) & 0x7fffffff;
      di = (di >> 1) & 0x7fffffff;
      dx = (dx >> 1) & 0x7fffffff;
      ax = (ax >> 1) & 0x7fffffff;
      //di |= si_carry;
      dx |= di_carry;
      ax |= dx_carry;
      SHIFT++;
    }

    //var k = _bsr(di);
    for (var iix = 0; iix < SHIFT; iix++) {
      var di_neg = di < 0 || di > 0x7fffffff;
      var dx_neg = dx < 0 || dx > 0x7fffffff;
      var ax_neg = ax < 0 || ax > 0x7fffffff;
      //si = si << 1 | +di_neg;
      di = di << 1 | +dx_neg;
      dx = dx << 1 | +ax_neg;
      ax <<= 1;

      //var di_abs = di < 0 ? di + 0x100000000 : di;
      var di_abs = di;

      if (di < 0)
        di_abs += 0x100000000;
      else if (di_neg)
        di_abs += 0x100000000;

      if (di_abs >= bx) {
        di = di_abs - bx;
        ax |= 1;
      }
    }

    //return di;
    return {q: ax, m: di} // quotient, modulo
  }

  var Q2  = _mul64(A, B);
  var result = _mod64by32(Q2, mod);
  var M = result.m;
  return result.m;
}

function modExp(base, exp, mod) { // atomic en/decrypt
// maximum JavaScript integer
var _MAXINT53_ = 9007199254740991; // 2^53 - 1

// maximum modulus for javascript modular exponentiation
var _MAXINT53_SQR_ = 94906265; // sqrt(_MAXINT53_) // about 26 bits

  if (mod < 0) mod += 0x100000000;
  if (base < 0) base += 0x100000000;
  base %= mod;
  var m = 1;
  while (exp) {
    if (m < 0) m += 0x100000000;
    if (base < 0) base += 0x100000000;
    if (exp & 1)
      //m = m * base > _MAXINT53_ ? _modExp2(m, base, mod) : (m * base) % mod;
      if (m * base < _MAXINT53_)
        m = (m * base) % mod;
      else
        m = _modExp2(m, base, mod);
    exp >>= 1;
    exp &= 0x7fffffff;
    //base = base > _MAXINT53_SQR_ ? _modExp2(base, base, mod) : (base * base) % mod;
    if (base < _MAXINT53_SQR_)
      base = (base * base) % mod;
    else
      base = _modExp2(base, base, mod);
  }
  return m;
}
