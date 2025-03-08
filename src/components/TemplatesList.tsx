
import { useState } from 'react';
import { Plus, FileText, Edit, Trash2, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { Template } from '@/types/supabase';
import { getTemplates, deleteTemplate } from '@/services/templateService';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function TemplatesList() {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  
  // Fetch templates from Supabase
  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates
  });
  
  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success("Template deleted successfully");
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast.error("Failed to delete template");
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter templates based on search query
  const filteredTemplates = templates.filter(template => 
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">Error loading templates. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button asChild>
          <Link to="/templates/create">
            <Plus size={16} className="mr-2" />
            Create Template
          </Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <FileText size={64} className="text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-xl font-medium">No templates found</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery ? "Try a different search term" : "Create your first template to get started"}
          </p>
          {!searchQuery && (
            <Button className="mt-6" asChild>
              <Link to="/templates/create">
                <Plus size={16} className="mr-2" />
                Create Template
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{template.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar size={14} className="mr-1" />
                      <span>Created {formatDate(template.created_at)}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="sr-only">Open menu</span>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                          <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/templates/edit/${template.id}`} className="flex items-center">
                          <Edit size={14} className="mr-2" />
                          Edit Template
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive" 
                        onClick={() => handleDelete(template.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={14} className="mr-2" />
                        {deleteMutation.isPending && deleteMutation.variables === template.id 
                          ? "Deleting..." 
                          : "Delete Template"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-muted-foreground mt-3 text-sm line-clamp-2">
                  {template.description}
                </p>
              </CardContent>
              <CardFooter className="bg-muted/50 px-6 py-3 flex justify-between items-center">
                <div className="text-sm">
                  <span className="font-medium">
                    {/* Use the questions array length from the nested selection */}
                    {template.questions ? template.questions.length : 0}
                  </span> questions
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/templates/${template.id}`}>
                    View Details
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default TemplatesList;
