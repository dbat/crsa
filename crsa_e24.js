"use strict";
/*
 * Copyright 2003-2015 Adrian H, Ray AF and Raisa NF
 * Private property of PT SOFTINDO Jakarta
 * All right reserved
 */

function _encrypt24(key1, mod, str) {
  var Ep = [];
  var crc, n = str.length;

  function do_conversion(x0, x1, x2) {
    var y32, x24 = (x0 << 16) | (x1 << 8) | x2;
    y32 = modExp(x24, key1, mod);
    y32 ^= modExp(++crc, SAMPLE_PUBKEY, mod);

    //msb may be signed, leave MSB alone
    for (var k = 0; k < 3 * 8; k += 8)
      Ep.push((y32 >> k) & 255);

    if (y32 < 0) y32 += 0x100000000;
    Ep.push(parseInt(y32 / 0x1000000));;
  }

  if (n >= 3)
    for(var i = 0; i < n - 2; i += 3)
      do_conversion(str.charCodeAt(i),
        str.charCodeAt(i + 1), str.charCodeAt(i + 2));

  var m = n % 3;
  if (m)
    do_conversion(str.charCodeAt(n - m),
      m > 1 ? str.charCodeAt(n - m + 1) : m, m);

  var E = [];
  for (var i = 0; i < Ep.length; i++)
    E[i] = String.fromCharCode(Ep[i]);

  return E.join('');
}

function _decrypt24(key2, mod, str) {
  var crc, n = str.length;
  // try to recover last zero truncated str
  // if (n % 4 == 3) { str += '\x00'; n++; }
  // should be 4bytes fold
  if (n % 4) return;
  var x24, y32, Sp = [];
  for(var i = 0; i < n; i += 4) {
    y32 = 0;
    for (k = 0; k <= 3; k++)
      y32 |= (str.charCodeAt(i + k) << (k * 8));

    y32 ^= modExp(++crc, SAMPLE_PUBKEY, mod);
    x24 = modExp(y32, key2, mod);

    // the MSB should be 0 for 24 bit enc!
    // but might be changed later for longer bits-wide
    if (x24 < 0 || x24 >= 1 << 24) return;
    for (var k = 2 * 8; k >= 0; k -= 8)
      Sp.push((x24 >> k) & 255);
  }

  var L = Sp.length;
  if (L % (3 * 4)) {
    var j = (L % 3);
    var k = Sp[L - 1];
    for (var i = 0; i < j - k; i++)
      { Sp.pop(); L--; }
  }

  var S  = [];
  for (var i = 0; i < L; i++)
    S[i] = String.fromCharCode(Sp[i]);

  return S.join('');
}
