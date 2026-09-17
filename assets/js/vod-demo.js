/* ==========================================================================
   VOD「应用配置」可交互原型
   实现依据：《VOD 新增应用配置-需求说明书 V1.0》 2.1 / 2.2.1 / 2.2.2 / 2.2.3
   - 纯前端演示，不依赖任何后端；存储、下载耗时均为模拟值。
   ========================================================================== */
(function () {
  'use strict';

  var root = document.getElementById('vod-demo');
  if (!root) return;

  /* ---------------- 数据（模拟） ---------------- */
  var TOTAL = 32 * 1024;              // 总存储 32 GB（单位 MB）
  var PRE_USED = 21.6 * 1024;         // 预置已占用
  var SYSTEM_APPS = ['缺歌反馈', '语音助手'];   // 系统自带：不进应用管理、不可卸载

  // 应用目录：应用市场展示"目录中未安装的应用"；已安装的只在应用管理显示（2.2.1）
  // 已卸载的应用会回到应用市场，可重新下载（2.2.2）
  var CATALOG = [
    { id: 'a1', name: '云游戏大厅', icon: '🎮', ver: '3.2.1', size: 12 * 1024, desc: '云端串流 3A 大作，无需下载安装即可畅玩。支持 1080P / 60 帧，需搭配手柄获得最佳体验。' },
    { id: 'a2', name: 'K 歌房', icon: '🎤', ver: '2.4.0', size: 1.6 * 1024, desc: '家庭 KTV，海量曲库实时更新，支持双麦合唱与打分。' },
    { id: 'a3', name: '4K 影视专区', icon: '🎬', ver: '5.0.3', size: 9.8 * 1024, desc: '收录 4K HDR 高码率片源，支持杜比全景声输出。' },
    { id: 'a4', name: '云健身', icon: '🏃', ver: '1.9.2', size: 0.8 * 1024, desc: '跟练课程按周更新，支持体感摄像头动作纠正。' },
    { id: 'a5', name: '少儿学堂', icon: '🧒', ver: '3.1.0', size: 1.2 * 1024, desc: '学龄前启蒙课程，含家长时长管控与内容分级。' },
    { id: 'a6', name: '戏曲大全', icon: '🎭', ver: '1.2.7', size: 0.9 * 1024, desc: '京剧、越剧、黄梅戏等十余个剧种，含名家名段合集。' },
    { id: 'a7', name: '电视购物', icon: '🛍️', ver: '2.0.5', size: 0.6 * 1024, desc: '直播购物频道，支持扫码下单与订单查询。' },
    { id: 'a8', name: '智慧医疗', icon: '🩺', ver: '1.4.1', size: 0.7 * 1024, desc: '在线问诊与健康档案，支持与医院端数据同步。' },
    { id: 'a9', name: '家庭相册', icon: '🖼️', ver: '2.2.0', size: 0.5 * 1024, desc: '手机相册自动同步到大屏，支持人脸聚类与投屏轮播。' },
    { id: 'a10', name: 'Ai 学习助手', icon: '🤖', ver: '1.0.8', size: 3.4 * 1024, desc: '语音问答与课程陪练，基于大模型生成个性化学习计划。' },
    { id: 'a11', name: '天气预报', icon: '🌤️', ver: '1.1.3', size: 0.3 * 1024, desc: '15 日趋势与灾害预警，支持桌面组件常驻显示。' },
    { id: 'a12', name: '音乐现场', icon: '🎧', ver: '4.3.2', size: 2.1 * 1024, desc: '演唱会直播与无损音质点播，支持歌词逐字滚动。' },
    // 以下 4 个为出厂预置，同样在应用目录中，卸载后可回到应用市场重新下载
    { id: 'a13', name: '电影频道', icon: '🍿', ver: '6.0.1', size: 2.8 * 1024, desc: '院线新片与经典片库，支持多端续播。' },
    { id: 'a14', name: '游戏中心', icon: '🕹️', ver: '3.6.4', size: 2.2 * 1024, desc: '大屏游戏聚合入口，含云游戏与本地游戏管理。' },
    { id: 'a15', name: '有声书', icon: '📚', ver: '2.5.9', size: 1.1 * 1024, desc: '睡前故事与有声小说，支持定时关闭。' },
    { id: 'a16', name: '投屏助手', icon: '📱', ver: '1.8.0', size: 0.4 * 1024, desc: '手机一键投屏，支持镜像与推送两种模式。' }
  ];

  // 出厂预置（应用管理里能看到、可卸载）
  var PREINSTALLED = ['a13', 'a14', 'a15', 'a16'];

  function marketList() {
    return CATALOG.filter(function (a) {
      return !state.installed.some(function (i) { return i.id === a.id; });
    });
  }
  function appById(id) {
    return CATALOG.filter(function (a) { return a.id === id; })[0] || null;
  }

  /* ---------------- 状态 ---------------- */
  var state = {
    view: 'settings',        // settings | config
    tab: 'market',           // market | manage
    installed: [],           // 已安装应用对象
    tasks: {},               // id -> {progress, timer, paused, mode:'install'|'update'}
    used: PRE_USED,
    detail: null,            // {app, from:'market'|'manage'}
    toastTimer: null,
    lockUntil: 0,            // 空间不足冷却锁（2.2.1 第 6 条）
    updateCheck: 0
  };

  function clone(a) { return JSON.parse(JSON.stringify(a)); }
  function reset() {
    state.installed = CATALOG.filter(function (a) { return PREINSTALLED.indexOf(a.id) > -1; }).map(clone);
    state.used = state.installed.reduce(function (s, a) { return s + a.size; }, PRE_USED);
    Object.keys(state.tasks).forEach(function (k) { clearInterval(state.tasks[k].timer); });
    state.tasks = {};
    state.view = 'settings'; state.tab = 'market'; state.detail = null; state.lockUntil = 0;
    state.updateCheck = 0;
    render();
  }

  var remaining = function () { return TOTAL - state.used; };
  function fmt(mb) {
    return mb >= 1024 ? (mb / 1024).toFixed(1).replace(/\.0$/, '') + ' GB' : Math.round(mb) + ' MB';
  }

  /* ---------------- 结构 ---------------- */
  root.innerHTML = [
    '<div class="v-top"><div class="v-title">系统设置</div><div class="v-time">20:14</div></div>',
    '<div class="v-main">',
    '  <div class="v-side" id="v-side"></div>',
    '  <div class="v-body" id="v-body"></div>',
    '</div>',
    '<div class="v-foot">',
    '  <span>交互按《需求说明书 V1.0》2.1 / 2.2.1 / 2.2.2 / 2.2.3 还原，存储与下载耗时为模拟值</span>',
    '  <span><b id="v-used"></b> · <button class="v-btn ghost" id="v-reset" style="width:auto;padding:2px 10px;font-size:11.5px">重置演示</button></span>',
    '</div>'
  ].join('');

  var sideEl = root.querySelector('#v-side');
  var bodyEl = root.querySelector('#v-body');

  /* ---------------- 渲染：左侧列表 ---------------- */
  function renderSide() {
    var items = ['通用设置', '网络设置', '显示设置', '声音设置', '服务器配置'];
    // 2.1：在左侧列表最下方（服务器配置下）新增"应用配置"
    sideEl.innerHTML =
      '<div class="v-side-h">系统设置</div>' +
      items.map(function (t) {
        return '<button data-plain="1">' + t + '</button>';
      }).join('') +
      '<div class="v-sep"></div>' +
      '<button id="v-navconfig" class="' + (state.view === 'config' ? 'on' : '') + '">📦 应用配置</button>';
  }

  /* ---------------- 渲染：主区 ---------------- */
  function render() {
    renderSide();
    root.querySelector('#v-used').textContent = '已用 ' + fmt(state.used) + ' / ' + fmt(TOTAL);

    if (state.view === 'settings') {
      bodyEl.innerHTML =
        '<div class="v-empty">← 请在左侧选择设置项<br><span style="font-size:12.5px">点击最下方的「应用配置」进入应用市场</span></div>';
      return;
    }

    // 2.2：两个 tab + 右上角磁盘使用情况按钮
    var html = [
      '<div class="v-tabs">',
      '  <button class="v-tab ' + (state.tab === 'market' ? 'on' : '') + '" data-tab="market">应用市场</button>',
      '  <button class="v-tab ' + (state.tab === 'manage' ? 'on' : '') + '" data-tab="manage">应用管理</button>',
      '  <button class="v-disk-btn" id="v-diskbtn">⛁ 磁盘使用情况</button>',
      '</div>'
    ];

    var list = state.tab === 'market'
      ? marketList().map(function (a) { return card(a, 'market'); })
      : state.installed.map(function (a) { return card(a, 'manage'); });

    html.push('<div class="v-grid">' + (list.length ? list.join('') : '<div class="v-empty" style="grid-column:1/-1">暂无应用</div>') + '</div>');

    // 2.2 最后一条：右下角返回按钮
    html.push('<div style="display:flex;justify-content:flex-end;margin-top:14px">' +
      '<button class="v-btn ghost" id="v-back" style="width:auto;padding:7px 20px">↩ 返回</button></div>');

    bodyEl.innerHTML = html.join('');
    if (state.detail) renderDetail();
  }

  function card(app, mode) {
    var task = state.tasks[app.id];
    var action;
    if (mode === 'market') {
      if (task) {
        // 2.2.1 第 3 条：下载中以进度条替换下载按钮，点击可暂停 / 继续
        action = '<button class="v-progress' + (task.paused ? ' paused' : '') + '" data-progress="' + app.id + '" ' +
          'title="' + (task.paused ? '点击继续下载' : '点击暂停下载') + '">' +
          '<i style="width:' + task.progress + '%"></i><span>' +
          (task.paused ? '暂停中' : Math.floor(task.progress) + '%') + '</span></button>';
      } else {
        action = '<button class="v-btn" data-dl="' + app.id + '">下载</button>';
      }
    } else {
      action = '<button class="v-btn ghost" data-unin="' + app.id + '">卸载</button>';
    }
    return '<div class="v-card">' +
      '<button class="v-logo" data-open="' + app.id + '" data-from="' + mode + '" title="查看详情">' + app.icon + '</button>' +
      '<div class="v-name">' + app.name + '</div>' +
      action + '</div>';
  }

  /* ---------------- 应用详情（2.2.1 / 2.2.2） ---------------- */
  function renderDetail() {
    var app = state.detail.app, from = state.detail.from;
    var installed = state.installed.some(function (i) { return i.id === app.id; });
    var task = state.tasks[app.id];

    var action = installed
      ? '<button class="v-btn" id="v-check">检查更新</button>' +
        '<button class="v-btn ghost" id="v-unin2">卸载</button>'
      : (task
        ? '<button class="v-progress' + (task.paused ? ' paused' : '') + '" data-progress="' + app.id + '" style="width:220px">' +
          '<i style="width:' + task.progress + '%"></i><span>' + (task.paused ? '暂停中' : Math.floor(task.progress) + '%') + '</span></button>'
        : '<button class="v-btn" data-dl="' + app.id + '" style="width:auto;padding:9px 22px">下载</button>');

    var d = document.createElement('div');
    d.className = 'v-detail';
    d.id = 'v-detail';
    d.innerHTML =
      '<button class="v-close" id="v-dclose">✕</button>' +
      '<div class="v-dhead"><div class="v-logo" style="cursor:default">' + app.icon + '</div>' +
      '<div><h4>' + app.name + '</h4><div class="v-meta">' +
      '<span>版本 ' + app.ver + '</span>' +
      // 市场详情看"需要存储空间"，已安装详情看"占用存储空间"
      '<span>' + (installed ? '占用存储空间 ' : '需要存储空间 ') + fmt(app.size) + '</span>' +
      '<span>' + (installed ? '状态：已安装' : '状态：未安装') + '</span>' +
      '</div></div></div>' +
      '<div class="v-desc">' + app.desc + '</div>' +
      '<div class="v-dactions">' + action + '</div>';
    bodyEl.appendChild(d);
  }

  /* ---------------- 提示与弹窗 ---------------- */
  function toast(msg, ms, cb) {
    var t = root.querySelector('.v-toast');
    if (t) t.remove();
    t = document.createElement('div');
    t.className = 'v-toast';
    t.textContent = msg;
    root.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.remove(); if (cb) cb(); }, 300);
    }, ms);
    return t;
  }

  function dialog(opts) {
    var mask = document.createElement('div');
    mask.className = 'v-mask';
    mask.innerHTML = '<div class="v-dialog"><h5>' + opts.title + '</h5>' +
      (opts.text ? '<p>' + opts.text + '</p>' : (opts.html || '')) +
      (opts.actions ? '<div class="v-acts">' + opts.actions + '</div>' : '') +
      '</div>';
    root.appendChild(mask);
    requestAnimationFrame(function () { mask.classList.add('show'); });
    if (opts.close) mask.addEventListener('click', function (e) { if (e.target === mask) opts.close(mask); });
    return mask;
  }

  function diskDialog() {
    var pct = state.used / TOTAL;
    var C = 2 * Math.PI * 78;
    var mask = dialog({
      title: '磁盘使用情况',
      html: '<div class="v-ring">' +
        '<svg width="176" height="176" viewBox="0 0 176 176">' +
        '<circle class="v-track" cx="88" cy="88" r="78"></circle>' +
        '<circle class="v-arc" cx="88" cy="88" r="78" stroke-dasharray="' + C.toFixed(2) + '" ' +
        'stroke-dashoffset="' + (C * (1 - pct)).toFixed(2) + '"></circle></svg>' +
        // 2.2.3：环形图内部居中显示百分比，下方展示已用 / 总容量
        '<div class="v-center"><div class="v-pct">' + Math.round(pct * 100) + '%</div>' +
        '<div class="v-amount">' + fmt(state.used) + ' / ' + fmt(TOTAL) + '</div></div></div>' +
        '<div class="v-legend">已占用 ' + fmt(state.used) + '，剩余可用 ' + fmt(remaining()) + '</div>' +
        '<button class="v-x" data-close="1">✕</button>',
      close: function (m) { m.remove(); }
    });
    mask.querySelector('.v-dialog').classList.add('v-disk');
    mask.querySelector('[data-close]').addEventListener('click', function () { mask.remove(); });
  }

  /* ---------------- 下载（2.2.1） ---------------- */
  function startDownload(app, mode) {
    var now = Date.now();
    // 第 6 条：空间不足的提示与 3 秒冷却锁
    if (app.size > remaining()) {
      if (now < state.lockUntil) {
        toast('下载失败！磁盘空间不足，请卸载应用后重试', 3000);  // 冷却期内重复点击：只重置 3 秒倒计时
        return;
      }
      state.lockUntil = now + 3000;
      toast('下载失败！磁盘空间不足，请卸载应用后重试', 3000);
      return;
    }
    var task = state.tasks[app.id] = { progress: 0, paused: false, timer: null, mode: mode || 'install' };
    task.timer = setInterval(function () {
      if (task.paused) return;
      task.progress += 100 / 28;   // 约 2.8 秒完成（模拟）
      if (task.progress >= 100) {
        task.progress = 100;
        clearInterval(task.timer);
        finish(app, task);
      } else {
        paintProgress(app.id);
      }
    }, 100);
    render();
  }

  function paintProgress(id) {
    root.querySelectorAll('[data-progress="' + id + '"]').forEach(function (el) {
      var t = state.tasks[id];
      if (!t) return;
      el.classList.toggle('paused', t.paused);
      el.querySelector('i').style.width = t.progress + '%';
      el.querySelector('span').textContent = t.paused ? '暂停中' : Math.floor(t.progress) + '%';
    });
  }

  function finish(app, task) {
    delete state.tasks[app.id];
    if (task.mode === 'update') {
      state.used += 0;   // 更新视为覆盖安装，不改变占用（演示简化）
      state.detail = null; render();
      toast('已成功更新' + app.name, 2000);
    } else {
      state.installed.push(clone(app));
      state.used += app.size;
      state.detail = null; render();
      toast('已成功安装' + app.name, 2000);
    }
  }

  /* ---------------- 卸载（2.2.2） ---------------- */
  function uninstall(app) {
    var m = dialog({
      title: '确定要卸载' + app.name + '吗？',
      text: '卸载后该应用将回到应用市场，可随时重新下载。',
      actions: '<button class="v-btn ghost" data-cancel="1" style="width:auto;padding:7px 20px">取消</button>' +
               '<button class="v-btn" data-ok="1" style="width:auto;padding:7px 20px">确定</button>'
    });
    m.querySelector('[data-cancel]').addEventListener('click', function () { m.remove(); });  // 取消 → 返回刚才的页面
    m.querySelector('[data-ok]').addEventListener('click', function () {
      m.remove();
      // 「正在卸载中，请稍后…」不可手动关闭，完成后自动退出
      var w = dialog({ title: '正在卸载中，请稍后…', text: '请勿关闭设备或断电。' });
      setTimeout(function () {
        w.remove();
        state.installed = state.installed.filter(function (i) { return i.id !== app.id; });
        state.used -= app.size;
        state.detail = null; render();
        toast('已成功卸载' + app.name, 2000);   // 2 秒后自动淡出
      }, 1400);
    });
  }

  /* ---------------- 检查更新（2.2.2） ---------------- */
  function checkUpdate(app) {
    var w = dialog({ title: '检查更新中，请稍后…', text: '正在连接应用商店服务器。' });
    setTimeout(function () {
      w.remove();
      // 演示：Ai 学习助手 永远有新版；其余为最新版
      var hasNew = app.id === 'a10' || state.updateCheck++ % 3 === 2;
      if (!hasNew) { toast('目前已是最新版本', 2000); return; }
      var c = dialog({
        title: '检测到新版本，是否进行更新？',
        text: '新版本将继续占用约 ' + fmt(app.size) + ' 存储空间。',
        actions: '<button class="v-btn ghost" data-cancel="1" style="width:auto;padding:7px 20px">取消</button>' +
                 '<button class="v-btn" data-ok="1" style="width:auto;padding:7px 20px">确定</button>'
      });
      c.querySelector('[data-cancel]').addEventListener('click', function () { c.remove(); });   // 取消 → 回详情页
      c.querySelector('[data-ok]').addEventListener('click', function () {
        c.remove();
        if (app.size * 0.15 > remaining()) {
          // 更新失败文案
          toast('更新失败！磁盘空间不足，请卸载应用后重试', 3000);
          return;
        }
        var u = dialog({ title: '正在更新中，请稍后…', text: '请勿关闭设备或断电。' });
        var task = state.tasks[app.id] = { progress: 0, paused: false, timer: null, mode: 'update' };
        task.timer = setInterval(function () {
          task.progress += 100 / 20;
          if (task.progress >= 100) { clearInterval(task.timer); task.progress = 100; u.remove(); finish(app, task); }
          else { var s = u.querySelector('.v-dialog p'); if (s) s.textContent = '更新进度 ' + Math.floor(task.progress) + '%'; }
        }, 100);
      });
    }, 1200);
  }

  /* ---------------- 事件 ---------------- */
  root.addEventListener('click', function (e) {
    var el = e.target.closest('[data-tab],[data-open],[data-dl],[data-unin],[data-progress],[data-plain],#v-navconfig,#v-back,#v-diskbtn,#v-dclose,#v-check,#v-unin2,#v-reset');
    if (!el) return;
    var from = el.getAttribute('data-from');

    if (el.id === 'v-reset') { reset(); return; }
    if (el.id === 'v-navconfig') { state.view = 'config'; state.tab = 'market'; state.detail = null; render(); return; }
    if (el.id === 'v-back') { state.view = 'settings'; state.detail = null; render(); return; }
    if (el.id === 'v-diskbtn') { diskDialog(); return; }
    if (el.id === 'v-dclose') { state.detail = null; var d = root.querySelector('.v-detail'); if (d) d.remove(); return; }

    if (el.hasAttribute('data-tab')) { state.tab = el.getAttribute('data-tab'); state.detail = null; render(); return; }
    if (el.hasAttribute('data-plain')) { state.view = 'settings'; state.detail = null; render(); return; }

    if (el.hasAttribute('data-open')) {
      var id = el.getAttribute('data-open');
      var app = appById(id);
      if (app) { state.detail = { app: app, from: from }; render(); }
      return;
    }

    if (el.hasAttribute('data-dl')) {
      var a2 = appById(el.getAttribute('data-dl'));
      if (a2) startDownload(a2, 'install');
      return;
    }

    if (el.hasAttribute('data-progress')) {
      var pid = el.getAttribute('data-progress');
      var t = state.tasks[pid];
      if (t) { t.paused = !t.paused; paintProgress(pid); }   // 点击进度条：暂停 / 继续
      return;
    }

    if (el.hasAttribute('data-unin')) {
      var a3 = state.installed.filter(function (a) { return a.id === el.getAttribute('data-unin'); })[0];
      if (a3) uninstall(a3);
      return;
    }
    if (el.id === 'v-unin2' && state.detail) { uninstall(state.detail.app); return; }
    if (el.id === 'v-check' && state.detail) { checkUpdate(state.detail.app); return; }
  });

  reset();

  /* ---------------- 演示起始状态 & 测试钩子 ---------------- */
  // 支持通过 URL 直接进入某个视图：?demo=market / ?demo=manage / ?demo=disk
  (function () {
    var q = new URLSearchParams(location.search).get('demo');
    if (q === 'market' || q === 'manage') { state.view = 'config'; state.tab = q; render(); }
    else if (q === 'disk') { state.view = 'config'; state.tab = 'market'; render(); diskDialog(); }
  })();

  // 暴露少量内部状态与方法，便于自动化检查与二次演示
  window.__vod = {
    state: state,
    render: render,
    startDownload: startDownload,
    uninstall: uninstall,
    toast: function (m, ms) { return toast(m, ms); },
    setTab: function (t) { state.tab = t; state.detail = null; render(); },
    openConfig: function () { state.view = 'config'; state.detail = null; render(); },
    backToSettings: function () { state.view = 'settings'; state.detail = null; render(); },
    openDetail: function (id) {
      var app = appById(id);
      if (app) { state.detail = { app: app }; render(); }
    },
    reset: reset,
    remaining: remaining,
    apps: function () { return { catalog: CATALOG, installed: state.installed, system: SYSTEM_APPS }; }
  };
})();
