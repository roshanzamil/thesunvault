// ── HERO: grid-snapped top-down movement (WASD / arrows / swipe) ──────
class Hero {
  constructor(scene, startCol, startRow) {
    this.scene = scene;
    this.col = startCol;
    this.row = startRow;
    this.targetCol = startCol;
    this.targetRow = startRow;
    this.moving = false;
    this.holdingColor = null;
    this.disc = null;

    var px = startCol * TILE + TILE / 2;
    var py = startRow * TILE + TILE / 2;
    this.img = scene.add.sprite(px, py, 'hero_tex', 0).setDepth(20).play('idle-down');
    this.setupInput(scene);
    scene.events.on('update', this.tick, this);
    scene.events.once('shutdown', () => scene.events.off('update', this.tick, this));
  }

  setupInput(scene) {
    var self = this;
    var dirs = {
      'ArrowUp': [0,-1], 'ArrowDown': [0,1], 'ArrowLeft': [-1,0], 'ArrowRight': [1,0],
      'w': [0,-1], 's': [0,1], 'a': [-1,0], 'd': [1,0],
      'W': [0,-1], 'S': [0,1], 'A': [-1,0], 'D': [1,0]
    };

    scene.input.keyboard.on('keydown', function(e) {
      var d = dirs[e.key];
      if (d) { self.heldDirection = d; self.tryMove(d[0], d[1]); }
    });

    scene.input.keyboard.on('keyup', function(e) {
      if (dirs[e.key] === self.heldDirection) self.heldDirection = null;
    });
    var release = () => { self.heldDirection = null; };
    scene.game.events.on('blur', release);
    scene.events.once('shutdown', () => scene.game.events.off('blur', release));

    var swipeStart = null;
    scene.input.on('pointerdown', function(p) { swipeStart = { x: p.x, y: p.y }; });
    scene.input.on('pointerup', function(p) {
      if (!swipeStart || self.moving) return;
      var dx = p.x - swipeStart.x, dy = p.y - swipeStart.y;
      var dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 15) return; // tap → handled by stage interactives
      var ax = Math.abs(dx), ay = Math.abs(dy);
      if (ax > ay) self.tryMove(Math.sign(dx), 0);
      else self.tryMove(0, Math.sign(dy));
      swipeStart = null;
    });
  }

  tryMove(dc, dr) {
    if (this.moving) return;
    var nc = this.col + dc, nr = this.row + dr;
    if (nc < 0 || nr < 0 || nc >= ROOM_COLS || nr >= ROOM_ROWS) return;
    var tile = this.scene.getTileAt(nc, nr);
    if (!tile || tile.solid) return;
    if (tile.boulder && !tile.boulder.dead) {
      var pushed = this.scene.pushBoulder(nc, nr, dc, dr);
      if (!pushed) return;
    }
    this.targetCol = nc; this.targetRow = nr;
    this.moving = true;
    var dir = dc < 0 ? 'left' : dc > 0 ? 'right' : dr < 0 ? 'up' : 'down';
    this.img.play('walk-' + dir, true);
    var tx = nc * TILE + TILE / 2, ty = nr * TILE + TILE / 2;
    this.scene.tweens.add({ targets: this.img, x: tx, y: ty, duration: MOVE_DURATION,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.col = this.targetCol; this.row = this.targetRow;
        this.moving = false;
        this.scene.onHeroArrived && this.scene.onHeroArrived(this.col, this.row);
        if (this.heldDirection) {
          this.tryMove(...this.heldDirection);
        }
        if (!this.moving) this.img.play('idle-' + dir);
      }
    });
  }

  setHolding(color) {
    this.holdingColor = color;
    if (this.disc) { this.disc.destroy(); this.disc = null; }
    if (color) {
      this.disc = this.scene.add.image(this.img.x, this.img.y - 30, color)
        .setDepth(21).setAngle(-8);
    }
  }

  tick() {
    if (this.disc) {
      this.disc.x = this.img.x;
      this.disc.y = this.img.y - 30 + Math.sin(this.scene.time.now * 0.003) * 3;
    }
  }

  destroy() {
    if (this.img) this.img.destroy();
    if (this.disc) this.disc.destroy();
  }
}
