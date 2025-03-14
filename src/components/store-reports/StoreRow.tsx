
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Store, Report, Template } from '@/types/supabase';
import { assignTemplateToStore } from '@/services/storeService';

interface StoreRowProps {
  store: Store;
  storeReport?: Report;
  template?: Template;
  onTemplateAssigned: () => void;
  templates?: Template[];
  isLoadingTemplates?: boolean;
}

export function StoreRow({ 
  store, 
  storeReport, 
  template, 
  onTemplateAssigned,
  templates = [],
  isLoadingTemplates = false
}: StoreRowProps) {
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
    <div className="grid grid-cols-12 border-b px-4 py-4 items-center">
      <div className="col-span-12 md:col-span-4 mb-2 md:mb-0">
        <div className="flex flex-col">
          <div className="font-medium truncate-text">{store.name}</div>
          <div className="text-sm text-muted-foreground truncate-text">{store.location}</div>
        </div>
      </div>
      
      <div className="hidden md:block md:col-span-2 truncate-text">
        {store.manager}
      </div>
      
      <div className="col-span-7 md:col-span-2 flex items-center">
        {isLoadingTemplates ? (
          <Skeleton className="h-8 w-full" />
        ) : (
          <Select
            value={selectedTemplateId}
            onValueChange={setSelectedTemplateId}
            disabled={assigning}
          >
            <SelectTrigger className="w-[140px] md:w-full h-9 text-xs md:text-sm">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id} className="truncate-text">
                  {template.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div className="hidden md:flex md:col-span-2 items-center">
        <Badge variant={storeReport?.completed ? "success" : "secondary"} className="whitespace-nowrap">
          {storeReport?.completed ? (
            <><CheckCircle className="mr-1 h-3 w-3" /> Completed</>
          ) : (
            <><AlertCircle className="mr-1 h-3 w-3" /> Pending</>
          )}
        </Badge>
      </div>
      
      <div className="col-span-5 md:col-span-2 flex justify-end gap-2 items-center">
        {template ? (
          <Button 
            size="sm"
            variant="outline"
            className="text-xs whitespace-nowrap"
            onClick={handleAssignTemplate}
            disabled={assigning || !selectedTemplateId}
          >
            {assigning ? 'Assigning...' : 'Change'}
          </Button>
        ) : (
          <Button 
            size="sm"
            variant="outline" 
            className="text-xs whitespace-nowrap"
            onClick={handleAssignTemplate}
            disabled={assigning || !selectedTemplateId}
          >
            {assigning ? 'Assigning...' : 'Assign'}
          </Button>
        )}
        
        <Button 
          size="sm" 
          className="text-xs whitespace-nowrap"
          onClick={handleNavigateToForm}
          disabled={!template || isCompletedToday}
          title={isCompletedToday ? "Report already completed for today" : ""}
        >
          {isCompletedToday ? "Done" : "Complete"}
        </Button>
      </div>
    </div>
  );
}
