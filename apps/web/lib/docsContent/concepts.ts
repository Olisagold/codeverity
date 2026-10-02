import type { DocPage } from '@/types/docs';

export const conceptPages: DocPage[] = [
  {
    slug: 'concepts/assessment',
    section: 'Concepts',
    title: 'How Codeverity assesses code',
    description:
      'Codeverity uses multiple independent model assessments before applying a reassessment stage to the generated feedback.',
    blocks: [
      { type: 'heading', id: 'pipeline', text: 'The assessment pipeline' },
      { type: 'custom', component: 'requestFlow' },
      {
        type: 'paragraph',
        text: 'Each model receives the same submission, assignment requirements, and language. No model sees another model’s output during the assessment stage, so the assessments stay independent.',
      },
      { type: 'heading', id: 'why', text: 'Why independence matters' },
      {
        type: 'list',
        items: [
          'A single model can produce feedback that is incomplete, incorrect, or inconsistent between runs.',
          'Different models identify different issues in the same submission.',
          'Conflicting recommendations are signal: they mark the parts of a submission where feedback is least certain.',
        ],
      },
      {
        type: 'cards',
        cards: [
          { title: 'Multi-model assessment', text: 'How models are selected and normalized.', to: '/docs/concepts/multi-model' },
          { title: 'Reassessment', text: 'How the final feedback is chosen.', to: '/docs/concepts/reassessment' },
        ],
      },
    ],
  },
  {
    slug: 'concepts/multi-model',
    section: 'Concepts',
    title: 'Multi-model assessment',
    description: 'Several language models evaluate the same submission independently.',
    blocks: [
      { type: 'heading', id: 'independent', text: 'Independent assessments' },
      {
        type: 'paragraph',
        text: 'Every live assessment is sent to three models in parallel: GPT-6 Luna, Gemini Flash, and DeepSeek V4.1 Flash. Each writes feedback for the student on its own. If Gemini is busy or rate limited, a cheaper Gemini model is tried. At least two models must succeed for the assessment to continue.',
      },
      { type: 'heading', id: 'normalization', text: 'Normalization' },
      {
        type: 'paragraph',
        text: 'Every model must return the same JSON structure, so their feedback can be compared side by side rather than concatenated. Output that doesn’t match is discarded.',
      },
      {
        type: 'code',
        language: 'json',
        label: 'Normalized assessment',
        code: `{
  "summary": "The loop works, but starting at 0 fails for lists of only negative numbers.",
  "issues": ["max_num is initialized to 0, so find_max([-5, -2]) returns 0."],
  "suggestions": ["Initialize max_num with the first element: max_num = numbers[0]."]
}`,
      },
      { type: 'heading', id: 'disagreement', text: 'Disagreement' },
      {
        type: 'paragraph',
        text: 'When the models disagree, all of their feedback goes to the review step instead of one being picked at random. Claude Sonnet 5.5 scores each one, writes the final feedback, and rates how closely they agreed. That agreement feeds into `confidence`.',
      },
    ],
  },
  {
    slug: 'concepts/reassessment',
    section: 'Concepts',
    title: 'Reassessment',
    description:
      'Reassessment is the stage in which Codeverity evaluates independently generated model assessments before producing the final feedback.',
    blocks: [
      { type: 'heading', id: 'flow', text: 'How reassessment works' },
      { type: 'custom', component: 'reassessment' },
      {
        type: 'list',
        ordered: true,
        items: [
          'Multiple models independently analyze the submission.',
          'Their assessments are normalized into a common structure.',
          'The reassessment model receives the generated assessments.',
          'The assessments are evaluated against defined criteria.',
          'Disagreements are identified.',
          'The final feedback is selected or refined.',
          'The result is returned to the integrating platform.',
        ],
      },
      { type: 'heading', id: 'confidence', text: 'Confidence' },
      {
        type: 'paragraph',
        text: 'The result includes a `confidence` value derived from how strongly the independent assessments agreed and how well the final feedback scored against the evaluation criteria.',
      },
      {
        type: 'code',
        language: 'json',
        label: 'Result excerpt',
        code: `{
  "score": 9.2,
  "confidence": 0.92,
  "criteria": {
    "correctness": 9.5,
    "relevance": 9.0,
    "actionability": 9.2,
    "specificity": 9.4,
    "pedagogical_fit": 8.8
  }
}`,
      },
    ],
  },
  {
    slug: 'concepts/evaluation',
    section: 'Concepts',
    title: 'Evaluation criteria',
    description: 'The criteria used to evaluate generated feedback during reassessment.',
    blocks: [
      { type: 'heading', id: 'criteria', text: 'Criteria' },
      {
        type: 'definitions',
        items: [
          {
            term: 'Correctness',
            text: 'Whether the feedback accurately identifies issues or characteristics of the submitted code.',
          },
          {
            term: 'Relevance',
            text: 'Whether the feedback addresses the assignment requirements and submitted code.',
          },
          {
            term: 'Actionability',
            text: 'Whether the feedback provides practical guidance that can be used to improve the submission.',
          },
          {
            term: 'Specificity',
            text: 'Whether recommendations identify concrete issues rather than relying on generic programming advice.',
          },
          {
            term: 'Pedagogical appropriateness',
            text: 'Whether the explanation is suitable for the intended learner context.',
          },
        ],
      },
      { type: 'heading', id: 'scoring', text: 'How criteria appear in the result' },
      {
        type: 'paragraph',
        text: 'Each criterion is scored independently so your platform can display why a recommendation was selected rather than only the final number.',
      },
    ],
  },
];
