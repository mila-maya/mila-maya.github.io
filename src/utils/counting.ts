/**
 * Counting and listing in prose, from data rather than from memory.
 *
 * Every sentence on the site that says how many of something there is used to
 * say it by hand, so adding a project or a workflow quietly turned the copy
 * into a lie. These two build the phrase from the array itself.
 */

const WORDS = [
  'no',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
];

/** "three" up to twelve, "13" past it, where a numeral reads better anyway. */
export const countWord = (n: number): string => WORDS[n] ?? String(n);

/** The same, for the start of a sentence. */
export const countWordCapitalised = (n: number): string => {
  const word = countWord(n);
  return word.charAt(0).toUpperCase() + word.slice(1);
};

/** "a, b and c" — an Oxford comma would fight the rest of the site's voice. */
export const listPhrase = (items: string[]): string => {
  if (items.length <= 1) {
    return items[0] ?? '';
  }

  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
};
