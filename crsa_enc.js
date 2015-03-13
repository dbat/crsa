"use strict";
/*
 * Copyright 2003-2015 Adrian H, Ray AF and Raisa NF
 * Private property of PT SOFTINDO Jakarta
 * All right reserved
 */

var SAMPLE_PUBKEY = 19699;
var _B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function encrypt(key1, mod, str) {
  //var str = _encrypt24(key1, mod, str);
  //var str = _encrypt28(key1, mod, str);
  //var str = _encrypt30(key1, mod, str);
  //return str;
  var S = [];
  for (var i = str.length - 1; i >= 0; i--) S.push(str[i]);
  //return _encrypt24(key1, mod, S.join(''));
  return _encrypt28(key1, mod, S.join(''));
  //return _encrypt30(key1, mod, S.join(''));
}

function decrypt(key2, mod, str) {
  //var d = _decrypt24(key2, mod, str);
  var d = _decrypt28(key2, mod, str);
  //var d = _decrypt30(key2, mod, str);
  //return d; // normal (forward)

  var S = [];
  for (var i = d.length - 1; i >= 0; i--) S.push(d[i]);
  return S.join('');
}

function _entoHex(EncryptedStr) {
  var HexStr = [], en = EncryptedStr;
  for (var i = 0; i < en.length; i ++)
    HexStr[i] = '0'.substr(0, en.charCodeAt(i) < 16) + en.charCodeAt(i).toString(16);
  return HexStr.join('');
}

function _hextoEn(HexStr) {
  if (!HexStr) return HexStr;
  var Hexs = HexStr.match(/../g);
  // eval is dangerous, it differs only one vowel with evil.
  return eval('\x27\\x' + Hexs.join('\\x') + '\x27');
}

function _entoCharCodes(EncryptedStr) {
  var List = [];
  for (var i = 0; i < EncryptedStr.length; i ++)
    List[i] = EncryptedStr.charCodeAt(i);
  return List.join(', ');
}

function _charCodestoEn(List) {
  var L = List.split(',');
  var EncryptedStr = [];
  for (var i = 0; i < L.length; i ++)
    EncryptedStr[i] = String.fromCharCode(parseInt(L[i]));
  return EncryptedStr.join('');
}

function eBase64(S) {
  var c1, c2, c3;
  var e1, e2, e3, e4;
  var i = 0, E = "";
  while (i < S.length) {
    c1 = S.charCodeAt(i++);
    c2 = S.charCodeAt(i++);
    c3 = S.charCodeAt(i++);
    e1 = c1 >> 2;
    e2 = ((c1 & 3) << 4) | (c2 >> 4);
    e3 = ((c2 & 15) << 2) | (c3 >> 6);
    e4 = c3 & 63;
    if (isNaN(c2)) e3 = e4 = 64;
    else if (isNaN(c3)) e4 = 64;
    E += (_B64.charAt(e1) + _B64.charAt(e2)
      + _B64.charAt(e3) + _B64.charAt(e4));
  }
  return E;
}

function dBase64(E) {
  var c1, c2, c3;
  var e1, e2, e3, e4;
  var i = 0, S = "";
  while (i < E.length) {
    e1 = _B64.indexOf(E.charAt(i++));
    e2 = _B64.indexOf(E.charAt(i++));
    e3 = _B64.indexOf(E.charAt(i++));
    e4 = _B64.indexOf(E.charAt(i++));
    c1 = (e1 << 2) | (e2 >> 4);
    c2 = ((e2 & 0x0f) << 4) | (e3 >> 2);
    c3 = ((e3 & 0x03) << 6) | e4;
    S = S + String.fromCharCode(c1);
    if (e3 != 64) S += String.fromCharCode(c2);
    if (e4 != 64) S += String.fromCharCode(c3);
  }
  return S;
} 

/*
 *
 * var _MyPKTest1_ = {"prime1":36793,"prime2":48353,"pq":1779051929,"totient":1778966784,"key2":570492079, "key1":33871}
 * var _SECRET_1_ = 'My Secret!1234';
 * var _SECRET_2_ = '\x60\x9b\x8b\x0c\xe4\x8a\xc9\x20\x3f\xf2\x4d\x23\x4e\x6a\x8a\x02';
 *
 * function _entoHexx(S) {
 *   var E = [];
 *   for (var i = 0; i < S.length; i ++)
 *     E[i] = '0'.substr(0, S.charCodeAt(i) < 16) + S.charCodeAt(i).toString(16);
 *   return '\\x' + E.join('\\x');
 * }
 *
 * function encTest1(S) {
 *   if(!S) S = _SECRET_1_;
 *   var R = _MyPKTest1_;
 *   var mod = R.pq;
 *   var key1 = R.key1;
 *   var E = encrypt28(key1, mod, S);
 *   return E;
 * }
 *
 * function decTest1(E) {
 *   if(!E) E = eval('\x27' + _SECRET_2_ + '\x27');
 *   var R = _MyPKTest1_;
 *   var mod = R.pq;
 *   var key2 = R.key2;
 *   var S = decrypt28(key2, mod, E);
 *   return S;
 * }
 */
