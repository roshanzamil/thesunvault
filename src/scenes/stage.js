// ── STAGE BASE: tile-based RPG room ───────────────────────────────────
// Tile codes
const T_FLOOR='f', T_WALL='w', T_WALL_TOP='W', T_CRACKED='c',
      T_SW_OFF='s', T_SW_ON='S', T_CRYSTAL='C', T_DOOR='D',
      T_DOOR_OPEN='d', T_TV='T', T_BOULDER='b';

class StageBase extends Phaser.Scene {
  constructor(cfg) { super({ key: cfg.key }); this.cfg = cfg; }

  create() {
    var sc = this;
    this.__busy = false;
    GAME.holding = null;
    this.tilemap = [];
    this.boulders = [];
    this.switches = [];
    this.crystal = null;
    this.doorObj = null;
    this.doorGlow = null;
    this.allSwitchesLit = false;

    this.buildTilemap(this.cfg.map);
    var spawn = this.cfg.spawn || [2, 2];
    this.hero = new Hero(this, spawn[0], spawn[1]);

    var tvPos = this.cfg.tv || [17, 9];
    this.tv = new RetroTV(this, tvPos[0], tvPos[1]);
    this.tv.setProgress(GAME.progress);

    // The painted arch sits halfway across the north wall.
    var doorX = ROOM_W / 2, doorY = TILE * 2;
    this.doorObj = this.add.image(doorX, doorY, 'gate_closed').setDisplaySize(142,132).setDepth(12);
    this.doorGlow = this.add.image(doorX, doorY, 'dot_glow')
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(11).setScale(3).setAlpha(0).setVisible(false);

    var crystalPos = this.cfg.crystal || [15, 6];
    this.chest = this.add.image((crystalPos[0]+0.5)*TILE, (crystalPos[1]+0.5)*TILE,
      'chest_tex').setScale(1.5).setDepth(9);
    this.crystal = this.add.image(crystalPos[0]*TILE+TILE/2, crystalPos[1]*TILE+TILE/2,
      this.cfg.crystalTex || 'crystal_cyan').setDepth(14).setVisible(false).setAlpha(0);

    this.updateSwitchVisuals();
    this.placeBoulders();

    var reset = document.getElementById('resetChamber');
    reset.hidden = false;
    reset.disabled = false;
    function retry() {
      if (sc.__busy) return;
      sc.__busy = true;
      reset.disabled = true;
      sc.scene.restart();
    }
    function useResetKey(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        if (!e.repeat) retry();
      }
    }
    reset.addEventListener('keydown', useResetKey);
    reset.addEventListener('click', retry);
    this.events.once('shutdown', function() {
      reset.removeEventListener('keydown', useResetKey);
      reset.removeEventListener('click', retry);
      reset.hidden = true;
    });
    this.showTip('WASD / arrows or swipe to move · Push boulders onto pads · R to retry');

    this.insertDisc = function() {
      var d = STORY.discs[GAME.progress];
      if (!d) return;
      sc.__busy = true;
      chime(1046);
      sc.hero.setHolding(null);
      GAME.holding = null;
      reset.disabled = true;
      sc.tv.playDisc(d);
      sc.tv.setProgress(GAME.progress + 1);
      sc.openDoor();
      sc.cameras.main.fadeOut(500, 0, 0, 0);
      sc.time.delayedCall(600, function() {
        if (sc.onGateOpen) sc.onGateOpen();
        sc.cameras.main.fadeIn(400, 0, 0, 0);
      });
    };

    this.input.keyboard.on('keydown-ENTER', function() {
      if (document.activeElement !== reset && GAME.holding && !sc.__busy) sc.insertDisc();
    });
    this.input.keyboard.on('keydown-R', function(e) {
      if (!e.repeat) retry();
    });
  }

  buildTilemap(mapRows) {
    for (var r = 0; r < ROOM_ROWS; r++) {
      this.tilemap[r] = [];
      for (var c = 0; c < ROOM_COLS; c++) {
        var ch = (mapRows[r] && mapRows[r][c]) || T_FLOOR;
        var tile = { type: ch, solid: false, boulder: null, switch: null };
        if (ch === T_WALL || ch === T_WALL_TOP || ch === T_DOOR) tile.solid = true;
        if (ch === T_SW_OFF || ch === T_SW_ON) {
          tile.switch = { active: ch === T_SW_ON, col: c, row: r };
          this.switches.push(tile.switch);
        }
        if (ch === T_BOULDER) {
          tile.boulder = { col: c, row: r, dead: false };
          this.boulders.push(tile.boulder);
        }
        this.tilemap[r][c] = tile;
      }
    }
    this.renderTilemap();
  }

  // ── BOULDERS ────────────────────────────────────────────────────────
  placeBoulders() {
    var self = this;
    this.boulders.forEach(function(b) {
      var px = b.col*TILE+TILE/2, py = b.row*TILE+TILE/2;
      b.sprite = self.add.image(px, py, 'boulder').setScale(1.55).setDepth(10);
    });
  }

  pushBoulder(fromCol, fromRow, dc, dr) {
    var toCol = fromCol+dc, toRow = fromRow+dr;
    if (toCol<0||toRow<0||toCol>=ROOM_COLS||toRow>=ROOM_ROWS) return false;
    var target = this.tilemap[toRow][toCol];
    if (target.solid) return false;
    if (target.boulder && !target.boulder.dead) return false;
    var boulder = this.tilemap[fromRow][fromCol].boulder;
    if (!boulder || boulder.dead) return false;
    boulder.col = toCol; boulder.row = toRow;
    this.tilemap[fromRow][fromCol].boulder = null;
    this.tilemap[toRow][toCol].boulder = boulder;
    boulder.sprite.x = toCol*TILE+TILE/2;
    boulder.sprite.y = toRow*TILE+TILE/2;
    this.checkSwitches();
    return true;
  }

  // ── SWITCHES ────────────────────────────────────────────────────────
  checkSwitches() {
    var self = this;
    var allActive = true;
    this.switches.forEach(function(sw) {
      var tile = self.tilemap[sw.row][sw.col];
      sw.active = (tile.boulder && !tile.boulder.dead);
      tile.type = sw.active ? T_SW_ON : T_SW_OFF;
      if (!sw.active) allActive = false;
    });
    this.updateSwitchVisuals();
    if (allActive && !this.allSwitchesLit && !this.crystal.visible) {
      this.allSwitchesLit = true;
      this.revealCrystal();
    }
  }

  updateSwitchVisuals() {
    var self = this;
    this.switches.forEach(function(sw) {
      var px = sw.col*TILE+TILE/2, py = sw.row*TILE+TILE/2;
      if (sw.glow) sw.glow.setVisible(!!sw.active);
      if (sw.active && !sw.glow) {
        sw.glow = self.add.image(px, py, 'dot_glow')
          .setBlendMode(Phaser.BlendModes.ADD).setScale(1.5).setDepth(9)
          .setAlpha(0.7).setTint(0xb9a7ff);
        self.tweens.add({ targets: sw.glow, scale:2, alpha:0.4, duration:800, yoyo:true, repeat:-1 });
      }
    });
  }

  // ── CRYSTAL ─────────────────────────────────────────────────────────
  revealCrystal() {
    var self = this;
    chime(1200);
    this.showChestScene();
    this.chest.setVisible(false);
    this.crystal.setVisible(true).setAlpha(0).setDepth(14);
    this.tweens.add({ targets: this.crystal, alpha: 1, duration: 600,
      onComplete: function() {
        self.tweens.add({ targets: self.crystal, scale:1.2, duration:700, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
      }
    });
  }

  showChestScene() {
    var dialog = document.getElementById('speech');
    var next = document.getElementById('nextLine');
    var lines = STORY.chestLines[GAME.progress];
    var index = 0;
    var chapter = GAME.progress + 1;
    var voice = document.getElementById('explorerVoice');
    var reset = document.getElementById('resetChamber');
    reset.disabled = true;
    this.scene.pause();
    this.hero.heldDirection = null;
    function display() {
      voice.pause();
      voice.src = 'assets/audio/explorer-' + chapter + '-' + (index + 1) + '.wav';
      document.getElementById('line').textContent = lines[index];
      voice.play().catch(() => {});
      next.textContent = index === lines.length - 1 ? 'Continue' : 'Next';
    }
    next.onclick = () => {
      if (++index < lines.length) display(); else dialog.close();
    };
    dialog.oncancel = e => e.preventDefault();
    dialog.onkeydown = e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        if (!e.repeat) next.click();
      }
    };
    const cleanup = () => {
      voice.pause();
      voice.removeAttribute('src');
      voice.load();
      dialog.onclose = dialog.onkeydown = dialog.oncancel = null;
      next.onclick = null;
      if (dialog.open) dialog.close();
    };
    dialog.onclose = () => {
      cleanup();
      this.events.off('shutdown', cleanup);
      reset.disabled = false;
      this.scene.resume();
    };
    this.events.once('shutdown', cleanup);
    dialog.showModal();
    display();
    next.focus();
  }

  onHeroArrived(col, row) {
    if (this.crystal.visible && col === this.cfg.crystal[0] && row === this.cfg.crystal[1]) {
      this.collectCrystal();
    }
  }

  collectCrystal() {
    if (this.__busy || GAME.holding) return;
    this.__busy = true;
    this.crystal.dead = true;
    chime(1400);
    var d = STORY.discs[GAME.progress];
    this.hero.setHolding(this.cfg.crystalTex);
    GAME.holding = d.color;
    this.crystal.setVisible(false);
    var tip = this.add.text(ROOM_W/2, 100, 'you found "' + d.title + '"\npress Enter or click the TV to insert it', {
      fontFamily:'Georgia, serif', fontSize:'22px', color:'#ffe9b0', align:'center'
    }).setOrigin(0.5).setDepth(95).setAlpha(0);
    this.tweens.add({ targets:tip, alpha:1, duration:600 });
    this.__busy = false;
  }

  // ── DOOR ────────────────────────────────────────────────────────────
  openDoor() {
    this.doorObj.setTexture('gate_open');
    this.doorGlow.setVisible(true);
    var self = this;
    this.tweens.add({ targets:this.doorGlow, alpha:0.8, duration:600, yoyo:true, repeat:3,
      onComplete:function() { self.doorGlow.setVisible(false); }
    });
  }

  // ── HELPERS ─────────────────────────────────────────────────────────
  getTileAt(col, row) {
    if (row<0||row>=ROOM_ROWS||col<0||col>=ROOM_COLS) return { solid:true };
    return this.tilemap[row][col];
  }

  showTip(txt) {
    var t = this.add.text(ROOM_W/2, 40, txt, {
      fontFamily:'Georgia, serif', fontSize:'18px', color:'#ffe9b0', backgroundColor:'#241911', padding:{x:12,y:5},
      fontStyle:'italic', align:'center'
    }).setOrigin(0.5).setDepth(95).setAlpha(0);
    this.tweens.add({ targets:t, alpha:1, duration:800, yoyo:true, hold:3000,
      onComplete:function(){ t.destroy(); } });
  }

  buildChallenge() {}

  // ── RENDERING ───────────────────────────────────────────────────────
  renderTilemap() {
    // Match the painted floor edges to the three northern and one southern wall rows.
    var bands = [[0,120,0,3], [120,332,3,11], [332,360,11,12]];
    var texture = roomBackdrop(this);
    bands.forEach(([top, bottom, firstRow, endRow]) => {
      var frame = 'band-' + top;
      if (!texture.has(frame)) texture.add(frame, 0, 0, top, 640, bottom-top);
      this.add.image(0,firstRow*TILE,texture.key,frame).setOrigin(0)
        .setDisplaySize(ROOM_W,(endRow-firstRow)*TILE);
    });
    var pads = this.add.graphics().setDepth(2);
    for (var row = 0; row < ROOM_ROWS; row++) {
      for (var col = 0; col < ROOM_COLS; col++) {
        var tile = this.tilemap[row][col];
        var x = (col + 0.5) * TILE, y = (row + 0.5) * TILE;
        if (tile.type === T_WALL_TOP) {
          this.add.image(x,y,'tiles_wall',(row+col)%2).setDisplaySize(TILE,TILE).setDepth(3);
        } else if (!tile.solid) {
          var variant = (col * 7 + row * 3) % 4;
          this.add.image(x,y,'tiles_floor',variant).setDisplaySize(TILE,TILE).setAlpha(0.18);
        }
        if (tile.switch) {
          pads.fillStyle(0x302216, 0.85); pads.fillCircle(x,y,24);
          pads.lineStyle(3,0xffdb80,1); pads.strokeCircle(x,y,21);
          pads.lineStyle(2,0xebaa49,1); pads.strokeCircle(x,y,14);
        }
      }
    }
    [5, 14].forEach(col => {
      this.add.image((col+0.5)*TILE,TILE*1.65,'torch').setScale(1.5).setDepth(3);
    });
  }
}
