
import React from 'react';
import { Filter, Search, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface StoreFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: 'all' | 'pending' | 'completed';
  setStatusFilter: (value: 'all' | 'pending' | 'completed') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
}

export const StoreFilter = ({ 
  searchTerm, 
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortOrder,
  setSortOrder
}: StoreFilterProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
      <div className="relative w-full md:w-auto md:flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search stores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <Select 
          value={statusFilter} 
          onValueChange={(value: any) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            <SelectItem value="completed">Completed Reports</SelectItem>
            <SelectItem value="pending">Pending Reports</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          className="w-full sm:w-auto" 
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
        </Button>
      </div>
    </div>
  );
};
