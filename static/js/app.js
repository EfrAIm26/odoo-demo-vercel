(function () {
  "use strict";

  var D = window.ODOO_DEMO;
  var state = {
    screen: "home",
    app: null,
    view: null,
    selectedRows: {},
    snoozed: {},
    activeLocation: "ALM/Stock",
    activeTrigger: "All",
    showModal: false,
    modalRowId: null,
    toast: null,
    forkast: {
      productId: "croissant",
      algorithm: "wma",
      period: 7,
      source: "all",
      step: 1,
      generating: false,
      generated: false,
    },
  };

  var TRIGGER_ES = { All: "Todos", Auto: "Auto", Manual: "Manual" };

  function $(sel) { return document.querySelector(sel); }
  function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  function toast(msg) {
    state.toast = msg;
    renderToast();
    setTimeout(function () { state.toast = null; renderToast(); }, 2600);
  }

  function renderToast() {
    var el = $("#o-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "o-toast";
      el.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:9999;background:#1b4332;color:#fff;padding:11px 18px;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(27,67,50,.25);transition:opacity .3s;pointer-events:none;font-family:Inter,sans-serif;";
      document.body.appendChild(el);
    }
    if (!state.toast) { el.style.opacity = "0"; return; }
    el.textContent = state.toast;
    el.style.opacity = "1";
  }

  function getRow(id) {
    return D.replenishment.find(function (r) { return r.id === id; });
  }

  function visibleRows() {
    return D.replenishment.filter(function (r) {
      if (state.snoozed[r.id]) return false;
      if (state.activeTrigger !== "All" && r.trigger !== state.activeTrigger) return false;
      if (state.activeLocation !== "Todos" && state.activeLocation !== "ALM/Stock") return false;
      return true;
    });
  }

  function triggerCounts() {
    var base = D.replenishment.filter(function (r) { return !state.snoozed[r.id]; });
    return {
      All: base.length,
      Auto: base.filter(function (r) { return r.trigger === "Auto"; }).length,
      Manual: base.filter(function (r) { return r.trigger === "Manual"; }).length,
    };
  }

  /* ── SVG CHARTS ── */
  function chartBars(items, w, h) {
    w = w || 320; h = h || 150;
    if (!items.length) return "";
    var max = Math.max.apply(null, items.map(function (x) { return x.v; }).concat([1]));
    var pad = 20, bw = Math.min(28, (w - pad * 2) / items.length - 6);
    var bars = items.map(function (it, i) {
      var bh = Math.max(2, (it.v / max) * (h - 34));
      var x = pad + i * (bw + 6);
      var y = h - 26 - bh;
      var lbl = it.l.length > 7 ? it.l.slice(0, 6) + "…" : it.l;
      return '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + bh + '" rx="5" fill="' + (it.c || "#2d6a4f") + '" opacity=".88"/>' +
        '<text x="' + (x + bw / 2) + '" y="' + (h - 6) + '" text-anchor="middle" fill="#5c6f65" font-size="8" font-weight="600">' + esc(lbl) + '</text>';
    }).join("");
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="o_chart_svg">' + bars + '</svg>';
  }

  function chartDonut(segments, size) {
    size = size || 140;
    var cx = size / 2, cy = size / 2, r = size / 2 - 10;
    var total = segments.reduce(function (s, x) { return s + x.v; }, 0) || 1;
    var angle = -Math.PI / 2;
    var paths = segments.map(function (seg) {
      var a = (seg.v / total) * Math.PI * 2;
      var x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
      angle += a;
      var x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
      var large = a > Math.PI ? 1 : 0;
      return '<path d="M ' + cx + ' ' + cy + ' L ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x2 + ' ' + y2 + ' Z" fill="' + (seg.c || "#2d6a4f") + '"/>';
    }).join("");
    var legend = segments.map(function (seg) {
      return '<span class="o_chart_legend_item"><i style="background:' + seg.c + '"></i>' + esc(seg.l) + " (" + seg.v + ")</span>";
    }).join("");
    return '<div class="o_chart_donut_wrap"><svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '">' +
      paths + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.52) + '" fill="#fff"/></svg><div class="o_chart_legend">' + legend + '</div></div>';
  }

  function chartLine(points, w, h) {
    w = w || 320; h = h || 150;
    if (points.length < 2) return chartBars(points, w, h);
    var max = Math.max.apply(null, points.map(function (p) { return p.v; }));
    var min = Math.min.apply(null, points.map(function (p) { return p.v; }));
    var range = max - min || 1;
    var pad = 18;
    var coords = points.map(function (p, i) {
      var x = pad + i * ((w - pad * 2) / (points.length - 1));
      var y = h - pad - ((p.v - min) / range) * (h - pad * 2);
      return x + "," + y;
    }).join(" ");
    var area = pad + "," + (h - pad) + " " + coords + " " + (w - pad) + "," + (h - pad);
    var dots = points.map(function (p, i) {
      var x = pad + i * ((w - pad * 2) / (points.length - 1));
      var y = h - pad - ((p.v - min) / range) * (h - pad * 2);
      return '<circle cx="' + x + '" cy="' + y + '" r="4" fill="#52b788" stroke="#fff" stroke-width="2"/>';
    }).join("");
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="o_chart_svg"><polygon points="' + area + '" fill="rgba(82,183,136,.14)"/>' +
      '<polyline points="' + coords + '" fill="none" stroke="#2d6a4f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' + dots + '</svg>';
  }

  function chartHBar(items, w, h) {
    w = w || 320; h = h || 150;
    var max = Math.max.apply(null, items.map(function (x) { return x.v; }).concat([1]));
    var bh = Math.min(18, (h - 20) / Math.max(items.length, 1) - 4);
    var bars = items.map(function (it, i) {
      var bw = Math.max(4, (it.v / max) * (w - 90));
      var y = 10 + i * (bh + 6);
      return '<text x="4" y="' + (y + bh * 0.72) + '" fill="#5c6f65" font-size="9" font-weight="600">' + esc(it.l.length > 10 ? it.l.slice(0, 9) + "…" : it.l) + '</text>' +
        '<rect x="82" y="' + y + '" width="' + bw + '" height="' + bh + '" rx="4" fill="' + (it.c || "#2d6a4f") + '" opacity=".88"/>';
    }).join("");
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="o_chart_svg">' + bars + '</svg>';
  }

  function fkWma(s) {
    var n = s.length, tw = n * (n + 1) / 2, sum = 0;
    for (var i = 0; i < n; i++) sum += s[i] * (i + 1);
    return sum / tw;
  }
  function fkSma(s) { var t = 0; s.forEach(function (v) { t += v; }); return t / s.length; }
  function fkEts(s) { return s[s.length - 1] * 0.4 + fkSma(s) * 0.6; }
  function fkProphet(s) {
    return fkWma(s) + ((s[s.length - 1] - s[0]) / s.length) * 2.2;
  }
  function fkDaily(sales, algo, source) {
    var mult = source === "rappi" ? 1.12 : source === "pos" ? 0.94 : 1;
    var fn = { wma: fkWma, sma: fkSma, ets: fkEts, prophet: fkProphet }[algo] || fkWma;
    return Math.round(fn(sales) * mult * 10) / 10;
  }
  function fkProduct() {
    return D.forkast.products.find(function (p) { return p.id === state.forkast.productId; }) || D.forkast.products[0];
  }
  function fkAlgo() {
    return D.forkast.algorithms.find(function (a) { return a.id === state.forkast.algorithm; }) || D.forkast.algorithms[0];
  }
  function fkResult() {
    var p = fkProduct();
    var daily = fkDaily(p.sales, state.forkast.algorithm, state.forkast.source);
    var total = Math.round(daily * state.forkast.period);
    var need = Math.max(0, Math.ceil(total - p.stock + p.min * 0.5));
    var conf = fkAlgo().accuracy + (state.forkast.period > 14 ? -3 : 0);
    return { product: p, daily: daily, total: total, need: need, confidence: conf };
  }
  function chartForecastHist(sales, daily, period, w, h) {
    w = w || 640; h = h || 200;
    var hist = sales.map(function (v, i) { return { v: v }; });
    var proj = [];
    var i;
    for (i = 1; i <= Math.min(period, 14); i++) {
      var bump = state.forkast.algorithm === "prophet" && i % 7 === 0 ? daily * 1.15 : daily;
      proj.push({ v: Math.round(bump * (0.96 + (i % 3) * 0.02) * 10) / 10 });
    }
    var all = hist.concat(proj);
    var max = Math.max.apply(null, all.map(function (x) { return x.v; })) * 1.12 || 1;
    var pad = 28, gw = w - pad * 2, gh = h - 36;
    var split = hist.length;
    var hPts = hist.map(function (it, idx) {
      var x = pad + idx * (gw / (all.length - 1 || 1));
      var y = h - 22 - (it.v / max) * gh;
      return x + "," + y;
    }).join(" ");
    var pPts = proj.map(function (it, idx) {
      var x = pad + (split + idx) * (gw / (all.length - 1 || 1));
      var y = h - 22 - (it.v / max) * gh;
      return x + "," + y;
    }).join(" ");
    var lx = pad + (split - 1) * (gw / (all.length - 1 || 1));
    var ly = h - 22 - (hist[hist.length - 1].v / max) * gh;
    var bridge = lx + "," + ly + " " + (pPts.split(" ")[0] || "");
    var dots = all.map(function (it, idx) {
      var x = pad + idx * (gw / (all.length - 1 || 1));
      var y = h - 22 - (it.v / max) * gh;
      var fc = idx >= split;
      return '<circle cx="' + x + '" cy="' + y + '" r="' + (fc ? 4 : 5) + '" fill="' + (fc ? "#d4a373" : "#2d6a4f") + '"/>';
    }).join("");
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="o_chart_svg o_fk_chart">' +
      '<line x1="' + lx + '" y1="18" x2="' + lx + '" y2="' + (h - 22) + '" stroke="#e2ebe6" stroke-dasharray="4 4"/>' +
      '<text x="' + (lx + 6) + '" y="14" fill="#94a3b8" font-size="9" font-weight="600">Pronóstico →</text>' +
      '<polyline points="' + hPts + '" fill="none" stroke="#2d6a4f" stroke-width="2.5" stroke-linecap="round"/>' +
      '<polyline points="' + bridge + " " + pPts + '" fill="none" stroke="#d4a373" stroke-width="2.5" stroke-dasharray="6 4" stroke-linecap="round"/>' +
      dots + '</svg>';
  }

  function renderReportDashboard(title, kpis, charts, tableHtml) {
    var kpiHtml = kpis.map(function (k) {
      return '<div class="o_report_kpi"><label>' + esc(k.label) + '</label><div class="val">' + esc(k.value) + '</div></div>';
    }).join("");
    var chartsHtml = charts.map(function (c) {
      return '<div class="o_chart_card"><h4>' + esc(c.title) + '</h4>' + c.html + '</div>';
    }).join("");
    return renderNavbar() + renderControlPanel(title) +
      '<div class="o_report_kpis">' + kpiHtml + '</div>' +
      '<div class="o_report_charts">' + chartsHtml + '</div>' +
      (tableHtml ? '<div class="o_report_table">' + tableHtml + '</div>' : '');
  }

  /* ── APP ICONS ── */
  function appIconSvg(type) {
    var c = {
      accounting: ["#d4a373", "#2d6a4f"],
      planning: ["#52b788", "#40916c"],
      inventory: ["#2d6a4f", "#d4a373"],
      purchase: ["#40916c", "#1b4332"],
      sales: ["#bc8a5f", "#2d6a4f", "#52b788"],
      manufacturing: ["#52796f", "#d4a373"],
      crm: ["#52b788", "#2d6a4f"],
      project: ["#40916c", "#d4a373"],
      pos: ["#d4a373", "#2d6a4f"],
      discuss: ["#2d6a4f", "#52b788"],
      documents: ["#bc8a5f", "#40916c"],
      website: ["#40916c", "#52b788"],
    }[type] || ["#2d6a4f", "#52b788"];

    if (type === "accounting") return '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="' + c[0] + '"/><text x="24" y="30" text-anchor="middle" fill="#fff" font-size="18" font-weight="700">%</text></svg>';
    if (type === "planning") return '<svg viewBox="0 0 48 48"><rect x="8" y="10" width="32" height="28" rx="3" fill="' + c[1] + '" opacity=".25"/><rect x="12" y="16" width="8" height="16" rx="2" fill="' + c[0] + '"/><rect x="22" y="12" width="8" height="20" rx="2" fill="' + c[1] + '"/><rect x="32" y="18" width="4" height="14" rx="1" fill="' + c[0] + '"/></svg>';
    if (type === "inventory") return '<svg viewBox="0 0 48 48"><path d="M24 6L42 16V32L24 42L6 32V16Z" fill="' + c[0] + '"/><path d="M24 6V42M6 16L42 32M42 16L6 32" stroke="' + c[1] + '" stroke-width="2" fill="none"/></svg>';
    if (type === "purchase") return '<svg viewBox="0 0 48 48"><path d="M14 12h22l-2 24H16L14 12z" fill="' + c[0] + '"/><path d="M18 12c0-4 3-6 6-6s6 2 6 6" stroke="' + c[1] + '" stroke-width="3" fill="none"/></svg>';
    if (type === "sales") return '<svg viewBox="0 0 48 48"><rect x="12" y="28" width="6" height="14" fill="' + c[2] + '"/><rect x="21" y="18" width="6" height="24" fill="' + c[0] + '"/><rect x="30" y="10" width="6" height="32" fill="' + c[1] + '"/></svg>';
    if (type === "manufacturing") return '<svg viewBox="0 0 48 48"><rect x="8" y="22" width="32" height="18" rx="2" fill="' + c[0] + '"/><polygon points="8,22 14,12 38,12 32,22" fill="' + c[1] + '"/><rect x="18" y="28" width="6" height="8" fill="#fff" opacity=".5"/><rect x="28" y="28" width="6" height="8" fill="#fff" opacity=".5"/></svg>';
    if (type === "crm") return '<svg viewBox="0 0 48 48"><circle cx="18" cy="20" r="8" fill="' + c[0] + '"/><circle cx="32" cy="20" r="8" fill="' + c[1] + '"/><path d="M8 38c0-8 6-12 10-12s10 4 10 12" fill="' + c[0] + '"/><path d="M22 38c0-6 4-10 10-10s10 4 10 10" fill="' + c[1] + '"/></svg>';
    if (type === "project") return '<svg viewBox="0 0 48 48"><rect x="10" y="8" width="28" height="32" rx="3" fill="' + c[1] + '" opacity=".2"/><rect x="14" y="14" width="20" height="4" rx="1" fill="' + c[0] + '"/><rect x="14" y="22" width="14" height="4" rx="1" fill="' + c[1] + '"/><rect x="14" y="30" width="18" height="4" rx="1" fill="' + c[0] + '" opacity=".6"/><circle cx="34" cy="32" r="6" fill="' + c[1] + '"/><path d="M32 32l2 2 4-4" stroke="#fff" stroke-width="2" fill="none"/></svg>';
    if (type === "pos") return '<svg viewBox="0 0 48 48"><rect x="8" y="14" width="32" height="24" rx="3" fill="' + c[0] + '"/><rect x="12" y="18" width="24" height="10" rx="1" fill="#fff" opacity=".9"/><rect x="14" y="32" width="8" height="4" rx="1" fill="' + c[1] + '"/><rect x="26" y="32" width="8" height="4" rx="1" fill="' + c[1] + '"/></svg>';
    if (type === "discuss") return '<svg viewBox="0 0 48 48"><rect x="6" y="10" width="28" height="18" rx="6" fill="' + c[0] + '"/><rect x="14" y="22" width="28" height="16" rx="6" fill="' + c[1] + '"/><circle cx="16" cy="19" r="2" fill="#fff"/><circle cx="24" cy="19" r="2" fill="#fff"/><circle cx="32" cy="19" r="2" fill="#fff"/></svg>';
    if (type === "documents") return '<svg viewBox="0 0 48 48"><path d="M14 6h14l10 10v26a2 2 0 01-2 2H14a2 2 0 01-2-2V8a2 2 0 012-2z" fill="' + c[0] + '"/><path d="M28 6v10h10" fill="' + c[1] + '"/><rect x="16" y="24" width="16" height="3" rx="1" fill="#fff" opacity=".7"/><rect x="16" y="30" width="12" height="3" rx="1" fill="#fff" opacity=".5"/></svg>';
    if (type === "website") return '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18" fill="' + c[0] + '" opacity=".2"/><circle cx="24" cy="24" r="18" stroke="' + c[1] + '" stroke-width="2" fill="none"/><ellipse cx="24" cy="24" rx="8" ry="18" stroke="' + c[1] + '" stroke-width="2" fill="none"/><line x1="6" y1="24" x2="42" y2="24" stroke="' + c[1] + '" stroke-width="2"/></svg>';
    return '<svg viewBox="0 0 48 48"><rect x="10" y="10" width="28" height="28" rx="6" fill="' + c[0] + '"/></svg>';
  }

  function navigate(hash) {
    location.hash = hash;
    parseRoute();
    render();
  }

  function parseRoute() {
    var h = (location.hash || "#home").slice(1);
    if (h === "home" || h === "") {
      state.screen = "home";
      state.app = null;
      return;
    }
    state.screen = "client";
    var parts = h.split("/");
    state.app = parts[0] || "inventory";
    state.view = parts[1] || defaultView(state.app);
  }

  function defaultView(app) {
    var map = {
      inventory: "replenishment", planning: "forecast",
      purchase: "orders", sales: "orders",
    };
    return map[app] || "overview";
  }

  var NAV = {
    inventory: [
      { view: "overview", label: "Resumen" },
      { view: "replenishment", label: "Operaciones" },
      { view: "products", label: "Productos" },
      { view: "reporting", label: "Informes" },
      { view: "features", label: "Configuración" },
    ],
    planning: [
      { view: "forecast", label: "Smart Food AI" },
      { view: "reporting", label: "Informes" },
      { view: "configuration", label: "Configuración" },
      { view: "schedule", label: "Horario Gantt" },
    ],
    purchase: [
      { view: "orders", label: "Pedidos" },
      { view: "products", label: "Productos" },
      { view: "reporting", label: "Informes" },
      { view: "configuration", label: "Configuración" },
    ],
    sales: [
      { view: "orders", label: "Pedidos" },
      { view: "quotations", label: "Cotizaciones" },
      { view: "reporting", label: "Informes" },
      { view: "configuration", label: "Configuración" },
    ],
  };

  function renderNavbar() {
    var items = NAV[state.app] || [];
    var menus = items.map(function (m) {
      var active = state.view === m.view ? " active" : "";
      return '<button class="o_navbar_menu' + active + '" data-view="' + m.view + '">' + esc(m.label) + '</button>';
    }).join("");
    var appName = (D.apps.find(function (a) { return a.id === state.app; }) || {}).name || state.app;
    return '<div class="o_navbar">' +
      '<div class="o_navbar_apps" id="btn-home" title="Menú principal"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" fill="#fff"/><rect x="14" y="3" width="7" height="7" rx="1" fill="#fff"/><rect x="3" y="14" width="7" height="7" rx="1" fill="#fff"/><rect x="14" y="14" width="7" height="7" rx="1" fill="#fff"/></svg></div>' +
      '<div class="o_navbar_brand">' + esc(appName) + '</div>' +
      '<div class="o_navbar_menus">' + menus + '</div>' +
      '<div class="o_navbar_systray"><div class="o_systray_avatar">' + esc(D.user.initials) + '</div></div></div>';
  }

  function renderControlPanel(title, extra) {
    return '<div class="o_control_panel">' + (extra || "") + '<div class="o_cp_title">' + esc(title) + '</div></div>';
  }

  function renderSimpleTable(headers, rows, clickable) {
    var th = headers.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("");
    var tb = rows.map(function (cells) {
      var label = typeof cells[0] === "string" ? cells[0].replace(/<[^>]+>/g, "") : "";
      var trCls = clickable ? ' class="o_click_row"' : "";
      var trToast = clickable ? ' data-toast="📋 ' + esc(label) + ' — detalle demo"' : "";
      return "<tr" + trCls + trToast + ">" + cells.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>";
    }).join("");
    return '<div class="o_content" style="padding:16px"><table class="o_list_table"><thead><tr>' + th + '</tr></thead><tbody>' + tb + '</tbody></table></div>';
  }

  function renderConfigPanel(title, items) {
    var rows = items.map(function (it) {
      return '<tr><td><strong>' + esc(it.label) + '</strong></td><td>' + esc(it.value) + '</td><td><button class="o_btn o_btn_secondary o_btn_sm" data-toast="Configuración guardada">Editar</button></td></tr>';
    }).join("");
    return renderNavbar() + renderControlPanel(title) +
      '<div class="o_content" style="padding:16px"><table class="o_list_table"><thead><tr><th>Ajuste</th><th>Valor</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function renderMarketingBanner(compact) {
    if (compact) {
      return '<div class="o_sf_marketing o_sf_marketing_compact">' +
        '<p><strong>Smart Food AI</strong> — An AI breakthrough for your entire workflow, from purchasing to sales. ' +
        'Precise forecasting, Gantt, POs, production & sales orders, and inventory — all in one platform. ' +
        '<span class="o_sf_marketing_hi">−20% lead times</span> · <span class="o_sf_marketing_hi">−35% storage & waste</span></p></div>';
    }
    return '<div class="o_sf_marketing">' +
      '<div class="o_sf_marketing_copy">' +
      '<span class="o_sf_marketing_tag">Smart Food AI</span>' +
      '<h2>The AI breakthrough for your entire company workflow</h2>' +
      '<p>From <strong>purchasing</strong> to <strong>sales</strong> — run precise demand forecasting on a single all-in-one platform. ' +
      'Adjust your Gantt, manage purchase orders, production orders, sales orders, and inventory to prevent stockouts and delays.</p>' +
      '</div>' +
      '<div class="o_sf_marketing_stats">' +
      '<div class="o_sf_stat"><div class="o_sf_stat_val">−20%</div><div class="o_sf_stat_lbl">Lead times</div></div>' +
      '<div class="o_sf_stat"><div class="o_sf_stat_val">−35%</div><div class="o_sf_stat_lbl">Storage & waste</div></div>' +
      '<div class="o_sf_stat"><div class="o_sf_stat_val">1</div><div class="o_sf_stat_lbl">All-in-one platform</div></div>' +
      '</div></div>';
  }

  function renderHome() {
    var apps = D.apps.map(function (a) {
      return '<button class="app-tile" data-app="' + a.id + '">' +
        '<div class="app-icon">' + appIconSvg(a.icon) + '</div>' +
        '<span class="app-name">' + esc(a.name) + '</span></button>';
    }).join("");
    return '<div id="screen-home">' +
      '<div class="home-top"><div class="home-logo"><span>Smart</span> Food</div>' +
      '<div class="home-user"><span>' + esc(D.user.company) + '</span>' +
      '<div class="home-avatar">' + esc(D.user.initials) + '</div></div></div>' +
      renderMarketingBanner(false) +
      '<div class="apps-grid">' + apps + '</div>' +
      '<div class="home-footer"><span>Demo · Smart Food</span></div></div>';
  }

  function renderSearchPanel() {
    if (state.view !== "replenishment") return "";
    var counts = triggerCounts();
    var locs = D.locations[0];
    var visible = visibleRows().length;

    function tree(node) {
      var count = node.name === "Todos" ? visible : (node.name === "ALM/Stock" ? visible : "");
      var html = '<div class="o_sp_item' + (node.name === state.activeLocation ? " active" : "") + '" data-loc="' + esc(node.name) + '">' +
        esc(node.name) + (count !== "" ? '<span class="count">' + count + '</span>' : '') + '</div>';
      if (node.children) {
        html += '<div class="o_sp_tree">' + node.children.map(tree).join("") + '</div>';
      }
      return html;
    }

    var triggers = ["All", "Auto", "Manual"].map(function (name) {
      return '<div class="o_sp_item' + (name === state.activeTrigger ? " active" : "") + '" data-trigger="' + name + '">' +
        TRIGGER_ES[name] + '<span class="count">' + counts[name] + '</span></div>';
    }).join("");

    return '<div class="o_search_panel"><div class="o_sp_section">Ubicaciones</div>' + tree(locs) +
      '<div class="o_sp_section" style="margin-top:16px">Disparador</div>' + triggers + '</div>';
  }

  function renderReplenishment() {
    var rows = visibleRows();
    var selectedCount = Object.keys(state.selectedRows).filter(function (k) { return state.selectedRows[k]; }).length;

    var tbody = rows.map(function (r) {
      var toOrder = D.calcToOrder(r);
      var sel = state.selectedRows[r.id] ? " selected" : "";
      var fcClass = r.forecast < 0 ? " o_num negative" : " o_num";
      var chart = r.chart ? '<button class="o_chart_btn' + (r.warn ? " warn" : "") + '" data-info="' + r.id + '" title="Informe de pronóstico">📈</button>' : "";
      return '<tr class="' + sel + '" data-id="' + r.id + '">' +
        '<td><input type="checkbox"' + (state.selectedRows[r.id] ? " checked" : "") + ' data-check="' + r.id + '"></td>' +
        '<td><strong>' + esc(r.product) + '</strong></td>' +
        '<td>' + esc(r.location) + '</td>' +
        '<td class="o_num">' + r.onHand.toFixed(2) + '</td>' +
        '<td class="' + fcClass.trim() + '">' + r.forecast.toFixed(2) + ' ' + chart + '</td>' +
        '<td class="o_route">' + esc(r.route) + '</td>' +
        '<td class="o_num">' + r.min + '</td>' +
        '<td class="o_num">' + r.max + '</td>' +
        '<td class="o_num"><strong>' + toOrder + '</strong></td>' +
        '<td><div class="o_actions_cell">' +
        (toOrder > 0 ? '<a class="o_link" data-action="order" data-id="' + r.id + '">Ordenar</a>' : '') +
        (toOrder > 0 && r.trigger !== "Auto" ? '<a class="o_link" data-action="automate" data-id="' + r.id + '">Automatizar</a>' : '') +
        (r.trigger === "Manual" ? '<a class="o_link" data-action="snooze" data-id="' + r.id + '">Posponer</a>' : '') +
        '</div></td></tr>';
    }).join("");

    return renderNavbar() +
      '<div class="o_control_panel"><div class="o_cp_buttons">' +
      '<button class="o_btn o_btn_primary">Nuevo</button>' +
      '<button class="o_btn o_btn_secondary" data-bulk="order">Pedir</button>' +
      '<button class="o_btn o_btn_secondary" data-bulk="snooze">Posponer</button>' +
      '<button class="o_btn o_btn_secondary">Pedir al máximo</button>' +
      (selectedCount ? '<span class="o_selected_badge" id="clear-selected">' + selectedCount + ' seleccionados ✕</span><button class="o_btn o_btn_secondary">Acciones ▾</button>' : '') +
      '</div><div class="o_cp_title">Reabastecimiento</div>' +
      '<div class="o_cp_pager"><button>‹</button><span>1-' + rows.length + ' / ' + rows.length + '</span><button>›</button></div></div>' +
      '<div class="o_content_wrap">' + renderSearchPanel() +
      '<div class="o_content"><table class="o_list_table"><thead><tr>' +
      '<th></th><th>Producto</th><th>Ubicación</th><th>Existencias</th><th>Pronóstico</th><th>Ruta</th><th>Mín</th><th>Máx</th><th>A pedir</th><th></th>' +
      '</tr></thead><tbody>' + (tbody || '<tr><td colspan="10" style="text-align:center;padding:40px;color:#999">No hay reabastecimientos pendientes</td></tr>') + '</tbody></table></div></div>';
  }

  function renderInventoryOverview() {
    var needOrder = D.replenishment.filter(function (r) { return D.calcToOrder(r) > 0 && !state.snoozed[r.id]; }).length;
    return renderNavbar() +
      '<div class="o_control_panel"><div class="o_cp_title">Resumen</div></div>' +
      '<div class="o_kanban_grid">' +
      '<div class="o_kanban_card" data-goto="inventory/replenishment"><h3>Reabastecimiento</h3><p>Propuestas inteligentes según pronósticos de inventario.</p><div class="o_kanban_stat">' + needOrder + ' por reordenar</div></div>' +
      '<div class="o_kanban_card" data-goto="inventory/reporting"><h3>Informe pronosticado</h3><p>Existencias, entradas y salidas en tiempo real.</p><div class="o_kanban_stat">' + D.replenishment.length + ' productos</div></div>' +
      '<div class="o_kanban_card" data-toast="📦 3 recepciones pendientes — demo interactivo"><h3>Operaciones</h3><p>Recepciones, entregas y transferencias internas.</p><div class="o_kanban_stat">3 pendientes</div></div>' +
      '<div class="o_kanban_card" data-goto="inventory/products"><h3>Productos</h3><p>Gestiona productos almacenables y categorías.</p><div class="o_kanban_stat">' + D.products.length + ' ítems</div></div></div>';
  }

  function invStatus(r) {
    if (r.forecast < 0) return "Déficit";
    if (r.onHand < r.min) return "Bajo";
    return "OK";
  }

  function renderReporting() {
    var ok = 0, low = 0, deficit = 0;
    D.replenishment.forEach(function (r) {
      var s = invStatus(r);
      if (s === "OK") ok++; else if (s === "Bajo") low++; else deficit++;
    });
    var topStock = D.replenishment.slice(0, 6).map(function (r) {
      return { l: r.product.split("] ")[1] || r.product, v: r.onHand, c: r.forecast < 0 ? "#c1121f" : "#2d6a4f" };
    });
    var forecastTrend = D.replenishment.slice(0, 7).map(function (r, i) {
      return { l: "P" + (i + 1), v: Math.max(0, r.forecast + r.onHand) };
    });
    var rows = D.replenishment.map(function (r) {
      var toOrder = D.calcToOrder(r);
      var status = invStatus(r);
      return '<tr><td><strong>' + esc(r.product) + '</strong></td><td class="o_num">' + r.onHand + '</td><td class="o_num' + (r.forecast < 0 ? " negative" : "") + '">' + r.forecast + '</td><td class="o_num">' + toOrder + '</td><td>' + status + '</td></tr>';
    }).join("");
    var table = '<table class="o_list_table"><thead><tr><th>Producto</th><th>Existencias</th><th>Pronóstico</th><th>A pedir</th><th>Estado</th></tr></thead><tbody>' + rows + '</tbody></table>';
    return renderReportDashboard("Informe pronosticado", [
      { label: "Productos", value: String(D.replenishment.length) },
      { label: "En déficit", value: String(deficit) },
      { label: "Stock bajo", value: String(low) },
      { label: "Nivel OK", value: String(ok) },
    ], [
      { title: "Existencias por producto", html: chartBars(topStock) },
      { title: "Estado del inventario", html: chartDonut([
        { l: "OK", v: ok, c: "#2d6a4f" }, { l: "Bajo", v: low, c: "#e09f3e" }, { l: "Déficit", v: deficit, c: "#c1121f" },
      ]) },
      { title: "Tendencia pronosticada", html: chartLine(forecastTrend) },
      { title: "Pedidos sugeridos", html: chartHBar(D.replenishment.filter(function (r) { return D.calcToOrder(r) > 0; }).slice(0, 5).map(function (r) {
        return { l: r.product.split("] ")[1] || r.product, v: D.calcToOrder(r), c: "#40916c" };
      })) },
    ], table);
  }

  function renderProducts() {
    var rows = D.products.map(function (p) {
      return '<tr class="o_click_row" data-toast="📦 ' + esc(p.name) + ' · ' + p.onHand + ' en stock · S/ ' + p.cost.toFixed(2) + ' costo">' +
        '<td><strong>' + esc(p.name) + '</strong></td><td>' + esc(p.category) + '</td>' +
        '<td class="o_num">' + p.onHand + '</td><td class="o_num' + (p.forecast < 0 ? " negative" : "") + '">' + p.forecast + '</td>' +
        '<td class="o_num">S/ ' + p.cost.toFixed(2) + '</td><td class="o_num">' + (p.price ? "S/ " + p.price.toFixed(2) : "—") + '</td></tr>';
    }).join("");
    return renderNavbar() +
      '<div class="o_control_panel"><button class="o_btn o_btn_primary" data-toast="Producto creado — demo">Nuevo</button><div class="o_cp_title">Productos</div>' +
      '<div class="o_cp_search">🔍 <input placeholder="Buscar..." id="product-search"></div></div>' +
      '<div class="o_content"><table class="o_list_table" id="products-table"><thead><tr><th>Producto</th><th>Categoría</th><th>Existencias</th><th>Pronóstico</th><th>Costo</th><th>Precio</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function renderFeatures() {
    return renderNavbar() +
      '<div class="o_feature_page"><h1>Reabastecimiento</h1><div class="o_feature_grid">' +
      '<div class="o_feature_item"><h3>Pronóstico</h3><p>Informes de existencias, entradas y salidas en tiempo real.</p></div>' +
      '<div class="o_feature_item"><h3>Órdenes de compra</h3><p>Crea solicitudes automáticamente cuando el stock cae bajo el umbral.</p></div>' +
      '<div class="o_feature_item"><h3>Reglas de reorden</h3><p>Dispara compras y fabricación según niveles mín/máx.</p></div>' +
      '<div class="o_feature_item"><h3>Tiempos de entrega</h3><p>Gestiona inventario JIT con planificación integrada.</p></div>' +
      '</div></div>';
  }

  function renderFkLoader() {
    var algo = fkAlgo();
    return '<div class="o_fk_ai_loader">' +
      '<div class="o_fk_ai_orb"><div class="o_fk_ai_ring"></div><div class="o_fk_ai_core">🧠</div></div>' +
      '<h3>Generando Forkast con IA</h3>' +
      '<p class="o_fk_ai_status" id="fk-ai-status">Analizando historial de ventas...</p>' +
      '<div class="o_fk_ai_progress"><div class="o_fk_ai_progress_bar"></div></div>' +
      '<div class="o_fk_ai_tags"><span>' + esc(algo.name.split("(")[0].trim()) + '</span><span>Patty Pastelería</span><span>Smart Food IA</span></div></div>';
  }

  function startFkGenerate() {
    state.forkast.generating = true;
    state.forkast.generated = false;
    render();
    var msgs = [
      "📊 Leyendo ventas de Patty Pastelería...",
      "🧠 Entrenando " + fkAlgo().name + "...",
      "📈 Proyectando " + state.forkast.period + " días...",
      "✨ Calculando accionables de compra/producción...",
    ];
    var idx = 0;
    var iv = setInterval(function () {
      var el = document.getElementById("fk-ai-status");
      if (el && idx < msgs.length) el.textContent = msgs[idx++];
    }, 620);
    setTimeout(function () {
      clearInterval(iv);
      state.forkast.generating = false;
      state.forkast.generated = true;
      state.forkast.step = 4;
      var res = fkResult();
      toast("¡Pronóstico listo! " + res.daily + " " + fkProduct().unit + "/día");
      render();
    }, 2600);
  }

  function fkGoStep(n, silent) {
    if (state.forkast.generating) return;
    state.forkast.step = n;
    if (n < 4) state.forkast.generated = false;
    if (!silent) render();
  }

  function renderPlanningForecast() {
    var fk = state.forkast;
    var p = fkProduct();
    var algo = fkAlgo();
    var r = fk.generated ? fkResult() : null;
    var periodLabel = (D.forkast.periods.find(function (x) { return x.id === fk.period; }) || {}).label || fk.period + " días";

    var stepMeta = [
      { n: 1, t: "Producto y ventas" },
      { n: 2, t: "Algoritmo ML" },
      { n: 3, t: "Periodo y generar" },
      { n: 4, t: "Resultados" },
    ];
    var stepsHtml = stepMeta.map(function (s) {
      var cls = "o_fk_step";
      if (s.n < fk.step || (fk.generated && s.n <= 4)) cls += " done";
      if (s.n === fk.step && !fk.generating) cls += " active";
      var clickable = s.n <= fk.step && !fk.generating;
      return '<button type="button" class="' + cls + '"' + (clickable ? ' data-fk-goto-step="' + s.n + '"' : ' disabled') + '>' +
        '<span class="o_fk_step_n">' + (s.n < fk.step || (fk.generated && s.n < 4) ? "✓" : s.n) + '</span><span>' + s.t + '</span></button>';
    }).join("");

    var prodOpts = D.forkast.products.map(function (pr) {
      return '<option value="' + pr.id + '"' + (fk.productId === pr.id ? " selected" : "") + '>' + esc(pr.name) + " (" + pr.unit + ")</option>";
    }).join("");
    var srcOpts = D.forkast.salesSources.map(function (s) {
      return '<option value="' + s.id + '"' + (fk.source === s.id ? " selected" : "") + '>' + esc(s.label) + '</option>';
    }).join("");
    var periodOpts = D.forkast.periods.map(function (pe) {
      return '<option value="' + pe.id + '"' + (fk.period === pe.id ? " selected" : "") + '>' + esc(pe.label) + '</option>';
    }).join("");

    var algoCards = D.forkast.algorithms.map(function (a) {
      var sel = fk.algorithm === a.id ? " selected" : "";
      return '<button type="button" class="o_fk_algo' + sel + '" data-fk-algo="' + a.id + '">' +
        '<strong>' + esc(a.name) + '</strong><span>' + esc(a.desc) + '</span>' +
        '<em>Precisión demo: ' + a.accuracy + '%</em></button>';
    }).join("");

    var salesPreview = p.sales.map(function (v, i) {
      return '<span class="o_fk_sale_chip">D' + (i + 1) + ': <b>' + v + '</b></span>';
    }).join("");

    var wizardBody = "";
    if (fk.generating) {
      wizardBody = renderFkLoader();
    } else if (fk.step === 1) {
      wizardBody = '<div class="o_fk_wizard_panel o_fk_slide">' +
        '<div class="o_fk_step_hd"><span class="o_fk_step_badge">Paso 1 de 4</span><h3>Selecciona producto y fuente de ventas</h3></div>' +
        '<div class="o_fk_step_body">' +
        '<label class="o_fk_lbl">Producto</label><select class="o_fk_sel" id="fk-product">' + prodOpts + '</select>' +
        '<label class="o_fk_lbl">Fuente de ventas</label><select class="o_fk_sel" id="fk-source">' + srcOpts + '</select>' +
        '<div class="o_fk_sales_prev">' + salesPreview + '</div>' +
        '<p class="o_fk_hint">💡 Al elegir producto o canal avanzas al siguiente paso</p></div></div>';
    } else if (fk.step === 2) {
      wizardBody = '<div class="o_fk_wizard_panel o_fk_slide">' +
        '<div class="o_fk_step_hd"><span class="o_fk_step_badge">Paso 2 de 4</span><h3>Elige algoritmo de machine learning</h3>' +
        '<p class="o_fk_step_sub">Producto: <strong>' + esc(p.name) + '</strong> · ' + esc((D.forkast.salesSources.find(function (x) { return x.id === fk.source; }) || {}).label || "") + '</p></div>' +
        '<div class="o_fk_algos o_fk_algos_wide">' + algoCards + '</div>' +
        '<p class="o_fk_hint">💡 Toca un algoritmo para continuar</p></div>';
    } else if (fk.step === 3) {
      wizardBody = '<div class="o_fk_wizard_panel o_fk_slide">' +
        '<div class="o_fk_step_hd"><span class="o_fk_step_badge">Paso 3 de 4</span><h3>Define el periodo y genera el Forkast</h3>' +
        '<p class="o_fk_step_sub">Modelo: <strong>' + esc(algo.name) + '</strong> · ' + esc(p.name) + '</p></div>' +
        '<label class="o_fk_lbl">Periodo de proyección</label><select class="o_fk_sel o_fk_sel_lg" id="fk-period">' + periodOpts + '</select>' +
        '<div class="o_fk_gen_wrap"><button type="button" class="o_fk_gen_btn" id="fk-generate">' +
        '<span class="o_fk_gen_icon">✨</span><span class="o_fk_gen_txt"><strong>Generar Forkast con IA</strong><em>Pronóstico + accionables para Patty Pastelería</em></span></button></div></div>';
    } else if (fk.step === 4 && fk.generated) {
      var buyDate = fk.period <= 7 ? "22 May" : fk.period <= 14 ? "25 May" : "5 Jun";
      var prodDate = fk.period <= 7 ? "21 May" : "24 May";
      wizardBody = '<div class="o_fk_wizard_panel o_fk_results">' +
        '<div class="o_fk_step_hd"><span class="o_fk_step_badge done">Paso 4 · Completado</span><h3>Resultados del pronóstico</h3></div>' +
        '<div class="o_fk_kpis">' +
        '<div class="o_fk_kpi pop"><label>Demanda diaria</label><div class="val">' + r.daily + ' ' + esc(p.unit) + '</div></div>' +
        '<div class="o_fk_kpi pop"><label>Total periodo</label><div class="val">' + r.total + ' ' + esc(p.unit) + '</div></div>' +
        '<div class="o_fk_kpi pop"><label>Confianza</label><div class="val">' + r.confidence + '%</div></div>' +
        '<div class="o_fk_kpi pop"><label>Inversión est.</label><div class="val">S/ ' + (r.need * p.cost).toFixed(0) + '</div></div></div>' +
        '<div class="o_fk_chart_wrap pop">' + chartForecastHist(p.sales, r.daily, fk.period) +
        '<div class="o_fk_legend"><span><i style="background:#2d6a4f"></i>Histórico 7d</span><span><i style="background:#d4a373"></i>' + esc(periodLabel) + '</span></div></div>' +
        '<div class="o_fk_actions pop"><h3>Accionables · Patty Pastelería</h3><div class="o_fk_action_grid">' +
        (p.route === "Comprar"
          ? '<div class="o_fk_action buy"><div class="o_fk_action_ico">🛒</div><div><strong>Comprar stock</strong><p>Pedir <b>' + r.need + " " + esc(p.unit) + '</b> a ' + esc(p.supplier || "proveedor") + '</p><p class="o_fk_when">⏰ Antes del ' + buyDate + '</p><button class="o_btn o_btn_primary o_btn_sm" data-fk-action="buy">Crear OC demo</button></div></div>'
          : '<div class="o_fk_action make"><div class="o_fk_action_ico">🏭</div><div><strong>Producir</strong><p>Fabricar <b>' + r.need + " " + esc(p.unit) + '</b> en ' + esc(p.resource) + '</p><p class="o_fk_when">⏰ ' + prodDate + ' · turno mañana</p><button class="o_btn o_btn_primary o_btn_sm" data-fk-action="produce">Programar OF demo</button></div></div>') +
        '<div class="o_fk_action alert"><div class="o_fk_action_ico">📦</div><div><strong>Inventario</strong><p>Stock: <b>' + p.stock + " " + esc(p.unit) + '</b></p><button class="o_btn o_btn_secondary o_btn_sm" data-goto="inventory/replenishment">Ver inventario</button></div></div>' +
        '<div class="o_fk_action sync"><div class="o_fk_action_ico">📅</div><div><strong>Gantt</strong><p>Sincronizar turnos de horno</p><button class="o_btn o_btn_secondary o_btn_sm" data-goto="planning/schedule">Ver horario</button></div></div>' +
        '</div></div>' +
        renderMarketingBanner(true) +
        '<button type="button" class="o_btn o_btn_outline o_fk_reset" id="fk-reset">↻ Nuevo pronóstico</button></div>';
    }

    return renderNavbar() +
      '<div class="o_control_panel">' +
      (fk.step > 1 && !fk.generating && !fk.generated ? '<button class="o_btn o_btn_secondary" id="fk-back">← Atrás</button>' : '') +
      '<div class="o_cp_title">Smart Food AI · Planning</div></div>' +
      '<div class="o_fk_wrap">' +
      renderMarketingBanner(state.forkast.step === 1 && !state.forkast.generating ? false : true) +
      '<div class="o_fk_header"><div><h2>Demand forecasting</h2><p>Guided flow for <strong>Patty Pastelería</strong> — complete each step to generate your AI-powered forecast</p></div>' +
      '<span class="o_fk_badge">' + (fk.generating ? "⚡ Generando..." : fk.generated ? "✓ Listo" : "Paso " + fk.step + "/4") + '</span></div>' +
      '<div class="o_fk_steps">' + stepsHtml + '</div>' +
      wizardBody +
      '</div>';
  }

  function renderPlanningSchedule() {
    var days = D.planning.days;
    var header = '<div class="o_gantt_header"><div></div>' + days.map(function (d) { return '<div>' + esc(d) + '</div>'; }).join("") + '</div>';
    var rows = D.planning.resources.map(function (res) {
      var shifts = D.planning.shifts.filter(function (s) { return s.resource === res; });
      var cells = "";
      for (var di = 0; di < days.length; di++) {
        var active = shifts.find(function (s) { return di >= s.start && di < s.start + s.span; });
        if (active && di !== active.start) continue;
        if (active) {
          cells += '<div class="o_gantt_cell o_gantt_cell_span" style="grid-column:span ' + active.span + '"><div class="o_gantt_bar" data-toast="Turno: ' + esc(active.label) + ' — clic para editar (demo)" style="background:' + active.color + ';cursor:pointer">' + esc(active.label) + '</div></div>';
        } else {
          cells += '<div class="o_gantt_cell"></div>';
        }
      }
      return '<div class="o_gantt_row"><div class="o_gantt_resource">' + esc(res) + '</div>' + cells + '</div>';
    }).join("");
    return renderNavbar() +
      '<div class="o_control_panel"><button class="o_btn o_btn_primary" data-toast="Turno creado">Nuevo</button><div class="o_cp_title">Horario Gantt · Producción</div>' +
      '<div class="o_cp_pager"><button data-toast="Semana anterior">‹</button><span>Semana 20</span><button data-toast="Semana siguiente">›</button></div></div>' +
      '<div class="o_gantt">' + header + rows + '</div>';
  }

  function renderPlanningReporting() {
    if (!D.planningReport) return renderPlanningSchedule();
    var utilData = D.planningReport.map(function (r) {
      return { l: r.resource, v: parseInt(r.utilized, 10) || 0, c: "#2d6a4f" };
    });
    var rows = D.planningReport.map(function (r) {
      return '<tr><td><strong>' + esc(r.resource) + '</strong></td><td>' + esc(r.planned) + '</td><td>' + esc(r.utilized) + '</td><td class="o_num' + (r.conflicts ? " negative" : "") + '">' + (r.conflicts || 0) + '</td></tr>';
    }).join("");
    var table = '<table class="o_list_table"><thead><tr><th>Recurso</th><th>Horas planificadas</th><th>Utilización</th><th>Conflictos</th></tr></thead><tbody>' + rows + '</tbody></table>';
    return renderReportDashboard("Análisis de planificación", [
      { label: "Recursos", value: String(D.planningReport.length) },
      { label: "Utilización media", value: "79%" },
      { label: "Conflictos", value: "1" },
      { label: "Turnos activos", value: String(D.planning.shifts.length) },
    ], [
      { title: "Utilización por recurso (%)", html: chartBars(utilData) },
      { title: "Carga semanal", html: chartLine([{ v: 72 }, { v: 78 }, { v: 85 }, { v: 79 }, { v: 92 }, { v: 68 }, { v: 60 }].map(function (x, i) { return { l: D.planning.days[i] ? D.planning.days[i].slice(0, 3) : "", v: x.v }; })) },
      { title: "Horas planificadas", html: chartHBar(D.planningReport.map(function (r) {
        return { l: r.resource, v: parseInt(r.planned, 10) || 0, c: "#52b788" };
      })) },
      { title: "Distribución de tareas", html: chartDonut(D.planning.shifts.map(function (s, i) {
        return { l: s.label, v: s.span, c: ["#2d6a4f", "#52b788", "#d4a373", "#40916c", "#52796f", "#1b4332"][i % 6] };
      })) },
    ], table);
  }

  function renderPlanningConfiguration() {
    return renderConfigPanel("Configuración de planificación", D.planningConfig);
  }

  function renderSales() {
    if (state.view === "quotations") {
      var rows = D.sales.filter(function (s) { return s.status === "Cotización"; }).map(function (s) {
        return [esc(s.customer), esc(s.order), esc(s.date), esc(s.total), '<span class="o_badge o_badge_rfq">' + esc(s.status) + '</span>'];
      });
      return renderNavbar() + renderControlPanel("Cotizaciones", '<button class="o_btn o_btn_primary" data-toast="Cotización creada">Nuevo</button>') +
        renderSimpleTable(["Cliente", "Pedido", "Fecha", "Total", "Estado"], rows, true);
    }
    if (state.view === "reporting") {
      return renderReportDashboard("Análisis de ventas", [
        { label: "Ventas totales", value: "S/ 2,750" }, { label: "Pedidos", value: "3" }, { label: "Ticket promedio", value: "S/ 917" }, { label: "Cotizaciones", value: "1" },
      ], [
        { title: "Ventas por cliente (S/)", html: chartBars(D.sales.map(function (s) {
          return { l: s.customer.split(" ")[0], v: parseInt(s.total.replace(/\D/g, ""), 10) || 0, c: "#bc8a5f" };
        })) },
        { title: "Estado de pedidos", html: chartDonut([
          { l: "Confirmados", v: 2, c: "#2d6a4f" }, { l: "Cotizaciones", v: 1, c: "#d4a373" },
        ]) },
        { title: "Tendencia semanal", html: chartLine([{ v: 680 }, { v: 920 }, { v: 1150 }, { v: 890 }, { v: 1020 }, { v: 750 }, { v: 980 }].map(function (x, i) {
          return { l: ["L", "M", "X", "J", "V", "S", "D"][i], v: x.v };
        })) },
        { title: "Top productos vendidos", html: chartHBar([
          { l: "Pan de molde", v: 42, c: "#40916c" }, { l: "Croissants", v: 35, c: "#52b788" }, { l: "Tarta manzana", v: 28, c: "#2d6a4f" }, { l: "Cupcakes", v: 22, c: "#d4a373" },
        ]) },
      ]);
    }
    if (state.view === "configuration") {
      return renderConfigPanel("Configuración de ventas", [
        { label: "Lista de precios", value: "Precios públicos" }, { label: "Validez cotización", value: "30 días" },
      ]);
    }
    var rows = D.sales.map(function (s) {
      return [esc(s.customer), esc(s.order), esc(s.date), esc(s.total), '<span class="o_badge o_badge_posted">' + esc(s.status) + '</span>'];
    });
    return renderNavbar() + renderControlPanel("Pedidos de venta", '<button class="o_btn o_btn_primary" data-toast="Pedido creado">Nuevo</button>') +
      renderSimpleTable(["Cliente", "Pedido", "Fecha", "Total", "Estado"], rows, true);
  }

  function renderManufacturing() {
    if (state.view === "planning") return renderPlanningSchedule();
    if (state.view === "reporting") {
      return renderReportDashboard("Análisis de fabricación", [
        { label: "OF en progreso", value: "1" }, { label: "Unidades producidas", value: "224" }, { label: "Eficiencia", value: "87%" }, { label: "Terminadas", value: "1" },
      ], [
        { title: "Producción por producto", html: chartBars(D.manufacturing.map(function (m) {
          return { l: m.product.split("] ")[1] || m.product, v: m.qty, c: "#52796f" };
        })) },
        { title: "Estado de órdenes", html: chartDonut([
          { l: "En progreso", v: 1, c: "#d4a373" }, { l: "Confirmado", v: 1, c: "#52b788" }, { l: "Terminado", v: 1, c: "#2d6a4f" },
        ]) },
        { title: "Rendimiento semanal", html: chartLine([{ v: 65 }, { v: 72 }, { v: 78 }, { v: 87 }, { v: 82 }, { v: 90 }, { v: 85 }].map(function (x, i) {
          return { l: ["L", "M", "X", "J", "V", "S", "D"][i], v: x.v };
        })) },
        { title: "Tiempo por recurso (h)", html: chartHBar(D.planningReport.map(function (r) {
          return { l: r.resource, v: parseInt(r.planned, 10) || 0, c: "#40916c" };
        })) },
      ]);
    }
    if (state.view === "configuration") {
      return renderConfigPanel("Configuración de fabricación", [
        { label: "Lista de materiales", value: "Auto-selección" }, { label: "Controles de calidad", value: "Activado" },
      ]);
    }
    var rows = D.manufacturing.map(function (m) {
      return ['<strong>' + esc(m.product) + '</strong>', esc(m.mo), String(m.qty), '<span class="o_badge o_badge_rfq">' + esc(m.status) + '</span>'];
    });
    return renderNavbar() + renderControlPanel("Órdenes de fabricación", '<button class="o_btn o_btn_primary" data-toast="OF creada">Nuevo</button>') +
      renderSimpleTable(["Producto", "Referencia OF", "Cantidad", "Estado"], rows);
  }

  function renderAccountingView() {
    if (state.view === "customers") {
      return renderNavbar() + renderControlPanel("Clientes") + renderSimpleTable(["Cliente", "Por cobrar", "Estado"], [
        ["Café Lima Centro", "S/ 680", "Activo"], ["Bodega San Isidro", "S/ 920", "Activo"],
      ]);
    }
    if (state.view === "vendors") {
      return renderNavbar() + renderControlPanel("Proveedores") + renderSimpleTable(["Proveedor", "Por pagar", "Estado"], [
        ["Distribuidora Lácteos SAC", "S/ 1,240", "Activo"], ["Molinos del Perú", "S/ 750", "Borrador"],
      ]);
    }
    if (state.view === "journals") {
      var rows = D.accounting.journals.map(function (j) {
        return [esc(j.name), String(j.count), esc(j.amount)];
      });
      return renderNavbar() + renderControlPanel("Diarios") + renderSimpleTable(["Diario", "Asientos", "Saldo"], rows);
    }
    if (state.view === "reporting") {
      var rc = D.accounting.reportCharts;
      return renderReportDashboard("Informes contables", [
        { label: "PyG", value: "S/ 8,420" }, { label: "Balance", value: "S/ 24,100" }, { label: "Margen", value: "32%" }, { label: "Flujo caja", value: "+8%" },
      ], [
        { title: "Ingresos mensuales (S/)", html: chartLine(rc.revenue) },
        { title: "Estructura de gastos (%)", html: chartDonut(rc.expenses.map(function (e) { return { l: e.l, v: e.v, c: e.c }; })) },
        { title: "Gastos por categoría", html: chartBars(rc.expenses) },
        { title: "Saldo por diario", html: chartHBar(D.accounting.journals.map(function (j) {
          return { l: j.name.split(" ")[0], v: parseInt(j.amount.replace(/\D/g, ""), 10) / 100 || 0, c: "#2d6a4f" };
        })) },
      ]);
    }
    if (state.view === "configuration") {
      return renderConfigPanel("Configuración contable", [
        { label: "Año fiscal", value: "Ene – Dic" }, { label: "Moneda", value: "PEN (S/)" },
      ]);
    }
    return renderAccounting();
  }

  function renderPurchaseView() {
    if (state.view === "products") return renderProducts();
    if (state.view === "reporting") {
      return renderReportDashboard("Análisis de compras", [
        { label: "Total OC", value: "S/ 2,550" }, { label: "RFQ pendientes", value: "2" }, { label: "Proveedores", value: "3" }, { label: "Ahorro negociado", value: "5%" },
      ], [
        { title: "Compras por proveedor (S/)", html: chartBars(D.purchase.map(function (p) {
          return { l: p.vendor.split(" ")[0], v: parseInt(p.total.replace(/\D/g, ""), 10) || 0, c: "#40916c" };
        })) },
        { title: "Estado de solicitudes", html: chartDonut([
          { l: "RFQ enviada", v: 1, c: "#52b788" }, { l: "Orden confirmada", v: 1, c: "#2d6a4f" }, { l: "Solicitud", v: 1, c: "#d4a373" },
        ]) },
        { title: "Gasto mensual", html: chartLine([{ v: 1800 }, { v: 2100 }, { v: 1950 }, { v: 2300 }, { v: 2550 }].map(function (x, i) {
          return { l: ["Ene", "Feb", "Mar", "Abr", "May"][i], v: x.v };
        })) },
        { title: "Top materias primas", html: chartHBar([
          { l: "Harina", v: 45, c: "#2d6a4f" }, { l: "Leche", v: 38, c: "#40916c" }, { l: "Chocolate", v: 22, c: "#52796f" }, { l: "Huevos", v: 18, c: "#52b788" },
        ]) },
      ]);
    }
    if (state.view === "configuration") {
      return renderConfigPanel("Configuración de compras", [
        { label: "Pago proveedor", value: "30 días" }, { label: "RFQ automática", value: "Activado" },
      ]);
    }
    return renderPurchase();
  }

  function renderPlaceholderApp() {
    var ph = D.placeholders[state.app];
    if (!ph) {
      return renderNavbar() + '<div class="o_content" style="padding:40px;text-align:center;color:var(--o-muted)">Vista demo</div>';
    }
    if (state.view === "configuration") {
      return renderConfigPanel("Configuración de " + ((D.apps.find(function (a) { return a.id === state.app; }) || {}).name || state.app), [
        { label: "Modo demo", value: "Activado" }, { label: "Notificaciones", value: "Activadas" },
      ]);
    }
    if (state.view === "reporting") {
      var keys = Object.keys(ph.rows[0]);
      var numKey = keys.find(function (k) { return typeof ph.rows[0][k] === "string" && ph.rows[0][k].indexOf("S/") >= 0; }) || keys[1];
      return renderReportDashboard("Informe · " + ph.title, [
        { label: "Registros", value: String(ph.rows.length) }, { label: "Esta semana", value: "+12%" }, { label: "Activos", value: String(ph.rows.length) }, { label: "Nuevos", value: "2" },
      ], [
        { title: "Actividad reciente", html: chartBars(ph.rows.map(function (r, i) {
          var v = parseInt(String(r[numKey] || r[keys[1]]).replace(/\D/g, ""), 10) || (ph.rows.length - i) * 10;
          return { l: String(r[keys[0]]).slice(0, 8), v: v, c: "#52b788" };
        })) },
        { title: "Distribución", html: chartDonut(ph.rows.map(function (r, i) {
          return { l: String(r[keys[0]]).slice(0, 12), v: 1, c: ["#2d6a4f", "#52b788", "#d4a373", "#40916c"][i % 4] };
        })) },
        { title: "Tendencia", html: chartLine(ph.rows.map(function (r, i) {
          return { l: "S" + (i + 1), v: 20 + i * 15 };
        })) },
        { title: "Comparativo", html: chartHBar(ph.rows.map(function (r, i) {
          return { l: String(r[keys[0]]).slice(0, 10), v: 30 + i * 20, c: "#40916c" };
        })) },
      ]);
    }
    var keys = Object.keys(ph.rows[0]);
    var headers = keys.map(function (k) {
      var map = { name: "Nombre", stage: "Etapa", amount: "Monto", assignee: "Responsable", status: "Estado", session: "Sesión", total: "Total", msgs: "Mensajes", last: "Último", folder: "Carpeta", date: "Fecha", url: "URL" };
      return map[k] || k.charAt(0).toUpperCase() + k.slice(1);
    });
    var rows = ph.rows.map(function (r) {
      return keys.map(function (k) { return esc(String(r[k])); });
    });
    return renderNavbar() + renderControlPanel(ph.title, '<button class="o_btn o_btn_primary" data-toast="Registro creado">Nuevo</button>') +
      renderSimpleTable(headers, rows);
  }

  function renderAccounting() {
    var kpis = D.accounting.kpis.map(function (k) {
      var cls = k.delta.indexOf("-") === 0 ? " down" : "";
      return '<div class="o_account_kpi"><label>' + esc(k.label) + '</label><div class="val">' + esc(k.value) + '</div><div class="delta' + cls + '">' + esc(k.delta) + '</div></div>';
    }).join("");
    var journals = D.accounting.journals.map(function (j) {
      return '<div class="o_journal_card"><h4>' + esc(j.name) + '</h4><div class="amt">' + esc(j.amount) + '</div><p style="font-size:12px;color:var(--o-muted);margin-top:4px">' + j.count + ' asientos</p></div>';
    }).join("");
    var moves = D.accounting.moves.map(function (m) {
      var badge = m.status === "Publicado" ? "o_badge_posted" : "o_badge_draft";
      return '<tr><td>' + esc(m.date) + '</td><td>' + esc(m.number) + '</td><td>' + esc(m.partner) + '</td><td class="o_num">' + esc(m.amount) + '</td><td><span class="o_badge ' + badge + '">' + esc(m.status) + '</span></td></tr>';
    }).join("");
    return renderNavbar() +
      '<div class="o_control_panel"><div class="o_cp_title">Tablero contable</div></div>' +
      '<div class="o_account_kpis">' + kpis + '</div><div class="o_journals">' + journals + '</div>' +
      '<div class="o_content" style="padding:16px"><h3 style="font-size:15px;margin-bottom:12px">Asientos recientes</h3>' +
      '<table class="o_list_table"><thead><tr><th>Fecha</th><th>Número</th><th>Contacto</th><th>Importe</th><th>Estado</th></tr></thead><tbody>' + moves + '</tbody></table></div>';
  }

  function renderPurchase() {
    var rows = D.purchase.map(function (p) {
      return '<tr class="o_click_row" data-toast="🛒 ' + esc(p.reference) + ' · ' + esc(p.vendor) + ' — ' + esc(p.status) + '">' +
        '<td>' + esc(p.vendor) + '</td><td>' + esc(p.reference) + '</td><td>' + esc(p.date) + '</td><td class="o_num">' + esc(p.total) + '</td>' +
        '<td><span class="o_badge o_badge_rfq">' + esc(p.status) + '</span></td></tr>';
    }).join("");
    return renderNavbar() +
      '<div class="o_control_panel"><button class="o_btn o_btn_primary" data-toast="Nueva solicitud de cotización creada">Nuevo</button><div class="o_cp_title">Órdenes de compra</div></div>' +
      '<div class="o_content"><table class="o_list_table"><thead><tr><th>Proveedor</th><th>Referencia</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function renderModal() {
    if (!state.showModal || !state.modalRowId) return "";
    var row = getRow(state.modalRowId);
    if (!row) return "";
    var f = D.forecastInfoFor(row);
    return '<div class="o_modal_backdrop" id="modal-backdrop"><div class="o_modal"><div class="o_modal_header">' + esc(f.title) +
      '<button class="o_modal_close" id="modal-close">×</button></div><div class="o_modal_body"><p>' + esc(f.text) + '</p>' +
      '<p><strong>' + esc(f.product) + '</strong><br>Existencias: ' + f.onHand + ' · Pronóstico: ' + f.forecast + ' · A pedir: ' + f.toOrder + ' ' + f.uom + '</p>' +
      '<div class="o_modal_graph"></div></div></div></div>';
  }

  function renderClient() {
    var body = "";
    if (state.app === "inventory") {
      if (state.view === "replenishment") body = renderReplenishment();
      else if (state.view === "overview") body = renderInventoryOverview();
      else if (state.view === "products") body = renderProducts();
      else if (state.view === "reporting") body = renderReporting();
      else if (state.view === "features") body = renderFeatures();
      else body = renderReplenishment();
    } else if (state.app === "planning") {
      if (state.view === "forecast") body = renderPlanningForecast();
      else if (state.view === "reporting") body = renderPlanningReporting();
      else if (state.view === "configuration") body = renderPlanningConfiguration();
      else if (state.view === "schedule") body = renderPlanningSchedule();
      else body = renderPlanningForecast();
    } else if (state.app === "accounting") {
      body = renderAccountingView();
    } else if (state.app === "purchase") {
      body = renderPurchaseView();
    } else if (state.app === "sales") {
      body = renderSales();
    } else if (state.app === "manufacturing") {
      body = renderManufacturing();
    } else if (D.placeholders[state.app]) {
      body = renderPlaceholderApp();
    } else {
      body = renderNavbar() + '<div class="o_content" style="padding:40px;text-align:center;color:var(--o-muted)">Vista demo</div>';
    }
    return '<div id="screen-client">' + body + renderModal() + '</div>';
  }

  function orderRow(id) {
    var row = getRow(id);
    if (!row) return;
    var qty = D.calcToOrder(row);
    if (qty <= 0) return toast("No hay nada que pedir para este producto");
    row.onHand += qty;
    row.forecast = Math.min(row.forecast + qty, row.max);
    toast("Orden de compra creada: " + qty + " uds · " + row.product.split("] ")[1]);
    render();
  }

  function automateRow(id) {
    var row = getRow(id);
    if (!row) return;
    row.trigger = "Auto";
    toast("Regla de reorden automática activada para " + row.product.split("] ")[1]);
    render();
  }

  function snoozeRow(id) {
    state.snoozed[id] = true;
    delete state.selectedRows[id];
    toast("Reabastecimiento pospuesto");
    render();
  }

  function bindEvents() {
    document.querySelectorAll(".app-tile").forEach(function (el) {
      el.onclick = function () { navigate(el.getAttribute("data-app") + "/" + defaultView(el.getAttribute("data-app"))); };
    });
    var homeBtn = $("#btn-home");
    if (homeBtn) homeBtn.onclick = function () { navigate("home"); };

    document.querySelectorAll(".o_navbar_menu[data-view]").forEach(function (el) {
      el.onclick = function () { navigate(state.app + "/" + el.getAttribute("data-view")); };
    });
    document.querySelectorAll(".o_kanban_card[data-goto]").forEach(function (el) {
      el.onclick = function () { navigate(el.getAttribute("data-goto")); };
    });
    document.querySelectorAll("[data-check]").forEach(function (el) {
      el.onchange = function () {
        var id = parseInt(el.getAttribute("data-check"), 10);
        if (el.checked) state.selectedRows[id] = true;
        else delete state.selectedRows[id];
        render();
      };
    });
    document.querySelectorAll("[data-loc]").forEach(function (el) {
      el.onclick = function () { state.activeLocation = el.getAttribute("data-loc"); render(); };
    });
    document.querySelectorAll("[data-trigger]").forEach(function (el) {
      el.onclick = function () { state.activeTrigger = el.getAttribute("data-trigger"); render(); };
    });
    document.querySelectorAll("[data-info]").forEach(function (el) {
      el.onclick = function () { state.modalRowId = parseInt(el.getAttribute("data-info"), 10); state.showModal = true; render(); };
    });
    document.querySelectorAll("[data-action]").forEach(function (el) {
      el.onclick = function (e) {
        e.preventDefault();
        var id = parseInt(el.getAttribute("data-id"), 10);
        var action = el.getAttribute("data-action");
        if (action === "order") orderRow(id);
        else if (action === "automate") automateRow(id);
        else if (action === "snooze") snoozeRow(id);
      };
    });
    var clearSel = $("#clear-selected");
    if (clearSel) clearSel.onclick = function () { state.selectedRows = {}; render(); };
    var modalClose = $("#modal-close");
    if (modalClose) modalClose.onclick = function () { state.showModal = false; render(); };
    var modalBg = $("#modal-backdrop");
    if (modalBg) modalBg.onclick = function (e) { if (e.target === modalBg) { state.showModal = false; render(); } };

    document.querySelectorAll("[data-toast]").forEach(function (el) {
      el.onclick = function () { toast(el.getAttribute("data-toast")); };
    });

    var search = $("#product-search");
    if (search) {
      search.oninput = function () {
        var q = search.value.toLowerCase();
        document.querySelectorAll("#products-table tbody tr").forEach(function (tr) {
          tr.style.display = tr.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none";
        });
      };
    }

    var fkProd = $("#fk-product");
    if (fkProd) fkProd.onchange = function () {
      state.forkast.productId = fkProd.value;
      if (state.forkast.step === 1) {
        toast("✓ Producto seleccionado — Paso 2: Algoritmo ML");
        fkGoStep(2);
      } else render();
    };
    var fkSrc = $("#fk-source");
    if (fkSrc) fkSrc.onchange = function () {
      state.forkast.source = fkSrc.value;
      if (state.forkast.step === 1) {
        toast("✓ Canal de ventas listo — Paso 2: Algoritmo ML");
        fkGoStep(2);
      } else render();
    };
    var fkPeriod = $("#fk-period");
    if (fkPeriod) fkPeriod.onchange = function () {
      state.forkast.period = parseInt(fkPeriod.value, 10);
      toast("Periodo: " + fkPeriod.options[fkPeriod.selectedIndex].text);
      render();
    };
    document.querySelectorAll("[data-fk-algo]").forEach(function (el) {
      el.onclick = function () {
        state.forkast.algorithm = el.getAttribute("data-fk-algo");
        if (state.forkast.step === 2) {
          toast("✓ " + el.querySelector("strong").textContent + " — Paso 3: Generar Forkast");
          fkGoStep(3);
        } else render();
      };
    });
    document.querySelectorAll("[data-fk-goto-step]").forEach(function (el) {
      el.onclick = function () {
        var n = parseInt(el.getAttribute("data-fk-goto-step"), 10);
        fkGoStep(n);
      };
    });
    var fkBack = $("#fk-back");
    if (fkBack) fkBack.onclick = function () {
      if (state.forkast.step > 1) fkGoStep(state.forkast.step - 1);
    };
    var fkReset = $("#fk-reset");
    if (fkReset) fkReset.onclick = function () {
      state.forkast.step = 1;
      state.forkast.generated = false;
      state.forkast.generating = false;
      toast("Nuevo pronóstico — empieza desde el paso 1");
      render();
    };
    var fkGen = $("#fk-generate");
    if (fkGen) fkGen.onclick = function () { startFkGenerate(); };
    document.querySelectorAll("[data-fk-action]").forEach(function (el) {
      el.onclick = function () {
        var act = el.getAttribute("data-fk-action");
        var res = fkResult();
        var pr = fkProduct();
        if (act === "buy") toast("Demo: OC creada — " + res.need + " " + pr.unit + " de " + pr.name);
        if (act === "produce") toast("Demo: OF programada — " + res.need + " " + pr.unit + " en " + pr.resource);
      };
    });
  }

  function render() {
    var root = $("#app");
    root.innerHTML = state.screen === "home" ? renderHome() : renderClient();
    bindEvents();
  }

  window.addEventListener("hashchange", function () { parseRoute(); render(); });
  parseRoute();
  render();
})();
