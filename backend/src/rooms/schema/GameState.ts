import { Client } from "@colyseus/core";
import { Schema, MapSchema, ArraySchema, Context, type, filter } from "@colyseus/schema";

export class Card extends Schema {

  @type('string') owner: string
  //@type('number') index: number
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
  @type('string') stake: string           // game stake
  @type('number') amount: number          // amount of stake
  @type('number') chips: number           // # of chips each player gets
  @type('number') b_blind: number         // min buy-in for big blind player
  @type('number') s_blind: number         // min buy-in for small blind player
  @type('string') dealer: string          // current dealer
  @type('string') bb_player: string       // current big blind player
  @type('string') sb_player: string       // current small blind player
  @type('string') current_player: string  // current player
  @type('string') current_uid: string     // current player's uid
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
  let cards: Card[] = []
  let values: String[] = []
  communityCards.forEach(card => {
    cards.push(card)
    values.push(card.value)
  });
  playerHand.forEach(card => {
    cards.push(card)
    values.push(card.value)
  });
  console.log('Finding best hand: ', values)
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
  //} else if (isFourOfAKind(cards)) bestHand = 8
  } else {
    let check = checkForDuplicates(cards)
    if (check === 5) bestHand = 8             // Four of Kind
    else if (check === 4) bestHand = 7        // Full House
    else if (isStraight(cards)) bestHand = 5  // Straight
    else if (check === 3) bestHand = 4        // Three of a Kind
    else if (check === 2) bestHand = 3        // Two pair
    else if (check === 1) bestHand = 2        // pair
    else bestHand = 1                         // High Card
  }
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
  
  console.log('Checking for flush: %s Clubs, %s Diamonds, %s Hearts, %s Spades', clubs, diamonds, hearts, spades)
  if (clubs == 5 || diamonds == 5 || hearts == 5 || spades == 5 ) return true
  else return false
}

function isStraight(cards: Card[]) {
  let values: number[] = []
  cards.forEach((card) => {
    const details = card.value.split('',2)
    let value: number = CARD_VALUE_MAP.get(details[0])
    values.push(value)
  });
  values.sort(function(a, b){return a-b})
  let previousValue: number = null
  values.forEach((value) => {
    if (previousValue == null) {
      previousValue = value
    } else {
      if (value != previousValue+1) {
        console.log('Not a straight: ', values)
        return false
      }
    }
  });
  return true
}

function isRoyal(cards: Card[]) {
  let values: number[] = []
  cards.forEach((card) => {
    const details = card.value.split('',2)
    let value: number = CARD_VALUE_MAP.get(details[0])
    values.push(value)
    // let value: string = details[0]
    // values.push(Number(CARD_VALUE_MAP.get(value)))
  });
  let sum = values.reduce((a,b) => a + b, 0)
  if (sum == 60) {
    return true
  } else {
    console.log('Not a Royal Flush: Toal of %s < 60', sum)
    return false
  }
}

// function isFourOfAKind(cards: Card[]) {
//   let counts: number[]
//   cards.forEach((card) => {
//     const details = card.value.split('',2)
//     let value: string = details[0]
//     let num: number = Number(CARD_VALUE_MAP.get(value))
//     //counts[num] = counts[num] ? counts[num] + 1 : 1;
//     if(counts[num]) counts[num]+=1
//     else counts[num]=1
//   });
//   console.log(counts)
//   counts.forEach((num) => {
//     if (num == 4) return true
//   })
//   return false
// }

// HELPER FUNCTIONS FOR CHECKING FOR 4 or 3 OF A KIND & PAIRS:
// Counts occorrences of a value in an array
const countOccurrences = (arr: any, val: any) => arr.reduce((a: any, v: any) => (v === val ? a + 1 : a), 0);
// Finds unique values - can then be passed 
const findUniques = (value: any, index: any, self: any) => {
  return self.indexOf(value) === index
}

function isFourOfAKind(cards: Card[]) {
  //let counts: number[] = [];
  let values: number[] = [];
  let highestCount = 0;

  cards.forEach((card) => {
    const details = card.value.split('',2)
    let value: string = details[0]
    let num: number = Number(CARD_VALUE_MAP.get(value))
    values.push(num)
    //counts[num] = counts[num] ? counts[num] + 1 : 1;
    // if(counts[num]) counts[num]+=1
    // else counts[num]=1
  });
  values.forEach((value) => {
    //counts.push(countOccurrences(values, value))
    let count = countOccurrences(values, value)
    highestCount = count > highestCount ? count : highestCount
  })
  console.log('Highest count: ', highestCount)
  if (highestCount === 4) return true
  else return false
  // counts.forEach((num) => {
  //   if (num == 4) return true
  // })
  // return false
}

function checkForDuplicates(cards: Card[]) {
  //let counts: number[] = [];
  let values: number[] = [];
  let counts: any[] = []

  cards.forEach((card) => {
    const details = card.value.split('',2)
    let value: string = details[0]
    let num: number = Number(CARD_VALUE_MAP.get(value))
    values.push(num)
  });

  let uniques = values.filter(findUniques)
  console.log('Unique values: ', uniques)

  uniques.forEach((value) => {
    //counts.push(countOccurrences(values, value))
    let count = {
      value: value,
      count: countOccurrences(values, value)
    }
    counts.push(count)
    console.log('%s occurences of %s ', count.count, count.value)
  })
  // Sort highest to lowest
  counts.sort((a, b) => (a.value > b.value) ? -1 : 1)
  console.log(counts)
  let threeOfAKind = false;
  let pairs = 0;

  counts.forEach((count) => {
    if (count.count === 4) {
      console.log('4 of a kind')
        return 5
    } else if (count.count === 3) {
        console.log('3 of a kind')
        threeOfAKind = true;
    }
      else if (count.count === 2) {
        pairs+=1
    }
  })
  if (threeOfAKind && pairs===1) {
    console.log('FULL HOUSE')
    return 4
  } else if (threeOfAKind) return 3
  else if (pairs===2) return 2
  else if (pairs===1) return 1
  else return 0
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
