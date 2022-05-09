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

// If two or more players have the same hand the high card determines the winner. For straights or flushes, the highest top card is declared the winner. For one pair and two pair hands, the highest kicker wins. If players have the same 5-card hand, it is a tie and the pot is split equally.

// Change functions to return Hand Object
// Hand Type, then give a value (for same hands), and list high card for (for ties)

// Rank used to determine winning hand. If ranks are the same, then the Primary value is used to determine the winner. If those are the same, then the Secondary is used. And so on.

// e.g. A tie of Two Pairs have a maximum of 3 values which can dictate the winning hand (each pair, and the kicker)
// e.g. A tie of Flushes have a maximum of 5 values which can dictate the winning hand

export class Hand {
  @type('string') owner: string
  @type('number') rank: number = 0
  @type('number') primary: number = 0
  @type('number') secondary: number = 0
  @type('number') tertiary: number = 0
  @type('number') quaternary: number = 0
  @type('number') quinary: number = 0

  constructor(Owner: string) {
    this.owner = Owner
  }
  
  update(Rank: number,  Primary: number,  Secondary: number,   Tertiary: number,   Quaternary: number,  Quinary: number) {
    this.rank = Rank
    this.primary = Primary
    this.secondary = Secondary
    this.tertiary = Tertiary
    this.quaternary = Quaternary
    this.quinary = Quinary

    return this
  }
}

// Used to compare hands
// e.g. JH, JS, 8D, 3D, 3C      vs          TC, TH, TD, 9S, 3H
// e.g. Two Pair                or          Three of a Kind
// e.g. 2x Jack                 or          3x Ten
// e.g. 2x Three                or          0 (Three of a Kind only measures one value)
// e.g. Eight                   or          Nine (Heighest of )
// e.g. 
function compareHands() {
  //
}

export function findBestHand(communityCards: Card[], player: Player) {
  //let hand = templateHand()
  //let playerHand = player.cards
  let bestHand = new Hand(player.sessionId)
  let cards: Card[] = []
  let values: String[] = [] // DEBUG PURPOSES
  communityCards.forEach(card => {
    cards.push(card)
    values.push(card.value)
  });
  player.cards.forEach(card => {
    cards.push(card)
    values.push(card.value)
  });
  console.log('Finding best hand: ', values) // DEBUG PURPOSES
  let checkHand = isFlush(player.sessionId, cards)
  if (checkHand.rank > bestHand.rank) {
    bestHand = checkHand
    // check for straight flush
    checkHand = isStraight(player.sessionId, cards)
    // If straight flush, check for royal and assign rank
    if (checkHand.rank === 5) {
      if (isRoyal(checkHand)) {
        console.log('Hand is a Royal Flush')
        checkHand.rank = 10
      } else {
        console.log('Hand is a Straight Flush')
        checkHand.rank = 9
      }
      // Update best hand
      if (checkHand.rank > bestHand.rank) bestHand = checkHand
    }
  }
  // Only continue checking if the hand is not a Royal, Straight or a normal Flush:
  if (bestHand.rank > 8 || bestHand.rank != 5) {
    let checkHand = checkForMultiples(player.sessionId, cards)
    if (checkHand.rank > bestHand.rank) bestHand = checkHand
  }
  return bestHand
}

// export function findBestHand(communityCards: Card[], playerHand: Card[]) {
//   let bestHand = 0
//   let cards: Card[] = []
//   let values: String[] = []
//   communityCards.forEach(card => {
//     cards.push(card)
//     values.push(card.value)
//   });
//   playerHand.forEach(card => {
//     cards.push(card)
//     values.push(card.value)
//   });
//   console.log('Finding best hand: ', values)
//   if (isFlush(cards)) {
//     // check for straight flush
//     if (isStraight(cards)) {
//       //check for royal flush
//       if (isRoyal(cards)) {
//         bestHand = 10
//       } else {
//         bestHand = 9
//       }
//     } else {
//       bestHand = 6
//     }
//   //} else if (isFourOfAKind(cards)) bestHand = 8
//   } else {
//     let check = checkForDuplicates(cards)
//     if (check === 5) bestHand = 8             // Four of Kind
//     else if (check === 4) bestHand = 7        // Full House
//     else if (isStraight(cards)) bestHand = 5  // Straight
//     else if (check === 3) bestHand = 4        // Three of a Kind
//     else if (check === 2) bestHand = 3        // Two pair
//     else if (check === 1) bestHand = 2        // pair
//     else bestHand = 1                         // High Card
//   }
//   return bestHand
// }


// HELPER FUNCTIONS FOR COMPARING NUMBERS: Ascending or Descending
function sortNumbersAsc(a: number, b: number) {
  return a - b;
}
function sortNumbersDes(a: number, b: number) {
  return b - a;
}

// Check for flush and return hand value
function isFlush(player_name: string, cards: Card[]) {
  let hand = new Hand(player_name)
  
  let clubs = 0
  let diamonds = 0
  let hearts = 0
  let spades = 0

  let values: number[] = []

  cards.forEach((card) => {
    const details = card.value.split('',2)
    let value: number = CARD_VALUE_MAP.get(details[0])
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
      default:
        console.log('Error: Unknown Suit encountered when parsing cards')
        break
    }
    values.push(value)
  });
  
  values.sort(sortNumbersDes) // sort values lowest to highest

  console.log('Checking for flush: %s Clubs, %s Diamonds, %s Hearts, %s Spades', clubs, diamonds, hearts, spades)
  if (clubs == 5 || diamonds == 5 || hearts == 5 || spades == 5 ) {
    console.log('Hand is a Flush')
    return hand.update(6, values[0], values[1], values[2], values[3], values[4])
  }
  else return hand
}

// function isFlush(cards: Card[]) {
//   let clubs = 0
//   let diamonds = 0
//   let hearts = 0
//   let spades = 0

//   cards.forEach((card) => {
//     const details = card.value.split('',2)
//     let suit: string = details[1]
//     switch(suit) {
//       case 'C':
//         clubs+=1
//         break
//       case 'D':
//         diamonds+=1
//         break
//       case 'H':
//         hearts+=1
//         break
//       case 'S':
//         spades+=1
//         break
//     }
//   });
  
//   console.log('Checking for flush: %s Clubs, %s Diamonds, %s Hearts, %s Spades', clubs, diamonds, hearts, spades)
//   if (clubs == 5 || diamonds == 5 || hearts == 5 || spades == 5 ) return true
//   else return false
// }

function isStraight(player_name: string, cards: Card[]) {
  let hand = new Hand(player_name)
  let values: number[] = []

  cards.forEach((card) => {
    const details = card.value.split('',2)
    let value: number = CARD_VALUE_MAP.get(details[0])
    values.push(value)
  });
  values.sort(sortNumbersDes)
  let previousValue: number = null
  values.every((value) => {
    if (previousValue == null) {
      previousValue = value
    } else {
      if (value != previousValue-1) {
        console.log('Not a straight: ', values)
        return hand // rank is 0
      }
    }
  });

  //hand.update(5, values[0], values[1], values[2], values[3], values[4])
  console.log('Hand is a straight')
  return hand.update(5, values[0], values[1], values[2], values[3], values[4])
}

// function isStraight(cards: Card[]) {
//   let values: number[] = []
//   cards.forEach((card) => {
//     const details = card.value.split('',2)
//     let value: number = CARD_VALUE_MAP.get(details[0])
//     values.push(value)
//   });
//   values.sort(function(a, b){return a-b})
//   let previousValue: number = null
//   values.forEach((value) => {
//     if (previousValue == null) {
//       previousValue = value
//     } else {
//       if (value != previousValue+1) {
//         console.log('Not a straight: ', values)
//         return false
//       }
//     }
//   });
//   return true
// }

function isRoyal(hand: Hand) {
  let sum = 0
  sum+=hand.primary
  sum+=hand.secondary
  sum+=hand.tertiary
  sum+=hand.quaternary
  sum+=hand.quinary
  return (sum == 60 ? true : false)
}

// function isRoyal(player_name: string, cards: Card[]) {
//   let hand = new Hand(player_name)
//   let values: number[] = []

//   cards.forEach((card) => {
//     const details = card.value.split('',2)
//     let value: number = CARD_VALUE_MAP.get(details[0])
//     values.push(value)
//   });

//   let sum = values.reduce((a,b) => a + b, 0)
//   if (sum == 60) {
//     return true
//   } else {
//     console.log('Not a Royal Flush: Toal of %s < 60', sum)
//     return hand
//   }
// }

// function isRoyal(cards: Card[]) {
//   let values: number[] = []
//   cards.forEach((card) => {
//     const details = card.value.split('',2)
//     let value: number = CARD_VALUE_MAP.get(details[0])
//     values.push(value)
//     // let value: string = details[0]
//     // values.push(Number(CARD_VALUE_MAP.get(value)))
//   });
//   let sum = values.reduce((a,b) => a + b, 0)
//   if (sum == 60) {
//     return true
//   } else {
//     console.log('Not a Royal Flush: Toal of %s < 60', sum)
//     return false
//   }
// }

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
// const countOccurrences = (arr: any, val: any) => arr.reduce((a: any, v: any) => (v === val ? a + 1 : a), 0);
// // Finds unique values - can then be passed 
// const findUniques = (value: any, index: any, self: any) => {
//   return self.indexOf(value) === index
// }

// function isFourOfAKind(cards: Card[]) {
//   //let counts: number[] = [];
//   let values: number[] = [];
//   let highestCount = 0;

//   cards.forEach((card) => {
//     const details = card.value.split('',2)
//     let value: string = details[0]
//     let num: number = Number(CARD_VALUE_MAP.get(value))
//     values.push(num)
//     //counts[num] = counts[num] ? counts[num] + 1 : 1;
//     // if(counts[num]) counts[num]+=1
//     // else counts[num]=1
//   });
//   values.forEach((value) => {
//     //counts.push(countOccurrences(values, value))
//     let count = countOccurrences(values, value)
//     highestCount = count > highestCount ? count : highestCount
//   })
//   console.log('Highest count: ', highestCount)
//   if (highestCount === 4) return true
//   else return false
//   // counts.forEach((num) => {
//   //   if (num == 4) return true
//   // })
//   // return false
// }

function countOccurrences(cards: Card[]) {
  let values: string[] = [];
  let count: {[key: string]: number} = {}

  cards.forEach((card) => {
    let details = card.value.split('',2)
    let value: string = String(CARD_VALUE_MAP.get(details[0]))
    values.push(value)
  });

  for (let value of values) {
    if (count[value]) {
      count[value] += 1;
    } else {
      count[value] = 1;
    }
  }
  let order = Object.keys(count).sort(function(curKey: string,nextKey: string) {
        return count[nextKey] - count[curKey]
      });

  console.log('Occurences: ', count);
  console.log('Highest to Lowest: ', order);

  return ({
    keys: order,    // keys in order of most to least occurences
    counts: count,  // object listing each occurence,
    values: values  // list of values
  })
}

function checkForMultiples(player_name: string, cards: Card[]) {
  let hand = new Hand(player_name)
  let fours: number[] = []
  let threes: number[] = [] 
  let pairs: number[] = [] 
  let highCards: number[] = []

  let occurences = countOccurrences(cards)

  occurences.keys.forEach((value) => {
    let count = occurences.counts[value]
    if (count == 4) {
      fours.push(Number(value))
    } else if (count == 3) {
      threes.push(Number(value))
    } else if (count == 2) {
      pairs.push(Number(value))
    } else if (count == 1) {
      highCards.push(Number(value))
    }
  });

  console.log('Found Multiples: ')
  console.log('Fours: ', fours)
  console.log('Threes: ', threes)
  console.log('Pairs: ', pairs)
  console.log('High Cards: ', highCards)

  if (fours.length > 0) {
    // Four of a Kind
    let highestValue = 0
    fours.forEach((value) => {
      highestValue = (value > highestValue) ? value : highestValue
    });
    let highestCard = 0
    let remainders = [threes, pairs, highCards].reduce((accumulator, value) => accumulator.concat(value), []);
    remainders.forEach((value) => {
      highestCard = (value > highestCard) ? value : highestCard
    });
    console.log('Four of Kind (%s) found with a high card of %s', highestValue, highestCard)
    return hand.update(8, highestValue, highestCard, 0, 0, 0)
  } else if (threes.length > 0 && pairs.length > 0) {
    // Full House
    let highestThree = 0
    threes.forEach((value) => {
      highestThree = (value > highestThree) ? value : highestThree
    });
    let highestPair = 0
    threes.forEach((value) => {
      highestPair = (value > highestPair) ? value : highestPair
    });
    console.log('Full House (3x %s, 2x %s)', highestThree, highestPair)
    return hand.update(7, highestThree, highestPair, 0, 0, 0)
  } else if (threes.length > 0) {
    // Three of a Kind
    let highestThree = 0
    threes.forEach((value) => {
      highestThree = (value > highestThree) ? value : highestThree
    });

    let highestCard = 0
    let remainders = [pairs, highCards].reduce((accumulator, value) => accumulator.concat(value), []);
    remainders.forEach((value) => {
      highestCard = (value > highestCard) ? value : highestCard
    });
    console.log('Three of a Kind (%s) found with a high card of %s', highestThree, highestCard)
    return hand.update(4, highestThree, highestCard, 0, 0, 0)
  } else if (pairs.length > 1) {
    // Two Pair
    let highestPair = 0
    let nextBest = 0
    pairs.forEach((value) => {
      if (value > highestPair) {
        nextBest = highestPair
        highestPair = value
      } else if (value > nextBest) nextBest = value
    });
    let highestCard = 0
    highCards.forEach((value) => {
      highestCard = (value > highestCard) ? value : highestCard
    });
    console.log('Two Pairs (%s and %s) found with a high card of %s', highestPair, nextBest, highestCard)
    return hand.update(3, highestPair, nextBest, highestCard, 0, 0)
  } else if (pairs.length > 0) {
    // Single Pair
    let highestPair = 0
    pairs.forEach((value) => {
      highestPair = (value > highestPair) ? value : highestPair
    });
    let highestCard = 0
    highCards.forEach((value) => {
      highestCard = (value > highestCard) ? value : highestCard
    });
    console.log('Pair (%s) found with a high card of %s', highestPair, highestCard)
    return hand.update(2, highestPair, highestCard, 0, 0, 0)
  } else {
    // High Card
    let highestCard = 0
    highCards.forEach((value) => {
      highestCard = (value > highestCard) ? value : highestCard
    });
    console.log('High card of %s', highestCard)
    return hand.update(1, highestCard, 0, 0, 0, 0)
  }
}

// function checkForMultiples(player_name: string, cards: Card[]) {
//   let hand = new Hand(player_name)
//   let isFourOfAKind = false
//   let isThreeOfAKind = false
//   let isPair = false
//   let highCard = 0;
//   let handValue = [0,0,0,0,0]
//   let occurences = countOccurrences(cards)

//   for (var i = 0; i < occurences.keys.length; i++) {
//     let key = occurences.keys[i]
//     let count = occurences.counts[key]
//     if (count == 4) {
//       isFourOfAKind = true
//       handValue[i] = Number(key)
//     }
//     else if (count == 3) {
//       if (isFourOfAKind) {}
//     }
//   }

//   occurences.keys.forEach((key) => {
//     if (occurences.counts[key] == 4) {
//       isFourOfAKind = true;
//     }
//   })
// }

// function checkForDuplicates(cards: Card[]) {
//   //let counts: number[] = [];
//   let values: number[] = [];
//   let counts: any[] = []

//   cards.forEach((card) => {
//     const details = card.value.split('',2)
//     let value: string = details[0]
//     let num: number = Number(CARD_VALUE_MAP.get(value))
//     values.push(num)
//   });

//   let uniques = values.filter(findUniques)
//   console.log('Unique values: ', uniques)

//   uniques.forEach((value) => {
//     //counts.push(countOccurrences(values, value))
//     let count = {
//       value: value,
//       count: countOccurrences(values, value)
//     }
//     counts.push(count)
//     console.log('%s occurences of %s ', count.count, count.value)
//   })
//   // Sort highest to lowest
//   counts.sort((a, b) => (a.value > b.value) ? -1 : 1)
//   console.log(counts)
//   let threeOfAKind = false;
//   let pairs = 0;

//   counts.forEach((count) => {
//     if (count.count === 4) {
//       console.log('4 of a kind')
//         return 5
//     } else if (count.count === 3) {
//         console.log('3 of a kind')
//         threeOfAKind = true;
//     }
//       else if (count.count === 2) {
//         pairs+=1
//     }
//   })
//   if (threeOfAKind && pairs===1) {
//     console.log('FULL HOUSE')
//     return 4
//   } else if (threeOfAKind) return 3
//   else if (pairs===2) return 2
//   else if (pairs===1) return 1
//   else return 0
// }

// function isFullHouse(cards: Card[]) {
//   let isPair = false
//   let isThree = false
//   let counts: number[]
//   cards.forEach((card) => {
//     const details = card.value.split('',2)
//     let value: string = details[0]
//     let num = CARD_VALUE_MAP.get(value)
//     counts[num] = counts[num] ? counts[num] + 1 : 1;
//   });
//   counts.forEach((num) => {
//     if (num == 2) isPair = true
//     if (num == 3) isThree = true
//   })
//   if (isPair && isThree) return true
//   else return false
// }

// function isThreeOfAKind(cards: Card[]) {
//   let counts: number[]
//   cards.forEach((card) => {
//     const details = card.value.split('',2)
//     let value: string = details[0]
//     let num = CARD_VALUE_MAP.get(value)
//     counts[num] = counts[num] ? counts[num] + 1 : 1;
//   });
//   counts.forEach((num) => {
//     if (num == 3) return true
//   })
//   return false
// }

// function countPairs(cards: Card[]) {
//   let pairCount = 0
//   let counts: number[]
//   cards.forEach((card) => {
//     const details = card.value.split('',2)
//     let value: string = details[0]
//     let num = CARD_VALUE_MAP.get(value)
//     counts[num] = counts[num] ? counts[num] + 1 : 1;
//   });
//   counts.forEach((num) => {
//     if (num == 2) pairCount+=1
//   })
//   return pairCount
// }
