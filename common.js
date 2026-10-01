/* common.js — 모든 페이지 공통: 상단바(카운트다운·지금 할 일·공유), 메뉴, 서버, 체크 동기화 */
(function () {
  'use strict';
  var T = window.TRIP;
  var J = window.J = {};

  /* 카카오톡 인앱 브라우저 → 기본 브라우저로 다시 열기 (체크 저장·홈 화면 추가가 안정적) */
  if (/kakaotalk/i.test(navigator.userAgent)) {
    location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(location.href);
  }

  /* 오프라인 · 홈 화면 설치 */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }

  /* ---------- 헬퍼 ---------- */
  J.$ = function (s, r) { return (r || document).querySelector(s); };
  J.esc = function (s) {
    return String(s == null ? '' : s).replace(/[<>&"]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]; });
  };
  J.won = function (n) { return Math.round(n).toLocaleString('ko-KR') + '원'; };
  J.toast = function (msg) {
    var t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('out'); }, 1800);
    setTimeout(function () { t.remove(); }, 2200);
  };
  J.ls = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };

  /* ---------- 서버 ---------- */
  var cfg = window.JINAN_CONFIG || {};
  J.sb = (cfg.supabaseUrl && cfg.supabaseKey && window.supabase)
    ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey) : null;

  /* ---------- 메뉴 ---------- */
  var PAGES = [
    ['index.html', '🏠', '홈'], ['move.html', '🚗', '이동'], ['food.html', '🍳', '식단'],
    ['shop.html', '🛒', '장보기'], ['prep.html', '🎒', '준비'], ['weather.html', '☂', '날씨'], ['money.html', '💰', '정산'],
  ];
  var here = location.pathname.split('/').pop() || 'index.html';
  var wrap = document.querySelector('.wrap');

  var bar = document.createElement('div');
  bar.className = 'topbar';
  bar.innerHTML = '<span class="cd" id="cd"></span><button class="share" type="button">🔗 링크 공유</button>';

  var nav = document.createElement('nav');
  nav.className = 'nav';
  nav.innerHTML = PAGES.map(function (p) {
    return '<a href="' + p[0] + '"' + (p[0] === here ? ' class="active" aria-current="page"' : '') + '>' + p[1] + ' ' + p[2] + '</a>';
  }).join('');
  wrap.insertBefore(nav, wrap.firstChild);
  wrap.insertBefore(bar, wrap.firstChild);
  var act = nav.querySelector('.active');
  if (act) nav.scrollLeft = act.offsetLeft - 16;

  /* ---------- 카운트다운 · 지금 할 일 ---------- */
  var START = new Date(T.start), END = new Date(T.end);
  function kst() { return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' })); }
  function toMin(s) { var a = s.split(':'); return +a[0] * 60 + +a[1]; }
  J.dday = function () {
    var k = kst(), today = new Date(k.getFullYear(), k.getMonth(), k.getDate());
    var sd = T.startDay;
    return Math.round((new Date(sd[0], sd[1], sd[2]) - today) / 864e5);
  };
  J.nowPlan = function () {
    var k = kst();
    if (k.getFullYear() !== 2026 || k.getMonth() !== 9) return null;
    var list = T.plan[k.getDate()]; if (!list) return null;
    var hm = k.getHours() * 60 + k.getMinutes();
    for (var i = 0; i < list.length; i++) {
      if (hm >= toMin(list[i][0]) && hm < toMin(list[i][1])) return { cur: list[i], next: list[i + 1] || null };
    }
    return null;
  };
  J.phase = function () { var n = new Date(); return n < START ? 'before' : n <= END ? 'during' : 'after'; };

  var cd = bar.querySelector('#cd');
  function renderBar() {
    var ph = J.phase();
    if (ph === 'before') {
      var d = J.dday(), hr = Math.floor((START - new Date()) / 36e5);
      cd.innerHTML = d > 0 ? '출발까지 D-<b>' + d + '</b><small>' + hr + '시간 남음</small>'
                           : '<b>오늘 출발</b><small>' + hr + '시간 남음</small>';
    } else if (ph === 'during') {
      var p = J.nowPlan();
      cd.innerHTML = p ? p.cur[2] + ' 지금: <b>' + J.esc(p.cur[3]) + '</b>' : '🏕️ <b>진안</b> 캠핑 중';
    } else {
      cd.innerHTML = '🏠 캠핑 끝 · 다들 수고했어요';
    }
  }
  renderBar();
  setInterval(renderBar, 30000);

  /* ---------- 공유 ---------- */
  var sbtn = bar.querySelector('.share');
  sbtn.addEventListener('click', function () {
    var url = location.origin + location.pathname.replace(/[^/]*$/, '');
    var data = { title: '운일암반일암 원정 10.8–11', text: '진안 캠핑 · 볼더링 페이지', url: url };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
      .then(function () {
        sbtn.textContent = '✓ 링크 복사됨'; sbtn.classList.add('copied');
        setTimeout(function () { sbtn.textContent = '🔗 링크 공유'; sbtn.classList.remove('copied'); }, 1800);
      })
      .catch(function () { window.prompt('아래 링크를 복사하세요', url); });
  });

  /* ---------- 홈 화면 설치 버튼 ---------- */
  (function () {
    var installed = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    var dismissed = false;
    try { dismissed = !!sessionStorage.getItem('install-x'); } catch (e) {}
    if (installed || dismissed) return;
    var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent), deferred = null;
    var btn = document.createElement('button');
    btn.className = 'install-btn'; btn.type = 'button';
    btn.innerHTML = '⬇ 홈 화면에 추가<span class="x" aria-label="닫기">✕</span>';
    function show() { if (!btn.isConnected) document.body.appendChild(btn); }
    window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; show(); });
    window.addEventListener('appinstalled', function () { btn.remove(); });
    if (isIOS) window.addEventListener('load', show);
    btn.addEventListener('click', function (e) {
      if (e.target.classList.contains('x')) { btn.remove(); try { sessionStorage.setItem('install-x', '1'); } catch (er) {} return; }
      if (deferred) { deferred.prompt(); deferred = null; return; }
      J.toast(isIOS ? '사파리 공유 버튼(□↑) → 홈 화면에 추가' : '브라우저 메뉴(⋮) → 홈 화면에 추가');
    });
  })();

  /* ---------- 체크 동기화 (장보기 · 준비 · 홈) ---------- */
  J.checkId = function (g, name) { return g + ':' + name; };
  J.checks = (function () {
    var state = J.ls.get('jinan-checks', {}), subs = [], status = 'local';
    function emit() { subs.forEach(function (f) { f(state, status); }); }
    function setStatus(s) { status = s; emit(); }
    function start() {
      if (!J.sb) { setStatus('local'); return; }
      setStatus('connecting');
      J.sb.from('jinan_checks').select('id, done').then(function (res) {
        if (res.error) { J.sb = null; setStatus('error'); return; }
        state = {}; res.data.forEach(function (r) { state[r.id] = r.done; });
        J.ls.set('jinan-checks', state);
        emit();
      });
      J.sb.channel('jinan-checks-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'jinan_checks' }, function (p) {
          if (p.new && p.new.id) { state[p.new.id] = p.new.done; J.ls.set('jinan-checks', state); emit(); }
        })
        .subscribe(function (s) {
          if (s === 'SUBSCRIBED') setStatus('live');
          else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') setStatus('error');
        });
    }
    return {
      onChange: function (f) { subs.push(f); f(state, status); },
      start: start,
      get: function (id) { return !!state[id]; },
      toggle: function (id) {
        var v = !state[id]; state[id] = v; J.ls.set('jinan-checks', state); emit();
        if (!J.sb) return;
        J.sb.from('jinan_checks').upsert({ id: id, done: v, updated_at: new Date().toISOString() }).then(function (res) {
          if (res.error) { state[id] = !v; emit(); J.toast('저장 실패 · 다시 눌러 주세요'); }
        });
      },
    };
  })();

  J.syncLabel = function (status) {
    return {
      live: ['live', '실시간 공유 중 · 4명 같이 체크'],
      connecting: ['', '서버 연결 중'],
      error: ['err', '서버 연결 실패 · 이 폰에만 저장'],
      local: ['', '이 폰에만 저장'],
    }[status];
  };

  /* 체크리스트 그리기: groups = [{g,t,s,items:[[이름,양,메모]]}] */
  J.renderChecklist = function (box, groups, opts) {
    opts = opts || {};
    box.innerHTML = groups.map(function (grp) {
      return (grp.t ? '<h2 class="gh">' + J.esc(grp.t) + (grp.s ? ' <em>' + J.esc(grp.s) + '</em>' : '') + '</h2>' : '') +
        '<ul class="buy">' + grp.items.map(function (it) {
          var id = J.checkId(grp.g, it[0]);
          return '<li tabindex="0" role="checkbox" data-id="' + J.esc(id) + '"><b class="box"></b><span>' + J.esc(it[0]) + '</span>' +
            (it[1] ? '<i>' + J.esc(it[1]) + '</i>' : '') + (it[2] ? '<small>' + J.esc(it[2]) + '</small>' : '') + '</li>';
        }).join('') + '</ul>';
    }).join('');
    var lis = box.querySelectorAll('li[data-id]');
    lis.forEach(function (li) {
      function tog() { J.checks.toggle(li.dataset.id); }
      li.addEventListener('click', tog);
      li.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); tog(); } });
    });
    J.checks.onChange(function () {
      var on = 0;
      lis.forEach(function (li) {
        var v = J.checks.get(li.dataset.id); if (v) on++;
        li.classList.toggle('on', v); li.setAttribute('aria-checked', v);
      });
      if (opts.onCount) opts.onCount(on, lis.length);
    });
  };

  J.countChecks = function (groups) {
    var all = 0, on = 0;
    groups.forEach(function (grp) { grp.items.forEach(function (it) { all++; if (J.checks.get(J.checkId(grp.g, it[0]))) on++; }); });
    return { on: on, all: all };
  };
})();
