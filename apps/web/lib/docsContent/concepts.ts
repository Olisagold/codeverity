import type { DocPage } from '@/types/docs';

const assessmentDiagram = `             Submission
                  │
                  ▼
         Assessment Engine
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
 Model A       Model B       Model C
    │             │             │
    └─────────────┼─────────────┘
                  ▼
           Reassessment
                  │
                  ▼
           Final Result`;

const reassessmentDiagram = `Assessment A ──┐
Assessment B ──┼──>  Reassessment  ──>  Final Result
Assessment C ──┘`;

export const conceptPages: DocPage[] = [
  {
    slug: 'concepts/assessment',
    section: 'Concepts',
    title: 'How Codeverity assesses code',
    description:
      'Codeverity uses multiple independent model assessments before applying a reassessment stage to the generated feedback.',
    blocks: [
      { type: 'heading', id: 'pipeline', text: 'The assessment pipeline' },
      { type: 'diagram', art: assessmentDiagram },
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
          { title: 'Reassessment', text: 'How the final prescription is chosen.', to: '/docs/concepts/reassessment' },
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
        text: 'Every assessment is dispatched to multiple models in parallel. Each returns an assessment of the submission and a prescription: the concrete change the student should make.',
      },
      { type: 'heading', id: 'normalization', text: 'Normalization' },
      {
        type: 'paragraph',
        text: 'Model outputs are normalized into a common structure before reassessment, so prescriptions can be compared rather than concatenated.',
      },
      {
        type: 'code',
        language: 'json',
        label: 'Normalized assessment',
        code: `{
  "model": "model_a",
  "assessment": {
    "summary": "Fails for lists of only negative numbers.",
    "issues": ["max_num initialized to 0"]
  },
  "prescription": {
    "action": "Initialize max_num with the first element",
    "code": "max_num = numbers[0]"
  }
}`,
      },
      { type: 'heading', id: 'disagreement', text: 'Disagreement' },
      {
        type: 'paragraph',
        text: 'When prescriptions conflict, the disagreement is preserved and passed into reassessment instead of being silently resolved by picking the first response.',
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
      { type: 'diagram', art: reassessmentDiagram },
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
        text: 'The result includes a `confidence` value derived from how strongly the independent assessments agreed and how well the selected prescription scored against the evaluation criteria.',
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
