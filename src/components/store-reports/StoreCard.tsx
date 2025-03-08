
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Store as StoreType, Report, Template } from '@/types/supabase';
import { assignTemplateToStore } from '@/services/storeService';

interface StoreCardProps {
  store: StoreType;
  storeReport?: Report;
  template?: Template;
  onTemplateAssigned: () => void;
  templates?: Template[];
  isLoadingTemplates?: boolean;
}

export function StoreCard({ 
  store, 
  storeReport, 
  template,
  onTemplateAssigned,
  templates = [], 
  isLoadingTemplates = false
}: StoreCardProps) {
  const navigate = useNavigate();
  const [assigning, setAssigning] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(
    template?.id
  );

  const handleAssignTemplate = async () => {
    if (!selectedTemplateId) {
      toast.error('Please select a template first');
      return;
    }

    setAssigning(true);
    try {
      await assignTemplateToStore(store.id, selectedTemplateId);
      toast.success('Template assigned successfully');
      onTemplateAssigned();
    } catch (error) {
      console.error('Error assigning template:', error);
      toast.error('Failed to assign template');
    } finally {
      setAssigning(false);
    }
  };

  const handleNavigateToForm = () => {
    if (storeReport) {
      navigate(`/reports/edit/${storeReport.id}`);
    } else {
      navigate(`/reports/${store.id}${selectedTemplateId ? `?templateId=${selectedTemplateId}` : ''}`);
    }
  };

  const isCompleted = storeReport?.completed === true;
  const todayFormatted = new Date().toISOString().split('T')[0];
  const reportDateFormatted = storeReport?.submitted_at ? new Date(storeReport.submitted_at).toISOString().split('T')[0] : null;
  const isCompletedToday = isCompleted && reportDateFormatted === todayFormatted;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <div className="truncate mr-2">{store.name}</div>
          <Badge variant={storeReport?.completed ? "success" : "secondary"} className="whitespace-nowrap shrink-0">
            {storeReport?.completed ? (
              <><CheckCircle className="mr-1 h-3 w-3" /> Completed</>
            ) : (
              <><AlertCircle className="mr-1 h-3 w-3" /> Pending</>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow pb-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Store className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{store.location}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">Manager: {store.manager}</span>
        </div>
        
        {isLoadingTemplates ? (
          <Skeleton className="h-9 w-full mt-2" />
        ) : (
          <Select
            value={selectedTemplateId}
            onValueChange={setSelectedTemplateId}
            disabled={assigning}
          >
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="Select template" className="truncate" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id} className="truncate">
                  {template.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-0">
        {template ? (
          <Button 
            variant="outline"
            className="w-full text-sm"
            onClick={handleAssignTemplate}
            disabled={assigning || !selectedTemplateId}
          >
            {assigning ? 'Assigning...' : 'Change Template'}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full text-sm"
            onClick={handleAssignTemplate}
            disabled={assigning || !selectedTemplateId}
          >
            {assigning ? 'Assigning...' : 'Assign Template'}
          </Button>
        )}
        
        <Button 
          className="w-full text-sm"
          onClick={handleNavigateToForm}
          disabled={!template || isCompletedToday}
          title={isCompletedToday ? "Report already completed for today" : ""}
        >
          {isCompletedToday ? "Completed Today" : "Complete Form"}
        </Button>
      </CardFooter>
    </Card>
  );
}
