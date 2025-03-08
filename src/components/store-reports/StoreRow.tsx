
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Clock, FileText, StoreIcon, ClipboardList, FormInput } from 'lucide-react';
import { Store, Report, Template } from '@/types/supabase';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useQuery } from '@tanstack/react-query';
import { getTemplates } from '@/services/templateService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { assignTemplateToStore } from '@/services/storeService';

interface StoreRowProps {
  store: Store;
  storeReport?: Report;
  template?: Template;
  onTemplateAssigned?: () => void;
}

export const StoreRow = ({ store, storeReport, template, onTemplateAssigned }: StoreRowProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSubmitted = storeReport?.completed || false;
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  
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
    // Show template selection dialog
    setShowTemplateDialog(true);
  };
  
  const handleCompleteForm = () => {
    if (isSubmitted) {
      // Navigate to view the existing report
      navigate(`/reports/edit/${storeReport?.id}`);
    } else if (storeReport && template) {
      // Navigate to edit existing report
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
      toast.error("Failed to assign template");
    } finally {
      setIsAssigning(false);
    }
  };
  
  return (
    <>
      <div className="grid grid-cols-12 items-center border-b px-4 py-3 hover:bg-muted/20">
        <div className="col-span-12 md:col-span-4 flex items-center">
          <StoreIcon className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0"> {/* This ensures proper text truncation */}
            <div className="font-medium truncate">{store.name}</div>
            <div className="text-xs text-muted-foreground truncate">{store.location}</div>
          </div>
        </div>
        <div className="col-span-6 md:col-span-2 text-sm truncate mt-2 md:mt-0">{store.manager}</div>
        <div className="col-span-6 md:col-span-2 text-sm flex items-center mt-2 md:mt-0">
          <FileText className="h-4 w-4 mr-2 text-primary/60 flex-shrink-0" />
          <span className="truncate">{template ? template.title : 'Not assigned'}</span>
        </div>
        <div className="col-span-6 md:col-span-2 mt-2 md:mt-0">
          {isSubmitted ? (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
              <CheckSquare className="h-3 w-3 mr-1" />
              Completed
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </span>
          )}
        </div>
        <div className="col-span-6 md:col-span-2 flex justify-end gap-2 mt-2 md:mt-0">
          {/* Template button - different text based on whether a template is already assigned */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAssignTemplate}
            className="flex items-center gap-1"
          >
            <ClipboardList className="h-3 w-3" />
            <span className="hidden sm:inline">{template ? "Change" : "Assign"}</span>
          </Button>
          
          <Button 
            variant={isSubmitted ? "secondary" : "default"}
            size="sm" 
            onClick={handleCompleteForm}
            className="flex items-center gap-1"
            disabled={!template}
          >
            <FormInput className="h-3 w-3" />
            <span className="hidden sm:inline">{isSubmitted ? "View" : "Complete"}</span>
          </Button>
        </div>
      </div>
      
      {/* Template Assignment Dialog */}
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
                    <RadioGroupItem value={template.id} id={`template-${template.id}`} className="mt-1" />
                    <div className="flex-1 min-w-0"> {/* Ensures text truncation */}
                      <Label 
                        htmlFor={`template-${template.id}`} 
                        className="font-medium cursor-pointer"
                      >
                        {template.title}
                      </Label>
                      <p className="text-sm text-muted-foreground truncate">{template.description}</p>
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
