/* move.js — 멤버 · 가는 날 · 오는 날 */
(function () {
  var T = window.TRIP, J = window.J, e = J.esc, M = T.members;
  function av(i, size) { var m = M[i]; return '<span class="av ' + (size || '') + ' ' + m.cls + '" title="' + e(m.name) + '">' + m.k + '</span>'; }
  function riders(list) {
    if (!list.length) return '<span class="riders"><span class="solo">혼자</span></span>';
    return '<span class="riders">' + list.map(function (i) { return av(i, 'sm'); }).join('') + '</span>';
  }
  function steps(rows) {
    return '<ol class="tl">' + rows.map(function (r) {
      return '<li><span class="t">' + e(r[0]) + '</span><p>' + e(r[1]) + (r[2] ? '<small>' + e(r[2]) + '</small>' : '') + '</p></li>';
    }).join('') + '</ol>';
  }
  function carHead(c) {
    var names = [M[c.who].name].concat(c.with.map(function (i) { return M[i].name; })).join(' · ');
    return '<div class="car-h">' + av(c.who) + '<div class="who"><b>' + e(M[c.who].name) + '</b><span>' + e(c.note || names) + '</span></div>' + riders(c.with) + '</div>';
  }

  J.$('#members').innerHTML = M.map(function (m, i) {
    return '<li>' + av(i) + '<div><b>' + e(m.name) + '</b><span class="r">' + e(m.role) + '</span></div></li>';
  }).join('');

  J.$('#go-h').innerHTML = e(T.go.title) + ' <em>' + e(T.go.sub) + '</em>';
  J.$('#go').innerHTML = T.go.cars.map(function (c) {
    return '<div class="card car">' + carHead(c) + steps(c.steps) + '</div>';
  }).join('');

  J.$('#back-h').innerHTML = e(T.back.title) + ' <em>' + e(T.back.sub) + '</em>';
  J.$('#back').innerHTML = '<div class="pairs">' + T.back.cars.map(function (c) {
    return '<div class="pair"><div class="lbl2">' + e(M[c.who].name) + ' 운전</div><div class="ppl">' +
      [c.who].concat(c.with).map(function (i) { return av(i, 'xs') + e(M[i].name); }).join(' ') + '</div></div>';
  }).join('') + '</div><div class="card">' + steps(T.back.steps) + '</div>';
})();
