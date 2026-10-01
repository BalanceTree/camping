/* prep.js — 출발 전 확인 (4명 공유) · 규칙 · 보관 */
(function () {
  var T = window.TRIP, J = window.J, e = J.esc;
  J.renderChecklist(J.$('#list'), [T.prep], {
    onCount: function (on, all) {
      J.$('#pcount').textContent = on + ' / ' + all;
      J.$('#pbar').style.width = (all ? on / all * 100 : 0) + '%';
    },
  });
  J.checks.onChange(function (s, status) {
    var l = J.syncLabel(status), el = J.$('#sync');
    el.className = 'sync ' + l[0]; el.querySelector('span').textContent = l[1];
  });
  J.checks.start();
  function kv(box, rows) {
    J.$(box).innerHTML = rows.map(function (r) {
      return '<div><span>' + e(r[0]) + '</span><b>' + e(r[1]) + (r[2] ? '<small>' + e(r[2]) + '</small>' : '') + '</b></div>';
    }).join('');
  }
  kv('#storage', T.storage);
})();
