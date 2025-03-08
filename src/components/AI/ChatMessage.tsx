
import { cn } from "@/lib/utils";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, User } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex w-full items-start gap-4 py-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <Avatar className="h-8 w-8 bg-primary/10 flex items-center justify-center">
          <Bot size={16} className="text-primary" />
        </Avatar>
      )}
      
      <div className={cn(
        "rounded-lg px-4 py-3 max-w-[85%] text-sm",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted/50 text-foreground"
      )}>
        {message.loading ? (
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
        ) : (
          <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-full markdown">
            {message.content}
          </ReactMarkdown>
        )}
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8 bg-primary flex items-center justify-center">
          <User size={16} className="text-primary-foreground" />
        </Avatar>
      )}
    </div>
  );
}

export default ChatMessage;
