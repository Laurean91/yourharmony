/**
 * Mock-data for the interactive English learning module ("English Games").
 *
 * Target audience: children 4–6 y.o. who often cannot read yet, so every
 * question and every answer option carries a strong *visual* association
 * (emoji / colour swatch / flag). Text labels are secondary and mainly there
 * for the accompanying adult.
 *
 * The data shape is intentionally generic so the same rendering engine
 * (see `useEnglishQuiz` + `EnglishQuiz`) can drive all three topics.
 *
 * Each topic has 10 questions.
 */

export type GameTopicId =
  | 'colors'
  | 'objects'
  | 'countries'
  | 'animals'
  | 'numbers'

/** How the answer options should be rendered visually. */

export type OptionVisual = 'emoji' | 'swatch' | 'flag'

export interface QuizOption {
  id: string
  /** English word — the "correct answer" label. */
  label: string
  /** Emoji or flag glyph shown big on the tile. */
  glyph?: string
  /** For `swatch` visuals — a CSS colour used to fill the tile. */
  color?: string
}

export interface QuizQuestion {
  id: string
  /** Short kid-friendly Russian prompt (read aloud by the adult). */
  prompt: string
  /** Big visual shown in the "question" area (emoji / flag / colour). */
  promptGlyph?: string
  promptColor?: string
  /** How the option tiles are rendered. */
  optionVisual: OptionVisual
  options: QuizOption[]
  /** id of the correct option. */
  correctOptionId: string
}

export interface GameTopic {
  id: GameTopicId
  /** Russian name of the topic (primary — shown to the child/adult). */
  title: string
  /** English subtitle (the word being learnt). */
  subtitle: string
  /** Emoji used as the topic icon. */
  emoji: string
  /** Two-stop gradient used across the topic's UI (juicy & bright). */
  gradient: [string, string]
  questions: QuizQuestion[]
}

/* ────────────────────────────── ЦВЕТА ────────────────────────────── */

const colorsTopic: GameTopic = {
  id: 'colors',
  title: 'Цвета',
  subtitle: 'Colors',
  emoji: '🎨',
  gradient: ['#F97316', '#FB923C'],
  questions: [
    {
      id: 'c1',
      prompt: 'Найди RED (красный)',
      promptGlyph: '🍎',
      optionVisual: 'swatch',
      correctOptionId: 'red',
      options: [
        { id: 'red', label: 'Red', color: '#EF4444' },
        { id: 'blue', label: 'Blue', color: '#3B82F6' },
        { id: 'green', label: 'Green', color: '#22C55E' },
        { id: 'yellow', label: 'Yellow', color: '#FACC15' },
      ],
    },
    {
      id: 'c2',
      prompt: 'Найди YELLOW (жёлтый)',
      promptGlyph: '🌟',
      optionVisual: 'swatch',
      correctOptionId: 'yellow',
      options: [
        { id: 'purple', label: 'Purple', color: '#A855F7' },
        { id: 'yellow', label: 'Yellow', color: '#FACC15' },
        { id: 'red', label: 'Red', color: '#EF4444' },
        { id: 'blue', label: 'Blue', color: '#3B82F6' },
      ],
    },
    {
      id: 'c3',
      prompt: 'Найди GREEN (зелёный)',
      promptGlyph: '🐸',
      optionVisual: 'swatch',
      correctOptionId: 'green',
      options: [
        { id: 'green', label: 'Green', color: '#22C55E' },
        { id: 'orange', label: 'Orange', color: '#F97316' },
        { id: 'pink', label: 'Pink', color: '#EC4899' },
        { id: 'blue', label: 'Blue', color: '#3B82F6' },
      ],
    },
    {
      id: 'c4',
      prompt: 'Найди BLUE (синий)',
      promptGlyph: '💧',
      optionVisual: 'swatch',
      correctOptionId: 'blue',
      options: [
        { id: 'yellow', label: 'Yellow', color: '#FACC15' },
        { id: 'green', label: 'Green', color: '#22C55E' },
        { id: 'blue', label: 'Blue', color: '#3B82F6' },
        { id: 'red', label: 'Red', color: '#EF4444' },
      ],
    },
    {
      id: 'c5',
      prompt: 'Найди PINK (розовый)',
      promptGlyph: '🌸',
      optionVisual: 'swatch',
      correctOptionId: 'pink',
      options: [
        { id: 'pink', label: 'Pink', color: '#EC4899' },
        { id: 'purple', label: 'Purple', color: '#A855F7' },
        { id: 'orange', label: 'Orange', color: '#F97316' },
        { id: 'green', label: 'Green', color: '#22C55E' },
      ],
    },
    {
      id: 'c6',
      prompt: 'Найди ORANGE (оранжевый)',
      promptGlyph: '🍊',
      optionVisual: 'swatch',
      correctOptionId: 'orange',
      options: [
        { id: 'blue', label: 'Blue', color: '#3B82F6' },
        { id: 'orange', label: 'Orange', color: '#F97316' },
        { id: 'green', label: 'Green', color: '#22C55E' },
        { id: 'purple', label: 'Purple', color: '#A855F7' },
      ],
    },
    {
      id: 'c7',
      prompt: 'Найди PURPLE (фиолетовый)',
      promptGlyph: '🍇',
      optionVisual: 'swatch',
      correctOptionId: 'purple',
      options: [
        { id: 'red', label: 'Red', color: '#EF4444' },
        { id: 'yellow', label: 'Yellow', color: '#FACC15' },
        { id: 'purple', label: 'Purple', color: '#A855F7' },
        { id: 'green', label: 'Green', color: '#22C55E' },
      ],
    },
    {
      id: 'c8',
      prompt: 'Найди BROWN (коричневый)',
      promptGlyph: '🐻',
      optionVisual: 'swatch',
      correctOptionId: 'brown',
      options: [
        { id: 'brown', label: 'Brown', color: '#92400E' },
        { id: 'pink', label: 'Pink', color: '#EC4899' },
        { id: 'blue', label: 'Blue', color: '#3B82F6' },
        { id: 'yellow', label: 'Yellow', color: '#FACC15' },
      ],
    },
    {
      id: 'c9',
      prompt: 'Найди BLACK (чёрный)',
      promptGlyph: '🐈‍⬛',
      optionVisual: 'swatch',
      correctOptionId: 'black',
      options: [
        { id: 'white', label: 'White', color: '#F3F4F6' },
        { id: 'red', label: 'Red', color: '#EF4444' },
        { id: 'black', label: 'Black', color: '#111827' },
        { id: 'green', label: 'Green', color: '#22C55E' },
      ],
    },
    {
      id: 'c10',
      prompt: 'Найди WHITE (белый)',
      promptGlyph: '☁️',
      optionVisual: 'swatch',
      correctOptionId: 'white',
      options: [
        { id: 'black', label: 'Black', color: '#111827' },
        { id: 'white', label: 'White', color: '#F3F4F6' },
        { id: 'orange', label: 'Orange', color: '#F97316' },
        { id: 'purple', label: 'Purple', color: '#A855F7' },
      ],
    },
  ],
}

/* ────────────────────────────── ПРЕДМЕТЫ ───────────────────────────── */

const objectsTopic: GameTopic = {
  id: 'objects',
  title: 'Предметы',
  subtitle: 'Objects',
  emoji: '🧸',
  gradient: ['#4F46E5', '#818CF8'],
  questions: [
    {
      id: 'o1',
      prompt: 'Где APPLE (яблоко)?',
      optionVisual: 'emoji',
      correctOptionId: 'apple',
      options: [
        { id: 'apple', label: 'Apple', glyph: '🍎' },
        { id: 'ball', label: 'Ball', glyph: '⚽' },
        { id: 'car', label: 'Car', glyph: '🚗' },
        { id: 'book', label: 'Book', glyph: '📕' },
      ],
    },
    {
      id: 'o2',
      prompt: 'Где CAR (машинка)?',
      optionVisual: 'emoji',
      correctOptionId: 'car',
      options: [
        { id: 'cat', label: 'Cat', glyph: '🐱' },
        { id: 'car', label: 'Car', glyph: '🚗' },
        { id: 'sun', label: 'Sun', glyph: '☀️' },
        { id: 'cup', label: 'Cup', glyph: '☕' },
      ],
    },
    {
      id: 'o3',
      prompt: 'Где BALL (мячик)?',
      optionVisual: 'emoji',
      correctOptionId: 'ball',
      options: [
        { id: 'house', label: 'House', glyph: '🏠' },
        { id: 'fish', label: 'Fish', glyph: '🐟' },
        { id: 'ball', label: 'Ball', glyph: '⚽' },
        { id: 'star', label: 'Star', glyph: '⭐' },
      ],
    },
    {
      id: 'o4',
      prompt: 'Где CAT (кошка)?',
      optionVisual: 'emoji',
      correctOptionId: 'cat',
      options: [
        { id: 'dog', label: 'Dog', glyph: '🐶' },
        { id: 'tree', label: 'Tree', glyph: '🌳' },
        { id: 'cat', label: 'Cat', glyph: '🐱' },
        { id: 'flower', label: 'Flower', glyph: '🌼' },
      ],
    },
    {
      id: 'o5',
      prompt: 'Где BOOK (книжка)?',
      optionVisual: 'emoji',
      correctOptionId: 'book',
      options: [
        { id: 'book', label: 'Book', glyph: '📕' },
        { id: 'shoe', label: 'Shoe', glyph: '👟' },
        { id: 'balloon', label: 'Balloon', glyph: '🎈' },
        { id: 'clock', label: 'Clock', glyph: '⏰' },
      ],
    },
    {
      id: 'o6',
      prompt: 'Где DOG (собачка)?',
      optionVisual: 'emoji',
      correctOptionId: 'dog',
      options: [
        { id: 'dog', label: 'Dog', glyph: '🐶' },
        { id: 'cat', label: 'Cat', glyph: '🐱' },
        { id: 'fish', label: 'Fish', glyph: '🐟' },
        { id: 'bird', label: 'Bird', glyph: '🐦' },
      ],
    },
    {
      id: 'o7',
      prompt: 'Где SUN (солнышко)?',
      optionVisual: 'emoji',
      correctOptionId: 'sun',
      options: [
        { id: 'moon', label: 'Moon', glyph: '🌙' },
        { id: 'cloud', label: 'Cloud', glyph: '☁️' },
        { id: 'sun', label: 'Sun', glyph: '☀️' },
        { id: 'star', label: 'Star', glyph: '⭐' },
      ],
    },
    {
      id: 'o8',
      prompt: 'Где HOUSE (домик)?',
      optionVisual: 'emoji',
      correctOptionId: 'house',
      options: [
        { id: 'car', label: 'Car', glyph: '🚗' },
        { id: 'house', label: 'House', glyph: '🏠' },
        { id: 'tree', label: 'Tree', glyph: '🌳' },
        { id: 'boat', label: 'Boat', glyph: '⛵' },
      ],
    },
    {
      id: 'o9',
      prompt: 'Где FLOWER (цветок)?',
      optionVisual: 'emoji',
      correctOptionId: 'flower',
      options: [
        { id: 'tree', label: 'Tree', glyph: '🌳' },
        { id: 'flower', label: 'Flower', glyph: '🌼' },
        { id: 'apple', label: 'Apple', glyph: '🍎' },
        { id: 'star', label: 'Star', glyph: '⭐' },
      ],
    },
    {
      id: 'o10',
      prompt: 'Где FISH (рыбка)?',
      optionVisual: 'emoji',
      correctOptionId: 'fish',
      options: [
        { id: 'bird', label: 'Bird', glyph: '🐦' },
        { id: 'cat', label: 'Cat', glyph: '🐱' },
        { id: 'fish', label: 'Fish', glyph: '🐟' },
        { id: 'dog', label: 'Dog', glyph: '🐶' },
      ],
    },
  ],
}

/* ───────────────────────────── СТРАНЫ ──────────────────────────── */

const countriesTopic: GameTopic = {
  id: 'countries',
  title: 'Страны',
  subtitle: 'Countries',
  emoji: '🌍',
  gradient: ['#10B981', '#34D399'],
  questions: [
    {
      id: 'k1',
      prompt: 'Где флаг USA (США)?',
      promptGlyph: '🗽',
      optionVisual: 'flag',
      correctOptionId: 'usa',
      options: [
        { id: 'usa', label: 'USA', glyph: '🇺🇸' },
        { id: 'japan', label: 'Japan', glyph: '🇯🇵' },
        { id: 'france', label: 'France', glyph: '🇫🇷' },
        { id: 'brazil', label: 'Brazil', glyph: '🇧🇷' },
      ],
    },
    {
      id: 'k2',
      prompt: 'Где флаг JAPAN (Япония)?',
      promptGlyph: '🗻',
      optionVisual: 'flag',
      correctOptionId: 'japan',
      options: [
        { id: 'italy', label: 'Italy', glyph: '🇮🇹' },
        { id: 'japan', label: 'Japan', glyph: '🇯🇵' },
        { id: 'uk', label: 'UK', glyph: '🇬🇧' },
        { id: 'egypt', label: 'Egypt', glyph: '🇪🇬' },
      ],
    },
    {
      id: 'k3',
      prompt: 'Где флаг UK (Британия)?',
      promptGlyph: '☕',
      optionVisual: 'flag',
      correctOptionId: 'uk',
      options: [
        { id: 'germany', label: 'Germany', glyph: '🇩🇪' },
        { id: 'france', label: 'France', glyph: '🇫🇷' },
        { id: 'uk', label: 'UK', glyph: '🇬🇧' },
        { id: 'spain', label: 'Spain', glyph: '🇪🇸' },
      ],
    },
    {
      id: 'k4',
      prompt: 'Где флаг FRANCE (Франция)?',
      promptGlyph: '🥐',
      optionVisual: 'flag',
      correctOptionId: 'france',
      options: [
        { id: 'france', label: 'France', glyph: '🇫🇷' },
        { id: 'usa', label: 'USA', glyph: '🇺🇸' },
        { id: 'japan', label: 'Japan', glyph: '🇯🇵' },
        { id: 'canada', label: 'Canada', glyph: '🇨🇦' },
      ],
    },
    {
      id: 'k5',
      prompt: 'Где флаг BRAZIL (Бразилия)?',
      promptGlyph: '⚽',
      optionVisual: 'flag',
      correctOptionId: 'brazil',
      options: [
        { id: 'italy', label: 'Italy', glyph: '🇮🇹' },
        { id: 'germany', label: 'Germany', glyph: '🇩🇪' },
        { id: 'brazil', label: 'Brazil', glyph: '🇧🇷' },
        { id: 'uk', label: 'UK', glyph: '🇬🇧' },
      ],
    },
    {
      id: 'k6',
      prompt: 'Где флаг ITALY (Италия)?',
      promptGlyph: '🍕',
      optionVisual: 'flag',
      correctOptionId: 'italy',
      options: [
        { id: 'italy', label: 'Italy', glyph: '🇮🇹' },
        { id: 'france', label: 'France', glyph: '🇫🇷' },
        { id: 'japan', label: 'Japan', glyph: '🇯🇵' },
        { id: 'spain', label: 'Spain', glyph: '🇪🇸' },
      ],
    },
    {
      id: 'k7',
      prompt: 'Где флаг GERMANY (Германия)?',
      promptGlyph: '🥨',
      optionVisual: 'flag',
      correctOptionId: 'germany',
      options: [
        { id: 'uk', label: 'UK', glyph: '🇬🇧' },
        { id: 'germany', label: 'Germany', glyph: '🇩🇪' },
        { id: 'usa', label: 'USA', glyph: '🇺🇸' },
        { id: 'brazil', label: 'Brazil', glyph: '🇧🇷' },
      ],
    },
    {
      id: 'k8',
      prompt: 'Где флаг CANADA (Канада)?',
      promptGlyph: '🍁',
      optionVisual: 'flag',
      correctOptionId: 'canada',
      options: [
        { id: 'egypt', label: 'Egypt', glyph: '🇪🇬' },
        { id: 'japan', label: 'Japan', glyph: '🇯🇵' },
        { id: 'canada', label: 'Canada', glyph: '🇨🇦' },
        { id: 'italy', label: 'Italy', glyph: '🇮🇹' },
      ],
    },
    {
      id: 'k9',
      prompt: 'Где флаг SPAIN (Испания)?',
      promptGlyph: '💃',
      optionVisual: 'flag',
      correctOptionId: 'spain',
      options: [
        { id: 'france', label: 'France', glyph: '🇫🇷' },
        { id: 'spain', label: 'Spain', glyph: '🇪🇸' },
        { id: 'germany', label: 'Germany', glyph: '🇩🇪' },
        { id: 'uk', label: 'UK', glyph: '🇬🇧' },
      ],
    },
    {
      id: 'k10',
      prompt: 'Где флаг EGYPT (Египет)?',
      promptGlyph: '🐫',
      optionVisual: 'flag',
      correctOptionId: 'egypt',
      options: [
        { id: 'brazil', label: 'Brazil', glyph: '🇧🇷' },
        { id: 'canada', label: 'Canada', glyph: '🇨🇦' },
        { id: 'egypt', label: 'Egypt', glyph: '🇪🇬' },
        { id: 'usa', label: 'USA', glyph: '🇺🇸' },
      ],
    },
  ],
}

/* ────────────────────────────── ЖИВОТНЫЕ ───────────────────────────── */

const animalsTopic: GameTopic = {
  id: 'animals',
  title: 'Животные',
  subtitle: 'Animals',
  emoji: '🦁',
  gradient: ['#EC4899', '#F472B6'],
  questions: [
    {
      id: 'a1',
      prompt: 'Где LION (лев)?',
      optionVisual: 'emoji',
      correctOptionId: 'lion',
      options: [
        { id: 'lion', label: 'Lion', glyph: '🦁' },
        { id: 'elephant', label: 'Elephant', glyph: '🐘' },
        { id: 'monkey', label: 'Monkey', glyph: '🐵' },
        { id: 'frog', label: 'Frog', glyph: '🐸' },
      ],
    },
    {
      id: 'a2',
      prompt: 'Где ELEPHANT (слон)?',
      optionVisual: 'emoji',
      correctOptionId: 'elephant',
      options: [
        { id: 'rabbit', label: 'Rabbit', glyph: '🐰' },
        { id: 'elephant', label: 'Elephant', glyph: '🐘' },
        { id: 'bear', label: 'Bear', glyph: '🐻' },
        { id: 'pig', label: 'Pig', glyph: '🐷' },
      ],
    },
    {
      id: 'a3',
      prompt: 'Где MONKEY (обезьянка)?',
      optionVisual: 'emoji',
      correctOptionId: 'monkey',
      options: [
        { id: 'cow', label: 'Cow', glyph: '🐮' },
        { id: 'monkey', label: 'Monkey', glyph: '🐵' },
        { id: 'lion', label: 'Lion', glyph: '🦁' },
        { id: 'duck', label: 'Duck', glyph: '🦆' },
      ],
    },
    {
      id: 'a4',
      prompt: 'Где RABBIT (зайчик)?',
      optionVisual: 'emoji',
      correctOptionId: 'rabbit',
      options: [
        { id: 'rabbit', label: 'Rabbit', glyph: '🐰' },
        { id: 'frog', label: 'Frog', glyph: '🐸' },
        { id: 'bear', label: 'Bear', glyph: '🐻' },
        { id: 'elephant', label: 'Elephant', glyph: '🐘' },
      ],
    },
    {
      id: 'a5',
      prompt: 'Где BEAR (мишка)?',
      optionVisual: 'emoji',
      correctOptionId: 'bear',
      options: [
        { id: 'pig', label: 'Pig', glyph: '🐷' },
        { id: 'cow', label: 'Cow', glyph: '🐮' },
        { id: 'bear', label: 'Bear', glyph: '🐻' },
        { id: 'monkey', label: 'Monkey', glyph: '🐵' },
      ],
    },
    {
      id: 'a6',
      prompt: 'Где FROG (лягушка)?',
      optionVisual: 'emoji',
      correctOptionId: 'frog',
      options: [
        { id: 'frog', label: 'Frog', glyph: '🐸' },
        { id: 'duck', label: 'Duck', glyph: '🦆' },
        { id: 'lion', label: 'Lion', glyph: '🦁' },
        { id: 'rabbit', label: 'Rabbit', glyph: '🐰' },
      ],
    },
    {
      id: 'a7',
      prompt: 'Где PIG (свинка)?',
      optionVisual: 'emoji',
      correctOptionId: 'pig',
      options: [
        { id: 'cow', label: 'Cow', glyph: '🐮' },
        { id: 'pig', label: 'Pig', glyph: '🐷' },
        { id: 'bear', label: 'Bear', glyph: '🐻' },
        { id: 'monkey', label: 'Monkey', glyph: '🐵' },
      ],
    },
    {
      id: 'a8',
      prompt: 'Где COW (коровка)?',
      optionVisual: 'emoji',
      correctOptionId: 'cow',
      options: [
        { id: 'duck', label: 'Duck', glyph: '🦆' },
        { id: 'pig', label: 'Pig', glyph: '🐷' },
        { id: 'cow', label: 'Cow', glyph: '🐮' },
        { id: 'elephant', label: 'Elephant', glyph: '🐘' },
      ],
    },
    {
      id: 'a9',
      prompt: 'Где DUCK (уточка)?',
      optionVisual: 'emoji',
      correctOptionId: 'duck',
      options: [
        { id: 'frog', label: 'Frog', glyph: '🐸' },
        { id: 'rabbit', label: 'Rabbit', glyph: '🐰' },
        { id: 'duck', label: 'Duck', glyph: '🦆' },
        { id: 'lion', label: 'Lion', glyph: '🦁' },
      ],
    },
    {
      id: 'a10',
      prompt: 'Где HORSE (лошадка)?',
      optionVisual: 'emoji',
      correctOptionId: 'horse',
      options: [
        { id: 'cow', label: 'Cow', glyph: '🐮' },
        { id: 'horse', label: 'Horse', glyph: '🐴' },
        { id: 'pig', label: 'Pig', glyph: '🐷' },
        { id: 'bear', label: 'Bear', glyph: '🐻' },
      ],
    },
  ],
}

/* ────────────────────────────── ЧИСЛА ───────────────────────────── */

const numbersTopic: GameTopic = {
  id: 'numbers',
  title: 'Числа',
  subtitle: 'Numbers',
  emoji: '🔢',
  gradient: ['#0EA5E9', '#38BDF8'],
  questions: [
    {
      id: 'n1',
      prompt: 'Где ONE (один)?',
      optionVisual: 'emoji',
      correctOptionId: 'one',
      options: [
        { id: 'one', label: 'One', glyph: '1️⃣' },
        { id: 'three', label: 'Three', glyph: '3️⃣' },
        { id: 'five', label: 'Five', glyph: '5️⃣' },
        { id: 'two', label: 'Two', glyph: '2️⃣' },
      ],
    },
    {
      id: 'n2',
      prompt: 'Где TWO (два)?',
      optionVisual: 'emoji',
      correctOptionId: 'two',
      options: [
        { id: 'four', label: 'Four', glyph: '4️⃣' },
        { id: 'two', label: 'Two', glyph: '2️⃣' },
        { id: 'one', label: 'One', glyph: '1️⃣' },
        { id: 'six', label: 'Six', glyph: '6️⃣' },
      ],
    },
    {
      id: 'n3',
      prompt: 'Где THREE (три)?',
      optionVisual: 'emoji',
      correctOptionId: 'three',
      options: [
        { id: 'three', label: 'Three', glyph: '3️⃣' },
        { id: 'seven', label: 'Seven', glyph: '7️⃣' },
        { id: 'two', label: 'Two', glyph: '2️⃣' },
        { id: 'five', label: 'Five', glyph: '5️⃣' },
      ],
    },
    {
      id: 'n4',
      prompt: 'Где FOUR (четыре)?',
      optionVisual: 'emoji',
      correctOptionId: 'four',
      options: [
        { id: 'one', label: 'One', glyph: '1️⃣' },
        { id: 'four', label: 'Four', glyph: '4️⃣' },
        { id: 'eight', label: 'Eight', glyph: '8️⃣' },
        { id: 'three', label: 'Three', glyph: '3️⃣' },
      ],
    },
    {
      id: 'n5',
      prompt: 'Где FIVE (пять)?',
      optionVisual: 'emoji',
      correctOptionId: 'five',
      options: [
        { id: 'nine', label: 'Nine', glyph: '9️⃣' },
        { id: 'two', label: 'Two', glyph: '2️⃣' },
        { id: 'five', label: 'Five', glyph: '5️⃣' },
        { id: 'six', label: 'Six', glyph: '6️⃣' },
      ],
    },
    {
      id: 'n6',
      prompt: 'Где SIX (шесть)?',
      optionVisual: 'emoji',
      correctOptionId: 'six',
      options: [
        { id: 'six', label: 'Six', glyph: '6️⃣' },
        { id: 'four', label: 'Four', glyph: '4️⃣' },
        { id: 'ten', label: 'Ten', glyph: '🔟' },
        { id: 'one', label: 'One', glyph: '1️⃣' },
      ],
    },
    {
      id: 'n7',
      prompt: 'Где SEVEN (семь)?',
      optionVisual: 'emoji',
      correctOptionId: 'seven',
      options: [
        { id: 'three', label: 'Three', glyph: '3️⃣' },
        { id: 'seven', label: 'Seven', glyph: '7️⃣' },
        { id: 'nine', label: 'Nine', glyph: '9️⃣' },
        { id: 'two', label: 'Two', glyph: '2️⃣' },
      ],
    },
    {
      id: 'n8',
      prompt: 'Где EIGHT (восемь)?',
      optionVisual: 'emoji',
      correctOptionId: 'eight',
      options: [
        { id: 'five', label: 'Five', glyph: '5️⃣' },
        { id: 'eight', label: 'Eight', glyph: '8️⃣' },
        { id: 'six', label: 'Six', glyph: '6️⃣' },
        { id: 'ten', label: 'Ten', glyph: '🔟' },
      ],
    },
    {
      id: 'n9',
      prompt: 'Где NINE (девять)?',
      optionVisual: 'emoji',
      correctOptionId: 'nine',
      options: [
        { id: 'seven', label: 'Seven', glyph: '7️⃣' },
        { id: 'one', label: 'One', glyph: '1️⃣' },
        { id: 'nine', label: 'Nine', glyph: '9️⃣' },
        { id: 'four', label: 'Four', glyph: '4️⃣' },
      ],
    },
    {
      id: 'n10',
      prompt: 'Где TEN (десять)?',
      optionVisual: 'emoji',
      correctOptionId: 'ten',
      options: [
        { id: 'ten', label: 'Ten', glyph: '🔟' },
        { id: 'eight', label: 'Eight', glyph: '8️⃣' },
        { id: 'three', label: 'Three', glyph: '3️⃣' },
        { id: 'six', label: 'Six', glyph: '6️⃣' },
      ],
    },
  ],
}

export const GAME_TOPICS: GameTopic[] = [
  colorsTopic,
  objectsTopic,
  countriesTopic,
  animalsTopic,
  numbersTopic,
]


export function getTopic(id: GameTopicId): GameTopic | undefined {
  return GAME_TOPICS.find(t => t.id === id)
}
