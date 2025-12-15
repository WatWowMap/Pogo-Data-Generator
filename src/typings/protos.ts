import { Rpc } from '@na-ji/pogo-protos'

export type WeatherProto =
  keyof typeof Rpc.GameplayWeatherProto.WeatherCondition

export type CostumeProto = keyof typeof Rpc.PokemonDisplayProto.Costume

export type TypeProto = keyof typeof Rpc.HoloPokemonType

export type PokemonIdProto = keyof typeof Rpc.HoloPokemonId

export type MoveProto = keyof typeof Rpc.HoloPokemonMove

export type FormProto = Exclude<
  keyof typeof Rpc.PokemonDisplayProto.Form,
  number
>

export type GenderProto = keyof typeof Rpc.PokemonDisplayProto.Gender

export type FamilyProto = keyof typeof Rpc.HoloPokemonFamilyId

export type MegaProto = keyof typeof Rpc.HoloTemporaryEvolutionId

export type ItemProto = keyof typeof Rpc.Item

export type QuestTypeProto = keyof typeof Rpc.QuestType

export type QuestRewardProto = keyof typeof Rpc.QuestRewardProto.Type

export type QuestConditionProto =
  keyof typeof Rpc.QuestConditionProto.ConditionType

export type ActivityProto = keyof typeof Rpc.HoloActivityType

export type LocationCardProto = keyof typeof Rpc.LocationCard
