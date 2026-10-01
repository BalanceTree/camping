/* rules.js — 캠핑장 정보 · 이용 규칙 */
(function () {
  var S = window.TRIP.site, J = window.J, e = J.esc;
  J.$('#s-name').textContent = S.name + ' · ' + S.spot;
  J.$('#s-addr').textContent = S.addr + ' · ' + S.tel;
  J.$('#s-tel').href = 'tel:' + S.tel.replace(/-/g, '');
  J.$('#s-map').href = 'https://map.kakao.com/link/search/' + encodeURIComponent(S.name);
  function kv(box, rows) {
    J.$(box).innerHTML = rows.map(function (r) {
      return '<div><span>' + e(r[0]) + '</span><b>' + e(r[1]) + (r[2] ? '<small>' + e(r[2]) + '</small>' : '') + '</b></div>';
    }).join('');
  }
  kv('#s-facts', S.facts); kv('#s-rules', S.rules);
  J.$('#s-src').innerHTML = '출처 · ' + S.src.map(function (s) { return '<a href="' + e(s[1]) + '" target="_blank" rel="noopener">' + e(s[0]) + '</a>'; }).join(' · ') +
    '<br>세부 규칙은 공개된 자료가 없어 공공 캠핑장 공통 기준으로 적었어요.';
})();
