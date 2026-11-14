// ── STAGE 2 · The Silent Hall — 2 boulders, 2 switches ────────────────
class Stage2 extends StageBase {
  constructor() {
    super({
      key: 'Stage2', crystalTex: 'crystal_ruby',
      spawn: [2, 6], tv: [17, 9], crystal: [14, 7],
      map: [
        'wwwwwwwwwwwwwwwwwwww',
        'wwwwwwwwwwwwwwwwwwww',
        'wwwwwwwwwwwwwwwwwwww',
        'wffffffffffffffffffw',
        'wffffffffffWWWWWWffw',
        'wffffbfffffsfsWWWffw',
        'wffffffffffWWWWWWffw',
        'wfffffffbffffffffffw',
        'wffffffffffffffffffw',
        'wffffffffffffffffffw',
        'wffffffffffffffffffw',
        'wwwwwwwwwwwwwwwwwwww',
      ]
    });
  }
  onGateOpen() { this.scene.start('Stage3'); }
}
