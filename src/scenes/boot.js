class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    this.load.setPath('assets/higgsfield/');
    this.load.spritesheet('hero_tex', 'hero.png', {frameWidth: 64, frameHeight: 64});
    this.load.spritesheet('tiles_floor', 'tiles_floor.png', {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('tiles_wall', 'tiles_wall.png', {frameWidth: 32, frameHeight: 32});
    var art = {
      room1_bg: 'room1', tv_tex: 'sun-altar-tv', chest_tex: 'chest', gate_closed: 'door_locked',
      gate_open: 'door_open', boulder: 'boulder', torch: 'torch',
      crystal_cyan: 'crystal_cyan', crystal_ruby: 'crystal_ruby'
    };
    Object.entries(art).forEach(([key, file]) => this.load.image(key, file + '.png'));
  }

  create() {
    ['down','left','right','up'].forEach((dir, row) => {
      var base = row * 6;
      var animation = (action, offsets, frameRate) => this.anims.create({
        key: action + '-' + dir,
        frames: offsets.map(i => ({key:'hero_tex', frame:base + i})),
        frameRate, repeat:-1
      });
      animation('idle', [0,1], 2);
      animation('walk', [2,3,4,5], 12);
    });
    // soft glow dot
    var g = this.make.graphics({ add: false });
    g.fillStyle(0xffffff, 0.85); g.fillCircle(32, 32, 8);
    g.fillStyle(0xffffff, 0.35); g.fillCircle(32, 32, 16);
    g.fillStyle(0xffffff, 0.12); g.fillCircle(32, 32, 28);
    g.generateTexture('dot_glow', 64, 64); g.destroy();

    this.scene.start('StartScreen');
  }
}
