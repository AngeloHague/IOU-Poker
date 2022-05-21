import { Client } from "@colyseus/core";
import { Schema, MapSchema, ArraySchema, Context, type, filter } from "@colyseus/schema";
import { SUITS, CARDS, CARD_SUIT_MAP, CARD_NAME_MAP, CARD_VALUE_MAP, HAND_NAME_MAP, HAND_PARAM_MAP} from "./constants";

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
  @type([Card]) cards = new  ArraySchema<Card>()
  @type('boolean') isFolded: boolean = false
  @type('boolean') isOut: boolean = false
  @type('boolean') isAllIn: boolean = false
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
  big_blind_idx = 0
  small_blind_idx = 0
  connected_players = 0
  active_players: string[]
  betting_players = new Map()
  folded_players = 0
  matched_players = 0
  all_in_players = 0
}

export function readCard(card: Card) {
    const details = card.value.split('',2)
    let value: string = details[0]
    let suit: string = details[1]
    return (CARD_NAME_MAP.get(value) + ' of ' + CARD_SUIT_MAP.get(suit))
}

//Create Full Deck of Cards (Ordered):
export function newDeck() {
    let deck = []

    for (let suit of SUITS) {
        for (let card of CARDS) {
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

function sortHandsByRank(a: Hand, b: Hand) {
  if (a.rank === b.rank) {
    // if ranks are the same, sort by tie break params:
    if (a.primary == b.primary) {
      // etc.
      if (a.secondary == b.secondary) {
        if (a.tertiary == b.tertiary) {
          if (a.quaternary == b.quaternary) {
            // if (a.quinary == b.quinary) {
            //   // tied 
            // }
            return a.quinary < b.quinary ? 1 : -1;
          }
          return a.quaternary < b.quaternary ? 1 : -1;
        }
        return a.tertiary < b.tertiary ? 1 : -1;
      }
      return a.secondary < b.secondary ? 1 : -1;
    }
    return a.primary < b.primary ? 1 : -1;
  }
  return a.rank < b.rank ? 1 : -1;
}
export function organiseHands(state: GameState) {
  let hands: Hand[] = []
  state.players.forEach(player => {
    hands.push(findBestHand(state.community_cards, player))
  });
  hands.sort(sortHandsByRank);
  return hands
}

function filterHandsByRank(a: Hand, b: Hand) {
  if (a.rank === b.rank) {
    // if ranks are the same, sort by tie break params:
    if (a.primary == b.primary) {
      // etc.
      if (a.secondary == b.secondary) {
        if (a.tertiary == b.tertiary) {
          if (a.quaternary == b.quaternary) {
            if (a.quinary == b.quinary) {
              // tied
              return true
            }
            return false
          }
          return false
        }
        return false
      }
      return false
    }
    return false
  }
  return false
}

// Recursive function to divide a sorted array of winners into an array so that players with equal ranking hands are grouped together
function divideWinners(hands: Hand[], winners: Hand[]) {
  if (hands.length > 0) {
    let winner = hands[0]
    // reduces equal ranking hands into _winners and remaining into remainders variables
    let [_winners, remainders] = hands.reduce((accumulator:any, currentValue) => (accumulator[filterHandsByRank(winner, currentValue) ? 0 : 1].push(currentValue), accumulator), [[], []]);
    winners.push(_winners)
    if (remainders.length > 0) divideWinners(remainders, winners)
  }
}

export function determineWinners(state: GameState) {
  let hands: Hand[] = [] 
  state.players.forEach((player: Player) => {
    hands.push(findBestHand(state.community_cards, player))
  });
  let sorted = hands.sort(sortHandsByRank);
  let winners: any = []
  divideWinners(sorted, winners)
  return winners
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

function isRoyal(hand: Hand) {
  let sum = 0
  sum+=hand.primary
  sum+=hand.secondary
  sum+=hand.tertiary
  sum+=hand.quaternary
  sum+=hand.quinary
  return (sum == 60 ? true : false)
}

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
    pairs.forEach((value) => {
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