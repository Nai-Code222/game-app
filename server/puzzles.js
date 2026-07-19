// ============================================================================
//  QUESTIONS / ANSWERS  —  edit this file to change the game content.
//  See CONTENT-GUIDE.md for the copy-paste format and an AI generation prompt.
//
//  Each tile is one object:
//    { category, value, phrase, clue }
//        phrase = the ANSWER players type (UPPERCASE, letters + spaces only)
//        clue   = the QUESTION / hint shown on screen
//    Word tiles add:  partOfSpeech, definition, example (with ______ blank)
//
//  Rules: every category needs exactly one entry per value 100/200/300/500/1000.
//         phrases use A–Z and spaces only — write ILL BE BACK, not "I'll be back".
// ============================================================================

// Puzzle bank owned by the server (the game authority).
// Every category has exactly one puzzle per value: 100, 200, 300, 500, 1000.

export const CATEGORIES = [
  'Words',
  'Phrases',
  'Movie Quotes',
  'History',
  'Reading & Math',
  'Misc',
  "Ender's Game",
  'Gaming',
  'Mystery',
];

export const VALUES = [100, 200, 300, 500, 1000];

export const PUZZLES = [
  // Words — guess the word from its definition
  { category: 'Words', value: 100, phrase: 'JOLLY', partOfSpeech: 'adjective', definition: 'Happy and full of cheer.', example: 'The ______ old man handed out candy with a big smile.' },
  { category: 'Words', value: 200, phrase: 'GADGET', partOfSpeech: 'noun', definition: 'A small, clever tool or device.', example: 'She bought a handy ______ that opens jars easily.' },
  { category: 'Words', value: 300, phrase: 'MIMIC', partOfSpeech: 'verb', definition: 'To copy the way someone speaks or acts.', example: 'Parrots can ______ the sounds that they hear.' },
  { category: 'Words', value: 500, phrase: 'FRAGILE', partOfSpeech: 'adjective', definition: 'Easily broken or damaged.', example: 'The box was marked ______ because the dishes could break.' },
  { category: 'Words', value: 1000, phrase: 'ZENITH', partOfSpeech: 'noun', definition: 'The highest point of something.', example: 'Reaching the ______ of the mountain, they could see for miles.' },

  // Phrases — proverbs and sayings
  { category: 'Phrases', value: 100, phrase: 'LOOK BEFORE YOU LEAP' },
  { category: 'Phrases', value: 200, phrase: 'BETTER LATE THAN NEVER' },
  { category: 'Phrases', value: 300, phrase: 'ABSENCE MAKES THE HEART GROW FONDER' },
  { category: 'Phrases', value: 500, phrase: 'THE EARLY BIRD CATCHES THE WORM' },
  { category: 'Phrases', value: 1000, phrase: 'A PENNY SAVED IS A PENNY EARNED' },

  // Movie Quotes
  { category: 'Movie Quotes', value: 100, phrase: 'THERES NO PLACE LIKE HOME', clue: 'The Wizard of Oz' },
  { category: 'Movie Quotes', value: 200, phrase: 'WHY SO SERIOUS', clue: 'The Dark Knight' },
  { category: 'Movie Quotes', value: 300, phrase: 'TO INFINITY AND BEYOND', clue: 'Toy Story' },
  { category: 'Movie Quotes', value: 500, phrase: 'MAY THE FORCE BE WITH YOU', clue: 'Star Wars' },
  { category: 'Movie Quotes', value: 1000, phrase: 'HERES LOOKING AT YOU KID', clue: 'Casablanca' },

  // History
  { category: 'History', value: 100, phrase: 'JUNETEENTH', clue: 'What holiday celebrates the announcement of freedom for enslaved people in Texas?' },
  { category: 'History', value: 200, phrase: 'THE HARLEM RENAISSANCE', clue: 'What cultural movement celebrated Black art, music, and writing during the nineteen twenties?' },
  { category: 'History', value: 300, phrase: 'THE TUSKEGEE AIRMEN', clue: 'What group of Black military pilots served during World War Two?' },
  { category: 'History', value: 500, phrase: 'BROWN V BOARD OF EDUCATION', clue: 'What Supreme Court case ruled that racial segregation in public schools was unconstitutional?' },
  { category: 'History', value: 1000, phrase: 'THE MONTGOMERY BUS BOYCOTT', clue: 'What major civil rights protest lasted more than a year after Rosa Parks was arrested?' },

  // Reading & Math
  { category: 'Reading & Math', value: 100, phrase: 'THE MAIN IDEA', clue: 'What a paragraph is mostly about' },
  { category: 'Reading & Math', value: 200, phrase: 'CAUSE AND EFFECT', clue: 'Why something happens, and what follows' },
  { category: 'Reading & Math', value: 300, phrase: 'ORDER OF OPERATIONS', clue: 'Please Excuse My Dear Aunt Sally' },
  { category: 'Reading & Math', value: 500, phrase: 'LEAST COMMON MULTIPLE', clue: 'Abbreviated LCM' },
  { category: 'Reading & Math', value: 1000, phrase: 'THE PYTHAGOREAN THEOREM', clue: 'A squared plus B squared' },

  // Misc
  { category: 'Misc', value: 100, phrase: 'THE GRAND CANYON', clue: 'A very big hole in Arizona' },
  { category: 'Misc', value: 200, phrase: 'A CUP OF HOT COFFEE', clue: 'A morning pick me up' },
  { category: 'Misc', value: 300, phrase: 'A BOWL OF ICE CREAM', clue: 'A sweet frozen treat' },
  { category: 'Misc', value: 500, phrase: 'SATURDAY MORNING CARTOONS', clue: 'A childhood weekend ritual' },
  { category: 'Misc', value: 1000, phrase: 'ROAD TRIP ACROSS THE COUNTRY', clue: 'Fun on the highway' },

  // Ender's Game
  { category: "Ender's Game", value: 100, phrase: 'BATTLE SCHOOL', clue: 'Where Ender trains in orbit' },
  { category: "Ender's Game", value: 200, phrase: 'ENDER WIGGIN', clue: 'The young hero of the story' },
  { category: "Ender's Game", value: 300, phrase: 'THE BATTLE ROOM', clue: 'Zero-gravity training arena' },
  { category: "Ender's Game", value: 500, phrase: 'THE ALIEN BUGGERS', clue: 'The enemy Ender must defeat' },
  { category: "Ender's Game", value: 1000, phrase: 'THE ENEMYS GATE IS DOWN', clue: "Ender's famous rule for orientation" },

  // Gaming
  { category: 'Gaming', value: 100, phrase: 'TETRIS', clue: 'Falling blocks puzzle classic' },
  { category: 'Gaming', value: 200, phrase: 'FORTNITE', clue: 'Build-and-battle royale game' },
  { category: 'Gaming', value: 300, phrase: 'OVERWATCH', clue: 'Team-based hero shooter' },
  { category: 'Gaming', value: 500, phrase: 'MORTAL KOMBAT', clue: 'Classic arcade fighting game' },
  { category: 'Gaming', value: 1000, phrase: 'CALL OF DUTY BLACK OPS', clue: 'Also known as Call of Duty 7' },

  // Mystery — Law & Order: SVU
  { category: 'Mystery', value: 100, phrase: 'LAW AND ORDER', clue: 'What television franchise begins with the famous dun dun sound?' },
  { category: 'Mystery', value: 200, phrase: 'OLIVIA BENSON', clue: 'Which detective has been solving crimes on SVU since the beginning?' },
  { category: 'Mystery', value: 300, phrase: 'ELLIOT STABLER', clue: 'Which detective was Bensons longtime partner?' },
  { category: 'Mystery', value: 500, phrase: 'SPECIAL VICTIMS UNIT', clue: 'What do the letters SVU stand for?' },
  { category: 'Mystery', value: 1000, phrase: 'DUN DUN', clue: 'What sound makes Mom stop the whole conversation and look at the television?' },

  // --- Extra pool questions (rotate in on reset) ---
  { category: 'Words', value: 100, phrase: 'GENEROUS', partOfSpeech: 'adjective', definition: 'Willing to give or share with others', example: 'Auntie was ______ and gave everyone an extra dessert.' },
  { category: 'Words', value: 200, phrase: 'CURIOUS', partOfSpeech: 'adjective', definition: 'Wanting to know or learn something', example: 'The ______ child kept asking what was inside every gift bag.' },
  { category: 'Words', value: 300, phrase: 'PERSUADE', partOfSpeech: 'verb', definition: 'To convince someone to do or believe something', example: 'We tried to ______ Grandma to play one more round.' },
  { category: 'Words', value: 500, phrase: 'RELUCTANT', partOfSpeech: 'adjective', definition: 'Unwilling or unsure about doing something', example: 'Dad was ______ to dance until his favorite song came on.' },
  { category: 'Words', value: 1000, phrase: 'RESOURCEFUL', partOfSpeech: 'adjective', definition: 'Good at finding clever ways to solve problems', example: 'She was ______ and fixed the broken decoration with tape and a hair clip.' },

  { category: 'Phrases', value: 100, phrase: 'WHO ALL OVER THERE', clue: 'What does Mom ask when you say you are going to somebodys house?' },
  { category: 'Phrases', value: 200, phrase: 'CLOSE MY DOOR', clue: 'What does a parent yell after you leave their room?' },
  { category: 'Phrases', value: 300, phrase: 'DO WE HAVE MCDONALDS MONEY', clue: 'What question ends a childs fast food request immediately?' },
  { category: 'Phrases', value: 500, phrase: 'KEEP PLAYING WITH ME', clue: 'What warning means the joking is almost over?' },
  { category: 'Phrases', value: 1000, phrase: 'FIX YOUR FACE', clue: 'What does an adult say when your expression is saying too much?' },

  { category: 'Reading & Math', value: 100, phrase: 'TWENTY', clue: 'What is four times five?' },
  { category: 'Reading & Math', value: 200, phrase: 'MAIN IDEA', clue: 'What term means the most important point of a passage?' },
  { category: 'Reading & Math', value: 300, phrase: 'FORTY TWO', clue: 'What is six times seven?' },
  { category: 'Reading & Math', value: 500, phrase: 'METAPHOR', clue: 'What figure of speech compares two things without using like or as?' },
  { category: 'Reading & Math', value: 1000, phrase: 'ONE HUNDRED FORTY FOUR', clue: 'What is twelve squared?' },

  { category: 'Misc', value: 100, phrase: 'POTATO SALAD', clue: 'What cookout dish gets judged before anybody even tastes it?' },
  { category: 'Misc', value: 200, phrase: 'THE FAMILY GROUP CHAT', clue: 'Where does one good morning message somehow become fifty notifications?' },
  { category: 'Misc', value: 300, phrase: 'SPADES', clue: 'What card game can turn a peaceful family gathering into a serious competition?' },
  { category: 'Misc', value: 500, phrase: 'THE GOOD CONTAINER', clue: 'What kitchen item are you warned not to lose after taking leftovers home?' },
  { category: 'Misc', value: 1000, phrase: 'SOMEWHERE SAFE', clue: 'Where did Mom put the missing item that nobody can find now?' },

  { category: "Ender's Game", value: 100, phrase: 'ENDER WIGGIN', clue: 'Who is the main character of the novel?' },
  { category: "Ender's Game", value: 200, phrase: 'BATTLE SCHOOL', clue: 'Where is Ender sent to train?' },
  { category: "Ender's Game", value: 300, phrase: 'VALENTINE', clue: 'Which sibling is kind and protective toward Ender?' },
  { category: "Ender's Game", value: 500, phrase: 'PETER WIGGIN', clue: 'Which sibling is feared for being cruel and aggressive?' },
  { category: "Ender's Game", value: 1000, phrase: 'COMMAND SCHOOL', clue: 'Where does Ender complete his advanced military training?' },

  { category: 'Gaming', value: 100, phrase: 'MARIO', clue: 'Which video game hero is known for jumping on enemies and saving a princess?' },
  { category: 'Gaming', value: 200, phrase: 'MINECRAFT', clue: 'What game lets players build with blocks and avoid creepers?' },
  { category: 'Gaming', value: 300, phrase: 'FORTNITE', clue: 'What game combines building with a battle royale competition?' },
  { category: 'Gaming', value: 500, phrase: 'RESPAWN', clue: 'What word means returning to the game after your character is defeated?' },
  { category: 'Gaming', value: 1000, phrase: 'NONPLAYER CHARACTER', clue: 'What does NPC stand for in a video game?' },

  // --- Added question pool (bonus + more, deduped) ---
  { category: 'Words', value: 100, phrase: 'GRUMPY', partOfSpeech: 'adjective', definition: 'Easily annoyed or in a bad mood.', example: 'Grandpa gets ______ when someone changes the television channel.' },
  { category: 'Words', value: 200, phrase: 'BARGAIN', partOfSpeech: 'noun', definition: 'Something bought for a very good price.', example: 'Auntie called the shoes a ______ because they were half price.' },
  { category: 'Words', value: 300, phrase: 'PONDER', partOfSpeech: 'verb', definition: 'To think carefully about something.', example: 'He had to ______ whether he wanted cake or pie.' },
  { category: 'Words', value: 500, phrase: 'MISCHIEVOUS', partOfSpeech: 'adjective', definition: 'Playfully causing trouble.', example: 'The ______ cousins hid the television remote.' },
  { category: 'Words', value: 1000, phrase: 'AMBIGUOUS', partOfSpeech: 'adjective', definition: 'Having more than one possible meaning.', example: 'Her ______ answer made everyone wonder what she really meant.' },
  { category: 'Phrases', value: 100, phrase: 'WHO ALL GONNA BE THERE', clue: 'What does Mom ask before letting you go anywhere?' },
  { category: 'Phrases', value: 300, phrase: 'DONT MAKE ME COME IN THERE', clue: 'What warning means playtime is almost over?' },
  { category: 'Phrases', value: 500, phrase: 'YOU GOT MCDONALDS MONEY', clue: 'What question appears when a child asks for fast food?' },
  { category: 'Phrases', value: 1000, phrase: 'I KNOW YOU HEARD ME', clue: 'What does Mom say when you suddenly pretend to be deaf?' },
  { category: 'Movie Quotes', value: 100, phrase: 'JUST KEEP SWIMMING', clue: 'Finding Nemo' },
  { category: 'Movie Quotes', value: 200, phrase: 'SHOW ME THE MONEY', clue: 'Jerry Maguire' },
  { category: 'Movie Quotes', value: 300, phrase: 'YOU CANT HANDLE THE TRUTH', clue: 'A Few Good Men' },
  { category: 'Movie Quotes', value: 500, phrase: 'KEEP THE CHANGE YA FILTHY ANIMAL', clue: 'Home Alone' },
  { category: 'Movie Quotes', value: 1000, phrase: 'BYE FELICIA', clue: 'Friday' },
  { category: 'History', value: 100, phrase: 'BLACK WALL STREET', clue: 'What nickname was given to the wealthy Greenwood District in Tulsa?' },
  { category: 'History', value: 200, phrase: 'THE FREEDMENS BUREAU', clue: 'What agency helped formerly enslaved people after the Civil War?' },
  { category: 'History', value: 300, phrase: 'THE GREAT MIGRATION', clue: 'What movement brought millions of Black Americans from the South to northern and western cities?' },
  { category: 'History', value: 500, phrase: 'THE LITTLE ROCK NINE', clue: 'What group of students integrated Central High School in Arkansas?' },
  { category: 'History', value: 1000, phrase: 'THE PORT CHICAGO MUTINY', clue: 'What World War Two protest involved Black sailors refusing unsafe ammunition work?' },
  { category: 'Reading & Math', value: 100, phrase: 'SIMILE', clue: 'A comparison using like or as' },
  { category: 'Reading & Math', value: 200, phrase: 'FORTY NINE', clue: 'What is seven times seven?' },
  { category: 'Reading & Math', value: 300, phrase: 'POINT OF VIEW', clue: 'The position from which a story is told' },
  { category: 'Reading & Math', value: 500, phrase: 'THREE FOURTHS', clue: 'What fraction is equal to seventy five percent?' },
  { category: 'Reading & Math', value: 1000, phrase: 'PERSONIFICATION', clue: 'Giving human qualities to something that is not human' },
  { category: 'Misc', value: 300, phrase: 'THE GOOD CONTAINER', clue: 'What must be returned after taking leftovers home?' },
  { category: 'Misc', value: 500, phrase: 'SOMEWHERE SAFE', clue: 'Where Mom put the missing item that nobody can find?' },
  { category: 'Misc', value: 1000, phrase: 'WHO MADE THE MACARONI', clue: 'What cookout question can determine whether you eat it or walk away?' },
  { category: "Ender's Game", value: 100, phrase: 'VALENTINE WIGGIN', clue: 'Enders loving and protective sister' },
  { category: "Ender's Game", value: 200, phrase: 'PETER WIGGIN', clue: 'Enders intelligent but cruel older brother' },
  { category: "Ender's Game", value: 300, phrase: 'BEAN', clue: 'Small but brilliant member of Dragon Army' },
  { category: "Ender's Game", value: 500, phrase: 'DRAGON ARMY', clue: 'The team Ender commands at Battle School' },
  { category: "Ender's Game", value: 1000, phrase: 'THE GIANTS DRINK', clue: 'The impossible game challenge Ender defeats in an unexpected way' },
  { category: 'Gaming', value: 100, phrase: 'MARIO KART', clue: 'Racing game known for shells bananas and family arguments' },
  { category: 'Gaming', value: 300, phrase: 'THE LEGEND OF ZELDA', clue: 'Adventure series featuring Link and Princess Zelda' },
  { category: 'Mystery', value: 100, phrase: 'CAPTAIN BENSON', clue: 'What title does Olivia eventually earn at SVU?' },
  { category: 'Mystery', value: 200, phrase: 'FIN TUTUOLA', clue: 'Which detective is known for dry jokes and unforgettable one liners?' },
  { category: 'Mystery', value: 300, phrase: 'ICE T', clue: 'Which rapper plays Detective Fin Tutuola?' },
  { category: 'Mystery', value: 500, phrase: 'JOHN MUNCH', clue: 'Which detective was famous for conspiracy theories and sarcastic comments?' },
  { category: 'Mystery', value: 1000, phrase: 'MANHATTAN SPECIAL VICTIMS UNIT', clue: 'What New York police squad is the main focus of the show?' },
  { category: 'Words', value: 100, phrase: 'NOSY', partOfSpeech: 'adjective', definition: 'Too interested in what other people are doing.', example: 'My ______ cousin wanted to know who sent every text message.' },
  { category: 'Words', value: 200, phrase: 'BICKER', partOfSpeech: 'verb', definition: 'To argue about small or unimportant things.', example: 'The siblings began to ______ over who had the larger slice.' },
  { category: 'Words', value: 300, phrase: 'CHAOTIC', partOfSpeech: 'adjective', definition: 'Confused, noisy, and lacking order.', example: 'The family group photo became ______ when the babies started crying.' },
  { category: 'Words', value: 500, phrase: 'SUSPICIOUS', partOfSpeech: 'adjective', definition: 'Feeling that something may be wrong or dishonest.', example: 'Mom became ______ when the children suddenly got quiet.' },
  { category: 'Words', value: 1000, phrase: 'EXAGGERATE', partOfSpeech: 'verb', definition: 'To describe something as larger or more serious than it really is.', example: 'Grandpa likes to ______ when telling stories about how far he walked to school.' },
  { category: 'Phrases', value: 100, phrase: 'WHO LEFT THE DOOR OPEN', clue: 'What gets yelled when the air conditioning is running?' },
  { category: 'Phrases', value: 200, phrase: 'IM NOT ONE OF YOUR LITTLE FRIENDS', clue: 'What does Mom say when you accidentally use the wrong tone?' },
  { category: 'Phrases', value: 300, phrase: 'YOU GOT MCDONALDS MONEY', clue: 'What question follows a request to stop for fast food?' },
  { category: 'Phrases', value: 500, phrase: 'KEEP YOUR HANDS TO YOURSELF', clue: 'What warning appears five minutes into a sibling car ride?' },
  { category: 'Phrases', value: 1000, phrase: 'I BROUGHT YOU INTO THIS WORLD', clue: 'What legendary parent speech begins after a child gets too bold?' },
  { category: 'History', value: 200, phrase: 'BUFFALO SOLDIERS', clue: 'What name was given to Black Army regiments serving in the American West?' },
  { category: 'History', value: 300, phrase: 'THE FREEDMENS BUREAU', clue: 'What agency helped formerly enslaved people after the Civil War?' },
  { category: 'History', value: 1000, phrase: 'THE GREAT MIGRATION', clue: 'What movement brought millions of Black Americans from the South to northern and western cities?' },
  { category: 'Reading & Math', value: 100, phrase: 'FIFTY SIX', clue: 'What is seven times eight?' },
  { category: 'Reading & Math', value: 200, phrase: 'SIMILE', clue: 'What comparison uses the words like or as?' },
  { category: 'Reading & Math', value: 300, phrase: 'ONE FOURTH', clue: 'What fraction is equal to twenty five percent?' },
  { category: 'Reading & Math', value: 500, phrase: 'PERSONIFICATION', clue: 'What technique gives human qualities to something nonhuman?' },
  { category: 'Reading & Math', value: 1000, phrase: 'NINE HUNDRED', clue: 'What is thirty squared?' },
  { category: 'Misc', value: 300, phrase: 'THE GOOD TUPPERWARE', clue: 'What container must be returned after somebody sends you home with food?' },
  { category: 'Misc', value: 500, phrase: 'AUNTIES PURSE', clue: 'Where can you find gum tissues lotion medicine and almost anything else?' },
  { category: "Ender's Game", value: 300, phrase: 'DRAGON ARMY', clue: 'Which army does Ender lead at Battle School?' },
  { category: "Ender's Game", value: 500, phrase: 'COLONEL GRAFF', clue: 'Who manipulates Enders training while believing he is saving humanity?' },
  { category: 'Gaming', value: 300, phrase: 'GRAND THEFT AUTO', clue: 'What open world series is commonly shortened to GTA?' },
  { category: 'Gaming', value: 500, phrase: 'RED DEAD REDEMPTION', clue: 'What western game series features outlaws horses and open country?' },
  { category: 'Gaming', value: 1000, phrase: 'THE LEGEND OF ZELDA', clue: 'What series follows Link as he protects the kingdom of Hyrule?' },
  { category: 'Mystery', value: 100, phrase: 'OLIVIA BENSON', clue: 'Which SVU captain can solve a case with one concerned look?' },
  { category: 'Mystery', value: 300, phrase: 'AMANDA ROLLINS', clue: 'Which detective moved to New York from Georgia?' },
];

export function findPuzzle(category, value) {
  return PUZZLES.find((p) => p.category === category && p.value === value);
}

export function tileKey(category, value) {
  return `${category}|${value}`;
}
