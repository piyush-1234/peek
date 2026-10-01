export const WYR_PROMPTS = [
  { a: 'Travel to the past', b: 'Travel to the future' },
  { a: 'Always be 10 minutes late', b: 'Always be 20 minutes early' },
  { a: 'Never use your phone again', b: 'Never travel again' },
  { a: 'Be famous', b: 'Be deeply loved by a few' },
  { a: 'Have unlimited time', b: 'Have unlimited money' },
  { a: 'Live in a treehouse', b: 'Live in a boat' },
  { a: 'Only eat sweet food', b: 'Only eat spicy food' },
  { a: 'Read minds', b: 'See 10 minutes into the future' },
  { a: 'Never sleep', b: 'Never eat again' },
  { a: 'Be the smartest person in the room', b: 'Be the funniest' },
  { a: 'Always speak in song', b: 'Always speak in rhyme' },
  { a: 'Have a pet dragon', b: 'Have a pet dinosaur' },
  { a: 'Live underwater', b: 'Live in space' },
  { a: 'Know every language', b: 'Play every instrument' },
  { a: 'Fight 100 duck-sized horses', b: 'Fight 1 horse-sized duck' },
  { a: 'Have no internet for a year', b: 'Have no music for a year' },
  { a: 'Be able to fly', b: 'Be able to turn invisible' },
  { a: 'Always have to tell the truth', b: 'Never be able to speak at all' },
  { a: 'Wake up at 5am every day', b: 'Sleep at 3am every day' },
  { a: 'Only wear one outfit forever', b: 'Never wear the same outfit twice' },
  { a: 'Have free food forever', b: 'Have free travel forever' },
  { a: 'Be a great cook', b: 'Be a great dancer' },
  { a: 'Live without Wi-Fi', b: 'Live without AC/heating' },
  { a: 'Be 10 years older', b: 'Be 10 years younger' },
  { a: 'Have a photographic memory', b: 'Be able to forget anything on demand' },
  { a: 'Live in a big city', b: 'Live in a quiet village' },
  { a: 'Have only online friends', b: 'Have only offline friends' },
  { a: 'Never watch another movie', b: 'Never read another book' },
  { a: 'Have a personal chef', b: 'Have a personal driver' },
  { a: 'Be able to pause time', b: 'Be able to rewind time 1 minute' },
];

// Deterministic seed from two socket IDs — same on both clients
export function gameSeed(idA, idB) {
  const sorted = [idA, idB].sort().join('|');
  let hash = 0;
  for (let i = 0; i < sorted.length; i++) {
    hash = ((hash << 5) - hash + sorted.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function promptForRound(seed, round) {
  return WYR_PROMPTS[(seed + round * 7) % WYR_PROMPTS.length];
}