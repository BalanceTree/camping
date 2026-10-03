/* home.js — 대시보드 */
(function () {
  var T = window.TRIP, J = window.J, e = J.esc;
  var START = new Date(T.start), END = new Date(T.end);

  /* D-day · 시계 */
  function hero() {
    var ph = J.phase(), now = new Date();
    if (ph === 'before') {
      var d = J.dday();
      J.$('#dnum').textContent = d > 0 ? 'D-' + d : 'D-DAY';
      J.$('#dlabel').textContent = '10.8 목 17:30 동탄 출발까지';
      var ms = START - now, s = Math.floor(ms / 1000);
      var seg = [[Math.floor(s / 86400), '일'], [Math.floor(s % 86400 / 3600), '시간'], [Math.floor(s % 3600 / 60), '분'], [s % 60, '초']];
      J.$('#clock').innerHTML = seg.map(function (x) { return '<div class="seg"><b>' + String(x[0]).padStart(2, '0') + '</b><span>' + x[1] + '</span></div>'; }).join('');
    } else if (ph === 'during') {
      var day = Math.floor((now - new Date(2026, 9, 8)) / 864e5) + 1;
      J.$('#dnum').textContent = 'DAY ' + Math.min(Math.max(day, 1), 4);
      J.$('#dlabel').textContent = '진안에서 캠핑 중';
      J.$('#clock').innerHTML = '';
    } else {
      J.$('#dnum').textContent = '끝!';
      J.$('#dlabel').textContent = '다들 수고했어요 · 정산 마무리';
      J.$('#clock').innerHTML = '';
    }
  }
  hero(); setInterval(hero, 1000);

  /* 지금 · 다음 일정 */
  function nowTile() {
    var ph = J.phase();
    if (ph === 'during') {
      var p = J.nowPlan();
      J.$('#now-h').textContent = '⏱ 지금';
      if (p) {
        J.$('#now-ic').textContent = p.cur[2];
        J.$('#now-tt').textContent = p.cur[3];
        J.$('#now-lb').textContent = p.cur[0] + ' – ' + p.cur[1] + (p.next ? ' · 다음 ' + p.next[3] : '');
      }
    } else if (ph === 'before') {
      J.$('#now-h').textContent = '🗓️ 다음 일정';
      J.$('#now-ic').textContent = '🛒';
      J.$('#now-lb').textContent = '10.8 목 17:30 · 동탄';
      J.$('#now-tt').textContent = '창섭 + 유은 장보기 → 양수빈 픽업 → 19:10 출발';
    } else {
      J.$('#now-h').textContent = '🏠 일정 끝';
      J.$('#now-ic').textContent = '💰';
      J.$('#now-lb').textContent = '남은 일';
      J.$('#now-tt').textContent = '정산 송금 마무리';
    }
  }
  nowTile(); setInterval(nowTile, 30000);

  /* 다음 끼니 */
  (function () {
    var slotH = { '아침': 8, '점심': 12, '저녁': 18, '야식': 22 };
    var now = new Date(), found = null;
    T.meals.some(function (d) {
      return d.rows.some(function (r) {
        var t = new Date(d.date + 'T' + String(slotH[r[0]] || 12).padStart(2, '0') + ':00:00+09:00');
        if (t > new Date(now - 2 * 36e5) && r[2]) { found = { d: d, r: r }; return true; }
        return false;
      });
    });
    if (!found) { J.$('#meal-tile').hidden = true; return; }
    J.$('#meal-lb').textContent = found.d.d + ' ' + found.r[0] + ' · ' + found.d.sub;
    J.$('#meal-tt').textContent = found.r[1];
    J.$('#meal-sub').textContent = found.r[2].replace(/\n/g, ' · ');
  })();

  /* 체크 진행률 */
  function pct(prefix, groups) {
    var c = J.countChecks(groups), p = c.all ? Math.round(c.on / c.all * 100) : 0;
    J.$('#' + prefix + '-pct').textContent = p + '%';
    J.$('#' + prefix + '-sub').textContent = c.on + ' / ' + c.all + ' 완료';
    J.$('#' + prefix + '-bar').style.width = p + '%';
  }
  J.checks.onChange(function () { pct('shop', T.shop); pct('prep', T.prepGroups()); });
  J.checks.start();

  /* 정산 합계 */
  if (J.sb) {
    J.sb.from('jinan_expenses').select('amount').then(function (res) {
      if (res.error || !res.data) return;
      var sum = res.data.reduce(function (a, x) { return a + (+x.amount || 0); }, 0);
      J.$('#money-total').textContent = J.won(sum);
      if (res.data.length) J.$('#money-sub').textContent = res.data.length + '건 · 1인 ' + J.won(sum / 4);
    });
  }

  /* 날씨 미니 */
  function wmini(s) {
    J.$('#wmini').innerHTML = s.days.map(function (d) {
      var r = window.JW.r;
      return '<div class="d"><div class="dd">' + d.label.split(' ')[0] + ' ' + d.label.split(' ')[1] + '</div><div class="ic">' + (d.n ? d.icon : '🗓️') + '</div>' +
        (d.n ? '<div class="tp">' + r(d.tmax) + '° <em>' + r(d.tmin) + '°</em></div><div class="pp">☔ ' + r(d.pop) + '%</div>'
             : '<div class="pp" style="color:var(--muted)">예보 전</div>') + '</div>';
    }).join('');
  }
  var c = window.JW.cached(); if (c) wmini(c);
  window.JW.load(false).then(function (s) { if (s.models) wmini(s); else if (!c) J.$('#wmini').innerHTML = '<div class="sub">예보를 못 불러왔어요</div>'; })
    .catch(function () { if (!c) J.$('#wmini').innerHTML = '<div class="sub">예보를 못 불러왔어요</div>'; });
})();
