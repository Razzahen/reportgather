
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Clock, FileText, StoreIcon } from 'lucide-react';
import { Store, Report, Template } from '@/types/supabase';

interface StoreRowProps {
  store: Store;
  storeReport?: Report;
  template?: Template;
}

export const StoreRow = ({ store, storeReport, template }: StoreRowProps) => {
  const navigate = useNavigate();
  const isSubmitted = !!storeReport;
  
  return (
    <div 
      className="grid grid-cols-12 items-center border-b px-4 py-3 hover:bg-muted/20 cursor-pointer"
      onClick={() => navigate(`/reports/${store.id}`)}
    >
      <div className="col-span-5 flex items-center">
        <StoreIcon className="h-4 w-4 mr-2 text-muted-foreground" />
        <div>
          <div className="font-medium">{store.name}</div>
          <div className="text-xs text-muted-foreground">{store.location}</div>
        </div>
      </div>
      <div className="col-span-3 text-sm">{store.manager}</div>
      <div className="col-span-2 text-sm flex items-center">
        <FileText className="h-4 w-4 mr-2 text-primary/60" />
        {template ? template.title : 'N/A'}
      </div>
      <div className="col-span-2 text-right">
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
    </div>
  );
};
