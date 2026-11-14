// ── STAGE 3 · Ember Trial — 3 boulders, 3 switches ────────────────────
class Stage3 extends StageBase {
  constructor() {
    super({
      key: 'Stage3', crystalTex: 'crystal_ruby',
      spawn: [2, 6], tv: [17, 9], crystal: [14, 7],
      map: [
        'wwwwwwwwwwwwwwwwwwww',
        'wwwwwwwwwwwwwwwwwwww',
        'wwwwwwwwwwwwwwwwwwww',
        'wffffffWWWWWWWWffffw',
        'wffffffWWWWffffffffw',
        'wsfsfffWWWWffWWffffw',
        'wffffffffbfffWWffffw',
        'wffbfffWWWWbfffffffw',
        'wffsfffWWWWffffffffw',
        'wffffffWWWWffffffffw',
        'wffffffWWWWWWWWffffw',
        'wwwwwwwwwwwwwwwwwwww',
      ]
    });
  }
  onGateOpen() { this.scene.start('Stage4'); }
}
