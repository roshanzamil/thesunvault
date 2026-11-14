// ── FINALE: garden clearing — full TV, credits ─────────────────────────
class Finale extends Phaser.Scene {
  constructor() { super({ key: 'Finale' }); }
  create() {
    var self = this;
    this.__busy = false;
    GAME.holding = null;

    this.add.image(0,0,roomBackdrop(this).key).setOrigin(0).setDisplaySize(ROOM_W,ROOM_H);
    this.add.rectangle(0,0,ROOM_W,ROOM_H,0x17100b,0.55).setOrigin(0);

    // TV + progress
    var tv = new RetroTV(this, 10, 6);
    tv.setProgress(GAME.progress);
    tv.showFull();

    // credits text
    this.credit = this.add.text(ROOM_W/2, ROOM_H/2 - 155,
      'A recording is ready.\nTurn up the sound.\n\nPress Enter or click the TV to play.', {
      fontFamily:'Georgia, serif', fontSize:'26px', color:'#ffe9b0',
      fontStyle:'italic', align:'center', lineHeight:'36px'
    }).setOrigin(0.5).setAlpha(0).setDepth(90);

    this.tweens.add({ targets:this.credit, alpha:1, duration:1600, delay:1200 });

    this.onTvFullPress = function() {
      if (self.__playing) return;
      self.__playing = true;
      playMovie();
    };
    this.input.keyboard.once('keydown-ENTER', this.onTvFullPress);
  }
}
