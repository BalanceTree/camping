/* rules.js — 캠핑장 안내 (처음 오는 사람 기준) */
(function () {
  var S = window.TRIP.site, J = window.J, e = J.esc;
  J.$('#s-name').textContent = S.name;
  J.$('#s-spot').textContent = S.spot;
  J.$('#s-addr').textContent = S.addr;
  J.$('#s-tel').href = 'tel:' + S.tel.replace(/-/g, '');
  J.$('#s-map').href = 'https://map.kakao.com/link/search/' + encodeURIComponent(S.name);
  J.$('#s-guide').innerHTML = S.guide.map(function (g) {
    return '<h2 class="sec">' + e(g.t) + (g.s ? ' <em>' + e(g.s) + '</em>' : '') + '</h2><div class="card kv">' +
      g.rows.map(function (r) {
        return '<div><span>' + e(r[0]) + '</span><b>' + e(r[1]) + (r[2] ? '<small>' + e(r[2]) + '</small>' : '') + '</b></div>';
      }).join('') + '</div>';
  }).join('');
  J.$('#s-src').innerHTML = '시설 정보 · ' + S.src.map(function (s) { return '<a href="' + e(s[1]) + '" target="_blank" rel="noopener">' + e(s[0]) + '</a>'; }).join(' · ');
})();
