// ── STORY DATA ─────────────────────────────────────────────────────────
const STORY = {
  title: 'The Sun Vault',
  discCount: 4,
  discs: [
    { id:1, key:'d1', color:'#ffe9b0',
      title:'First Light',
      verse:'before the world had a name for you,\nthe light already knew the way.',
      still:'assets/higgsfield/crystal_cyan.png' },
    { id:2, key:'d2', color:'#b9a7ff',
      title:'The Silent Hall',
      verse:'in the quiet, you learned to listen\nto what the walls could not say.',
      still:'assets/higgsfield/crystal_ruby.png' },
    { id:3, key:'d3', color:'#9fd8ff',
      title:'Ember Trial',
      verse:'fire does not ask permission.\nit only asks you to begin.',
      still:'assets/higgsfield/crystal_ruby.png' },
    { id:4, key:'d4', color:'#ffc1e0',
      title:'The Hearth',
      verse:'the temple is finished.\nthe light has always been yours.',
      still:'assets/higgsfield/crystal_ruby.png' },
  ],
  openingVerse:'Four chambers. Four missing crystals.\nRestore power to the vault.',
  chestLines: [
    ['Hear that? The stone seal on the chest just cracked.', 'A crystal. I wonder if it fits the old TV.'],
    ['Someone wrapped this crystal in linen. Even the tomb dust stayed out.', 'Funny thing to do for a piece of machinery.'],
    ['There’s a folded note in the hollow beneath this stone.', '“I hope she takes her time getting here.” Who’s she?'],
    ['One last inscription, right above the sun crest. “When you get here, turn the sound up.”', 'Ruqaiya, I think whoever built this place wanted to show you something.']
  ],
  letterHd:'Dear Ruqaiya,',
  letter:
`Happy 22nd birthday! You’ve opened the last stone door. Someone tucked a birthday wish between these old stones, and it has your name on it.

I hope somewhere between the birthday wishes and the last bite of cake, you get a quiet minute to make a wish just for yourself. Even the one you feel a little silly saying out loud counts.

At 22, you have time to be a beginner. Try the thing you keep thinking about. Ask the question you’ve been saving. Give yourself a chance to discover what you enjoy, and the freedom to change your mind along the way.

I hope this year brings you little moments when you catch yourself thinking, “I’m really happy here.” Maybe it’ll happen somewhere you’ve always wanted to go. Maybe it’ll be an ordinary evening when someone makes you laugh so hard you forget what you were about to say.

More people care about you than you know, Ruqaiya. Call them when something goes right, even if it seems too small to mention. And when a day feels heavy, “Do you have a minute?” is enough. Wherever life takes you, there’s someone who’ll be glad to hear your voice.

Happy birthday, Ruqaiya. I hope that by the time you blow out twenty-three candles, you’ll have a story you can’t wait to tell about something you finally did for yourself.`
};

// ── RPG CONSTANTS ─────────────────────────────────────────────────────
const TILE = 64;                     // one tile = 64px
const ROOM_COLS = 20;                // 20 tiles wide  = 1280px
const ROOM_ROWS = 12;                // 12 tiles tall  = 768px
const ROOM_W = ROOM_COLS * TILE;    // 1280
const ROOM_H = ROOM_ROWS * TILE;    // 768
const MOVE_DURATION = 140;           // ms per grid-step
const SCENES = ['Boot','StartScreen','Stage1','Stage2','Stage3','Stage4','Finale'];
