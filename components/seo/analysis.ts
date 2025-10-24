export type MetricStatus = 'success' | 'warning' | 'error';

export type SeoMetric = {
  id: string;
  label: string;
  value: string;
  detail?: string;
  status: MetricStatus;
  hint?: string;
};

export type KeywordInsight = {
  keyword: string;
  count: number;
  density: number;
  isTarget: boolean;
};

export type SeoInputs = {
  title: string;
  description: string;
  keywords: string;
  url: string;
  content: string;
};

export type SeoAnalysis = {
  metrics: SeoMetric[];
  suggestions: string[];
  keywordInsights: KeywordInsight[];
};

export const defaultSeoInputs: SeoInputs = {
  title: '',
  description: '',
  keywords: '',
  url: '',
  content: '',
};

type Range = { min: number; max: number };

type LengthMetricOptions = {
  emptyHint: string;
  shortHint: string;
  longHint: string;
  detail: string;
};

const TITLE_RANGE: Range = { min: 50, max: 60 };
const DESCRIPTION_RANGE: Range = { min: 120, max: 160 };

const WORD_COUNT_THRESHOLDS = {
  min: 300,
  warning: 150,
};

const AVERAGE_WORDS_PER_SENTENCE = { min: 12, max: 20 };
const WORDS_PER_MINUTE = 200;

const STOP_WORDS = new Set([
  'a',
  'about',
  'above',
  'after',
  'again',
  'against',
  'all',
  'am',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'being',
  'below',
  'between',
  'both',
  'but',
  'by',
  'could',
  'did',
  'do',
  'does',
  'doing',
  'down',
  'during',
  'each',
  'few',
  'for',
  'from',
  'further',
  'had',
  'has',
  'have',
  'having',
  'he',
  'her',
  'here',
  'hers',
  'herself',
  'him',
  'himself',
  'his',
  'how',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'itself',
  'just',
  'me',
  'more',
  'most',
  'my',
  'myself',
  'no',
  'nor',
  'not',
  'now',
  'of',
  'off',
  'on',
  'once',
  'only',
  'or',
  'other',
  'our',
  'ours',
  'ourselves',
  'out',
  'over',
  'own',
  'same',
  'she',
  'should',
  'so',
  'some',
  'such',
  'than',
  'that',
  'the',
  'their',
  'theirs',
  'them',
  'themselves',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'to',
  'too',
  'under',
  'until',
  'up',
  'very',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'while',
  'who',
  'whom',
  'why',
  'with',
  'you',
  'your',
  'yours',
  'yourself',
  'yourselves',
]);

export const analyzeSeo = (inputs: SeoInputs): SeoAnalysis => {
  const title = inputs.title.trim();
  const description = inputs.description.trim();
  const url = inputs.url.trim();
  const keywords = parseKeywords(inputs.keywords);
  const words = extractWords(inputs.content);
  const wordCount = words.length;
  const sentences = countSentences(inputs.content);
  const metrics: SeoMetric[] = [];
  const suggestions = new Set<string>();

  const titleMetric = createLengthMetric('title-length', 'Title length', title, TITLE_RANGE, {
    emptyHint: 'Add a descriptive title to help search engines understand the page.',
    shortHint: 'Aim for 50–60 characters so your title is not truncated.',
    longHint: 'Keep the title under 60 characters to avoid truncation in search results.',
    detail: 'Recommended: 50–60 characters',
  });
  metrics.push(titleMetric.metric);
  appendSuggestion(suggestions, titleMetric.hint);

  const descriptionMetric = createLengthMetric(
    'description-length',
    'Meta description length',
    description,
    DESCRIPTION_RANGE,
    {
      emptyHint: 'Write a compelling meta description to improve click-through rate.',
      shortHint: 'Descriptions between 120–160 characters perform better in search results.',
      longHint: 'Keep descriptions under 160 characters so they display in full.',
      detail: 'Recommended: 120–160 characters',
    }
  );
  metrics.push(descriptionMetric.metric);
  appendSuggestion(suggestions, descriptionMetric.hint);

  const wordMetric = createWordCountMetric(wordCount);
  metrics.push(wordMetric.metric);
  appendSuggestion(suggestions, wordMetric.hint);

  const readabilityMetric = createReadabilityMetric(wordCount, sentences);
  metrics.push(readabilityMetric.metric);
  appendSuggestion(suggestions, readabilityMetric.hint);

  const readingTimeMetric = createReadingTimeMetric(wordCount);
  metrics.push(readingTimeMetric);

  const coverageMetric = createKeywordCoverageMetric(keywords, words);
  metrics.push(coverageMetric.metric);
  coverageMetric.hints.forEach((hint) => appendSuggestion(suggestions, hint));

  const urlMetric = createUrlMetric(url);
  metrics.push(urlMetric.metric);
  urlMetric.hints.forEach((hint) => appendSuggestion(suggestions, hint));

  const keywordInsights = buildKeywordInsights(words, keywords);

  const suggestionList = suggestions.size
    ? Array.from(suggestions)
    : ['Great work! Your page inputs look well optimized.'];

  return {
    metrics,
    suggestions: suggestionList,
    keywordInsights,
  };
};

type LengthMetricResult = {
  metric: SeoMetric;
  hint?: string;
};

type WordCountMetricResult = {
  metric: SeoMetric;
  hint?: string;
};

type ReadabilityMetricResult = {
  metric: SeoMetric;
  hint?: string;
};

const createReadingTimeMetric = (wordCount: number): SeoMetric => {
  if (!wordCount) {
    return {
      id: 'reading-time',
      label: 'Estimated reading time',
      value: '—',
      detail: 'Add copy to calculate reading time.',
      status: 'warning',
    };
  }

  const minutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
  const status: MetricStatus = minutes < 2 ? 'warning' : 'success';

  return {
    id: 'reading-time',
    label: 'Estimated reading time',
    value: `${minutes} min`,
    detail: `Based on ${WORDS_PER_MINUTE} words per minute`,
    status,
  };
};

type KeywordCoverageResult = {
  metric: SeoMetric;
  hints: string[];
};

type UrlMetricResult = {
  metric: SeoMetric;
  hints: string[];
};

const createLengthMetric = (
  id: string,
  label: string,
  value: string,
  range: Range,
  options: LengthMetricOptions
): LengthMetricResult => {
  const length = value.length;

  if (!length) {
    return {
      metric: {
        id,
        label,
        value: 'Not set',
        detail: options.detail,
        status: 'warning',
        hint: options.emptyHint,
      },
      hint: options.emptyHint,
    };
  }

  const metric: SeoMetric = {
    id,
    label,
    value: `${length} characters`,
    detail: options.detail,
    status: 'success',
  };
  let hint: string | undefined;

  if (length < range.min) {
    metric.status = 'warning';
    hint = options.shortHint;
  } else if (length > range.max) {
    metric.status = 'warning';
    hint = options.longHint;
  }

  if (hint) {
    metric.hint = hint;
  }

  return { metric, hint };
};

const createWordCountMetric = (wordCount: number): WordCountMetricResult => {
  if (!wordCount) {
    const hint = 'Add body content so we can calculate keyword density and reading time.';
    return {
      metric: {
        id: 'word-count',
        label: 'Word count',
        value: '0 words',
        detail: 'Aim for 300+ words to provide depth.',
        status: 'warning',
        hint,
      },
      hint,
    };
  }

  const status: MetricStatus =
    wordCount < WORD_COUNT_THRESHOLDS.warning
      ? 'error'
      : wordCount < WORD_COUNT_THRESHOLDS.min
      ? 'warning'
      : 'success';

  const hint =
    status === 'success'
      ? undefined
      : wordCount < WORD_COUNT_THRESHOLDS.warning
      ? 'Very short content can struggle to rank—consider expanding your copy.'
      : 'Longer content (300+ words) tends to perform better for competitive queries.';

  const metric: SeoMetric = {
    id: 'word-count',
    label: 'Word count',
    value: `${wordCount} ${wordCount === 1 ? 'word' : 'words'}`,
    detail: 'Aim for 300+ words to provide depth.',
    status,
    ...(hint ? { hint } : {}),
  };

  return { metric, hint };
};

const createReadabilityMetric = (
  wordCount: number,
  sentenceCount: number
): ReadabilityMetricResult => {
  if (!wordCount) {
    return {
      metric: {
        id: 'readability',
        label: 'Readability',
        value: 'No content',
        detail: 'Aim for 12–20 words per sentence.',
        status: 'warning',
        hint: 'Add some copy to evaluate readability.',
      },
      hint: 'Add some copy to evaluate readability.',
    };
  }

  const average = sentenceCount === 0 ? wordCount : wordCount / sentenceCount;
  const value = `${average.toFixed(1)} words per sentence`;

  let status: MetricStatus = 'success';
  let hint: string | undefined;

  if (average < AVERAGE_WORDS_PER_SENTENCE.min) {
    status = 'warning';
    hint = 'Extremely short sentences can feel abrupt—consider combining related ideas.';
  } else if (average > AVERAGE_WORDS_PER_SENTENCE.max) {
    status = 'warning';
    hint = 'Break up long sentences to keep copy easy to read.';
    if (average > 30) {
      status = 'error';
    }
  }

  const metric: SeoMetric = {
    id: 'readability',
    label: 'Readability',
    value,
    detail: 'Aim for 12–20 words per sentence.',
    status,
    ...(hint ? { hint } : {}),
  };

  return { metric, hint };
};

const createKeywordCoverageMetric = (
  keywords: string[],
  words: string[]
): KeywordCoverageResult => {
  const hints: string[] = [];

  if (!keywords.length) {
    const hint = 'Add a few target keywords to monitor how well they appear in your copy.';
    return {
      metric: {
        id: 'keyword-coverage',
        label: 'Target keyword coverage',
        value: 'No keywords provided',
        detail: 'Add up to 5 target keywords separated by commas.',
        status: 'warning',
        hint,
      },
      hints: [hint],
    };
  }

  if (!words.length) {
    const hint = 'Add copy to evaluate how often your target keywords appear.';
    return {
      metric: {
        id: 'keyword-coverage',
        label: 'Target keyword coverage',
        value: '0% of keywords found',
        detail: `${keywords.length} keyword${keywords.length === 1 ? '' : 's'} tracked`,
        status: 'error',
        hint,
      },
      hints: [hint],
    };
  }

  const wordSet = new Set(words);
  const uniqueKeywords = Array.from(new Set(keywords));
  const usedCount = uniqueKeywords.filter((keyword) => wordSet.has(keyword)).length;
  const coverage = usedCount / uniqueKeywords.length;
  const coveragePercent = Math.round(coverage * 100);

  let status: MetricStatus = 'success';
  if (coverage === 0) {
    status = 'error';
    hints.push('Target keywords never appear—work them into headings and body copy.');
  } else if (coverage < 0.6) {
    status = 'warning';
    hints.push('Use your target keywords more consistently in the content.');
  }

  const metric: SeoMetric = {
    id: 'keyword-coverage',
    label: 'Target keyword coverage',
    value: `${coveragePercent}% of keywords found`,
    detail: `${usedCount}/${uniqueKeywords.length} keywords present`,
    status,
    ...(hints[0] ? { hint: hints[0] } : {}),
  };

  return { metric, hints };
};

const createUrlMetric = (url: string): UrlMetricResult => {
  if (!url) {
    const hint = 'Specify the canonical URL to ensure search engines index the right page.';
    return {
      metric: {
        id: 'canonical-url',
        label: 'Canonical URL',
        value: 'Not set',
        detail: 'Use the full URL, including protocol.',
        status: 'warning',
        hint,
      },
      hints: [hint],
    };
  }

  const hints: string[] = [];
  const normalized = url.replace(/https?:\/\//i, '');
  const segments = normalized.split('/').filter(Boolean);
  const slug = segments[segments.length - 1] ?? normalized;
  const slugLength = slug.length;
  const isSecure = /^https:\/\//i.test(url);

  if (!isSecure) {
    hints.push('Use HTTPS URLs to avoid security warnings in browsers.');
  }

  if (slugLength > 60) {
    hints.push('Shorten the URL slug so it is easier to read and share.');
  }

  const status: MetricStatus = slugLength > 75 ? 'error' : slugLength > 60 ? 'warning' : 'success';

  const metric: SeoMetric = {
    id: 'canonical-url',
    label: 'Canonical URL',
    value: slugLength ? `${slugLength} characters in slug` : normalized,
    detail: isSecure ? 'HTTPS detected' : 'Add HTTPS for secure pages.',
    status,
    ...(hints[0] ? { hint: hints[0] } : {}),
  };

  return { metric, hints };
};

const parseKeywords = (value: string): string[] =>
  value
    .split(',')
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 10);

const extractWords = (value: string): string[] => {
  const matches = value.toLowerCase().match(/[a-z0-9]+(?:'[a-z0-9]+)?/g);
  if (!matches) {
    return [];
  }
  return matches.filter((word) => !STOP_WORDS.has(word));
};

const countSentences = (value: string): number =>
  value
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length;

const buildKeywordInsights = (words: string[], keywords: string[]): KeywordInsight[] => {
  if (!words.length && !keywords.length) {
    return [];
  }

  const keywordFrequency = new Map<string, number>();
  for (const word of words) {
    const current = keywordFrequency.get(word) ?? 0;
    keywordFrequency.set(word, current + 1);
  }

  const uniqueKeywords = Array.from(new Set(keywords));
  const insights: KeywordInsight[] = uniqueKeywords.map((keyword) => {
    const count = keywordFrequency.get(keyword) ?? 0;
    const density = words.length ? (count / words.length) * 100 : 0;
    keywordFrequency.delete(keyword);
    return {
      keyword,
      count,
      density,
      isTarget: true,
    };
  });

  const remaining = Array.from(keywordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.max(0, 5 - insights.length));

  for (const [keyword, count] of remaining) {
    const density = words.length ? (count / words.length) * 100 : 0;
    insights.push({ keyword, count, density, isTarget: false });
  }

  return insights;
};

const appendSuggestion = (set: Set<string>, hint?: string) => {
  if (hint) {
    set.add(hint);
  }
};
