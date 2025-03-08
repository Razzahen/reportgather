
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Report, Template } from '@/types/supabase';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, User, CheckSquare, Clock, ClipboardList, FormInput, FileText } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useQuery } from '@tanstack/react-query';
import { getTemplates } from '@/services/templateService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { assignTemplateToStore } from '@/services/storeService';

interface StoreCardProps {
  store: Store;
  storeReport?: Report;
  template?: Template;
  onTemplateAssigned?: () => void;
}

export const StoreCard = ({ store, storeReport, template, onTemplateAssigned }: StoreCardProps) => {
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSubmitted = storeReport?.completed || false;
  
  // Fetch templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates
  });
  
  const handleAssignTemplate = () => {
    if (templates.length === 0) {
      toast.error("No templates available. Please create a template first.");
      return;
    }
    if (template) {
      setSelectedTemplate(template.id);
    }
    setShowTemplateDialog(true);
  };
  
  const handleCompleteForm = () => {
    if (isSubmitted) {
      // Navigate to view the existing report
      navigate(`/reports/edit/${storeReport?.id}`);
    } else if (storeReport && template) {
      // Navigate to create a new report with the assigned template
      navigate(`/reports/edit/${storeReport.id}`);
    } else if (template) {
      // Navigate to create a new report with the assigned template
      navigate(`/reports/${store.id}?templateId=${template.id}`);
    } else {
      toast.error("This store has no template assigned. Please assign a template first.");
    }
  };
  
  const handleTemplateSelect = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template to continue");
      return;
    }
    
    try {
      setIsAssigning(true);
      // Call the service to assign the template to the store
      await assignTemplateToStore(store.id, selectedTemplate);
      
      toast.success(`Template assigned to ${store.name}`);
      
      // Call the callback to refresh data if provided
      if (onTemplateAssigned) {
        onTemplateAssigned();
      }
      
      setShowTemplateDialog(false);
    } catch (error) {
      console.error('Error assigning template:', error);
      toast.error("Failed to assign template. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };
  
  return (
    <>
      <Card className="h-full flex flex-col">
        <CardContent className="pt-6 flex-grow">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg truncate">{store.name}</h3>
              {isSubmitted ? (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                  <CheckSquare className="h-3 w-3 mr-1" />
                  Complete
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </span>
              )}
            </div>
            <div className="flex items-center text-sm">
              <MapPin size={14} className="mr-2 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{store.location}</span>
            </div>
            <div className="flex items-center text-sm">
              <User size={14} className="mr-2 text-muted-foreground flex-shrink-0" />
              <span className="truncate">Manager: {store.manager}</span>
            </div>
            {template && (
              <div className="flex items-center text-sm">
                <FileText size={14} className="mr-2 text-muted-foreground flex-shrink-0" />
                <span className="truncate">Template: {template.title}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex flex-wrap gap-2">
          {/* Template button - different text based on whether a template is already assigned */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAssignTemplate}
            className="flex-1 min-w-[120px]"
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            {template ? "Change Template" : "Assign Template"}
          </Button>
          
          <Button 
            variant={isSubmitted ? "secondary" : "default"}
            size="sm" 
            onClick={handleCompleteForm}
            className="flex-1 min-w-[120px]"
            disabled={!template}
          >
            <FormInput className="h-4 w-4 mr-2" />
            {isSubmitted ? "View Report" : "Complete Form"}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Template Selection Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Template to Store</DialogTitle>
            <DialogDescription>
              Select a report template to assign to {store.name}
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingTemplates ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No templates available. Please create a template first.
            </div>
          ) : (
            <RadioGroup value={selectedTemplate || ''} onValueChange={setSelectedTemplate}>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {templates.map(template => (
                  <div 
                    key={template.id} 
                    className="flex items-start space-x-2 p-3 rounded-md border cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
                    <div className="flex-1">
                      <Label 
                        htmlFor={template.id} 
                        className="font-medium cursor-pointer"
                      >
                        {template.title}
                      </Label>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {template.questions?.length || 0} questions
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleTemplateSelect} 
              disabled={!selectedTemplate || isLoadingTemplates || isAssigning}
            >
              {isAssigning ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-0 border-white rounded-full" />
                  Assigning...
                </>
              ) : (
                <>
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Assign Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
