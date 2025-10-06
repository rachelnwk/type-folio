export const TIME_OPTIONS = [15, 30, 60];
export const PROFILES = {
  hmx: {
    alphas: [],
    space:  [],
    mods:   [],
  },
  kg: {
    top_alphas: [`${import.meta.env.BASE_URL}audio/KG/topalpha.mp3`],
    mid_alphas: [`${import.meta.env.BASE_URL}audio/KG/midalpha.mp3`],
    bot_alphas: [`${import.meta.env.BASE_URL}audio/KG/botalpha.mp3`],
    space: [`${import.meta.env.BASE_URL}audio/KG/spacebar.mp3`],
    backspace: [`${import.meta.env.BASE_URL}audio/KG/backspace.mp3`],
    mods: [`${import.meta.env.BASE_URL}audio/KG/shift.mp3`],
  },
  mac: {
    alphas: [],
    space:  [],
    mods:   [],
  },
};