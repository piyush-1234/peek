export const ICEBREAKERS = [
  // Fun
  "What's the last thing that made you laugh out loud?",
  "If you could teleport anywhere right now, where would you go?",
  "What's your most useless talent?",
  "Coffee or tea — and why does it matter?",
  "What's the weirdest food you've ever tried?",
  // Deep
  "What's something you're proud of but never get to talk about?",
  "What's a small thing that made your day better recently?",
  "If you could tell your younger self one thing, what would it be?",
  "What's a song that always puts you in a good mood?",
  "What's something you changed your mind about recently?",
  // Story
  "Tell me about the best day you've had this year.",
  "What's the most spontaneous thing you've ever done?",
  "What's a place that feels like home to you?",
  "What's the last book or show that stuck with you?",
  "What's a moment you'll never forget?",
  // Would you rather
  "Would you rather travel to the past or the future?",
  "Would you rather never use your phone again or never travel again?",
  "Would you rather be famous or deeply loved by a few?",
  "Would you rather have unlimited time or unlimited money?",
  "Would you rather know everything or feel everything?",
];

export function randomIcebreaker() {
  return ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];
}