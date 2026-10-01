/* move.js — 멤버 · 목요일 동선 */
(function () {
  var T = window.TRIP, J = window.J, e = J.esc;
  J.$('#members').innerHTML = T.members.map(function (m) {
    return '<li><span class="av ' + m.cls + '">' + m.k + '</span><div><b>' + e(m.name) + '</b><span class="r">' + e(m.role) + '</span></div></li>';
  }).join('');
  function tl(box, cls, k, title, sub, rows) {
    J.$(box).innerHTML = '<div class="card-h"><span class="av sm ' + cls + '">' + k + '</span><div><b>' + title + '</b><span class="r">' + sub + '</span></div></div>' +
      '<ol class="tl">' + rows.map(function (r) {
        return '<li><span class="t">' + e(r[0]) + '</span><p>' + e(r[1]) + (r[2] ? '<small>' + e(r[2]) + '</small>' : '') + '</p></li>';
      }).join('') + '</ol>';
  }
  tl('#moveA', 'ba', '🕊️', '투싼 · 여찬', '대전 출장 후 바로 진안 · 먼저 도착', T.moveA);
  tl('#moveB', 'bb', '🍊', '창섭 차 · 창섭 + 유은 + 양수빈', '동탄 장보기 → 대전역에서 양수빈 픽업', T.moveB);
})();
