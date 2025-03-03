
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { generateId, QuestionType } from '@/utils/mockData';
import { toast } from 'sonner';

interface QuestionInput {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options: string[];
}

export function CreateTemplate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionInput[]>([
    {
      id: generateId(),
      text: '',
      type: 'text',
      required: true,
      options: []
    }
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: generateId(),
        text: '',
        type: 'text',
        required: true,
        options: []
      }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length === 1) {
      toast.error("You need at least one question");
      return;
    }
    
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index: number, field: keyof QuestionInput, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    
    // Reset options if type is changed from choice
    if (field === 'type' && value !== 'choice') {
      newQuestions[index].options = [];
    }
    
    // Add a default option if type is changed to choice
    if (field === 'type' && value === 'choice' && newQuestions[index].options.length === 0) {
      newQuestions[index].options = ['Option 1'];
    }
    
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleAddOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push(`Option ${newQuestions[questionIndex].options.length + 1}`);
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    if (questions[questionIndex].options.length === 1) {
      toast.error("You need at least one option for choice questions");
      return;
    }
    
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(newQuestions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim()) {
      toast.error("Please enter a template title");
      return;
    }
    
    if (!description.trim()) {
      toast.error("Please enter a template description");
      return;
    }
    
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) {
        toast.error(`Question ${i + 1} cannot be empty`);
        return;
      }
      
      if (questions[i].type === 'choice' && questions[i].options.length === 0) {
        toast.error(`Question ${i + 1} needs at least one option`);
        return;
      }
    }
    
    // Submit the template
    toast.success("Template created successfully!");
    navigate('/templates');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">Create Template</h1>
          <p className="text-muted-foreground">
            Design a new report template for your stores
          </p>
        </div>
        <Button onClick={handleSubmit}>
          <Save size={16} className="mr-2" />
          Save Template
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="title">Template Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Daily Sales Report"
                  className="w-full"
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the purpose of this report template"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Questions</h2>
            <Button type="button" onClick={handleAddQuestion} size="sm">
              <Plus size={16} className="mr-2" />
              Add Question
            </Button>
          </div>
          
          {questions.map((question, index) => (
            <Card key={question.id} className="relative overflow-hidden transition-all hover:shadow-md">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary/40"></div>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-grow space-y-4">
                    <div className="flex gap-2 items-start">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0 mt-1">
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <Input
                          value={question.text}
                          onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                          placeholder="Enter question text"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Question Type</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value) => handleQuestionChange(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text Input</SelectItem>
                            <SelectItem value="number">Number Input</SelectItem>
                            <SelectItem value="choice">Multiple Choice</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`required-${question.id}`}
                          checked={question.required}
                          onCheckedChange={(checked) => handleQuestionChange(index, 'required', checked)}
                        />
                        <Label htmlFor={`required-${question.id}`}>Required</Label>
                      </div>
                    </div>
                    
                    {question.type === 'choice' && (
                      <div className="space-y-3 pt-2">
                        <Label>Answer Options</Label>
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <Input
                              value={option}
                              onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveOption(index, optionIndex)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddOption(index)}
                        >
                          <Plus size={14} className="mr-2" />
                          Add Option
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveQuestion(index)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="flex justify-center pt-4">
            <Button type="submit" className="w-full max-w-md">
              <ClipboardCheck size={16} className="mr-2" />
              Create Template
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateTemplate;
