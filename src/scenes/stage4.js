// ── STAGE 4 · The Hearth — final room, leads to finale ────────────────
class Stage4 extends StageBase {
  constructor() {
    super({
      key: 'Stage4', crystalTex: 'crystal_ruby',
      spawn: [2, 7], tv: [17, 9], crystal: [14, 7],
      map: [
        'wwwwwwwwwwwwwwwwwwww',
        'wwwwwwwwwwwwwwwwwwww',
        'wwwwwwwwwwwwwwwwwwww',
        'wffffffWWWWWWWWffffw',
        'wWWWWffWWWWffffffffw',
        'wsssfffWWWWffWWffffw',
        'wWWWWffffbfffWWffffw',
        'wffffffWWWWbfffffffw',
        'wffbfffWWWWffffffffw',
        'wfffWsWWWWWfffbffffw',
        'wfffWWWWWWWffffffffw',
        'wwwwwwwwwwwwwwwwwwww',
      ]
    });
  }
  onGateOpen() { this.scene.start('Finale'); }
}
