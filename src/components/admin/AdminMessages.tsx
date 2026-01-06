import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Mail, User, Clock, Trash2, Eye, EyeOff, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  useContactMessages,
  useMarkMessageAsRead,
  useDeleteContactMessage,
} from "@/hooks/useContactMessages";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function AdminMessages() {
  const { toast } = useToast();
  const { data: messages, isLoading } = useContactMessages();
  const markAsRead = useMarkMessageAsRead();
  const deleteMessage = useDeleteContactMessage();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const filteredMessages = messages?.filter((msg) => {
    if (filter === "unread") return !msg.is_read;
    if (filter === "read") return msg.is_read;
    return true;
  });

  const unreadCount = messages?.filter((m) => !m.is_read).length || 0;

  const handleMarkAsRead = async (id: string) => {
    await markAsRead.mutateAsync(id);
    toast({ title: "Message marked as read" });
  };

  const handleDelete = async (id: string) => {
    await deleteMessage.mutateAsync(id);
    toast({ title: "Message deleted", variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-foreground mb-2 flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-primary" />
          Contact Messages
        </h1>
        <p className="text-muted-foreground">
          View and manage messages from website visitors.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border/50 rounded-sm p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{messages?.length || 0}</p>
          <p className="text-xs text-muted-foreground">Total Messages</p>
        </div>
        <div className="bg-card border border-primary/30 rounded-sm p-4 text-center">
          <p className="text-2xl font-bold text-primary">{unreadCount}</p>
          <p className="text-xs text-muted-foreground">Unread</p>
        </div>
        <div className="bg-card border border-border/50 rounded-sm p-4 text-center">
          <p className="text-2xl font-bold text-muted-foreground">
            {(messages?.length || 0) - unreadCount}
          </p>
          <p className="text-xs text-muted-foreground">Read</p>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2"
      >
        <Button
          variant={filter === "all" ? "premium" : "ghost"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "unread" ? "premium" : "ghost"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === "read" ? "premium" : "ghost"}
          size="sm"
          onClick={() => setFilter("read")}
        >
          Read
        </Button>
      </motion.div>

      {/* Messages List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Loading messages...</p>
        ) : !filteredMessages?.length ? (
          <div className="bg-card border border-border/50 rounded-sm p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No messages found.</p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`bg-card border rounded-sm p-5 ${
                message.is_read
                  ? "border-border/50"
                  : "border-primary/50 bg-primary/5"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">{message.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${message.email}`}
                        className="text-primary hover:underline text-sm"
                      >
                        {message.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Clock className="h-4 w-4" />
                      {format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="bg-muted/30 rounded-sm p-4">
                    <p className="text-foreground text-sm whitespace-pre-wrap">
                      {message.message}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!message.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMarkAsRead(message.id)}
                      title="Mark as read"
                    >
                      <Eye className="h-4 w-4 text-primary" />
                    </Button>
                  )}
                  {message.is_read && (
                    <span title="Read" className="p-2">
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    </span>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" title="Delete message">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Message</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this message from {message.name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(message.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
