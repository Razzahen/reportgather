
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Clock, StoreIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Store, Report } from '@/types/supabase';

interface StoreCardProps {
  store: Store;
  storeReport?: Report;
}

export const StoreCard = ({ store, storeReport }: StoreCardProps) => {
  const navigate = useNavigate();
  const isSubmitted = !!storeReport;

  return (
    <Card 
      key={store.id} 
      className={`relative overflow-hidden transition-all hover:shadow-md cursor-pointer border-l-4 ${isSubmitted ? 'border-l-green-500' : 'border-l-amber-500'}`}
      onClick={() => navigate(`/reports/${store.id}`)}
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center">
              <StoreIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <h3 className="font-medium">{store.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{store.location}</p>
            <p className="text-xs flex items-center">
              Manager: {store.manager}
            </p>
          </div>
          
          <div className={`p-2 rounded-full ${isSubmitted ? 'bg-green-100' : 'bg-amber-100'}`}>
            {isSubmitted ? (
              <CheckSquare className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-amber-600" />
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <div className={`text-sm ${isSubmitted ? 'text-green-600' : 'text-amber-600'} font-medium`}>
            {isSubmitted ? 'Report Submitted' : 'Report Pending'}
          </div>
          
          {isSubmitted && storeReport && (
            <div className="text-xs text-muted-foreground mt-1">
              Submitted at {new Date(storeReport.submitted_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
