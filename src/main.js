// ── MAIN: Phaser config + scene registration ──────────────────────────
window.addEventListener('load', function() {
  var hintEl = document.getElementById('hint');
  function checkOrientation() {
    var landscape = window.innerWidth > window.innerHeight;
    hintEl.style.display = !landscape && matchMedia('(pointer: coarse)').matches ? 'block' : 'none';
  }
  window.addEventListener('resize', checkOrientation);
  checkOrientation();

  console.log('[MAIN] sceneList ready');
  var sceneList = [Boot, StartScreen, Stage1, Stage2, Stage3, Stage4, Finale];

  var isSmoke = location.search.indexOf('smoke') > -1;

  var game = new Phaser.Game({
    type: location.protocol === 'file:' ? Phaser.CANVAS : Phaser.AUTO,
    loader: { imageLoadType: 'HTMLImageElement' },
    pixelArt: true,
    parent: 'game',
    width: ROOM_W,
    height: ROOM_H,
    backgroundColor: '#0b0d1a',
    physics: { default: 'arcade', arcade: { debug: false } },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: sceneList,
    callbacks: { postBoot: function() { console.log('[MAIN] postBoot, canvas size=', game.canvas.width, 'x', game.canvas.height); } },
  });

  if (isSmoke) {
    var smokeTick = 0;
    var smokeTimer = setInterval(function() {
      smokeTick++;
      try {
        // drive any active stage
        for (var k = 1; k <= 4; k++) {
          var key = 'Stage' + k;
          if (!game.scene.isActive(key)) { continue; }
          var s = game.scene.getScene(key);
          var next = (k === 4) ? 'Finale' : 'Stage' + (k + 1);
          s.__busy = false;
          // step 1: all switches lit (boulders on pads) → reveal + collect crystal
          if (!s.allSwitchesLit) {
            s.allSwitchesLit = true;
            s.revealCrystal();
            document.title = 'SMOKE_' + key + ' reveal t=' + smokeTick;
            return;
          }
          // step 2: crystal visible → collect it (hero now holding disc)
          if (!GAME.holding) {
            s.collectCrystal();
            document.title = 'SMOKE_' + key + ' collect t=' + smokeTick;
            return;
          }
          // step 3: hero holding → insert disc → advance
          var d = STORY.discs[GAME.progress];
          s.hero.setHolding(null);
          GAME.holding = null;
          s.tv.setProgress(GAME.progress + 1);
          game.scene.stop(key);
          game.scene.start(next);
          document.title = 'SMOKE_' + key + ' done t=' + smokeTick;
          return;
        }
        // opening → stage1
        if (game.scene.isActive('StartScreen')) {
          document.title = 'SMOKE_StartScreen t=' + smokeTick;
          game.scene.stop('StartScreen');
          game.scene.start('Stage1');
          return;
        }
        if (game.scene.isActive('Finale')) {
          document.title = 'SMOKE_PASS_' + GAME.progress;
          clearInterval(smokeTimer);
          return;
        }
        document.title = 'SMOKE_Boot t=' + smokeTick;
      } catch (e) {
        document.title = 'SMOKE_FAIL: ' + e.message;
        clearInterval(smokeTimer);
      }
    }, 600);
  }


});

// Paint one shared video frame stream beneath the scene. The canvas uses the
// same 640 × 360 coordinates as the room artwork and its collision bands.
function roomBackdrop(scene) {
  var video = document.getElementById('roomLoop');
  var texture = scene.textures.get('roomLoop');
  if (!scene.textures.exists('roomLoop')) {
    texture = scene.textures.createCanvas('roomLoop', 640, 360);
    texture.context.drawImage(scene.textures.get('room1_bg').getSourceImage(), 0, 0, 640, 360);
    texture.refresh();
    function draw() {
      if (video.readyState >= 2) {
        texture.context.drawImage(video, 0, 0, 640, 360);
        texture.refresh();
      }
    }
    if (video.requestVideoFrameCallback) {
      video.requestVideoFrameCallback(function frame() {
        draw();
        video.requestVideoFrameCallback(frame);
      });
    } else {
      scene.game.events.on('prestep', draw);
    }
    video.play().catch(function() {
      document.addEventListener('pointerdown', () => video.play().catch(() => {}), {once:true});
      document.addEventListener('keydown', () => video.play().catch(() => {}), {once:true});
    });
  }
  return texture;
}

// Helpers used by start/finale
function hexN(c) { return parseInt(c.replace('#','0x')); }

function playMovie() {
  var film = document.getElementById('endingFilm');
  document.getElementById('cine').style.display = 'block';
  film.muted = false;
  film.volume = 1;
  film.onended = showLetter;
  film.play().catch(() => film.focus()); // Native controls allow a second user gesture.
}

function showLetter() {
  var letter = document.getElementById('letter');
  document.getElementById('cineStage').style.display = 'none';
  document.getElementById('letterHd').textContent = STORY.letterHd;
  document.getElementById('letterBody').textContent = STORY.letter;
  var music = document.getElementById('letterMusic');
  var button = document.getElementById('letterMusicButton');
  music.volume = 0.65;
  music.onplaying = () => { button.textContent = 'Pause music'; };
  music.onpause = () => { button.textContent = 'Play music'; };
  button.onclick = () => {
    if (music.paused) music.play().catch(() => { button.textContent = 'Retry music'; });
    else music.pause();
  };
  letter.style.display = 'flex';
  var again = letter.querySelector('.again');
  again.style.transition = 'opacity 2.5s';
  again.style.opacity = '0';
  setTimeout(function() { again.style.opacity = '1'; }, 2500);
}
