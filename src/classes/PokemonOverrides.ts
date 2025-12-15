import { AllForms } from '../typings/dataTypes'
import { Rpc } from '@na-ji/pogo-protos'
import Pokemon from './Pokemon'
import { EvoBranch } from '../typings/general'

export default class PokemonOverrides {
  static addEvos(form: AllForms) {
    if (form[Rpc.PokemonDisplayProto.Form.STANTLER_NORMAL].evolutions) {
      console.warn('Wyrdeer evolution added')
    } else
      form[Rpc.PokemonDisplayProto.Form.STANTLER_NORMAL].evolutions = [
        {
          evoId: Rpc.HoloPokemonId.WYRDEER,
        },
      ]
  }

  static addFormData(
    that: Pokemon,
    formId: string | Rpc.PokemonDisplayProto.Form,
  ) {
    switch (formId) {
      case Rpc.PokemonDisplayProto.Form.BASCULIN_WHITE_STRIPED:
        if (that.parsedForms[formId].evolutions) {
          console.warn('Basculegion evolution added')
        } else {
          that.parsedForms[formId].evolutions = [
            {
              evoId: Rpc.HoloPokemonId.BASCULEGION,
              formId: Rpc.PokemonDisplayProto.Form.BASCULEGION_NORMAL,
              candyCost: 50,
              genderRequirement: 1,
            },
            {
              evoId: Rpc.HoloPokemonId.BASCULEGION,
              formId: Rpc.PokemonDisplayProto.Form.BASCULEGION_FEMALE,
              candyCost: 50,
              genderRequirement: 2,
            },
          ]
        }
        break
      case Rpc.PokemonDisplayProto.Form.BASCULEGION_FEMALE:
        that.addFormBaseStats(formId, 120, 92, 65, 100, 75, 78)
        break
      case Rpc.PokemonDisplayProto.Form.SLIGGOO_HISUIAN:
        that.addFormBaseStats(formId, 58, 75, 83, 83, 123, 40)
        if (that.parsedForms[formId].evolutions) {
          console.warn('Hisuian Sliggoo evolution added')
        } else {
          that.parsedForms[formId].evolutions = [
            {
              evoId: Rpc.HoloPokemonId.GOODRA,
              formId: Rpc.PokemonDisplayProto.Form.GOODRA_HISUIAN,
              candyCost: 100,
            },
          ]
        }
        break
      case Rpc.PokemonDisplayProto.Form.GOODRA_HISUIAN:
        that.addFormBaseStats(formId, 80, 100, 100, 110, 150, 60)
        break
      case Rpc.PokemonDisplayProto.Form.TERAPAGOS_TERASTAL:
        that.addFormBaseStats(formId, 95, 95, 110, 105, 110, 85)
        break
      case Rpc.PokemonDisplayProto.Form.TERAPAGOS_STELLAR:
        that.addFormBaseStats(formId, 160, 105, 110, 130, 110, 85)
        break
    }
  }

  static checkEvos(that: Pokemon, mfObject: EvoBranch[]) {
    switch (mfObject[0].evolution) {
      // TODO: improve hardcoded gamemaster but it is tricky since gamemaster might switch to the other set of evolution during events
      // These should also be in sync with gamemaster
      case 'RAICHU':
        if (mfObject.length > 1) {
          console.warn('Alolan Raichu added', mfObject.length)
          break
        } else {
          that.evolvedPokemon.add(Rpc.HoloPokemonId.RAICHU)
          return [
            { evoId: Rpc.HoloPokemonId.RAICHU, candyCost: 50 },
            {
              evoId: Rpc.HoloPokemonId.RAICHU,
              formId: Rpc.PokemonDisplayProto.Form.RAICHU_ALOLA,
              candyCost: 50,
            },
          ]
        }
      case 'EXEGGUTOR':
        if (mfObject.length > 1) {
          console.warn('Alolan Exeggutor added', mfObject.length)
          break
        } else {
          that.evolvedPokemon.add(Rpc.HoloPokemonId.EXEGGUTOR)
          return [
            {
              evoId: Rpc.HoloPokemonId.EXEGGUTOR,
              formId: Rpc.PokemonDisplayProto.Form.EXEGGUTOR_NORMAL,
              candyCost: 50,
            },
            {
              evoId: Rpc.HoloPokemonId.EXEGGUTOR,
              formId: Rpc.PokemonDisplayProto.Form.EXEGGUTOR_ALOLA,
              candyCost: 50,
            },
          ]
        }
      case 'MAROWAK':
        if (mfObject.length > 1) {
          console.warn('Alolan Marowak added', mfObject.length)
          break
        } else {
          that.evolvedPokemon.add(Rpc.HoloPokemonId.MAROWAK)
          return [
            {
              evoId: Rpc.HoloPokemonId.MAROWAK,
              formId: Rpc.PokemonDisplayProto.Form.MAROWAK_NORMAL,
              candyCost: 50,
            },
            {
              evoId: Rpc.HoloPokemonId.MAROWAK,
              formId: Rpc.PokemonDisplayProto.Form.MAROWAK_ALOLA,
              candyCost: 50,
            },
          ]
        }
      case 'WEEZING':
        if (mfObject.length > 1) {
          console.warn('Galarian Weezing added', mfObject.length)
          break
        } else {
          that.evolvedPokemon.add(Rpc.HoloPokemonId.WEEZING)
          return [
            {
              evoId: Rpc.HoloPokemonId.WEEZING,
              formId: Rpc.PokemonDisplayProto.Form.WEEZING_NORMAL,
              candyCost: 50,
            },
            {
              evoId: Rpc.HoloPokemonId.WEEZING,
              formId: Rpc.PokemonDisplayProto.Form.WEEZING_GALARIAN,
              candyCost: 50,
            },
          ]
        }
      case 'MR_MIME':
        if (mfObject.length > 1) {
          console.warn('Galarian Mr Mime added', mfObject.length)
          break
        } else {
          that.evolvedPokemon.add(Rpc.HoloPokemonId.MR_MIME)
          return [
            {
              evoId: Rpc.HoloPokemonId.MR_MIME,
              candyCost: 50,
              questRequirement: 'MR_MIME_EVOLUTION_QUEST',
            },
            {
              evoId: Rpc.HoloPokemonId.MR_MIME,
              formId: Rpc.PokemonDisplayProto.Form.MR_MIME_GALARIAN,
              candyCost: 50,
            },
          ]
        }
      case 'SCIZOR':
        if (mfObject.length > 1) {
          console.warn('Kleavor added', mfObject.length)
          break
        } else {
          that.evolvedPokemon.add(Rpc.HoloPokemonId.SCIZOR)
          that.evolvedPokemon.add(Rpc.HoloPokemonId.KLEAVOR)
          return [
            {
              evoId: Rpc.HoloPokemonId.SCIZOR,
              formId: Rpc.PokemonDisplayProto.Form.SCIZOR_NORMAL,
              candyCost: 50,
              itemRequirement: Rpc.Item.ITEM_METAL_COAT,
            },
            {
              evoId: Rpc.HoloPokemonId.KLEAVOR,
              candyCost: 50,
            },
          ]
        }
      case 'TYPHLOSION':
        if (mfObject.length > 1) {
          console.warn('Hisuian Typhlosion added', mfObject.length)
          break
        } else {
          that.evolvedPokemon.add(Rpc.HoloPokemonId.TYPHLOSION)
          return [
            { evoId: Rpc.HoloPokemonId.TYPHLOSION, candyCost: 100 },
            {
              evoId: Rpc.HoloPokemonId.TYPHLOSION,
              formId: Rpc.PokemonDisplayProto.Form.TYPHLOSION_HISUIAN,
              candyCost: 100,
            },
          ]
        }
      case 'SAMUROTT':
        if (mfObject.length > 1) {
          console.warn('Hisuian Samurott added', mfObject.length)
          break
        } else {
          that.evolvedPokemon.add(Rpc.HoloPokemonId.SAMUROTT)
          return [
            { evoId: Rpc.HoloPokemonId.SAMUROTT, candyCost: 100 },
            {
              evoId: Rpc.HoloPokemonId.SAMUROTT,
              formId: Rpc.PokemonDisplayProto.Form.SAMUROTT_HISUIAN,
              candyCost: 100,
            },
          ]
        }
      case 'LILLIGANT':
        if (mfObject.length > 1) {
          console.warn('Hisuian Lilligant added', mfObject.length)
          break
        } else {
          that.evolvedPokemon.add(Rpc.HoloPokemonId.LILLIGANT)
          return [
            {
              evoId: Rpc.HoloPokemonId.LILLIGANT,
              candyCost: 50,
              itemRequirement: Rpc.Item.ITEM_SUN_STONE,
            },
            {
              evoId: Rpc.HoloPokemonId.LILLIGANT,
              formId: Rpc.PokemonDisplayProto.Form.LILLIGANT_HISUIAN,
              candyCost: 50,
            },
          ]
        }
      case 'BRAVIARY':
        if (mfObject.length > 1) {
          console.warn('Hisuian Braviary added', mfObject.length)
          break
        } else {
          that.evolvedPokemon.add(Rpc.HoloPokemonId.BRAVIARY)
          return [
            {
              evoId: Rpc.HoloPokemonId.BRAVIARY,
              formId: Rpc.PokemonDisplayProto.Form.BRAVIARY_NORMAL,
              candyCost: 50,
            },
            {
              evoId: Rpc.HoloPokemonId.BRAVIARY,
              formId: Rpc.PokemonDisplayProto.Form.BRAVIARY_HISUIAN,
              candyCost: 50,
            },
          ]
        }
      case 'SLIGGOO':
        if (mfObject.length > 1) {
          console.warn('Hisuian Sliggoo added', mfObject.length)
          break
        } else {
          that.evolvedPokemon.add(Rpc.HoloPokemonId.SLIGGOO)
          return [
            { evoId: Rpc.HoloPokemonId.SLIGGOO, candyCost: 25 },
            {
              evoId: Rpc.HoloPokemonId.SLIGGOO,
              formId: Rpc.PokemonDisplayProto.Form.SLIGGOO_HISUIAN,
              candyCost: 25,
            },
          ]
        }
      case 'AVALUGG':
        if (mfObject.length > 1) {
          console.warn('Hisuian Avalugg added', mfObject.length)
          break
        } else {
          that.evolvedPokemon.add(Rpc.HoloPokemonId.AVALUGG)
          return [
            { evoId: Rpc.HoloPokemonId.AVALUGG, candyCost: 50 },
            {
              evoId: Rpc.HoloPokemonId.AVALUGG,
              formId: Rpc.PokemonDisplayProto.Form.AVALUGG_HISUIAN,
              candyCost: 50,
            },
          ]
        }
      case 'DECIDUEYE':
        if (mfObject.length > 1) {
          console.warn('Hisuian Decidueye added', mfObject.length)
          break
        } else {
          that.evolvedPokemon.add(Rpc.HoloPokemonId.DECIDUEYE)
          return [
            { evoId: Rpc.HoloPokemonId.DECIDUEYE, candyCost: 100 },
            {
              evoId: Rpc.HoloPokemonId.DECIDUEYE,
              formId: Rpc.PokemonDisplayProto.Form.DECIDUEYE_HISUIAN,
              candyCost: 100,
            },
          ]
        }
    }
  }
}
