"use strict";
/*
 * Copyright 2003-2015 Adrian H, Ray AF and Raisa NF
 * Private property of PT SOFTINDO Jakarta
 * All right reserved
 */

function _decrypt30(key2, mod, str) {
  var crc = 1, n = str.length;
  if (n % 4) return 'ERROR!'; // should be 4bytes fold
  var x30, y32, cx, cy, Sp = [];
  for(var i = 0; i < n; i += 4) {
    y32 = 0;
    for (k = 0; k <= 3; k++)
      y32 |= (str.charCodeAt(i + k) << (k * 8));
    x30 = y32;

    y32 ^= modExp(++crc, SAMPLE_PUBKEY, mod);
    x30 = modExp(y32, key2, mod);
    //x30 &= 0x3fffffff; // clean-up hi bits

    var kk;
    switch ((i >> 2) & 3) {
      case 0: kk = 6;
          cx = (x30 & 0x3f) << 2;
        break;
      case 1: kk = 4;
          cy = cx | (x30 & (0x03 << 28)) >> 28;
          cx = (x30 & 0x0f) << 4;
          Sp.push(cy);
        break;
      case 2: kk = 2;
          cy = cx | (x30 & (0x0f << 26)) >> 26;
          cx = (x30 & 0x03) << 6;
          Sp.push(cy);
        break;
      case 3: kk = 0;
          cy = cx | (x30 & (0x3f << 24)) >> 24;
          Sp.push(cy);
        break;
    }
    for (var k = 2 * 8 + kk; k >= 0; k -= 8)
      Sp.push((x30 >> k) & 255);
  }

  var L = Sp.length;
  if (L % (15 * 4)) {
    var j = (L % 15);
    var k = Sp[L - 1];
    for (var i = 0; i < j - k; i++)
      { Sp.pop(); L--; }
  }

  var S = [];
  for (var i = 0; i < L; i++)
    S[i] = String.fromCharCode(Sp[i]);

  return S.join('');
}

function _encrypt30(key1, mod, str) {
  var cr = 1, n = str.length;
  var Ep = [], cc = [];
  var xA = 0x100000000;
  var xB = 0x001000000;

  function enc(x30) {
    var y32 = x30;

    y32 = modExp(x30, key1, mod);
    y32 ^= modExp(++cr, SAMPLE_PUBKEY, mod);

    for (var k = 0; k < 4 * 8; k += 8)
      Ep.push((y32 >> k) & 255);

    // take care for a signed most-significant-byte
    if (y32 < 0)
      Ep[Ep.length - 1] = parseInt((y32 + xA) / xB)
  }
  function cblock1(c0, c1, c2, c3)
    { return c0 << 22 | c1 << 14 | c2 << 6 | c3 >> 2; }

  function cblock2(c3, c4, c5, c6, c7)
    { return (c3 & 0x03) << 28 | c4 << 20 | c5 << 12 | c6 << 4 | c7 >> 4; }

  function cblock3(c7, c8, c9, c10, c11)
    { return (c7 & 0x0f ) << 26 | c8 << 18 | c9 << 10 | c10 << 2 | c11 >> 6; }

  function cblock4(c11, c12, c13, c14)
    { return (c11 & 0x3f) << 24 | c12 << 16 | c13 << 8  | c14  }

  for (var i = 0; i <= n - 15; i += 15) {
    for (var j = 0; j < 15; j++)
      cc[j] = str.charCodeAt(i + j) & 0xff;
    var w1 = cblock1(cc[0], cc[1], cc[2], cc[3]);
    var w2 = cblock2(cc[3], cc[4], cc[5], cc[6], cc[7]);
    var w3 = cblock3(cc[7], cc[8], cc[9], cc[10], cc[11]);
    var w4 = cblock4(cc[11], cc[12], cc[13], cc[14]);
    enc(w1); enc(w2); enc(w3); enc(w4);
  }

  var m = (n % 15);
  if (m) {
    cc = [m,m,m,m,m,m,m,m,m,m,m,m,m,m,m];
    for (var i = 0; i < m; i++)
      cc[i] = str.charCodeAt(n - m + i) & 0xff;
    var w1 = cblock1(cc[0], cc[1], cc[2], cc[3]);
    var w2 = cblock2(cc[3], cc[4], cc[5], cc[6], cc[7]);
    var w3 = cblock3(cc[7], cc[8], cc[9], cc[10], cc[11]);
    var w4 = cblock4(cc[11], cc[12], cc[13], cc[14]);
    enc(w1);
    if (m >= 3) enc(w2);
    if (m >= 7) enc(w3);
    if (m >= 11) enc(w4);
  }

  var E = [];
  for (var i = 0; i < Ep.length; i++)
    E[i] = String.fromCharCode(Ep[i]);

  return E.join('');
}
