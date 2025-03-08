import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Save, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getTemplateById } from '@/services/templateService';
import { getStore } from '@/services/storeService';
import { getReportById, createReport, updateReport } from '@/services/reportService';
import { toast } from 'sonner';
import { Question, Report, ReportAnswer } from '@/types/supabase';

const ReportForm: React.FC = () => {
  const { storeId = '', reportId = '' } = useParams<{ storeId: string; reportId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const queryParams = new URLSearchParams(location.search);
  const templateIdFromUrl = queryParams.get('templateId');
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(templateIdFromUrl);
  
  const { data: store, isLoading: isLoadingStore } = useQuery({
    queryKey: ['store', storeId],
    queryFn: () => getStore(storeId),
    enabled: !!storeId,
  });

  const { data: existingReport, isLoading: isLoadingReport } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => getReportById(reportId),
    enabled: !!reportId,
  });

  useEffect(() => {
    if (existingReport) {
      const answerMap: Record<string, any> = {};
      existingReport.answers?.forEach(answer => {
        answerMap[answer.question_id] = answer.value;
      });
      setAnswers(answerMap);
      
      if (existingReport.template_id) {
        setSelectedTemplate(existingReport.template_id);
      }
    }
  }, [existingReport]);

  const { data: template, isLoading: isLoadingTemplate } = useQuery({
    queryKey: ['template', selectedTemplate],
    queryFn: () => selectedTemplate ? getTemplateById(selectedTemplate) : null,
    enabled: !!selectedTemplate
  });

  useEffect(() => {
    if (existingReport?.template_id && !selectedTemplate) {
      setSelectedTemplate(existingReport.template_id);
    }
  }, [existingReport, selectedTemplate]);

  useEffect(() => {
    if (!isLoadingReport && !isLoadingStore && !reportId && !selectedTemplate) {
      toast.error("No template selected. Please select a template first.");
      navigate('/reports');
    }
  }, [isLoadingReport, isLoadingStore, reportId, selectedTemplate, navigate]);

  const sortedQuestions = template?.questions?.sort((a, b) => 
    (a.order_index || 0) - (b.order_index || 0)
  ) || [];

  const createReportMutation = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      
      if (!selectedTemplate || !storeId || !template || !store) {
        throw new Error('Missing required information to submit report');
      }
      
      const reportAnswers: Omit<ReportAnswer, 'id' | 'report_id' | 'created_at' | 'updated_at'>[] = 
        Object.entries(answers).map(([questionId, value]) => ({
          question_id: questionId,
          value
        }));
      
      const newReport: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'user_id'> = {
        template_id: selectedTemplate,
        store_id: storeId,
        submitted_at: new Date().toISOString(),
        completed: true
      };
      
      return createReport(newReport, reportAnswers);
    },
    onSuccess: () => {
      toast.success('Report submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      navigate('/reports');
    },
    onError: (error: any) => {
      toast.error(`Error submitting report: ${error.message}`);
      console.error('Error submitting report:', error);
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const updateReportMutation = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      
      if (!reportId || !template) {
        throw new Error('Missing required information to update report');
      }
      
      const reportAnswers: Omit<ReportAnswer, 'report_id' | 'created_at' | 'updated_at'>[] = 
        Object.entries(answers).map(([questionId, value]) => ({
          question_id: questionId,
          value,
          id: existingReport?.answers?.find(a => a.question_id === questionId)?.id
        }));
      
      const updatedReport: Partial<Omit<Report, 'id' | 'created_at' | 'updated_at' | 'user_id'>> = {
        submitted_at: new Date().toISOString(),
        completed: true
      };
      
      return updateReport(reportId, updatedReport, reportAnswers);
    },
    onSuccess: () => {
      toast.success('Report updated successfully');
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      navigate('/reports');
    },
    onError: (error: any) => {
      toast.error(`Error updating report: ${error.message}`);
      console.error('Error updating report:', error);
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < sortedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const unansweredRequired = sortedQuestions
      .filter(q => q.required)
      .filter(q => !answers[q.id]);
    
    if (unansweredRequired.length > 0) {
      toast.error(`Please answer all required questions before submitting`);
      return;
    }
    
    if (existingReport) {
      updateReportMutation.mutate();
    } else {
      createReportMutation.mutate();
    }
  };

  const handleSelectQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  if (isLoadingStore || isLoadingReport || (selectedTemplate && isLoadingTemplate)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading report form...</span>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Store not found</h2>
        <p className="text-muted-foreground mt-2">The store you're looking for doesn't exist</p>
        <Button className="mt-4" onClick={() => navigate('/reports')}>
          Back to Reports
        </Button>
      </div>
    );
  }

  if (!template && selectedTemplate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Template not found</h2>
        <p className="text-muted-foreground mt-2">The template for this report couldn't be loaded</p>
        <Button className="mt-4" onClick={() => navigate('/reports')}>
          Back to Reports
        </Button>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">No template selected</h2>
        <p className="text-muted-foreground mt-2">Please select a template to create a report</p>
        <Button className="mt-4" onClick={() => navigate('/reports')}>
          Back to Reports
        </Button>
      </div>
    );
  }

  const renderQuestionInput = (question: Question) => {
    const value = answers[question.id] || '';
    
    switch (question.type) {
      case 'text':
        return (
          <Textarea
            id={question.id}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Type your answer here..."
            className="w-full"
          />
        );
      
      case 'number':
        return (
          <Input
            id={question.id}
            type="number"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, parseFloat(e.target.value))}
            placeholder="Enter a number..."
            className="w-full"
          />
        );
      
      case 'choice':
        return (
          <div className="flex flex-col space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-accent">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={() => handleAnswerChange(question.id, option)}
                  className="w-4 h-4 text-primary"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'date':
        return (
          <Input
            id={question.id}
            type="date"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full"
          />
        );
      
      default:
        return (
          <Input
            id={question.id}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Type your answer here..."
            className="w-full"
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{existingReport ? 'Edit Report' : 'New Report'}</h1>
        <p className="text-muted-foreground">
          {store.name} • {template.title}
        </p>
      </div>
      
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{template.title}</span>
            <div className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {sortedQuestions.length}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {currentQuestionIndex > 0 && (
            <ScrollArea className="h-[250px] pr-4 border p-4 rounded-md">
              <AnimatePresence>
                {sortedQuestions.slice(0, currentQuestionIndex).map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-b pb-4 mb-4 last:border-0"
                    onClick={() => handleSelectQuestion(index)}
                  >
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mr-2">
                            {index + 1}
                          </div>
                          <Label className="font-medium cursor-pointer hover:text-primary">
                            {question.text}
                            {question.required && <span className="text-destructive ml-1">*</span>}
                          </Label>
                        </div>
                        <div className="pl-7">
                          {answers[question.id] ? (
                            <div className="text-sm italic text-muted-foreground">
                              {typeof answers[question.id] === 'string' ? answers[question.id] : JSON.stringify(answers[question.id])}
                            </div>
                          ) : (
                            <div className="text-sm italic text-destructive">No answer provided</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>
          )}
          
          <AnimatePresence mode="wait">
            {sortedQuestions.length > 0 && (
              <motion.div
                key={sortedQuestions[currentQuestionIndex]?.id || 'empty'}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor={sortedQuestions[currentQuestionIndex]?.id} className="text-lg font-medium">
                    {sortedQuestions[currentQuestionIndex]?.text}
                    {sortedQuestions[currentQuestionIndex]?.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <div className="mt-2">
                    {renderQuestionInput(sortedQuestions[currentQuestionIndex])}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={sortedQuestions[currentQuestionIndex]?.required && !answers[sortedQuestions[currentQuestionIndex]?.id]}
          >
            {currentQuestionIndex < sortedQuestions.length - 1 ? (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Submit
                <Save className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ReportForm;
