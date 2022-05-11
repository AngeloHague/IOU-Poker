export const SUITS = ['C', 'D', 'H', 'S'] // Clubs, Diamonds, Hearts, Spades

export const CARDS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']

export const CARD_SUIT_MAP = new Map([
  ['C', 'Clubs'],
  ['D', 'Diamonds'],
  ['H', 'Hearts'],
  ['S', 'Spades']
]);

export const CARD_NAME_MAP = new Map([
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

export const CARD_VALUE_MAP = new Map([
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

export const HAND_NAME_MAP = new Map([
  [1,'High Card'],
  [2,'Pair'],
  [3,'Two Pair'],
  [4,'Three of a Kind'],
  [5,'Straight'],
  [6,'Flush'],
  [7,'Full House'],
  [8,'Four of a Kind'],
  [9,'Straight Flush'],
  [10,'Royal Flush']
])

// The amount of parameters (at most) each hand ranking has that can be used to tie break if the tie persists
export const HAND_PARAM_MAP = new Map([
  [1,5], // High Card: all 5 cards
  [2,4], // Pair: the pair + 3 remaining cards
  [3,3], // Two Pair: each pair + 1 remaining card
  [4,3], // Three of a Kind: the three + 2 remaining cards
  [5,1], // Straight: only the first (highest) card is needed to tie break
  [6,5], // Flush: all 5 cards
  [7,2], // Full House: the three + the pair
  [8,2], // Four of a Kind: the four + the remaining card* (* = though no player can have 2 matching set of 4s)
  [9,1], // Straight Flush: only the first (highest) card is needed to tie break
  [10,1] // Royal Flush: Both hands are equal in value and will continue to tie
])