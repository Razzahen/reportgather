
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Report, Template } from '@/types/supabase';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, User, CheckSquare, Clock } from 'lucide-react';
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

interface StoreCardProps {
  store: Store;
  storeReport?: Report;
}

export const StoreCard = ({ store, storeReport }: StoreCardProps) => {
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Fetch templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates
  });
  
  const handleCreateReport = () => {
    if (templates.length === 0) {
      toast.error("No templates available. Please create a template first.");
      return;
    }
    setShowTemplateDialog(true);
  };
  
  const handleTemplateSelect = () => {
    if (!selectedTemplate) {
      toast.error("Please select a template to continue");
      return;
    }
    
    // Navigate to report creation page with store ID and template ID
    navigate(`/reports/${store.id}?templateId=${selectedTemplate}`);
    setShowTemplateDialog(false);
  };
  
  const handleViewReport = () => {
    if (storeReport) {
      navigate(`/reports/edit/${storeReport.id}`);
    }
  };
  
  return (
    <>
      <Card className="h-full">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg">{store.name}</h3>
              {storeReport ? (
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
              <MapPin size={14} className="mr-2 text-muted-foreground" />
              <span>{store.location}</span>
            </div>
            <div className="flex items-center text-sm">
              <User size={14} className="mr-2 text-muted-foreground" />
              <span>Manager: {store.manager}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          {storeReport ? (
            <Button 
              variant="default" 
              className="w-full"
              onClick={handleViewReport}
            >
              View Report
            </Button>
          ) : (
            <Button 
              variant="default" 
              className="w-full" 
              onClick={handleCreateReport}
            >
              Create Report
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Template Selection Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Template</DialogTitle>
            <DialogDescription>
              Choose a template for creating a report for {store.name}
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
              disabled={!selectedTemplate || isLoadingTemplates}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
