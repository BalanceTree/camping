/* weather.js — 날씨 페이지 */
(function () {
  var J = window.J, W = window.JW, r = W.r, e = J.esc;
  var btn = J.$('#w-refresh');

  function render(s) {
    var t = new Date(s.at);
    J.$('#w-upd').textContent = t.getHours() + ':' + String(t.getMinutes()).padStart(2, '0') + ' 업데이트 · 모델 ' + s.models + '/' + s.total;
    J.$('#wdays').innerHTML = s.days.map(function (d) {
      if (!d.n) {
        return '<div class="card wday"><div class="wh"><span class="wi">🗓️</span><div><div class="wl">' + d.label + '</div>' +
          '<div class="wt">아직 예보 전</div></div></div><ul class="tips"><li>보통 출발 7~10일 전부터 예보가 잡혀요</li></ul></div>';
      }
      var rng = function (a) { return a ? r(a[0]) + '~' + r(a[1]) + '℃' : '–'; };
      return '<div class="card wday">' +
        '<div class="wh"><span class="wi">' + d.icon + '</span><div><div class="wl">' + d.label + '</div><div class="wt">' + e(d.text) + '</div></div>' +
        '<div class="temps"><b>' + r(d.tmax) + '° <em>/ ' + r(d.tmin) + '°</em></b><span>최고 / 최저</span></div></div>' +
        '<div class="wstats">' +
          '<div><span>강수확률</span><b>' + r(d.pop) + '%</b></div>' +
          '<div><span>강수량</span><b>' + (d.mm == null ? '–' : (Math.round(d.mm * 10) / 10)) + 'mm</b></div>' +
          '<div><span>바람</span><b>' + r(d.wind) + 'km/h</b></div>' +
          '<div><span>밤 체감</span><b>' + r(d.feel) + '°</b></div>' +
          '<div><span>최고 범위</span><b>' + rng(d.tmaxR) + '</b></div>' +
          '<div><span>최저 범위</span><b>' + rng(d.tminR) + '</b></div>' +
        '</div>' +
        '<ul class="tips">' + W.tips(d).map(function (x) { return '<li>' + e(x) + '</li>'; }).join('') + '</ul>' +
        '<details class="models"><summary>모델별 예보 ' + d.n + '개 보기</summary><table class="mtable"><tr><th>모델</th><th>최고</th><th>최저</th><th>비</th><th>바람</th></tr>' +
          d.per.map(function (v) {
            return '<tr><td>' + e(v.model) + '</td><td>' + r(v.tmax) + '°</td><td>' + r(v.tmin) + '°</td><td>' + r(v.pop) + '%</td><td>' + r(v.wind) + '</td></tr>';
          }).join('') + '</table></details>' +
      '</div>';
    }).join('');
  }

  function load(force) {
    btn.disabled = true; btn.textContent = '불러오는 중';
    W.load(force).then(function (s) {
      if (!s.models) { J.$('#w-upd').textContent = '예보를 못 불러왔어요 · 잠시 후 새로고침'; }
      render(s);
    }).catch(function () {
      J.$('#w-upd').textContent = '예보를 못 불러왔어요 · 잠시 후 새로고침';
    }).then(function () { btn.disabled = false; btn.textContent = '새로고침'; });
  }
  var c = W.cached(); if (c) render(c);
  btn.addEventListener('click', function () { load(true); });
  load(false);
})();
