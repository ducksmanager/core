import Index from '@prisma/client'
import { Author, RoundWithScoresAndAuthor } from '~/types/roundWithScoresAndAuthor'

export interface GamePlayerWithFullPlayer extends Index.game_player {
  player: Index.player
}

export interface GameFull extends Index.game {
  authors: Author[]
  rounds: RoundWithScoresAndAuthor[]
  game_players: GamePlayerWithFullPlayer[]
}
