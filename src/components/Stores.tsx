import { useState } from 'react';
import { Plus, Store as StoreIcon, Search, MapPin, User, Edit, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Store, Template } from '@/types/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStores, createStore, updateStore, deleteStore } from '@/services/storeService';
import { getTemplates } from '@/services/templateService';
import { toast } from 'sonner';

export function Stores() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [isEditStoreOpen, setIsEditStoreOpen] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', location: '', manager: '' });
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [storeForReport, setStoreForReport] = useState<Store | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Fetch stores
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: getStores
  });
  
  // Fetch templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates
  });
  
  // Create store mutation
  const createMutation = useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast.success("Store created successfully");
      setIsAddStoreOpen(false);
      setNewStore({ name: '', location: '', manager: '' });
    },
    onError: (error) => {
      console.error('Error creating store:', error);
      toast.error("Failed to create store");
    }
  });
  
  // Update store mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, store }: { id: string; store: Partial<Store> }) => 
      updateStore(id, store),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast.success("Store updated successfully");
      setIsEditStoreOpen(false);
      setSelectedStore(null);
    },
    onError: (error) => {
      console.error('Error updating store:', error);
      toast.error("Failed to update store");
    }
  });
  
  // Delete store mutation
  const deleteMutation = useMutation({
    mutationFn: deleteStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast.success("Store deleted successfully");
    },
    onError: (error) => {
      console.error('Error deleting store:', error);
      toast.error("Failed to delete store");
    }
  });
  
  // Handle form submission for creating a new store
  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore.name || !newStore.location || !newStore.manager) {
      toast.error("Please fill all required fields");
      return;
    }
    createMutation.mutate(newStore);
  };
  
  // Handle form submission for updating a store
  const handleUpdateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) return;
    
    updateMutation.mutate({ 
      id: selectedStore.id, 
      store: selectedStore 
    });
  };
  
  // Handle store deletion
  const handleDeleteStore = (id: string) => {
    if (window.confirm("Are you sure you want to delete this store?")) {
      deleteMutation.mutate(id);
    }
  };
  
  // Handle creating a report with template selection
  const handleCreateReport = (store: Store) => {
    if (templates.length === 0) {
      toast.error("No templates available. Please create a template first.");
      return;
    }
    
    setStoreForReport(store);
    setSelectedTemplate(null);
    setShowTemplateDialog(true);
  };
  
  const handleTemplateSelect = () => {
    if (!selectedTemplate || !storeForReport) {
      toast.error("Please select a template to continue");
      return;
    }
    
    navigate(`/reports/${storeForReport.id}?templateId=${selectedTemplate}`);
    setShowTemplateDialog(false);
    setStoreForReport(null);
  };
  
  // Filter stores based on search term
  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Stores</h1>
        <p className="text-muted-foreground">
          Manage your store locations and assign managers
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search stores..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={isAddStoreOpen} onOpenChange={setIsAddStoreOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Store
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Store</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateStore} className="space-y-4">
              <div>
                <Label htmlFor="name">Store Name</Label>
                <Input 
                  id="name" 
                  value={newStore.name} 
                  onChange={(e) => setNewStore({...newStore, name: e.target.value})}
                  placeholder="Enter store name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={newStore.location} 
                  onChange={(e) => setNewStore({...newStore, location: e.target.value})}
                  placeholder="Enter location"
                  required
                />
              </div>
              <div>
                <Label htmlFor="manager">Manager</Label>
                <Input 
                  id="manager" 
                  value={newStore.manager} 
                  onChange={(e) => setNewStore({...newStore, manager: e.target.value})}
                  placeholder="Enter manager name"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddStoreOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Store"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <StoreIcon size={64} className="text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-xl font-medium">No stores found</h3>
          <p className="text-muted-foreground mt-2">
            {searchTerm ? "Try a different search term" : "Add your first store to get started"}
          </p>
          {!searchTerm && (
            <Button className="mt-6" onClick={() => setIsAddStoreOpen(true)}>
              <Plus size={16} className="mr-2" />
              Add Store
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <Card key={store.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-start">
                  <div className="flex items-center">
                    <StoreIcon size={18} className="mr-2 text-primary" />
                    <span>{store.name}</span>
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
                      <DropdownMenuItem onClick={() => {
                        setSelectedStore(store);
                        setIsEditStoreOpen(true);
                      }}>
                        <Edit size={14} className="mr-2" />
                        Edit Store
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive" 
                        onClick={() => handleDeleteStore(store.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={14} className="mr-2" />
                        {deleteMutation.isPending && deleteMutation.variables === store.id 
                          ? "Deleting..." 
                          : "Delete Store"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin size={14} className="mr-2 text-muted-foreground" />
                    <span>{store.location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <User size={14} className="mr-2 text-muted-foreground" />
                    <span>Manager: {store.manager}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/reports`}>
                      View Reports
                    </Link>
                  </Button>
                  <Button size="sm" variant="default" onClick={() => handleCreateReport(store)}>
                    Create Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Edit Store Dialog */}
      <Dialog open={isEditStoreOpen} onOpenChange={setIsEditStoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
          </DialogHeader>
          {selectedStore && (
            <form onSubmit={handleUpdateStore} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Store Name</Label>
                <Input 
                  id="edit-name" 
                  value={selectedStore.name} 
                  onChange={(e) => setSelectedStore({...selectedStore, name: e.target.value})}
                  placeholder="Enter store name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input 
                  id="edit-location" 
                  value={selectedStore.location} 
                  onChange={(e) => setSelectedStore({...selectedStore, location: e.target.value})}
                  placeholder="Enter location"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-manager">Manager</Label>
                <Input 
                  id="edit-manager" 
                  value={selectedStore.manager} 
                  onChange={(e) => setSelectedStore({...selectedStore, manager: e.target.value})}
                  placeholder="Enter manager name"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditStoreOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Store"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Template Selection Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Template</DialogTitle>
            <DialogDescription>
              Choose a template for creating a report for {storeForReport?.name}
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
                    <RadioGroupItem value={template.id} id={`store-${template.id}`} className="mt-1" />
                    <div className="flex-1">
                      <Label 
                        htmlFor={`store-${template.id}`} 
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
    </div>
  );
}

export default Stores;
