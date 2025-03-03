
export type QuestionType = 'text' | 'number' | 'choice' | 'date';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: string[]; // For choice questions
}

export interface Template {
  id: string;
  title: string;
  description: string;
  created: Date;
  questions: Question[];
}

export interface Report {
  id: string;
  templateId: string;
  storeId: string;
  date: Date;
  answers: {
    questionId: string;
    value: string | number;
  }[];
  submitted: boolean;
}

export interface Store {
  id: string;
  name: string;
  location: string;
  manager: string;
}

export const mockStores: Store[] = [
  { id: '1', name: 'Downtown Store', location: 'New York, NY', manager: 'John Smith' },
  { id: '2', name: 'Westfield Mall', location: 'Los Angeles, CA', manager: 'Emily Johnson' },
  { id: '3', name: 'River Park', location: 'Chicago, IL', manager: 'Michael Brown' },
  { id: '4', name: 'Eastside Plaza', location: 'Miami, FL', manager: 'Sarah Davis' },
  { id: '5', name: 'Northern Heights', location: 'Seattle, WA', manager: 'Robert Wilson' },
];

export const mockTemplates: Template[] = [
  {
    id: '1',
    title: 'Daily Sales Report',
    description: 'End of day sales performance and customer feedback',
    created: new Date('2023-01-15'),
    questions: [
      { id: 'q1', text: 'What was the total sales amount today?', type: 'number', required: true },
      { id: 'q2', text: 'How many transactions were processed?', type: 'number', required: true },
      { id: 'q3', text: 'Were there any notable customer complaints?', type: 'text', required: false },
      { id: 'q4', text: 'What were the top-selling items?', type: 'text', required: true },
      { id: 'q5', text: 'Rate today\'s overall store performance', type: 'choice', required: true, options: ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'] },
    ]
  },
  {
    id: '2',
    title: 'Staff Performance',
    description: 'Evaluation of staff attendance and performance',
    created: new Date('2023-02-20'),
    questions: [
      { id: 'q1', text: 'How many staff members were present today?', type: 'number', required: true },
      { id: 'q2', text: 'Were there any staff absences?', type: 'choice', required: true, options: ['Yes', 'No'] },
      { id: 'q3', text: 'Who was the best performing employee today?', type: 'text', required: false },
      { id: 'q4', text: 'Any staff conflicts or issues to address?', type: 'text', required: false },
    ]
  },
];

export const mockReports: Report[] = [
  {
    id: 'r1',
    templateId: '1',
    storeId: '1',
    date: new Date('2023-04-10'),
    answers: [
      { questionId: 'q1', value: 8750 },
      { questionId: 'q2', value: 124 },
      { questionId: 'q3', value: 'One customer complained about the long checkout line during peak hours.' },
      { questionId: 'q4', value: 'Summer dresses, casual tops, and accessories.' },
      { questionId: 'q5', value: 'Good' },
    ],
    submitted: true
  },
  {
    id: 'r2',
    templateId: '1',
    storeId: '2',
    date: new Date('2023-04-10'),
    answers: [
      { questionId: 'q1', value: 12350 },
      { questionId: 'q2', value: 187 },
      { questionId: 'q3', value: 'No significant complaints today.' },
      { questionId: 'q4', value: 'Premium jeans, graphic tees, and sneakers.' },
      { questionId: 'q5', value: 'Excellent' },
    ],
    submitted: true
  },
];

export const mockSummary = {
  date: new Date('2023-04-10'),
  totalStores: 5,
  reportsSubmitted: 2,
  averageSales: 10550,
  topPerformingStore: 'Westfield Mall',
  keyTrends: [
    'Casual wear and summer items showing strong sales across stores',
    'Customer service satisfaction remains high',
    'Morning hours significantly outperforming afternoon hours',
    'Accessories and add-on items driving up average transaction value'
  ],
  recommendations: [
    'Consider extending morning staff hours to capitalize on peak traffic',
    'Implement cross-store inventory sharing to address stock issues',
    'Provide additional training on new product lines launching next week'
  ]
};

// Utility function to generate a unique ID
export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};
