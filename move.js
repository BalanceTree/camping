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
  tl('#moveA', 'ba', '🕊️', '투싼 · 여찬', '대전 출장 끝나고 오후에 먼저 진입', T.moveA);
  tl('#moveB', 'bb', '🍊', '창섭 차 · 창섭 + 유은 + 양수빈', '동탄에서 장 보고 양수빈 태워 출발', T.moveB);
})();
