// import * as THREE from 'three'

export const HIGHLIGHT_POSITION_MAP = {
  top: {
    top: '12.25%',
    right: '33%',
  },
  bottom: {
    top: '62.0%',
    right: '33%',
  },
  front: {
    top: '37.25%',
    right: '33%',
  },
  back: {
    top: '86.5%',
    right: '33%',
  },
  left: {
    top: '37.25%',
    right: '66%',
  },
  right: {
    top: '37.25%',
    right: '0%',
  },
}

export const GAME_SYMBOLS = {
  AXE: 'AXE',
  HELM: 'HELM',
  ARROW: 'ARROW',
  SHIELD: 'SHIELD',
  HAND: 'HAND',
}

export const GAME_SYMBOLS_ORDER = {
  AXE: 1,
  ARROW: 2,
  HELM: 3,
  SHIELD: 4,
  HAND: 5,
}

export const DICE_FACES_MAP = {
  /* dice model number to side symbol mapping */
  1: {
    top: { symbol: GAME_SYMBOLS.AXE, isGolden: false },
    bottom: { symbol: GAME_SYMBOLS.HELM, isGolden: false },
    front: { symbol: GAME_SYMBOLS.ARROW, isGolden: true },
    back: { symbol: GAME_SYMBOLS.HAND, isGolden: true },
    right: { symbol: GAME_SYMBOLS.AXE, isGolden: false },
    left: { symbol: GAME_SYMBOLS.SHIELD, isGolden: false },
  },
  2: {
    top: { symbol: GAME_SYMBOLS.AXE, isGolden: false },
    bottom: { symbol: GAME_SYMBOLS.HAND, isGolden: true },
    front: { symbol: GAME_SYMBOLS.ARROW, isGolden: false },
    back: { symbol: GAME_SYMBOLS.HELM, isGolden: false },
    right: { symbol: GAME_SYMBOLS.AXE, isGolden: false },
    left: { symbol: GAME_SYMBOLS.SHIELD, isGolden: true },
  },
  3: {
    top: { symbol: GAME_SYMBOLS.AXE, isGolden: false },
    bottom: { symbol: GAME_SYMBOLS.HELM, isGolden: true },
    front: { symbol: GAME_SYMBOLS.HAND, isGolden: false },
    back: { symbol: GAME_SYMBOLS.SHIELD, isGolden: false },
    right: { symbol: GAME_SYMBOLS.AXE, isGolden: false },
    left: { symbol: GAME_SYMBOLS.ARROW, isGolden: true },
  },
  4: {
    top: { symbol: GAME_SYMBOLS.AXE, isGolden: false },
    bottom: { symbol: GAME_SYMBOLS.HELM, isGolden: true },
    front: { symbol: GAME_SYMBOLS.HAND, isGolden: true },
    back: { symbol: GAME_SYMBOLS.HELM, isGolden: false },
    right: { symbol: GAME_SYMBOLS.ARROW, isGolden: false },
    left: { symbol: GAME_SYMBOLS.SHIELD, isGolden: false },
  },
  5: {
    top: { symbol: GAME_SYMBOLS.AXE, isGolden: false },
    bottom: { symbol: GAME_SYMBOLS.HELM, isGolden: false },
    front: { symbol: GAME_SYMBOLS.HAND, isGolden: false },
    back: { symbol: GAME_SYMBOLS.ARROW, isGolden: true },
    right: { symbol: GAME_SYMBOLS.AXE, isGolden: false },
    left: { symbol: GAME_SYMBOLS.SHIELD, isGolden: true },
  },
  6: {
    top: { symbol: GAME_SYMBOLS.AXE, isGolden: false },
    bottom: { symbol: GAME_SYMBOLS.ARROW, isGolden: false },
    front: { symbol: GAME_SYMBOLS.HAND, isGolden: false },
    back: { symbol: GAME_SYMBOLS.HELM, isGolden: true },
    right: { symbol: GAME_SYMBOLS.AXE, isGolden: false },
    left: { symbol: GAME_SYMBOLS.SHIELD, isGolden: true },
  },
}

const PI_HALF = Math.PI * 0.5
export const ROTATION_FACE_MAP = {
  top: { x: 0, y: -PI_HALF, z: 0 },
  bottom: { x: -Math.PI, y: PI_HALF, z: 0 },
  front: { x: -PI_HALF, y: 0, z: 0 },
  back: { x: PI_HALF, y: 0, z: Math.PI },
  right: { x: 0, y: -PI_HALF, z: PI_HALF },
  left: { x: 0, y: PI_HALF, z: -PI_HALF },
}

export const KEYBOARD_STATE_MODIFIERS = ['shift', 'ctrl', 'alt', 'meta']
export const KEYBOARD_STATE_ALIAS = {
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  space: 32,
  pageup: 33,
  pagedown: 34,
  tab: 9,
}

export const GAME_BACKGROUND_VOLUME = 'TRIALS_OF_FAITH_BACKGROUND_VOLUME'
export const GAME_SOUND_EFFECT_VOLUME = 'TRIALS_OF_FAITH_SOUND_EFFECT_VOLUME'
export const GAME_PLAYER_ID = 'GAME_PLAYER_ID'
export const MAX_DICE_THROWS = 3

export const GAME_STARTING_LIFE_STONES = 15

export const GAME_TYPES = {
  GAME_TYPE_MULTIPLAYER: 'GAME_TYPE_MULTIPLAYER',
  GAME_TYPE_NPC: 'GAME_TYPE_NPC',
}

export const GAME_PLAYER_TYPES = {
  GAME_PLAYER_TYPE_PLAYER: 'PLAYER',
  GAME_PLAYER_TYPE_NPC: 'NPC',
}

export const GAMES_PHASES = {
  DICE_ROLL: 'DICE_ROLL',
  FAITH_CASTING: 'FAITH_CASTING',
  DICE_RESOLVE: 'DICE_RESOLVE',
  FAITH_RESOLVE: 'FAITH_RESOLVE',
}

/*
 * Runes
 * */
export const GAMES_RUNES = {
  RUNE_SERQET: 'RUNE_SERQET',
  RUNE_SHU: 'RUNE_SHU',
  RUNE_SET: 'RUNE_SET',
  RUNE_RA: 'RUNE_RA',
  RUNE_OSIRIS: 'RUNE_OSIRIS',
  RUNE_NEKHBET: 'RUNE_NEKHBET',
  RUNE_ISIS: 'RUNE_ISIS',
  RUNE_HORUS: 'RUNE_HORUS',
  RUNE_BAST: 'RUNE_BAST',
  RUNE_ANUBIS: 'RUNE_ANUBIS',
  RUNE_ANUBIS_BLACK: 'RUNE_ANUBIS_BLACK',
  RUNE_ANUBIS_WHITE: 'RUNE_ANUBIS_WHITE',
  RUNE_TAWARET: 'RUNE_TAWARET',
  RUNE_BABI: 'RUNE_BABI',
  RUNE_NEPHTHYS: 'RUNE_NEPHTHYS',
}
export const GAMES_RUNE_MODELS = {
  RUNE_SERQET: 'runeSerqet',
  RUNE_SHU: 'runeShu',
  RUNE_SET: 'runeSet',
  RUNE_RA: 'runeRa',
  RUNE_OSIRIS: 'runeOsiris',
  RUNE_NEKHBET: 'runeNekhbet',
  RUNE_ISIS: 'runeIsis',
  RUNE_HORUS: 'runeHorus',
  RUNE_BAST: 'runeBast',
  RUNE_ANUBIS: 'runeAnubis',
  RUNE_ANUBIS_BLACK: 'runeAnubisBlack',
  RUNE_ANUBIS_WHITE: 'runeAnubisWhite',
  RUNE_TAWARET: 'runeTawaret',
  RUNE_BABI: 'runeBabi',
  RUNE_NEPHTHYS: 'runeNephthys',
}

export const RUNE_RESOLUTION_TYPES = {
  BEGINNING_RESOLUTION: 'BEGINNING_RESOLUTION',
  END_RESOLUTION: 'END_RESOLUTION',
}

export const RUNE_RESOLUTION_TYPES_DESCRIPTION = {
  BEGINNING_RESOLUTION: 'Before dice resolution',
  END_RESOLUTION: 'After dice resolution',
}

export const GAME_RUNES_DESCRIPTIONS = {
  RUNE_SERQET: {
    name: 'Serquet\'s sting',
    description: 'each unblocked die deals X times damage (rounded up)',
    tier1: { cost: { faith: '3', souls: '' }, text: '1.5x per die', value: 1.5 },
    tier2: { cost: { faith: '6', souls: '' }, text: '2x per die' },
    value: 2,
    tier3: { cost: { faith: '10', souls: '' }, text: '2.5x per die', value: 2.5 },
    resolution: RUNE_RESOLUTION_TYPES.BEGINNING_RESOLUTION,
  },
  RUNE_SHU: {
    name: '\'s ',
    description: '',
    tier1: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    tier2: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    tier3: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    resolution: RUNE_RESOLUTION_TYPES.END_RESOLUTION,
  },
  RUNE_SET: {
    name: 'Set\'s trickery',
    description: 'Remove up to X dice from the enemies dice',
    tier1: { cost: { faith: '3', souls: '' }, text: '- 1 die', value: 1 },
    tier2: { cost: { faith: '5', souls: '' }, text: '- 2 dice', value: 2 },
    tier3: { cost: { faith: '8', souls: '' }, text: '- 3 dice', value: 3 },
    resolution: RUNE_RESOLUTION_TYPES.BEGINNING_RESOLUTION,
  },
  RUNE_RA: {
    name: '\'s ',
    description: '',
    tier1: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    tier2: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    tier3: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    resolution: RUNE_RESOLUTION_TYPES.END_RESOLUTION,
  },
  RUNE_OSIRIS: {
    name: '\'s ',
    description: '',
    // tier1: { cost: { faith: '3', souls: '' }, text: '+ 1 die', value: 1 },
    // tier2: { cost: { faith: '5', souls: '' }, text: '+ 2 dice', value: 2 },
    // tier3: { cost: { faith: '8', souls: '' }, text: '+ 3 dice', value: 3 },
    // resolution: RUNE_RESOLUTION_TYPES.BEGINNING_RESOLUTION,
  },
  RUNE_NEKHBET: {
    name: '\'s ',
    description: '',
    tier1: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    tier2: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    tier3: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    resolution: RUNE_RESOLUTION_TYPES.END_RESOLUTION,
  },
  RUNE_ISIS: {
    name: '\'s ',
    description: '',
    tier1: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    tier2: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    tier3: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    resolution: RUNE_RESOLUTION_TYPES.END_RESOLUTION,
  },
  RUNE_HORUS: {
    name: '\'s ',
    description: '',
    tier1: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    tier2: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    tier3: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    resolution: RUNE_RESOLUTION_TYPES.END_RESOLUTION,
  },
  RUNE_BAST: {
    name: '\'s ',
    description: '',
    tier1: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    tier2: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    tier3: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    resolution: RUNE_RESOLUTION_TYPES.END_RESOLUTION,
  },
  RUNE_ANUBIS: {
    name: 'Anubis\'s ',
    description: '',
    tier1: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    tier2: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    tier3: { cost: { faith: '0', souls: '' }, text: '+ 0 life stone', value: 0 },
    resolution: RUNE_RESOLUTION_TYPES.END_RESOLUTION,
  },
  RUNE_TAWARET: {
    name: 'Tawaret\'s fertility',
    description: 'Add X life stones',
    tier1: { cost: { faith: '2', souls: '' }, text: '+ 1 life stone', value: 1 },
    tier2: { cost: { faith: '6', souls: '' }, text: '+ 3 life stones', value: 3 },
    tier3: { cost: { faith: '11', souls: '' }, text: '+ 5 life stones', value: 5 },
    resolution: RUNE_RESOLUTION_TYPES.BEGINNING_RESOLUTION,
  },
  RUNE_BABI: {
    name: 'Babi\'s bloodthirst',
    description: 'Destroy X enemy\'s life stones',
    tier1: { cost: { faith: '2', souls: '' }, text: '- 1 life stone', value: 1 },
    tier2: { cost: { faith: '5', souls: '' }, text: '- 3 life stones', value: 3 },
    tier3: { cost: { faith: '11', souls: '' }, text: '- 5 life stones', value: 5 },
    resolution: RUNE_RESOLUTION_TYPES.END_RESOLUTION,
  },
  RUNE_NEPHTHYS: {
    name: 'Nephthys\'s rites',
    description: 'Receive faith tokens for each destroyed life stone',
    tier1: { cost: { faith: '2', souls: '' }, text: '+ 1 per life stone', value: 1 },
    tier2: { cost: { faith: '5', souls: '' }, text: '+ 2 per life stone', value: 2 },
    tier3: { cost: { faith: '9', souls: '' }, text: '+ 3 per life stone', value: 3 },
    resolution: RUNE_RESOLUTION_TYPES.END_RESOLUTION,
  },
}
