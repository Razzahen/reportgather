
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckIcon, Filter, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Store } from "@/types/supabase";
import { StoreFilter } from "@/types/chat";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface SummaryFiltersProps {
  stores: Store[];
  filter: StoreFilter;
  onFilterChange: (filter: StoreFilter) => void;
  onApplyFilters: () => void;
}

export function SummaryFilters({ stores, filter, onFilterChange, onApplyFilters }: SummaryFiltersProps) {
  const [dateOpen, setDateOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  
  const handleStoreSelection = (storeId: string) => {
    const isAll = storeId === 'all';
    
    // If "All Stores" is selected or it's already the only store selected
    if (isAll) {
      onFilterChange({
        ...filter,
        storeIds: 'all'
      });
      return;
    }
    
    // If coming from "all" to individual selection
    if (filter.storeIds === 'all') {
      onFilterChange({
        ...filter,
        storeIds: [storeId]
      });
      return;
    }
    
    // Toggle individual store selection
    const storeIds = filter.storeIds as string[];
    const newStoreIds = storeIds.includes(storeId)
      ? storeIds.filter(id => id !== storeId)
      : [...storeIds, storeId];
    
    // If none selected, default to all
    if (newStoreIds.length === 0) {
      onFilterChange({
        ...filter,
        storeIds: 'all'
      });
      return;
    }
    
    // If all selected individually, switch to 'all'
    if (newStoreIds.length === stores.length) {
      onFilterChange({
        ...filter,
        storeIds: 'all'
      });
      return;
    }
    
    onFilterChange({
      ...filter,
      storeIds: newStoreIds
    });
  };
  
  // Get count of selected stores
  const selectedStoreCount = filter.storeIds === 'all' 
    ? stores.length 
    : filter.storeIds.length;
  
  return (
    <Card className="mb-6">
      <CardContent className="p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
          {/* Store Selection */}
          <div className="flex-1 min-w-[180px]">
            <Popover open={storeOpen} onOpenChange={setStoreOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left font-normal"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  <span className="truncate">
                    {filter.storeIds === 'all' 
                      ? 'All Stores' 
                      : `${selectedStoreCount} Store${selectedStoreCount !== 1 ? 's' : ''}`
                    }
                  </span>
                  {selectedStoreCount > 0 && (
                    <Badge className="ml-auto">{selectedStoreCount}</Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0" align="start">
                <ScrollArea className="h-[300px]">
                  <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="all-stores" 
                        checked={filter.storeIds === 'all'}
                        onCheckedChange={() => handleStoreSelection('all')}
                      />
                      <Label htmlFor="all-stores" className="cursor-pointer">All Stores</Label>
                    </div>
                    <div className="border-t my-2" />
                    {stores.map(store => (
                      <div key={store.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`store-${store.id}`} 
                          checked={
                            filter.storeIds === 'all' || 
                            (Array.isArray(filter.storeIds) && filter.storeIds.includes(store.id))
                          }
                          onCheckedChange={() => handleStoreSelection(store.id)}
                        />
                        <Label htmlFor={`store-${store.id}`} className="cursor-pointer">{store.name}</Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Date Range Picker */}
          <div className="flex-1 min-w-[180px]">
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filter.dateRange.from && filter.dateRange.to ? (
                    <>
                      {format(filter.dateRange.from, "MMM d, yyyy")}
                      {!isSameDay(filter.dateRange.from, filter.dateRange.to) && (
                        <> - {format(filter.dateRange.to, "MMM d, yyyy")}</>
                      )}
                    </>
                  ) : (
                    <span>Select date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: filter.dateRange.from,
                    to: filter.dateRange.to,
                  }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      onFilterChange({
                        ...filter,
                        dateRange: {
                          from: range.from,
                          to: range.to,
                        },
                      });
                    }
                  }}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Apply Filters Button */}
          <div>
            <Button 
              variant="default" 
              onClick={onApplyFilters}
              className="w-full sm:w-auto"
            >
              <CheckIcon className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to check if dates are the same day
function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export default SummaryFilters;
