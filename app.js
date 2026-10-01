(function () {
  'use strict';

  var cfg = window.JINAN_CONFIG || {};
  var LOCAL_KEY = 'jinan-checks';
  var TAB_KEY = 'jinan-tab';

  var sb = null;
  if (cfg.supabaseUrl && cfg.supabaseKey && window.supabase) {
    sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
  }

  var state = {};          // id -> true/false
  var nodes = {};          // id -> <li>

  // ---------- sync status ----------
  var syncEl = document.getElementById('sync');
  var syncText = document.getElementById('synctext');
  function setSync(kind, text) {
    if (!syncEl) return;
    syncEl.className = 'sync' + (kind ? ' ' + kind : '');
    syncText.textContent = text;
  }

  // ---------- local fallback ----------
  function loadLocal() {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}'); } catch (e) { return {}; }
  }
  function saveLocal() {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(state)); } catch (e) {}
  }

  // ---------- checklist ----------
  // id = 그룹 + 항목 이름 → 목록 순서를 바꿔도 체크가 유지됨
  document.querySelectorAll('ul.buy').forEach(function (ul) {
    var g = ul.dataset.g;
    ul.querySelectorAll('li').forEach(function (li) {
      var id = g + ':' + li.querySelector('span').textContent.trim();
      nodes[id] = li;
      li.tabIndex = 0;
      li.setAttribute('role', 'checkbox');
      var box = document.createElement('b');
      box.className = 'box';
      li.prepend(box);
      li.addEventListener('click', function () { toggle(id); });
      li.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(id); }
      });
    });
  });

  function render(id) {
    var li = nodes[id];
    if (!li) return;
    var on = !!state[id];
    li.classList.toggle('on', on);
    li.setAttribute('aria-checked', on);
  }
  function renderAll() { Object.keys(nodes).forEach(render); progress(); }

  function progress() {
    var all = document.querySelectorAll('#t-shop ul.buy li');
    var on = document.querySelectorAll('#t-shop ul.buy li.on');
    document.getElementById('pcount').textContent = on.length + ' / ' + all.length;
    document.getElementById('pbar').style.width = (all.length ? on.length / all.length * 100 : 0) + '%';
  }

  function toggle(id) {
    state[id] = !state[id];
    render(id);
    progress();
    if (!sb) { saveLocal(); return; }
    var value = state[id];
    sb.from('jinan_checks')
      .upsert({ id: id, done: value, updated_at: new Date().toISOString() })
      .then(function (res) {
        if (res.error) {
          state[id] = !value;           // 실패하면 되돌림
          render(id);
          progress();
          setSync('err', '저장 실패 · 다시 눌러 주세요');
        }
      });
  }

  // ---------- server ----------
  function startServer() {
    setSync('', '서버 연결 중');
    sb.from('jinan_checks').select('id, done').then(function (res) {
      if (res.error) {
        setSync('err', '서버 연결 실패 · 이 폰에만 저장');
        sb = null;
        state = loadLocal();
        renderAll();
        return;
      }
      res.data.forEach(function (r) { state[r.id] = r.done; });
      renderAll();
    });

    sb.channel('jinan-checks-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jinan_checks' }, function (p) {
        var r = p.new;
        if (r && r.id) { state[r.id] = r.done; render(r.id); progress(); }
        else if (p.eventType === 'DELETE') { location.reload(); }
      })
      .subscribe(function (status) {
        if (status === 'SUBSCRIBED') setSync('live', '실시간 공유 중 · 4명 같이 체크');
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setSync('err', '실시간 끊김 · 새로고침');
      });
  }

  if (sb) {
    startServer();
  } else {
    state = loadLocal();
    renderAll();
    setSync('', '이 폰에만 저장 · config.js 설정 전');
  }

  // ---------- tabs ----------
  var btns = document.querySelectorAll('.nav button');
  function show(t) {
    document.querySelectorAll('.tab').forEach(function (m) { m.hidden = m.id !== t; });
    btns.forEach(function (b) {
      if (b.dataset.t === t) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    try { localStorage.setItem(TAB_KEY, t); } catch (e) {}
    window.scrollTo(0, 0);
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.t); }); });
  var last = null;
  try { last = localStorage.getItem(TAB_KEY); } catch (e) {}
  if (last && document.getElementById(last)) show(last);

  // ---------- D-day ----------
  var today = new Date(new Date().toDateString());
  var d = Math.ceil((new Date(2026, 9, 8) - today) / 864e5);
  document.getElementById('dday').textContent = d > 0 ? 'D-' + d : (d > -4 ? '진행 중' : '다녀옴');
})();
