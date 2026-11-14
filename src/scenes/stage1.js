// ── STAGE 1 · First Light — 1 boulder, 1 switch ───────────────────────
class Stage1 extends StageBase {
  constructor() {
    super({
      key: 'Stage1', crystalTex: 'crystal_cyan',
      spawn: [2, 6], tv: [17, 9], crystal: [14, 7],
      map: [
        'wwwwwwwwwwwwwwwwwwww',
        'wwwwwwwwwwwwwwwwwwww',
        'wwwwwwwwwwwwwwwwwwww',
        'wffffffffffffffffffw',
        'wffffffffffffffffffw',
        'wfffffffWffffffffffw',
        'wffffbffWfffsffffffw',
        'wfffffffWffffffffffw',
        'wffffffffffffffffffw',
        'wffffffffffffffffffw',
        'wffffffffffffffffffw',
        'wwwwwwwwwwwwwwwwwwww',
      ]
    });
  }
  onGateOpen() { this.scene.start('Stage2'); }
}
