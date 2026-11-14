// ── RETRO TV: placed at a tile position in the room ───────────────────
class RetroTV {
  constructor(scene, tileCol, tileRow) {
    this.scene = scene;
    this.discs = [false, false, false, false];
    this.total = STORY.discCount;
    this.busy = false;

    var px = tileCol * TILE + TILE / 2;
    var py = tileRow * TILE + TILE / 2;
    this.tileCol = tileCol;
    this.tileRow = tileRow;

    this.img = scene.add.image(px, py, 'tv_tex').setOrigin(0.5, 0.78).setDepth(15)
      .setInteractive({ useHandCursor: true });
    var screenX = px - 5, screenY = py - 38;
    this.glow = scene.add.image(screenX, screenY, 'dot_glow')
      .setBlendMode(Phaser.BlendModes.ADD).setScale(2).setAlpha(0).setDepth(14);

    // Four crystal sockets illuminate as the explorer returns each memory.
    this.sockets = STORY.discs.map((disc, i) => scene.add.rectangle(
      screenX + (i - 1.5) * 13, screenY + 10, 7, 7, 0x213432
    ).setAngle(45).setStrokeStyle(1, 0xaa9665).setDepth(16));
    this.screenMsg = scene.add.text(screenX, screenY - 5, '', {
      fontFamily: 'Georgia, serif', fontSize: '13px', color: '#ffe9b0', align:'center'
    }).setOrigin(0.5).setDepth(17);

    var self = this;
    this.img.on('pointerdown', function() {
      if (scene.__busy) return;
      if (GAME.holding && !self.busy) {
        scene.insertDisc && scene.insertDisc();
      } else if (GAME.progress === self.total && scene.onTvFullPress) {
        scene.onTvFullPress();
      }
    });
  }

  setProgress(n) {
    GAME.progress = n;
    this.sockets.forEach((socket, i) => {
      socket.setFillStyle(i < n ? hexN(STORY.discs[i].color) : 0x213432);
    });
    this.screenMsg.setText(n + ' / ' + this.total);
  }

  playDisc(disc) {
    this.discs[disc.id - 1] = true;
    this.busy = true;
    this.glow.setAlpha(0.5);
    chime(660 + disc.id * 120);
    var sc = this.scene;
    sc.tweens.add({ targets: this.glow, alpha: 0, duration: 4000, delay: 2500, ease: 'Sine.easeOut',
      onComplete: function() { this.busy = false; }.bind(this) });
  }

  showFull() {
    this.screenMsg.setText('▶ PLAY').setFontSize('15px').setVisible(true);
    this.glow.setAlpha(0.6);
  }
}
