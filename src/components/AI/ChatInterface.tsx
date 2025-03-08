
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage as ChatMessageType, StoreFilter } from "@/types/chat";
import { Store, Report } from "@/types/supabase";
import { ChatMessage } from "./ChatMessage";
import { Send } from "lucide-react";
import { generateAISummary } from "@/services/aiSummaryService";
import { toast } from "sonner";

interface ChatInterfaceProps {
  stores: Store[];
  reports: Report[];
  storeFilter: StoreFilter;
  initialMessage?: string;
}

export function ChatInterface({ stores, reports, storeFilter, initialMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize chat with a welcome message
  useEffect(() => {
    if (initialMessage) {
      const filteredStores = storeFilter.storeIds === 'all' 
        ? stores 
        : stores.filter(store => storeFilter.storeIds.includes(store.id));
      
      // Initial messages
      setMessages([
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'I am generating a summary of the store reports based on your selection...',
          timestamp: new Date(),
          loading: true
        }
      ]);
      
      // Generate initial summary
      generateAISummary(
        [{ role: 'user', content: initialMessage }],
        filteredStores,
        reports,
        'summary'
      )
        .then(response => {
          setMessages([
            {
              id: uuidv4(),
              role: 'assistant',
              content: response.content,
              timestamp: new Date()
            }
          ]);
        })
        .catch(error => {
          console.error("Error generating initial summary:", error);
          toast.error("Failed to generate summary. Please try again.");
          setMessages([
            {
              id: uuidv4(),
              role: 'assistant',
              content: "I'm sorry, I couldn't generate a summary at this time. Please try again or contact support if the issue persists.",
              timestamp: new Date()
            }
          ]);
        });
    }
  }, [initialMessage, stores, reports, storeFilter]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: ChatMessageType = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    // Add loading message from assistant
    const loadingMessage: ChatMessageType = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      loading: true
    };
    
    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput("");
    setLoading(true);
    
    try {
      // Filter stores based on selection
      const filteredStores = storeFilter.storeIds === 'all' 
        ? stores 
        : stores.filter(store => storeFilter.storeIds.includes(store.id));
      
      // Convert our messages to the format expected by the API
      const apiMessages = messages
        .filter(msg => !msg.loading)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      // Add the new user message
      apiMessages.push({
        role: 'user',
        content: input
      });
      
      // Generate response
      const response = await generateAISummary(
        apiMessages,
        filteredStores,
        reports,
        'chat'
      );
      
      // Update messages, replacing the loading message
      setMessages(prev => [
        ...prev.slice(0, prev.length - 1),
        {
          id: uuidv4(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error("Error in chat:", error);
      toast.error("Failed to get a response. Please try again.");
      
      // Update messages, replacing the loading message with an error
      setMessages(prev => [
        ...prev.slice(0, prev.length - 1),
        {
          id: uuidv4(),
          role: 'assistant',
          content: "I'm sorry, I couldn't process your question. Please try again or rephrase your question.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <Card className="flex flex-col h-[calc(100vh-300px)] min-h-[500px]">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <CardFooter className="border-t p-4">
        <div className="flex w-full items-center gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about the store reports..."
            className="min-h-10 resize-none flex-1"
            disabled={loading}
            style={{ maxHeight: '120px', overflow: 'auto' }}
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage} 
            disabled={!input.trim() || loading}
          >
            <Send size={16} />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default ChatInterface;
