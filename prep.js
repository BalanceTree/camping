/* prep.js — 각자 챙길 것 (4명 공유 체크) */
(function () {
  var J = window.J;
  J.renderChecklist(J.$('#list'), window.TRIP.prepGroups(), { key: 'prep',
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
