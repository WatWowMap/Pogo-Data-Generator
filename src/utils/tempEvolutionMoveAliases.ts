import { Rpc } from '@na-ji/pogo-protos'

// Generated from the canonical English move_name_NNNN values at
// https://raw.githubusercontent.com/sora10pls/holoholo-text/refs/heads/main/Release/English/en-us_raw.json
// whose complete contents are references such as "<<move_name_0246>>+".
// Keeping this snapshot local makes generation deterministic when translations
// are disabled, while active aliases are validated by Moves.finalizeTempEvolutionMoves().
const tempEvolutionMoveAliases: Readonly<Record<number, number>> = Object.freeze(
  {
    [Rpc.HoloPokemonMove
      .VM_MOVE_TEMP_EVOLUTION_MEGA_X_V0150_POKEMON_MEWTWO]:
      Rpc.HoloPokemonMove.DYNAMIC_PUNCH,
    [Rpc.HoloPokemonMove
      .VM_MOVE_TEMP_EVOLUTION_MEGA_Y_V0150_POKEMON_MEWTWO]:
      Rpc.HoloPokemonMove.FUTURESIGHT,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0015_POKEMON_BEEDRILL]:
      Rpc.HoloPokemonMove.FELL_STINGER,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_X_V0026_POKEMON_RAICHU]:
      Rpc.HoloPokemonMove.VOLT_TACKLE,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_Y_V0026_POKEMON_RAICHU]:
      Rpc.HoloPokemonMove.ZAP_CANNON,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0036_POKEMON_CLEFABLE]:
      Rpc.HoloPokemonMove.MOONBLAST,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0071_POKEMON_VICTREEBEL]:
      Rpc.HoloPokemonMove.ACID_SPRAY,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0080_POKEMON_SLOWBRO]:
      Rpc.HoloPokemonMove.CHILLING_WATER,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0121_POKEMON_STARMIE]:
      Rpc.HoloPokemonMove.LIQUIDATION,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0149_POKEMON_DRAGONITE]:
      Rpc.HoloPokemonMove.OUTRAGE,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0227_POKEMON_SKARMORY]:
      Rpc.HoloPokemonMove.DRILL_PECK,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0229_POKEMON_HOUNDOOM]:
      Rpc.HoloPokemonMove.DARK_PULSE,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0302_POKEMON_SABLEYE]:
      Rpc.HoloPokemonMove.NIGHT_SHADE,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0310_POKEMON_MANECTRIC]:
      Rpc.HoloPokemonMove.DISCHARGE,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0362_POKEMON_GLALIE]:
      Rpc.HoloPokemonMove.ICE_BEAM,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0398_POKEMON_STARAPTOR]:
      Rpc.HoloPokemonMove.BRAVE_BIRD,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0475_POKEMON_GALLADE]:
      Rpc.HoloPokemonMove.SACRED_SWORD,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0478_POKEMON_FROSLASS]:
      Rpc.HoloPokemonMove.WEATHER_BALL_ICE,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0560_POKEMON_SCRAFTY]:
      Rpc.HoloPokemonMove.UPPER_HAND,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0609_POKEMON_CHANDELURE]:
      Rpc.HoloPokemonMove.OMINOUS_WIND,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0652_POKEMON_CHESNAUGHT]:
      Rpc.HoloPokemonMove.SEED_BOMB,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0655_POKEMON_DELPHOX]:
      Rpc.HoloPokemonMove.MYSTICAL_FIRE,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0658_POKEMON_GRENINJA]:
      Rpc.HoloPokemonMove.SURF,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0687_POKEMON_MALAMAR]:
      Rpc.HoloPokemonMove.PSYBEAM,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0780_POKEMON_DRAMPA]:
      Rpc.HoloPokemonMove.TWISTER,
    [Rpc.HoloPokemonMove.VM_MOVE_TEMP_EVOLUTION_MEGA_V0870_POKEMON_FALINKS]:
      Rpc.HoloPokemonMove.BRICK_BREAK,
  },
)

export default tempEvolutionMoveAliases
