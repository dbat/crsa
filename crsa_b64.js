'use strict';
var _B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function encB64(S) {
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
};

function decB64(E) {
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
}; 
