# Editing the questions & answers

All game content lives in **`server/puzzles.js`** in the `PUZZLES` array.
Add or edit entries, save the file, and restart the server (`npm run play`).

## The format

Every tile is one object. There are two kinds:

**Normal tile** (trivia, phrases, quotes, etc.) — the `clue` is the question shown
on screen, the `phrase` is the answer players type:

```js
{ category: 'History', value: 100, phrase: 'THE MOON LANDING', clue: 'One giant leap, 1969' },
```

**Word tile** (the "Words" category) — show a definition and an example sentence;
players guess the word:

```js
{ category: 'Words', value: 100, phrase: 'JOLLY',
  partOfSpeech: 'adjective',
  definition: 'Happy and full of cheer.',
  example: 'The ______ old man handed out candy with a big smile.' },
```

## Rules (important)

1. **Categories** must be one of:
   `Words`, `Phrases`, `Movie Quotes`, `History`, `Reading & Math`, `Misc`,
   `Ender's Game`, `Gaming`, `Mystery`.
2. Each category needs **exactly one entry per value**: `100, 200, 300, 500, 1000`.
3. `phrase` (the answer) must be **UPPERCASE, letters A–Z and spaces only** —
   no numbers, apostrophes, or punctuation. Write `ILL BE BACK`, not `"I'll be back"`.
   (Players' typed answers are matched the same way, so punctuation/case don't matter.)
4. In word `example` sentences, blank out the target word with `______`.

## Scoring (automatic — no manual judging)

- Correct answer → the team wins the tile's points.
- Wrong answer that has correct letters → **+2 points per correct letter** (by position).
- After a wrong guess the team is locked out and buzzers reopen for everyone else.

---

## Prompt to generate new questions with an AI

Copy this into Claude/ChatGPT, fill in the blanks, and paste the result back into
the `PUZZLES` array in `server/puzzles.js`:

> Generate quiz tiles for a family "Jeopardy meets guess-the-phrase" game, for a
> **7th-grade / family-friendly** level. Output **only** a JavaScript array of
> objects in exactly this format, nothing else:
>
> ```js
> { category: 'CATEGORY', value: VALUE, phrase: 'ANSWER', clue: 'QUESTION' },
> ```
>
> Rules:
> - Category is one of: Words, Phrases, Movie Quotes, History, Reading & Math,
>   Misc, Ender's Game, Gaming, Mystery.
> - Give **one entry for each value: 100, 200, 300, 500, 1000**, ordered easiest
>   (100) to hardest (1000).
> - `phrase` is the answer: UPPERCASE, letters A–Z and spaces ONLY — no numbers,
>   apostrophes, or punctuation.
> - `clue` is a short question or hint. Keep it clean and age-appropriate.
> - For the **Words** category, instead of `clue` use three fields —
>   `partOfSpeech`, `definition`, and `example` (an example sentence with the
>   word replaced by `______`) — and pick unique but easy words.
>
> Make tiles for the category: **[CATEGORY NAME HERE]**
