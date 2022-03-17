import { Client } from "@colyseus/core";
import { Schema, MapSchema, ArraySchema, Context, type, filter } from "@colyseus/schema";

export class Card extends Schema {

  @type('string') owner: string
  @type('boolean') revealed: boolean = false
  
  @filter(function(
    this: Card,
    client: Client,
    value: Card['value'],
    root: Schema
  ){
    return this.revealed || this.owner === client.sessionId
  })
  @type('string') value: string

}

export class Player extends Schema {

  @type('string') uid: string
  @type('string') name: string
  @type('boolean') ready: boolean = false
  @type('string') sessionId: string
  @type('number') chips: number = 0
  @type('number') current_bet: number = 0
  //@type('number') best_hand: number = 0
  @type('boolean') folded: boolean = false
  @type([Card]) cards = new  ArraySchema<Card>()
  //cards = new ArraySchema<Card>()

}

export class GameState extends Schema {

  @type('boolean') game_started: boolean = false
  @type('string') host: string
  @type({map: Player}) players = new MapSchema<Player>()
  //@type({map: Player}) active_players = new MapSchema<Player>()
  //@type(['string']) folded_players = new ArraySchema<Player>()
  @type('number') player_idx: number = 1
  @type('string') stake: string
  @type('number') amount: number
  @type('number') chips: number
  @type('number') b_blind: number
  @type('number') s_blind: number
  @type('string') dealer: string
  @type('string') bb_player: string
  @type('string') sb_player: string
  @type('string') current_player: string
  @type([Card]) community_cards = new  ArraySchema<Card>()
  @type('number') largest_bet: number
  @type('number') round_stage: number = 0 // 0 - hidden, 1 - flop, 2 - turn, 3 - river
  @type('number') pot: number
  @type('string') winner: string

  deck: Card[]

  dealer_idx = 0
  connected_players = 0
  active_players: string[]
  betting_players = new Map()
  folded_players = 0
  matched_players = 0
}

const suits = ['C', 'D', 'H', 'S'] // Clubs, Diamonds, Hearts, Spades
const cards = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']
const CARD_SUIT_MAP = new Map([
  ['C', 'Clubs'],
  ['D', 'Diamonds'],
  ['H', 'Hearts'],
  ['S', 'Spades']
]);
const CARD_NAME_MAP = new Map([
  ['2', 'Two'],
  ['3', 'Three'],
  ['4', 'Four'],
  ['5', 'Five'],
  ['6', 'Six'],
  ['7', 'Seven'],
  ['8', 'Eight'],
  ['9', 'Nine'],
  ['T', 'Ten'],
  ['J', 'Jack'],
  ['Q', 'Queen'],
  ['K', 'King'],
  ['A', 'Ace']
])
const CARD_VALUE_MAP = new Map([
  ['2', 2],
  ['3', 3],
  ['4', 4],
  ['5', 5],
  ['6', 6],
  ['7', 7],
  ['8', 8],
  ['9', 9],
  ['T', 10],
  ['J', 11],
  ['Q', 12],
  ['K', 13],
  ['A', 14]
])

export function readCard(card: Card) {
    const details = card.value.split('',2)
    let value: string = details[0]
    let suit: string = details[1]
    return (CARD_NAME_MAP.get(value) + ' of ' + CARD_SUIT_MAP.get(suit))
}

//Create Full Deck of Cards (Ordered):
export function newDeck() {
    let deck = []

    for (let suit of suits) {
        for (let card of cards) {
          let _card = new Card
          _card.value = card + suit
          deck.push(_card)
        }
    }
    return deck
}

//Take array and return a shuffled one:
export function shuffle(deck: Card[]) {
  let shuffled = deck;
  //Fisher-Yates in-place O(n) shuffle
  let m = shuffled.length

  // While there remain elements to shuffle…
  while (m) {

      // Pick a remaining element…
      const i = Math.floor(Math.random() * m--)

      // And swap it with the current element.
      let t = shuffled[m]
      shuffled[m] = shuffled[i]
      shuffled[i] = t
  }
  return shuffled
}

const HAND_VALUE_MAP = ([
  [1, 'High Card'],
  [2, 'Pair'],
  [3, 'Two Pair'],
  [4, 'Three of a Kind'],
  [5, 'Straight'],
  [6, 'Flush'],
  [7, 'Full House'],
  [8, 'Four of a Kind'],
  [9, 'Straight Flush'],
  [10, 'Royal Flush'],
]);

export function findBestHand(communityCards: Card[], playerHand: Card[]) {
  let bestHand = 0
  let cards = communityCards.concat(playerHand)
  if (isFlush(cards)) {
    // check for straight flush
    if (isStraight(cards)) {
      //check for royal flush
      if (isRoyal(cards)) {
        bestHand = 10
      } else {
        bestHand = 9
      }
    } else {
      bestHand = 6
    }
  } else if (isFourOfAKind(cards)) bestHand = 8
  else if (isFullHouse(cards)) bestHand = 7
  else if (isStraight(cards)) bestHand = 5
  else if (isThreeOfAKind(cards)) bestHand = 4
  else if (countPairs(cards) == 2) bestHand = 3
  else if (countPairs(cards) == 1) bestHand = 2
  else bestHand = 1
  return bestHand
}

function isFlush(cards: Card[]) {
  let clubs = 0
  let diamonds = 0
  let hearts = 0
  let spades = 0

  cards.forEach((card) => {
    const details = card.value.split('',2)
    let suit: string = details[1]
    switch(suit) {
      case 'C':
        clubs+=1
        break
      case 'D':
        diamonds+=1
        break
      case 'H':
        hearts+=1
        break
      case 'S':
        spades+=1
        break
    }
  });

  if (clubs == 5 || diamonds == 5 || hearts == 5 || spades == 5 ) return true
  else return false
}

function isStraight(cards: Card[]) {
  let values: number[]
  cards.forEach((card) => {
    const details = card.value.split('',2)
    let value: string = details[0]
    values.push(CARD_VALUE_MAP.get(value))
  });
  values.sort(function(a, b){return a-b})
  let previousValue: number = null
  values.forEach((value) => {
    if (previousValue == null) {
      previousValue = value
    } else {
      if (value != previousValue+1) {
        return false
      }
    }
  });
  return true
}

function isRoyal(cards: Card[]) {
  let values: number[]
  cards.forEach((card) => {
    const details = card.value.split('',2)
    let value: string = details[0]
    values.push(CARD_VALUE_MAP.get(value))
  });
  let sum = values.reduce((a,b) => a + b, 0)
  if (sum == 60) {
    return true
  } else {
    return false
  }
}

function isStraightFlush(cards: Card[]) {
  cards.forEach((card) => {
    const details = card.value.split('',2)
    let value: string = details[0]
  });
}

function isFourOfAKind(cards: Card[]) {
  let counts: number[]
  cards.forEach((card) => {
    const details = card.value.split('',2)
    let value: string = details[0]
    let num = CARD_VALUE_MAP.get(value)
    counts[num] = counts[num] ? counts[num] + 1 : 1;
  });
  counts.forEach((num) => {
    if (num == 4) return true
  })
  return false
}

function isFullHouse(cards: Card[]) {
  let isPair = false
  let isThree = false
  let counts: number[]
  cards.forEach((card) => {
    const details = card.value.split('',2)
    let value: string = details[0]
    let num = CARD_VALUE_MAP.get(value)
    counts[num] = counts[num] ? counts[num] + 1 : 1;
  });
  counts.forEach((num) => {
    if (num == 2) isPair = true
    if (num == 3) isThree = true
  })
  if (isPair && isThree) return true
  else return false
}

function isThreeOfAKind(cards: Card[]) {
  let counts: number[]
  cards.forEach((card) => {
    const details = card.value.split('',2)
    let value: string = details[0]
    let num = CARD_VALUE_MAP.get(value)
    counts[num] = counts[num] ? counts[num] + 1 : 1;
  });
  counts.forEach((num) => {
    if (num == 3) return true
  })
  return false
}

function countPairs(cards: Card[]) {
  let pairCount = 0
  let counts: number[]
  cards.forEach((card) => {
    const details = card.value.split('',2)
    let value: string = details[0]
    let num = CARD_VALUE_MAP.get(value)
    counts[num] = counts[num] ? counts[num] + 1 : 1;
  });
  counts.forEach((num) => {
    if (num == 2) pairCount+=1
  })
  return pairCount
}
