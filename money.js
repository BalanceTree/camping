/* money.js — 정산 (Supabase 공유 · 미설정 시 이 폰에만) */
(function () {
  'use strict';
  var T = window.TRIP, J = window.J, e = J.esc, $ = J.$;
  var M = T.members, CATS = T.categories, ICON = T.catIcon;
  var LS = 'jinan-expenses';
  // 도쿄 때 만든 영수증 분석 워커 재사용 (balancetree.github.io 에서만 허용)
  var RECEIPT_API = 'https://tokyo-receipt.ducks7858.workers.dev';
  var CAT_MAP = { '식비': '장보기', '교통': '기름 · 톨비', '숙박': '야영장', '쇼핑': '장비', '관광': '기타', '항공': '기타', '기타': '기타' };

  var EXP = [], cat = CATS[0], payer = 0, split = [0, 1, 2, 3], receipt = null;
  var shared = !!J.sb;

  function setSync(kind, text) { var el = $('#sync'); el.className = 'sync ' + kind; el.querySelector('span').textContent = text; }

  /* ---------- 데이터 ---------- */
  function load() {
    if (!J.sb) { EXP = J.ls.get(LS, []); setSync('', '이 폰에만 저장'); renderAll(); return Promise.resolve(); }
    return J.sb.from('jinan_expenses').select('*').order('spent_on').order('created_at').then(function (res) {
      if (res.error) {
        shared = false; EXP = J.ls.get(LS, []);
        setSync('err', /does not exist|schema cache/.test(res.error.message) ? '서버에 정산 테이블 없음 · SQL 실행 필요' : '서버 연결 실패 · 이 폰에만 저장');
      } else { EXP = res.data; }
      renderAll();
    });
  }
  function add(row) {
    if (!shared) { row.id = 'l' + Date.now(); EXP.push(row); J.ls.set(LS, EXP); return Promise.resolve(); }
    return J.sb.from('jinan_expenses').insert(row).select().then(function (res) {
      if (res.error) throw new Error(res.error.message);
      if (!EXP.some(function (x) { return x.id === res.data[0].id; })) EXP.push(res.data[0]);
    });
  }
  function del(id) {
    if (!shared) { EXP = EXP.filter(function (x) { return x.id !== id; }); J.ls.set(LS, EXP); renderAll(); return; }
    J.sb.from('jinan_expenses').delete().eq('id', id).then(function (res) {
      if (res.error) { J.toast('삭제 실패'); return; }
      EXP = EXP.filter(function (x) { return x.id !== id; }); renderAll();
    });
  }
  function live() {
    if (!J.sb) return;
    J.sb.channel('jinan-expenses-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jinan_expenses' }, function (p) {
        if (p.eventType === 'INSERT' && !EXP.some(function (x) { return x.id === p.new.id; })) EXP.push(p.new);
        if (p.eventType === 'DELETE') EXP = EXP.filter(function (x) { return x.id !== p.old.id; });
        renderAll();
      })
      .subscribe(function (s) { if (s === 'SUBSCRIBED' && shared) setSync('live', '실시간 공유 중 · 4명 같이 기록'); });
  }

  /* ---------- 그리기 ---------- */
  function picks() {
    $('#m-cat').innerHTML = CATS.map(function (c) { return '<button type="button" data-v="' + e(c) + '"' + (c === cat ? ' class="on"' : '') + '>' + ICON[c] + ' ' + e(c) + '</button>'; }).join('');
    $('#m-payer').innerHTML = M.map(function (m, i) { return '<button type="button" data-v="' + i + '"' + (i === payer ? ' class="on"' : '') + '><span class="av ' + m.cls + '">' + m.k + '</span>' + e(m.name) + '</button>'; }).join('');
    $('#m-split').innerHTML = M.map(function (m, i) { return '<button type="button" data-v="' + i + '"' + (split.indexOf(i) > -1 ? ' class="on"' : '') + '><span class="av ' + m.cls + '">' + m.k + '</span>' + e(m.name) + '</button>'; }).join('');
  }
  function renderAll() {
    var total = EXP.reduce(function (a, x) { return a + (+x.amount); }, 0);
    $('#m-total').textContent = J.won(total);
    $('#m-count').textContent = EXP.length + '건';
    $('#m-avg').textContent = J.won(total / M.length);

    $('#m-list').innerHTML = EXP.length ? EXP.slice().reverse().map(function (x) {
      var who = M[x.payer], sp = (x.split || []).length === M.length ? '4명' : (x.split || []).map(function (i) { return M[i].name; }).join(', ');
      return '<div class="exp">' + (x.receipt ? '<img src="' + x.receipt + '" alt="영수증" data-img>' : '<span class="ci">' + (ICON[x.category] || '💳') + '</span>') +
        '<div><div class="tt">' + e(x.memo || x.category) + '</div><div class="mt">' + e(x.category) + ' · ' + e(who ? who.name : '?') + ' 결제 · ' + e(sp) + ' · ' + e((x.spent_on || '').slice(5).replace('-', '.')) + '</div></div>' +
        '<div class="am">' + J.won(x.amount) + '<button type="button" data-del="' + e(x.id) + '">삭제</button></div></div>';
    }).join('') : '<div class="empty">아직 기록이 없어요</div>';

    var n = M.length, paid = Array(n).fill(0), owe = Array(n).fill(0);
    EXP.forEach(function (x) {
      var sp = (x.split && x.split.length) ? x.split : [0, 1, 2, 3];
      paid[x.payer] += +x.amount;
      sp.forEach(function (i) { owe[i] += x.amount / sp.length; });
    });
    var bal = M.map(function (m, i) { return { m: m, net: paid[i] - owe[i], paid: paid[i], owe: owe[i] }; });
    $('#m-balances').innerHTML = bal.map(function (b) {
      return '<div class="bal"><span class="av ' + b.m.cls + '">' + b.m.k + '</span><div class="grow"><div class="nm">' + e(b.m.name) + '</div>' +
        '<div class="meta">낸 돈 ' + J.won(b.paid) + ' · 부담 ' + J.won(b.owe) + '</div></div>' +
        '<div class="net ' + (b.net >= 0 ? 'plus' : 'minus') + '">' + (b.net >= 0 ? '+' : '') + J.won(b.net) + '</div></div>';
    }).join('');

    var cred = bal.filter(function (b) { return b.net > 0.5; }).map(function (b) { return { m: b.m, net: b.net }; }).sort(function (a, b) { return b.net - a.net; });
    var debt = bal.filter(function (b) { return b.net < -0.5; }).map(function (b) { return { m: b.m, net: b.net }; }).sort(function (a, b) { return a.net - b.net; });
    var tr = [], ci = 0, di = 0;
    while (ci < cred.length && di < debt.length) {
      var give = Math.min(cred[ci].net, -debt[di].net);
      tr.push({ from: debt[di].m, to: cred[ci].m, amt: give });
      cred[ci].net -= give; debt[di].net += give;
      if (cred[ci].net < 0.5) ci++;
      if (debt[di].net > -0.5) di++;
    }
    $('#m-transfers').innerHTML = tr.length ? tr.map(function (t) {
      return '<div class="transfer"><span class="av sm ' + t.from.cls + '">' + t.from.k + '</span>' + e(t.from.name) + ' <span style="opacity:.6">→</span> ' +
        '<span class="av sm ' + t.to.cls + '">' + t.to.k + '</span>' + e(t.to.name) + '<b>' + J.won(Math.round(t.amt / 10) * 10) + '</b></div>';
    }).join('') : '<div class="card empty">보낼 돈이 없어요</div>';
  }

  /* ---------- 영수증 ---------- */
  function compress(file) {
    return new Promise(function (res, rej) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var w = img.width, h = img.height, m = Math.max(w, h), s = m > 1280 ? 1280 / m : 1;
        var c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(h * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        res(c.toDataURL('image/jpeg', .7));
      };
      img.onerror = rej; img.src = url;
    });
  }
  function thumb(dataUrl) {
    return new Promise(function (res) {
      var img = new Image();
      img.onload = function () {
        var m = Math.max(img.width, img.height), s = m > 480 ? 480 / m : 1;
        var c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .6));
      };
      img.src = dataUrl;
    });
  }
  function ocr(msg, ok) { var o = $('#m-ocr'); o.hidden = false; o.innerHTML = '<span style="color:' + (ok ? 'var(--good)' : 'var(--fire)') + '">' + e(msg) + '</span>'; }
  function onFile(file) {
    if (!file) return;
    var drop = $('#m-drop'); drop.classList.add('busy'); $('#m-droplabel').textContent = '분석 중…';
    compress(file).then(function (big) {
      thumb(big).then(function (t) { receipt = t; $('#m-previmg').src = t; $('#m-preview').style.display = 'block'; });
      return fetch(RECEIPT_API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data: big.split(',')[1], mime: 'image/jpeg' }) })
        .then(function (r) { return r.json().catch(function () { return null; }).then(function (j) { return { r: r, j: j }; }); });
    }).then(function (o) {
      var j = o.j;
      if (!o.r.ok || !j || j.error) throw new Error((j && j.error) || '분석 실패');
      if (j.total && (!j.currency || j.currency === 'KRW')) $('#m-amount').value = Math.round(j.total);
      var c = CAT_MAP[j.category]; if (c) { cat = c; picks(); }
      if (j.memo) $('#m-memo').value = j.memo;
      ocr('✅ 자동 입력 완료 · ' + ((j.items || []).join(', ') || '금액 확인해 주세요'), true);
    }).catch(function (err) {
      ocr((err && err.message ? err.message : '분석 실패') + ' · 금액만 직접 입력해 주세요 (사진은 첨부됨)', false);
    }).then(function () { drop.classList.remove('busy'); $('#m-droplabel').textContent = '🧾 영수증 사진으로 자동 입력'; });
  }

  /* ---------- 입력 ---------- */
  function reset() {
    $('#m-amount').value = ''; $('#m-memo').value = ''; receipt = null;
    $('#m-preview').style.display = 'none'; $('#m-ocr').hidden = true; $('#m-file').value = '';
    split = [0, 1, 2, 3]; picks();
  }
  function save() {
    var amt = Math.round(+$('#m-amount').value);
    if (!amt || amt <= 0) { J.toast('금액을 입력해 주세요'); return; }
    if (!split.length) { J.toast('같이 쓴 사람을 골라 주세요'); return; }
    var btn = $('#m-save'); btn.disabled = true;
    var row = { amount: amt, category: cat, payer: payer, split: split.slice().sort(), memo: $('#m-memo').value.trim(), spent_on: $('#m-date').value || new Date().toISOString().slice(0, 10) };
    if (receipt) row.receipt = receipt;
    add(row).then(function () { renderAll(); reset(); J.toast('추가했어요'); })
      .catch(function (err) { J.toast('저장 실패 · ' + err.message); })
      .then(function () { btn.disabled = false; });
  }

  $('#m-cat').addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; cat = b.dataset.v; picks(); });
  $('#m-payer').addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; payer = +b.dataset.v; picks(); });
  $('#m-split').addEventListener('click', function (ev) {
    var b = ev.target.closest('button'); if (!b) return; var i = +b.dataset.v, k = split.indexOf(i);
    if (k > -1) split.splice(k, 1); else split.push(i); picks();
  });
  $('#m-file').addEventListener('change', function () { onFile(this.files[0]); });
  $('#m-prevx').addEventListener('click', function () { receipt = null; $('#m-preview').style.display = 'none'; $('#m-file').value = ''; });
  $('#m-save').addEventListener('click', save);
  $('#m-reset').addEventListener('click', reset);
  $('#m-list').addEventListener('click', function (ev) {
    var d = ev.target.closest('[data-del]');
    if (d) { if (window.confirm('이 지출을 삭제할까요? 4명 모두에게서 지워져요.')) del(d.dataset.del); return; }
    var im = ev.target.closest('[data-img]');
    if (im) { var lb = document.createElement('div'); lb.className = 'lightbox'; lb.innerHTML = '<img src="' + im.src + '" alt="영수증">'; lb.onclick = function () { lb.remove(); }; document.body.appendChild(lb); }
  });

  var k = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  var td = k.getFullYear() + '-' + String(k.getMonth() + 1).padStart(2, '0') + '-' + String(k.getDate()).padStart(2, '0');
  $('#m-date').value = td;
  picks(); load().then(live);
})();
