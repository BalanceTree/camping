/* weather-api.js — Open-Meteo 여러 예보 모델을 모아 날짜별 합의값 계산 (키 불필요) */
(function () {
  'use strict';
  var P = window.TRIP.place;
  var DATES = ['2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11'];
  var LABELS = ['10.8 목', '10.9 금', '10.10 토', '10.11 일'];
  var MODELS = [
    { id: 'kma_seamless', name: '기상청 KMA' },
    { id: 'ecmwf_ifs025', name: 'ECMWF 유럽' },
    { id: 'gfs_seamless', name: 'GFS 미국' },
    { id: 'icon_seamless', name: 'ICON 독일' },
    { id: 'jma_seamless', name: 'JMA 일본' },
  ];
  var DAILY = 'temperature_2m_max,temperature_2m_min,apparent_temperature_min,precipitation_probability_max,precipitation_sum,weathercode,windspeed_10m_max';
  var CACHE = 'jinan-weather-v1', TTL = 30 * 60 * 1000;

  function icon(c) {
    if (c == null) return '❔';
    if (c === 0) return '☀️'; if (c <= 1) return '🌤️'; if (c <= 2) return '⛅'; if (c <= 3) return '☁️';
    if (c <= 48) return '🌫️'; if (c <= 55) return '🌦️'; if (c <= 67) return '🌧️'; if (c <= 77) return '❄️';
    if (c <= 82) return '🌧️'; return '⛈️';
  }
  function text(c) {
    if (c == null) return '예보 전';
    if (c === 0) return '맑음'; if (c <= 1) return '대체로 맑음'; if (c <= 2) return '구름 조금'; if (c <= 3) return '흐림';
    if (c <= 48) return '안개'; if (c <= 55) return '이슬비'; if (c <= 65) return '비'; if (c <= 77) return '눈';
    if (c <= 82) return '소나기'; return '뇌우';
  }
  function median(a) { if (!a.length) return null; var s = a.slice().sort(function (x, y) { return x - y; }), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
  function mean(a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : null; }
  function nums(a) { return a.filter(function (v) { return v != null && !isNaN(v); }); }

  function url(m) {
    return 'https://api.open-meteo.com/v1/forecast?latitude=' + P.lat + '&longitude=' + P.lon +
      '&daily=' + DAILY + '&timezone=Asia%2FSeoul&start_date=' + DATES[0] + '&end_date=' + DATES[DATES.length - 1] + '&models=' + m;
  }

  function fetchModel(m) {
    return fetch(url(m.id)).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return j && j.daily ? { m: m, d: j.daily } : null; })
      .catch(function () { return null; });
  }

  function summarize(results) {
    var ok = results.filter(Boolean);
    var days = DATES.map(function (date, i) {
      var per = ok.map(function (r) {
        var d = r.d, k = (d.time || []).indexOf(date);
        if (k < 0) return null;
        function g(n) { var a = d[n]; return a && a[k] != null ? a[k] : null; }
        var v = { model: r.m.name, tmax: g('temperature_2m_max'), tmin: g('temperature_2m_min'), feel: g('apparent_temperature_min'),
          pop: g('precipitation_probability_max'), mm: g('precipitation_sum'), code: g('weathercode'), wind: g('windspeed_10m_max') };
        if (v.tmax == null && v.tmin == null) return null;
        if (v.pop == null && v.mm != null) v.pop = v.mm <= 0 ? 5 : v.mm < 1 ? 35 : v.mm < 3 ? 55 : v.mm < 10 ? 72 : 88;
        return v;
      }).filter(Boolean);
      var tmaxs = nums(per.map(function (v) { return v.tmax; })), tmins = nums(per.map(function (v) { return v.tmin; }));
      var codes = nums(per.map(function (v) { return v.code; }));
      var kma = per.filter(function (v) { return v.model === '기상청 KMA'; })[0];
      var code = kma && kma.code != null ? kma.code : (codes.length ? Math.round(median(codes)) : null);
      return {
        date: date, label: LABELS[i], n: per.length, per: per,
        tmax: median(tmaxs), tmin: median(tmins), feel: median(nums(per.map(function (v) { return v.feel; }))),
        tmaxR: tmaxs.length ? [Math.min.apply(null, tmaxs), Math.max.apply(null, tmaxs)] : null,
        tminR: tmins.length ? [Math.min.apply(null, tmins), Math.max.apply(null, tmins)] : null,
        pop: mean(nums(per.map(function (v) { return v.pop; }))),
        mm: median(nums(per.map(function (v) { return v.mm; }))),
        wind: median(nums(per.map(function (v) { return v.wind; }))),
        code: code, icon: icon(code), text: text(code),
      };
    });
    return { days: days, models: ok.length, total: MODELS.length, at: Date.now() };
  }

  /* 캠핑용 한 줄 조언 */
  function tips(d) {
    var t = [];
    if (d.n === 0) return ['아직 예보 범위 밖 · 며칠 뒤 다시 확인'];
    if (d.tmin != null && d.tmin <= 3) t.push('🥶 밤에 영하권 근처 · 핫팩, 두꺼운 이불 필수');
    else if (d.tmin != null && d.tmin <= 8) t.push('🧥 밤 기온 한 자릿수 · 경량패딩, 수면양말');
    if (d.pop != null && d.pop >= 60) t.push('☔ 비 가능성 높음 · 타프 각도, 장비 방수');
    else if (d.pop != null && d.pop >= 35) t.push('🌂 비 올 수도 · 우비 챙기기');
    if (d.mm != null && d.mm >= 3) t.push('🧗 바위 젖음 · 다음 날 오전까지 마르기 어려움');
    if (d.wind != null && d.wind >= 25) t.push('💨 바람 강함 · 팩, 스트링 단단히');
    if (!t.length) t.push('👍 캠핑 · 볼더링 하기 좋은 날');
    return t;
  }

  window.JW = {
    MODELS: MODELS, tips: tips,
    cached: function () { var c = window.J.ls.get(CACHE, null); return c; },
    load: function (force) {
      var c = window.J.ls.get(CACHE, null);
      if (!force && c && Date.now() - c.at < TTL) return Promise.resolve(c);
      return Promise.all(MODELS.map(fetchModel)).then(function (rs) {
        var s = summarize(rs);
        if (s.models) window.J.ls.set(CACHE, s);
        else if (c) return c;          // 오프라인이면 마지막 값
        return s;
      });
    },
    r: function (v) { return v == null ? '–' : Math.round(v); },
  };
})();
