const suits = ['Clubs', 'Diamonds', 'Hearts', 'Spades']
const cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const CARD_VALUE_MAP = {
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14
}

const readCard = (card) => {
    return (card.face + ' of ' + card.suit)
}

//Create Full Deck of Cards (Ordered):
const newDeck = () => {
    const deck = []

    for (let suit of suits) {
        for (let card of cards) {
            deck.push({
                face: card,
                suit: suit,
                value: CARD_VALUE_MAP[card]
            })
        }
    }
    return deck
}

//Take array and return a shuffled one:
const shuffle = (deck) => {
    let shuffled = deck;
    //Fisher-Yates in-place O(n) shuffle
    var m = shuffled.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--)

        // And swap it with the current element.
        var t = shuffled[m]
        shuffled[m] = shuffled[i]
        shuffled[i] = t
    }
    return shuffled
}

const drawCard = (deck) => {
    var remainingDeck = deck
    var card = remainingDeck.pop()
    return {remainingDeck, card}
}

export { newDeck, shuffle, drawCard }