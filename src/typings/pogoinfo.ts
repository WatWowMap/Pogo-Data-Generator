export interface InvasionInfo {
  active?: boolean
  character?: Character
  lineup?: {
    rewards: number[]
    team: InvasionTeam[][]
  }
}

export interface Character {
  template: string
  gender: number
  boss: boolean
  type: {
    id?: number
    name?: string
  }
}

export interface InvasionTeam {
  id: number
  template: string
  form: number
}
