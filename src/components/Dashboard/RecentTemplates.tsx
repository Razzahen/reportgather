
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getTemplates } from '@/services/templateService';
import { Skeleton } from '@/components/ui/skeleton';

export function RecentTemplates() {
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString));
  };
  
  return (
    <Card className="lg:col-span-1 transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Templates</span>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/templates/create">
              <Plus size={16} />
            </Link>
          </Button>
        </CardTitle>
        <CardDescription>Recently created report templates</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-md bg-accent/50">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="w-full">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/4 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : templates.length > 0 ? (
          <ul className="space-y-3">
            {templates.slice(0, 3).map((template) => (
              <li key={template.id} className="flex items-start space-x-3 p-3 rounded-md bg-accent/50">
                <ClipboardList className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <h4 className="font-medium">{template.title}</h4>
                  <p className="text-xs text-muted-foreground">{formatDate(template.created_at)}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{template.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {template.questions ? template.questions.length : 0} questions
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No templates created yet</p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link to="/templates/create">Create your first template</Link>
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to="/templates">View All Templates</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default RecentTemplates;
