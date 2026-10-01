/* food.js — 식단 */
(function () {
  var T = window.TRIP, J = window.J, e = J.esc;
  var k = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  var today = k.getFullYear() + '-' + String(k.getMonth() + 1).padStart(2, '0') + '-' + String(k.getDate()).padStart(2, '0');
  J.$('#days').innerHTML = T.meals.map(function (day) {
    return '<section class="card day" id="d-' + day.date + '"><h2 class="dh"><b>' + day.d + '</b><span>' + e(day.sub) + '</span>' +
      (day.date === today ? '<span class="today">오늘</span>' : '') + '</h2>' +
      day.rows.map(function (r) {
        return '<div class="meal"><span class="slot">' + r[0] + '</span><div><p class="dish' + (r[2] ? '' : ' muted') + '">' + e(r[1]) + '</p>' +
          (r[2] ? '<p class="amt">' + e(r[2]) + '</p>' : '') +
          (r[3].length ? '<div class="chips">' + r[3].map(function (c) { return '<span class="chip ' + c[0] + '">' + e(c[1]) + '</span>'; }).join('') + '</div>' : '') +
          '</div></div>';
      }).join('') + (day.warn ? '<p class="warn">' + e(day.warn) + '</p>' : '') + '</section>';
  }).join('');
  var t = document.getElementById('d-' + today);
  if (t) t.scrollIntoView({ block: 'start' });
})();
