import type { DocPage } from '@/types/docs';

const experimentDiagram = `Experiment A            Experiment B            Experiment C
Single LLM              Multiple LLMs           Multiple LLMs
     │                       │                       │
     ▼                       ▼                       ▼
 Feedback           Independent Feedback        Reassessment
                                                     │
                                                     ▼
                                              Final Feedback`;

export const researchPages: DocPage[] = [
  {
    slug: 'research/methodology',
    section: 'Research',
    title: 'Evaluation methodology',
    description:
      'Codeverity is designed to investigate whether multi-model assessment combined with reassessment can improve the quality of AI-generated programming feedback.',
    blocks: [
      { type: 'heading', id: 'configurations', text: 'Experimental configurations' },
      { type: 'diagram', art: experimentDiagram },
      {
        type: 'paragraph',
        text: 'Each configuration receives identical submissions and assignment requirements, so differences in the generated feedback can be attributed to the assessment strategy rather than the input.',
      },
      { type: 'heading', id: 'dimensions', text: 'Evaluation dimensions' },
      {
        type: 'list',
        items: [
          'Correctness',
          'Prescription correctness',
          'Relevance',
          'Actionability',
          'Specificity',
          'Pedagogical appropriateness',
          'Human expert agreement',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Results are not published yet',
        text: 'Measured outcomes will be added here once the experiments have been run. No performance figures are reported in advance.',
      },
    ],
  },
  {
    slug: 'research/evaluation-framework',
    section: 'Research',
    title: 'Evaluation framework',
    description: 'How generated feedback is scored and compared against human expert judgement.',
    blocks: [
      { type: 'heading', id: 'procedure', text: 'Procedure' },
      {
        type: 'list',
        ordered: true,
        items: [
          'A fixed set of programming assignments and student submissions is prepared.',
          'Each configuration produces feedback for every submission.',
          'Feedback is scored against the evaluation criteria.',
          'A subset is independently reviewed by human experts.',
          'Agreement between automated scores and expert judgement is measured.',
        ],
      },
      { type: 'heading', id: 'criteria', text: 'Scoring criteria' },
      {
        type: 'table',
        columns: ['Criterion', 'Question it answers'],
        rows: [
          ['Correctness', 'Does the feedback accurately describe the submitted code?'],
          ['Prescription correctness', 'Would the recommended change actually fix the issue?'],
          ['Relevance', 'Does the feedback address the assignment requirements?'],
          ['Actionability', 'Can a student act on the feedback directly?'],
          ['Specificity', 'Is the recommendation concrete rather than generic advice?'],
          ['Pedagogical appropriateness', 'Is the explanation suitable for the learner context?'],
        ],
      },
      { type: 'heading', id: 'reproducibility', text: 'Reproducibility' },
      {
        type: 'paragraph',
        text: 'Model versions, prompts, and evaluation criteria are recorded with every experimental run so results can be reproduced and compared over time.',
      },
    ],
  },
];
