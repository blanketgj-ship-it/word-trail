# Vocabulary sources

This game does not contain or claim to contain the complete Oxford dictionary. Oxford topic pages were unavailable to the development session (HTTP 403), and no licensed Oxford data export or API credentials were supplied. The expanded vocabulary is a separate implementation using the following resources.

## Princeton WordNet 3.0

- https://wordnet.princeton.edu/
- License: licenses/WORDNET.txt
- Distribution: https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora/wordnet.zip
- WordNet Release 3.0, Copyright 2006 Princeton University.
- Database citation: Miller, George A. (1995). WordNet: A Lexical Database for English. Communications of the ACM, 38(11), 39–41.

Topic lists select noun lexical domains or descendants of relevant noun senses. Spelling variants and multiword expressions are included. Technical and uncommon words are intentional. Selected proper names are included for geography and mythology. No definitions are displayed or embedded in the game vocabulary.

## Chinese Open Wordnet

- Distributed through Open Multilingual Wordnet 1.4: https://github.com/omwn/omw-data
- Distribution: https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora/omw-1.4.zip
- Source project: http://compling.hss.ntu.edu.sg/cow/
- License: licenses/CHINESE-OPEN-WORDNET.txt
- Copyright 2013, 2014 Francis Bond and Shan Wang.
- Citation: Wang, Shan and Francis Bond (2013). Building the Chinese Open Wordnet (COW): Starting from Core Synsets. Proceedings of the 11th Workshop on Asian Language Resources.

Chinese topic lists use Chinese lemmas mapped to the same selected WordNet noun synsets, plus curated common terms. They are separate guessing pools, not inline translations of the English words. Chinese words are sorted by the browser's zh-Hans pinyin collator; polyphonic characters follow the collator's default reading.

## Curated additions

scripts/seeds.cjs preserves the original hand-curated 12-topic word lists. scripts/curated.cjs adds common terms, Chinese seeds, celebrity names, movie titles and book titles. Names and titles are curated examples, not an exhaustive or ranked list and not Oxford-derived. Local game matching ignores case, accents, punctuation and spaces; equivalent normalized entries are deduplicated. No automatic plural or combinatorial padding is used.

Counts in the interface refer to deduplicated entries in the selected topic. A word can legitimately belong to multiple topics, so summed topic-entry counts are not counts of globally unique words. The lists do not claim exhaustive topic coverage.
