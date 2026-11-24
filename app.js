
/* =====================================================================
   MICA FEST — lógica de la invitación
   No hace falta editar este archivo: todo se configura en config.js
   ===================================================================== */
(function () {
  "use strict";
  var C = window.INVITACION || {};
  var $ = function (id) { return document.getElementById(id); };
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
 
  /* ---------- 1. Colores y tipografías ---------- */
  var colorVars = { negro: "--negro", blanco: "--blanco", gris: "--gris", boton: "--boton", plata: "--plata" };
  Object.keys(C.colores || {}).forEach(function (k) { if (colorVars[k]) root.style.setProperty(colorVars[k], C.colores[k]); });
  var T = C.tipografias || {}, fontVars = { manuscrita: "--f-script", titulos: "--f-titulos", condensada: "--f-cond", texto: "--f-texto" };
  var fallback = { manuscrita: "cursive", titulos: "Georgia, serif", condensada: "'Arial Narrow', sans-serif", texto: "system-ui, sans-serif" };
  var weights = { manuscrita: "", titulos: ":wght@400;600", condensada: ":wght@300;400;500;700", texto: ":ital,wght@0,300;0,400;0,500;1,400" };
  var fams = [];
  Object.keys(fontVars).forEach(function (k) {
    if (!T[k]) return;
    fams.push("family=" + encodeURIComponent(T[k]).replace(/%20/g, "+") + weights[k]);
    root.style.setProperty(fontVars[k], '"' + T[k] + '", ' + fallback[k]);
  });
  if (fams.length) {
    var lk = document.createElement("link"); lk.rel = "stylesheet";
    lk.href = "https://fonts.googleapis.com/css2?" + fams.join("&") + "&display=swap";
    document.head.appendChild(lk);
  }
 
  /* ---------- 2. Textos ---------- */
  function get(path) { return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, C); }
  document.querySelectorAll("[data-bind]").forEach(function (el) {
    var v = get(el.getAttribute("data-bind")); if (v != null && v !== "") el.textContent = v;
  });
  $("demoRibbon").hidden = !C.demo;
  function names(id, list) {
    var box = $(id); box.innerHTML = "";
    (list || []).forEach(function (n, i) {
      if (i) { var a = document.createElement("p"); a.className = "amp"; a.textContent = "&"; box.appendChild(a); }
      var p = document.createElement("p"); p.textContent = n; box.appendChild(p);
    });
  }
  names("padres", C.padres); names("padrinos", C.padrinos);
  var tl = $("timeline");
  (C.cronograma || []).forEach(function (c) {
    var li = document.createElement("li");
    [["t-hora", c.hora], ["t-ico", c.icono], ["t-txt", c.texto]].forEach(function (x) {
      var s = document.createElement("span"); s.className = x[0]; s.textContent = x[1] || ""; li.appendChild(s);
    });
    tl.appendChild(li);
  });
  var L = C.lugar || {};
  if (L.nombre) { $("placeName").hidden = false; $("placeName").textContent = L.nombre; }
  if (L.direccion) { $("placeAddr").hidden = false; $("placeAddr").textContent = L.direccion; }
  $("placeHora").textContent = "Desde las " + String(C.hora || "").replace(/\s*H$/i, "") + " h";
  $("mapsBtn").href = L.enlaceMaps || ("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent((L.nombre || "") + " " + (L.direccion || "")));
  $("polaroidImg").src = C.fotoPortada || (C.fotos && C.fotos[0] && C.fotos[0].src) || "";
  $("polaroidImg").alt = C.nombre || "";
  if (C.fotoCuentaRegresiva) $("cdBand").style.backgroundImage = 'url("' + C.fotoCuentaRegresiva + '")';
  var waDigits = String(C.whatsapp || "").replace(/\D/g, "");
  $("waNumber").textContent = "+" + waDigits;
 
  /* ---------- 3. Invitado y cupo ---------- */
  var guest = { codigo: "general", nombre: "", cupo: Math.max(1, +(C.maxPersonas || C.cupoGeneral) || 1) }, count = 1;
  function readCode() {
    var h = decodeURIComponent((location.hash || "").replace(/^#/, "")).trim().toLowerCase();
    if (!h) { var m = location.search.match(/[?&](?:i|invitado)=([^&]+)/); if (m) h = decodeURIComponent(m[1]).toLowerCase(); }
    return h;
  }
  function plural(n) { return n === 1 ? "1 persona" : n + " personas"; }
  function strong(t) { var s = document.createElement("strong"); s.textContent = t; return s; }
  function paintGuest() {
    // Solo se muestra el nombre del invitado; el número de cupos no se muestra.
    var named = !!guest.nombre;
    $("coverGuest").hidden = !named; $("heroGuest").hidden = true; $("rsvpPass").hidden = true;
    if (named) { $("coverGuest").innerHTML = ""; $("coverGuest").append("Invitación para", strong(guest.nombre)); }
    setCount(Math.min(count, guest.cupo));
  }
  function resolveGuest() {
    var code = readCode();
    var f = (C.invitados || []).filter(function (g) { return String(g.codigo).toLowerCase() === code; })[0];
    guest = f ? { codigo: f.codigo, nombre: f.nombre, cupo: Math.max(1, +f.cupo || 1) }
              : { codigo: "general", nombre: "", cupo: Math.max(1, +(C.maxPersonas || C.cupoGeneral) || 1) };
    paintGuest();
    if (hasBackend() && code) {
      rpc("obtener_invitado", { p_codigo: code }).then(function (r) {
        if (r && r.encontrado) { guest = { codigo: r.codigo, nombre: r.nombre, cupo: Math.max(1, +r.cupo || 1) }; paintGuest(); }
      }).catch(function () {});
    }
  }
  addEventListener("hashchange", resolveGuest);
 
  /* ---------- 4. Bolas disco y lentejuelas ---------- */
  function DiscoBall(canvas, NL, NM) {
    var ctx = canvas.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1), size = canvas.width;
    canvas.width = canvas.height = size * dpr; ctx.scale(dpr, dpr);
    var R = size * .46, cx = size / 2, cy = size / 2, rot = Math.random() * 6, seeds = [];
    for (var i = 0; i < NL * NM; i++) seeds.push(Math.random());
    var Lx = -.45, Ly = -.55, Lz = .7, ln = Math.hypot(Lx, Ly, Lz); Lx /= ln; Ly /= ln; Lz /= ln;
    function draw() {
      ctx.clearRect(0, 0, size, size);
      ctx.beginPath(); ctx.arc(cx, cy, R + 1.5, 0, 7); ctx.fillStyle = "#070707"; ctx.fill();
      for (var i = 0; i < NL; i++) {
        var t0 = -Math.PI / 2 + Math.PI * i / NL, t1 = -Math.PI / 2 + Math.PI * (i + 1) / NL, tm = (t0 + t1) / 2;
        for (var j = 0; j < NM; j++) {
          var p0 = rot + 2 * Math.PI * j / NM, p1 = rot + 2 * Math.PI * (j + 1) / NM, pm = (p0 + p1) / 2;
          var nz = Math.cos(tm) * Math.cos(pm); if (nz <= .02) continue;
          var d = Math.max(0, Math.cos(tm) * Math.sin(pm) * Lx + Math.sin(tm) * Ly + nz * Lz);
          var s = seeds[i * NM + j], tw = Math.sin(rot * 7 + s * 40) * .5 + .5;
          var v = Math.min(255, Math.round(45 + 170 * Math.pow(d, 1.4) + 50 * s + (tw > .92 ? 70 : 0)));
          ctx.fillStyle = "rgb(" + v + "," + v + "," + v + ")";
          ctx.beginPath();
          var e = .02, pts = [[t0 + e, p0 + e], [t0 + e, p1 - e], [t1 - e, p1 - e], [t1 - e, p0 + e]];
          for (var k = 0; k < 4; k++) {
            var x = cx + R * Math.cos(pts[k][0]) * Math.sin(pts[k][1]), y = cy + R * Math.sin(pts[k][0]);
            k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          }
          ctx.closePath(); ctx.fill();
        }
      }
      var g = ctx.createRadialGradient(cx - R * .4, cy - R * .45, 0, cx - R * .4, cy - R * .45, R * .5);
      g.addColorStop(0, "rgba(255,255,255,.6)"); g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    }
    draw();
    return { step: function (dt) { rot += dt * .0004; draw(); }, draw: draw };
  }
  var coverBall = new DiscoBall($("coverBall"), 14, 28);
  var heroBalls = [new DiscoBall($("ballTR"), 16, 32), new DiscoBall($("ballBL"), 16, 32)];
 
  (function sequins() {
    var c = document.createElement("canvas"), n = 6, s = 26; c.width = c.height = n * s;
    var x = c.getContext("2d"); x.fillStyle = "#0d0d0e"; x.fillRect(0, 0, c.width, c.height);
    for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
      var cx = j * s + s / 2 + (i % 2 ? s / 2 : 0), cy = i * s + s / 2, b = Math.random();
      [cx, cx - n * s].forEach(function (px) {
        var g = x.createRadialGradient(px - 4, cy - 4, 1, px, cy, s * .55), hi = Math.round(150 + b * 105), lo = Math.round(40 + b * 70);
        g.addColorStop(0, "rgb(" + hi + "," + hi + "," + hi + ")"); g.addColorStop(1, "rgb(" + lo + "," + lo + "," + lo + ")");
        x.fillStyle = g; x.beginPath(); x.arc(px, cy, s * .47, 0, 7); x.fill();
      });
    }
    var url = c.toDataURL();
    document.querySelectorAll(".sequin").forEach(function (el) { el.style.backgroundImage = "url(" + url + ")"; el.style.backgroundSize = (n * s / 1.4) + "px"; });
  })();
 
  /* ---------- 5. Destellos ---------- */
  var fx = $("fx"), fc = fx.getContext("2d"), W = 0, H = 0, parts = [];
  function resize() {
    var dpr = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    fx.width = W * dpr; fx.height = H * dpr; fc.setTransform(dpr, 0, 0, dpr, 0, 0);
    parts = []; var n = Math.round(Math.min(55, W * H / 11000));
    for (var i = 0; i < n; i++) parts.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.5 + .5, ph: Math.random() * 6.28, sp: Math.random() * .002 + .0008, vy: Math.random() * .012 + .004 });
  }
  function drawFx(t, dt) {
    fc.clearRect(0, 0, W, H); fc.fillStyle = "#ffffff";
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i]; p.y -= p.vy * dt; if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      var tw = Math.pow(Math.sin(t * p.sp + p.ph) * .5 + .5, 3), r = p.r;
      fc.globalAlpha = .15 + tw * .75;
      if (tw > .7) { fc.beginPath(); fc.moveTo(p.x, p.y - r * 3); fc.quadraticCurveTo(p.x, p.y, p.x + r * 3, p.y); fc.quadraticCurveTo(p.x, p.y, p.x, p.y + r * 3); fc.quadraticCurveTo(p.x, p.y, p.x - r * 3, p.y); fc.quadraticCurveTo(p.x, p.y, p.x, p.y - r * 3); fc.fill(); }
      else { fc.beginPath(); fc.arc(p.x, p.y, r * .6, 0, 7); fc.fill(); }
    }
    fc.globalAlpha = 1;
  }
  resize(); addEventListener("resize", resize);
  var opened = false, last = performance.now();
  function loop(t) {
    var dt = Math.min(50, t - last); last = t;
    if (!document.hidden) {
      if (!opened) coverBall.step(dt * 1.4);
      else { drawFx(t, dt); if (scrollY < innerHeight * 1.2) { heroBalls[0].step(dt); heroBalls[1].step(-dt); } }
    }
    requestAnimationFrame(loop);
  }
  if (!reduceMotion) requestAnimationFrame(loop);
 
  /* ---------- 6. Música ---------- */
  var music = (function () {
    var list = (C.musica || []).filter(function (m) { return m && m.archivo; }), idx = 0, failed = 0;
    var audio = null, ctx = null, master = null, timer = null, playing = false, mode = list.length ? "file" : "synth";
    // Respaldo: melodía original generada (Am – F – C – G, 118 bpm)
    var beat = 60 / 118, nextT = 0, step = 0;
    var chords = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 69], [48, 55, 59, 64, 67], [55, 59, 62, 64, 71]], arp = [0, 2, 4, 3, 1, 3, 2, 4];
    function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
    function unlock() {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC || ctx) return;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 0;
      var comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
      var dl = ctx.createDelay(); dl.delayTime.value = beat * .75; var fb = ctx.createGain(); fb.gain.value = .3; var wet = ctx.createGain(); wet.gain.value = .28;
      dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(master); ctx._send = dl;
      var buf = ctx.createBuffer(1, ctx.sampleRate * .2, ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; ctx._noise = buf;
      // un instante de silencio desbloquea el audio en iPhone
      var s = ctx.createBufferSource(); s.buffer = ctx.createBuffer(1, 1, 22050); s.connect(ctx.destination); s.start(0);
    }
    function tone(f, t, dur, type, vol, send, att) {
      var o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + (att || .01)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(master); if (send) g.connect(ctx._send); o.start(t); o.stop(t + dur + .05);
    }
    function hat(t, v) {
      var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = ctx._noise; f.type = "highpass"; f.frequency.value = 8000;
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .06); s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + .08);
    }
    function kick(t) {
      var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(125, t); o.frequency.exponentialRampToValueAtTime(45, t + .12);
      g.gain.setValueAtTime(.34, t); g.gain.exponentialRampToValueAtTime(.0001, t + .3); o.connect(g); g.connect(master); o.start(t); o.stop(t + .32);
    }
    function schedule() {
      while (nextT < ctx.currentTime + .25) {
        var ch = chords[Math.floor(step / 16) % 4], s = step % 16, t = nextT;
        if (s === 0) ch.forEach(function (m) { tone(hz(m), t, beat * 4.2, "triangle", .026, false, .5); });
        if (s % 2 === 0) tone(hz(ch[arp[(s / 2) % 8]] + 12), t, .4, "square", .018, true);
        if (s % 2 === 0) tone(hz(ch[arp[(s / 2) % 8]] + 12), t, .45, "sine", .05, true);
        if (s % 4 === 0) { kick(t); tone(hz(ch[0] - 24), t, beat * .4, "sine", .17); }
        if (s % 4 === 2) { hat(t, .06); tone(hz(ch[0] - 12), t, beat * .4, "sine", .13); }
        if (s % 2 === 1) hat(t, .018);
        nextT += beat / 4; step++;
      }
    }
    function startSynth() {
      mode = "synth"; if (!ctx) unlock(); if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      if (!timer) { nextT = ctx.currentTime + .1; timer = setInterval(schedule, 60); }
      master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(.55, ctx.currentTime + 1.2);
      label("Pausar");
    }
    function loadTrack(i) {
      idx = (i + list.length) % list.length; audio.src = list[idx].archivo;
      var p = audio.play(); if (p && p.catch) p.catch(function (e) { if (e && e.name === "NotAllowedError") { playing = false; ui(false); } });
      label(list[idx].titulo || "Pausar");
    }
    function startFile() {
      if (!audio) {
        audio = new Audio(); audio.preload = "auto";
        audio.addEventListener("ended", function () { failed = 0; loadTrack(idx + 1); });
        audio.addEventListener("playing", function () { failed = 0; });
        audio.addEventListener("error", function () {
          failed++;
          if (failed >= list.length) { if (playing) startSynth(); } else loadTrack(idx + 1);
        });
        loadTrack(0);
      } else { var p = audio.play(); if (p && p.catch) p.catch(function () {}); label(list[idx].titulo || "Pausar"); }
    }
    function start() {
      unlock();
      playing = true; ui(true);
      if (mode === "file") startFile(); else startSynth();
    }
    function stop() {
      if (audio) audio.pause();
      if (ctx && master) { master.gain.setValueAtTime(master.gain.value, ctx.currentTime); master.gain.linearRampToValueAtTime(0, ctx.currentTime + .3); setTimeout(function () { if (!playing) ctx.suspend(); }, 400); }
      playing = false; ui(false);
    }
    function label(t) { if (playing) $("musicLbl").textContent = t; }
    function ui(on) {
      var b = $("musicBtn"); b.classList.toggle("paused", !on); b.setAttribute("aria-pressed", on ? "true" : "false");
      b.setAttribute("aria-label", on ? "Pausar música" : "Reproducir música"); if (!on) $("musicLbl").textContent = "Música";
    }
    var resume = false;
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && playing) { resume = true; stop(); } else if (!document.hidden && resume) { resume = false; start(); }
    });
    return { start: start, toggle: function () { playing ? stop() : start(); } };
  })();
  $("musicBtn").addEventListener("click", music.toggle);
 
  /* ---------- 7. Abrir ---------- */
  document.body.classList.add("locked");
  $("openBtn").addEventListener("click", function () {
    music.start();                                   // dentro del toque: lo exigen iPhone y Chrome
    $("cover").classList.add("opening");
    $("main").removeAttribute("aria-hidden");
    $("musicBtn").hidden = false;
    opened = true;
    setTimeout(function () { $("cover").hidden = true; document.body.classList.remove("locked"); }, reduceMotion ? 30 : 1300);
  });
 
  if (!reduceMotion && "IntersectionObserver" in window) {
    root.classList.add("js-anim");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove("pending"); io.unobserve(e.target); } });
    }, { threshold: .1 });
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("pending"); io.observe(el); });
  }
 
  /* ---------- 8. Cuenta regresiva ---------- */
  var target = new Date(C.fechaHoraISO).getTime();
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var ms = target - Date.now();
    if (isNaN(ms) || ms <= 0) { $("countdown").hidden = true; $("cdDone").hidden = false; return; }
    var s = Math.floor(ms / 1000);
    $("cdD").textContent = Math.floor(s / 86400); $("cdH").textContent = pad(Math.floor(s % 86400 / 3600));
    $("cdM").textContent = pad(Math.floor(s % 3600 / 60)); $("cdS").textContent = pad(s % 60);
  }
  tick(); setInterval(tick, 1000);
 
  /* ---------- 9. Galería + visor ---------- */
  var fotos = C.fotos || [], track = $("track"), dots = $("dots"), current = 0;
  fotos.forEach(function (f, i) {
    var b = document.createElement("button"); b.type = "button"; b.className = "slide" + (i ? "" : " active");
    b.setAttribute("aria-label", "Ampliar foto " + (i + 1) + " de " + fotos.length);
    var img = document.createElement("img"); img.src = f.src; img.alt = f.alt || ""; img.decoding = "async"; if (i) img.loading = "lazy";
    b.appendChild(img); b.addEventListener("click", function () { openLb(i); }); track.appendChild(b);
    var d = document.createElement("button"); d.type = "button"; d.setAttribute("role", "tab"); d.setAttribute("aria-label", "Foto " + (i + 1));
    d.setAttribute("aria-selected", i ? "false" : "true"); d.addEventListener("click", function () { go(i); }); dots.appendChild(d);
  });
  function go(i) {
    if (!fotos.length) return; i = (i + fotos.length) % fotos.length; var s = track.children[i];
    track.scrollTo({ left: s.offsetLeft - (track.clientWidth - s.clientWidth) / 2, behavior: reduceMotion ? "auto" : "smooth" });
  }
  function setActive(i) {
    current = i;
    Array.prototype.forEach.call(track.children, function (s, k) { s.classList.toggle("active", k === i); });
    Array.prototype.forEach.call(dots.children, function (d, k) { d.setAttribute("aria-selected", k === i ? "true" : "false"); });
  }
  var raf = 0;
  track.addEventListener("scroll", function () {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      var mid = track.scrollLeft + track.clientWidth / 2, best = 0, bd = 1e9;
      Array.prototype.forEach.call(track.children, function (s, k) { var dd = Math.abs(s.offsetLeft + s.clientWidth / 2 - mid); if (dd < bd) { bd = dd; best = k; } });
      if (best !== current) setActive(best);
    });
  }, { passive: true });
  $("prevBtn").addEventListener("click", function () { go(current - 1); });
  $("nextBtn").addEventListener("click", function () { go(current + 1); });
  track.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") go(current - 1); if (e.key === "ArrowRight") go(current + 1); });
  var autoT = null;
  function auto() { clearInterval(autoT); if (!reduceMotion && fotos.length > 1) autoT = setInterval(function () { if (opened && !document.hidden && $("lightbox").hidden) go(current + 1); }, 5000); }
  ["pointerdown", "touchstart", "wheel"].forEach(function (ev) { track.addEventListener(ev, auto, { passive: true }); });
  auto(); addEventListener("load", function () { go(0); });
 
  var lb = $("lightbox"), lbIdx = 0, lastFocus = null;
  function showLb(i) {
    lbIdx = (i + fotos.length) % fotos.length; var img = $("lbImg");
    img.style.animation = "none"; void img.offsetWidth; img.style.animation = "";
    img.src = fotos[lbIdx].src; img.alt = fotos[lbIdx].alt || ""; $("lbCount").textContent = (lbIdx + 1) + " / " + fotos.length;
  }
  function openLb(i) { lastFocus = document.activeElement; showLb(i); lb.hidden = false; document.body.classList.add("locked"); $("lbClose").focus(); }
  function closeLb() { lb.hidden = true; document.body.classList.remove("locked"); if (lastFocus) lastFocus.focus(); }
  $("lbClose").addEventListener("click", closeLb);
  $("lbPrev").addEventListener("click", function () { showLb(lbIdx - 1); });
  $("lbNext").addEventListener("click", function () { showLb(lbIdx + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return; if (e.key === "Escape") closeLb(); if (e.key === "ArrowLeft") showLb(lbIdx - 1); if (e.key === "ArrowRight") showLb(lbIdx + 1);
  });
  var tx = null;
  lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) { if (tx == null) return; var dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 50) showLb(lbIdx + (dx < 0 ? 1 : -1)); });
 
  /* ---------- 10. Confirmación ---------- */
  function setCount(n) {
    count = Math.max(1, Math.min(guest.cupo, n));
    $("fCant").textContent = count; $("minus").disabled = count <= 1; $("plus").disabled = count >= guest.cupo;
    $("cupoHint").textContent = "Incluyéndote a ti.";
    var list = $("acompList"), prev = [];
    list.querySelectorAll("input").forEach(function (i) { prev.push(i.value); });
    list.innerHTML = "";
    for (var i = 0; i < count - 1; i++) {
      var inp = document.createElement("input"); inp.type = "text"; inp.id = "fAcomp" + i; inp.maxLength = 80; inp.autocomplete = "off";
      inp.placeholder = "Acompañante " + (i + 1); inp.value = prev[i] || ""; inp.setAttribute("aria-label", "Nombre del acompañante " + (i + 1));
      list.appendChild(inp);
    }
    $("acompWrap").hidden = count < 2;
  }
  $("minus").addEventListener("click", function () { setCount(count - 1); });
  $("plus").addEventListener("click", function () { setCount(count + 1); });
  $("showForm").addEventListener("click", function () {
    var f = $("rsvpForm"), open = f.hidden; f.hidden = !open; $("rsvpDone").hidden = true;
    this.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) setTimeout(function () { $("fNombre").focus({ preventScroll: true }); f.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }); }, 50);
  });
 
  function hasBackend() { return !!(C.supabase && C.supabase.url && C.supabase.anonKey); }
  function rpc(fn, body) {
    return fetch(C.supabase.url.replace(/\/$/, "") + "/rest/v1/rpc/" + fn, {
      method: "POST", headers: { "Content-Type": "application/json", apikey: C.supabase.anonKey, Authorization: "Bearer " + C.supabase.anonKey },
      body: JSON.stringify(body)
    }).then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); });
  }
  function showError(t) { $("formError").textContent = t; $("formError").hidden = !t; }
  function finish(asiste, nombre, acomp) {
    var who = C.nombre || "", text;
    if (asiste) {
      text = "¡Hola! Confirmo mi asistencia a los 15 años de " + who + (C.titulo ? " (" + C.titulo + ")" : "") + ".\n\n" +
        "Invitado principal: " + nombre + "\nPersonas que asistirán: " + count +
        (acomp.length ? "\nAcompañantes: " + acomp.join(", ") : "") + (guest.nombre ? "\nInvitación: " + guest.nombre : "");
      $("doneTitle").textContent = "¡Te espero!";
      $("doneText").textContent = "Último paso: envía tu confirmación por WhatsApp.";
    } else {
      text = "¡Hola! Soy " + nombre + ". Lamentablemente no podré asistir a los 15 años de " + who + ". ¡Que sea una noche maravillosa!" + (guest.nombre ? "\nInvitación: " + guest.nombre : "");
      $("doneTitle").textContent = "Gracias por avisar";
      $("doneText").textContent = "Envía tu respuesta por WhatsApp para que lo sepamos.";
    }
    $("waBtn").href = "https://wa.me/" + waDigits + "?text=" + encodeURIComponent(text);
    $("rsvpForm").hidden = true; $("rsvpDone").hidden = false;
    $("rsvpDone").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }
  function submit(asiste) {
    showError("");
    var el = $("fNombre"), nombre = el.value.trim().replace(/\s+/g, " ");
    el.classList.toggle("invalid", nombre.length < 3);
    if (nombre.length < 3) { showError("Escribe tu nombre y apellido."); el.focus(); return; }
    var acomp = [], missing = null;
    if (asiste) {
      if (count > guest.cupo) { showError("La cantidad de personas no es válida."); return; }
      $("acompList").querySelectorAll("input").forEach(function (i) { var v = i.value.trim(); i.classList.toggle("invalid", !v); if (!v && !missing) missing = i; if (v) acomp.push(v); });
      if (missing) { showError("Escribe el nombre de cada acompañante o reduce la cantidad de personas."); missing.focus(); return; }
    }
    if (!hasBackend()) { finish(asiste, nombre, acomp); return; }
    var btn = $("confirmBtn"); btn.disabled = true; btn.textContent = "Guardando…";
    rpc("confirmar_asistencia", { p_codigo: guest.codigo, p_nombre: nombre, p_cantidad: asiste ? count : 0, p_acompanantes: acomp, p_asiste: asiste })
      .then(function (r) { if (r && r.ok) finish(asiste, nombre, acomp); else showError((r && r.mensaje) || "No se pudo guardar. Inténtalo de nuevo."); })
      .catch(function () { finish(asiste, nombre, acomp); })
      .then(function () { btn.disabled = false; btn.textContent = "Confirmar asistencia"; });
  }
  $("rsvpForm").addEventListener("submit", function (e) { e.preventDefault(); submit(true); });
  $("declineBtn").addEventListener("click", function () { submit(false); });
  $("editBtn").addEventListener("click", function () { $("rsvpDone").hidden = true; $("rsvpForm").hidden = false; });
  $("rsvpForm").addEventListener("input", function (e) { if (e.target.classList) e.target.classList.remove("invalid"); });
 
  resolveGuest();
})();