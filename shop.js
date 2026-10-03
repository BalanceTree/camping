/* shop.js — 장보기 체크 (4명 공유) */
(function () {
  var J = window.J;
  J.renderChecklist(J.$('#list'), window.TRIP.shop, { key: 'shop',
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
})();
