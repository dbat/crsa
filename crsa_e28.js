"use strict";
/*
 * Copyright 2003-2015 Adrian H, Ray AF and Raisa NF
 * Private property of PT SOFTINDO Jakarta
 * All right reserved
 */

function _decrypt28(key2, mod, str) {
  var crc = 1, n = str.length;
  if (n % 4) return 'ERROR!'; // should be 4bytes fold
  var x28, y32, cx, Sp = [];
  for(var i = 0; i < n; i += 4) {
    y32 = 0;
    for (k = 0; k <= 3; k++)
      y32 |= (str.charCodeAt(i + k) << (k * 8));
    //x28 = y32;

    y32 ^= modExp(++crc, SAMPLE_PUBKEY, mod);
    x28 = modExp(y32, key2, mod);

    var kk = 4;
    if ((i >> 2) & 1) {
      kk = 0;
      cx |= (x28 & 0x0f000000) >> 24;
      Sp.push(cx);
    }
    else
      cx = (x28 & 0x0f) << 4;

    for (var k = 2 * 8 + kk; k >= 0; k -= 8)
      Sp.push((x28 >> k) & 255);
  }

  var L = Sp.length;
  if (L % (7 * 4)) {
    var j = (L % 7);
    var k = Sp[L - 1];
    for (var i = 0; i < j - k; i++)
      { Sp.pop(); L--; }
  }

  var S = [];
  for (var i = 0; i < L; i++)
    S[i] = String.fromCharCode(Sp[i]);

  return S.join('');
}

function _encrypt28(key1, mod, str) {
  var cr = 1, n = str.length;
  var Ep = [], cc = [];
  var xA = 0x100000000;
  var xB = 0x001000000;

  function enc(x28) {
    var y32 = x28;

    y32 = modExp(x28, key1, mod);
    y32 ^= modExp(++cr, SAMPLE_PUBKEY, mod);

    for (var k = 0; k < 4 * 8; k += 8)
      Ep.push((y32 >> k) & 255);

    // take care a signed most-significant-byte
    if (y32 < 0)
      Ep[Ep.length - 1] = parseInt((y32 + xA) / xB)
  }

  //function b(c) { return c & 0xff; }
  function cblock1(c0, c1, c2, c3)
    { return c0 << 20 | c1 << 12 | c2 << 4 | c3 >> 4; }

  function cblock2(c3, c4, c5, c6)
    { return (c3 & 0x0f) << 24 | c4 << 16 | c5 << 8 | c6; }

  for (var i = 0; i <= n - 7; i += 7) {
    for (var j = 0; j < 7; j++)
      cc[j] = str.charCodeAt(i + j) & 0xff;
    var w1 = cblock1(cc[0], cc[1], cc[2], cc[3]);
    var w2 = cblock2(cc[3], cc[4], cc[5], cc[6]);
    enc(w1);
    enc(w2);
  }

  var m = (n % 7);
  if (m) {
    cc = [m,m,m,m,m,m,m];
    for (var i = 0; i < m; i++)
      cc[i] = str.charCodeAt(n - m + i) & 0xff;
    var w1 = cblock1(cc[0], cc[1], cc[2], cc[3]);
    var w2 = cblock2(cc[3], cc[4], cc[5], cc[6]);
    enc(w1);
    if (m >= 3)
      enc(w2);
  }

  var E = [];
  for (var i = 0; i < Ep.length; i++)
    E[i] = String.fromCharCode(Ep[i]);

  return E.join('');
}

