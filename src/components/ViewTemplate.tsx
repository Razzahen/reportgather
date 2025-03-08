
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, AlertCircle, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTemplateWithQuestions, deleteTemplate } from '@/services/templateService';
import { Template, Question } from '@/types/supabase';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogCancel, 
  AlertDialogAction
} from '@/components/ui/alert-dialog';

export function ViewTemplate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const { data: template, isLoading, error } = useQuery({
    queryKey: ['template', id],
    queryFn: () => id ? getTemplateWithQuestions(id) : null,
    enabled: !!id
  });
  
  const deleteMutation = useMutation({
    mutationFn: (templateId: string) => deleteTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template deleted successfully');
      navigate('/templates');
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  });
  
  const handleDelete = () => {
    if (id) {
      deleteMutation.mutate(id);
      setConfirmDelete(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !template) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h2 className="text-xl font-medium">Error Loading Template</h2>
        <p className="text-muted-foreground mt-2">
          This template could not be found or loaded.
        </p>
        <Button className="mt-6" onClick={() => navigate('/templates')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2"
            onClick={() => navigate('/templates')}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Templates
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">{template.title}</h1>
          <p className="text-muted-foreground">
            Created on {formatDate(template.created_at)}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/templates/edit/${template.id}`)}>
            <Edit size={16} className="mr-2" />
            Edit Template
          </Button>
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Template Description</CardTitle>
          <CardDescription>
            {template.description}
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div>
        <h2 className="text-xl font-medium mb-4 flex items-center">
          <ListChecks className="mr-2 h-5 w-5 text-primary" />
          Questions ({template.questions?.length || 0})
        </h2>
        
        {template.questions && template.questions.length > 0 ? (
          <div className="space-y-4">
            {template.questions
              .sort((a, b) => a.order_index - b.order_index)
              .map((question, index) => (
                <Card key={question.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{question.text}</h3>
                          {question.required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                        </div>
                        
                        <div className="mt-2">
                          <Badge className="capitalize">{question.type}</Badge>
                          
                          {question.type === 'choice' && question.options && (
                            <div className="mt-3 pl-4 border-l-2 border-muted space-y-1">
                              <p className="text-sm text-muted-foreground mb-1">Options:</p>
                              {question.options.map((option, i) => (
                                <div key={i} className="text-sm pl-2">{option}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No questions found for this template.
            </CardContent>
          </Card>
        )}
      </div>
      
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the template and all its questions.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ViewTemplate;
