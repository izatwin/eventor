
const badWords = [
    "ass hole", "asshole", "bitch", "bullshit",
    "cock", "cocksucker", "cunt", "dick",
    "dickhead", "faggot", "fuck", "fucked",
    "fucker", "fucking", "horseshit", "nigga",
    "prick", "pussy", "shit", "slut",
    "twat", "wanker"
];

// returns whether the provided string contains PROFANITY :O
function containsProfanity(text) {
    if (typeof text !== 'string') return false;

    const lowerText = text.toLowerCase();

    // For each bad word
    for (let badWord of badWords) {
        // Check if the text includes the bad word
        if (lowerText.includes(badWord.toLowerCase())) {
            return true;
        }
    }

    // No bad words found
    return false;
}

module.exports = {containsProfanity};