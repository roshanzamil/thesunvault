// ── START SCREEN: title card + tap to begin ────────────────────────────
class StartScreen extends Phaser.Scene {
  constructor() { super({ key: 'StartScreen' }); }
  create() {
    console.log('[StartScreen] create entry');
    var self = this;

    this.add.image(0,0,roomBackdrop(this).key).setOrigin(0).setDisplaySize(ROOM_W,ROOM_H);
    this.add.rectangle(0,0,ROOM_W,ROOM_H,0x17100b,0.55).setOrigin(0);

    // title
    this.title = this.add.text(ROOM_W/2, ROOM_H/2 - 80, STORY.title, {
      fontFamily:'Georgia, serif', fontSize:'56px', color:'#ffe9b0'
    }).setOrigin(0.5).setAlpha(0);

    this.sub = this.add.text(ROOM_W/2, ROOM_H/2 - 20, STORY.openingVerse, {
      fontFamily:'Georgia, serif', fontSize:'22px', color:'#ffffffaa',
      fontStyle:'italic', align:'center', lineHeight:'30px'
    }).setOrigin(0.5).setAlpha(0);

    this.tap = this.add.text(ROOM_W/2, ROOM_H/2 + 120, 'Enter or click to begin', {
      fontFamily:'Georgia, serif', fontSize:'18px', color:'#ffffff77'
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets:this.title, alpha:1, duration:1600, delay:500 });
    this.tweens.add({ targets:this.sub,   alpha:1, duration:1600, delay:1200 });
    this.time.delayedCall(2400, function(){ self.tap.setAlpha(1); });

    var starting = false;
    function begin() {
      if (starting) return;
      starting = true;
      chime(880);
      self.tweens.add({ targets:[self.title,self.sub], alpha:0, duration:800,
        onComplete: function() { self.scene.stop(); self.scene.start('Stage1'); }
      });
    }
    this.input.once('pointerdown', begin);
    this.input.keyboard.once('keydown-ENTER', begin);
  }
}

// Helper used by sky gradients
function hexN(c) { return parseInt(c.replace('#','0x')); }
