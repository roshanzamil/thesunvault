// ── SHARED SYSTEMS ────────────────────────────────────────────────────
GAME = { progress: 0, holding: null };

// Hash a string into a deterministic frequency for the audio fallback.
function hashFreq(str) {
  var h = 0;
  for (var i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return 330 + Math.abs(h) % 440; // 330–770 Hz range
}

function chime(freq) {
  try {
    var AC = window.__ac || (window.__ac = new (window.AudioContext || window.webkitAudioContext)());
    var o = AC.createOscillator(), g = AC.createGain();
    o.type = 'sine'; o.frequency.value = freq || hashFreq('chime');
    g.gain.setValueAtTime(0.0001, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.12, AC.currentTime + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + 0.5);
    o.connect(g); g.connect(AC.destination);
    o.start(); o.stop(AC.currentTime + 0.55);
  } catch (e) {}
}

function showVerse(scene, text, onDone) {
  var lines = String(text).split('\n');
  var n = 0;
  lines.forEach(function(ln, i) {
    var t = scene.add.text(ROOM_W / 2, 120 + i * 44, ln, {
      fontFamily: 'Georgia, serif', fontSize: '28px', color: '#ffe9b0',
      align: 'center', alpha: 0
    }).setOrigin(0.5).setDepth(90);
    scene.tweens.add({ targets: t, alpha: 1, duration: 1400, delay: 400 + i * 1200,
      onComplete: function() { n++; if (n === lines.length) {
        scene.time.delayedCall(2200, function() {
          scene.tweens.add({ targets: t, alpha: 0, duration: 900,
            onComplete: function() { t.destroy(); onDone && onDone(); } });
        });
      }}
    });
  });
}

// ── TILE-BASED ROOM RENDERING ─────────────────────────────────────────
// Renders a tilemap from a 2D array. Tiles are 64x64px.
// Tile codes: 'f'=floor, 'w'=wall, 'W'=wall-top, 'c'=cracked-floor

function drawRoom(scene, tilemap, opts) {
  opts = opts || {};
  var g = scene.add.graphics();

  if (opts.backdrop) {
    var bg = scene.add.image(ROOM_W / 2, ROOM_H / 2, opts.backdrop)
      .setDisplaySize(ROOM_W, ROOM_H).setDepth(0);
  } else {
    g.fillStyle(0x0b0d1a, 1);
    g.fillRect(0, 0, ROOM_W, ROOM_H);
    g.setDepth(0);
  }

  for (var r = 0; r < tilemap.length; r++) {
    for (var c = 0; c < (tilemap[r] || []).length; c++) {
      var code = tilemap[r][c];
      var x = c * TILE, y = r * TILE;
      if (code === 'f') {
        g.fillStyle(0x2a2f4a, 1); g.fillRect(x, y, TILE, TILE);
        g.lineStyle(1, 0x1e2340, 0.6); g.strokeRect(x, y, TILE, TILE);
      } else if (code === 'w') {
        g.fillStyle(0x3a3f5c, 1); g.fillRect(x, y, TILE, TILE);
        g.fillStyle(0x2c3046, 1); g.fillRect(x+2, y+2, TILE-4, TILE-4);
        g.lineStyle(2, 0x514577, 0.5); g.strokeRect(x, y, TILE, TILE);
      } else if (code === 'W') {
        g.fillStyle(0x3a3f5c, 1); g.fillRect(x, y, TILE, TILE);
        g.fillStyle(0x5a4f8a, 1); g.fillRect(x, y+TILE-10, TILE, 10);
        g.fillStyle(0x2c3046, 1); g.fillRect(x+2, y+2, TILE-4, TILE-14);
        g.lineStyle(2, 0x514577, 0.5); g.strokeRect(x, y, TILE, TILE);
      } else if (code === 'c') {
        g.fillStyle(0x252a42, 1); g.fillRect(x, y, TILE, TILE);
        g.lineStyle(1, 0x1e2340, 0.8); g.strokeRect(x, y, TILE, TILE);
        g.lineStyle(1, 0x151a30, 0.9);
        g.beginPath(); g.moveTo(x+8,y+12); g.lineTo(x+28,y+38); g.lineTo(x+50,y+20); g.strokePath();
      }
    }
  }

  if (opts.torches !== false) {
    var tg = scene.add.graphics().setDepth(1);
    var torchPositions = opts.torchPositions || [[TILE*2,TILE*2],[ROOM_W-TILE*2,TILE*2],[ROOM_W/2,TILE]];
    torchPositions.forEach(function(pos) {
      tg.fillStyle(0xffe9b0, 0.06); tg.fillCircle(pos[0], pos[1], TILE*3);
      tg.fillStyle(0xffe9b0, 0.04); tg.fillCircle(pos[0], pos[1], TILE*5);
    });
    tg.setBlendMode(Phaser.BlendModes.ADD);
  }
}

function buildTilemap(scene, tilemap, opts) {
  drawRoom(scene, tilemap, opts);
}
