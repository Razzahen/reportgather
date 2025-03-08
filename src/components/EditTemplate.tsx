
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Question, Template } from '@/types/supabase';
import { getTemplateWithQuestions, updateTemplate } from '@/services/templateService';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface QuestionInput {
  id: string;
  text: string;
  type: 'text' | 'number' | 'choice' | 'date';
  required: boolean;
  options: string[] | null;
  order_index: number;
}

export function EditTemplate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionInput[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { data: template, isLoading } = useQuery({
    queryKey: ['template', id],
    queryFn: () => id ? getTemplateWithQuestions(id) : null,
    enabled: !!id,
    onSuccess: (data) => {
      if (data) {
        setTitle(data.title);
        setDescription(data.description);
        
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions.map(q => ({
            id: q.id,
            text: q.text,
            type: q.type,
            required: q.required,
            options: q.options,
            order_index: q.order_index
          })));
        } else {
          // Default empty question if none exist
          setQuestions([{
            id: crypto.randomUUID(),
            text: '',
            type: 'text',
            required: true,
            options: null,
            order_index: 0
          }]);
        }
        
        setIsLoaded(true);
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Template ID is required');
      
      const templateData = {
        title,
        description
      };

      const questionsData = questions.map((q, index) => ({
        ...q,
        order_index: index
      }));

      return await updateTemplate(id, templateData, questionsData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', id] });
      toast.success("Template updated successfully!");
      navigate(`/templates/${id}`);
    },
    onError: (error: any) => {
      console.error('Error updating template:', error);
      toast.error(error.message || "Failed to update template. Please try again.");
    }
  });

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        text: '',
        type: 'text',
        required: true,
        options: null,
        order_index: questions.length
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
    
    if (field === 'type' && value !== 'choice') {
      newQuestions[index].options = null;
    }
    
    if (field === 'type' && value === 'choice' && (!newQuestions[index].options || newQuestions[index].options.length === 0)) {
      newQuestions[index].options = ['Option 1'];
    }
    
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options) {
      newQuestions[questionIndex].options[optionIndex] = value;
      setQuestions(newQuestions);
    }
  };

  const handleAddOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    if (!newQuestions[questionIndex].options) {
      newQuestions[questionIndex].options = [];
    }
    newQuestions[questionIndex].options.push(`Option ${newQuestions[questionIndex].options.length + 1}`);
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex];
    if (!question.options || question.options.length <= 1) {
      toast.error("You need at least one option for choice questions");
      return;
    }
    
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(newQuestions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      
      if (questions[i].type === 'choice' && (!questions[i].options || questions[i].options.length === 0)) {
        toast.error(`Question ${i + 1} needs at least one option`);
        return;
      }
    }
    
    updateMutation.mutate();
  };

  if (isLoading || !isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2"
            onClick={() => navigate(`/templates/${id}`)}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">Edit Template</h1>
          <p className="text-muted-foreground">
            Update your report template
          </p>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Save Changes
            </>
          )}
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
                    
                    {question.type === 'choice' && question.options && (
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
          
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EditTemplate;
