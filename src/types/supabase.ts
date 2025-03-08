
export interface Store {
  id: string;
  name: string;
  location: string;
  manager: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  questions?: Question[];
}

export interface Question {
  id: string;
  template_id: string;
  text: string;
  type: 'text' | 'number' | 'choice' | 'date';
  required: boolean;
  options: string[] | null;
  order_index: number;
  created_at: string;
}

export interface Report {
  id: string;
  template_id: string;
  store_id: string;
  submitted_at: string;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  answers?: ReportAnswer[];
  store?: Store;
  template?: Template;
}

export interface ReportAnswer {
  id: string;
  report_id: string;
  question_id: string;
  value: any;
  created_at: string;
  updated_at: string;
  question?: Question;
}
