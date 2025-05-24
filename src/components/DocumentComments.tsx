
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { MessageSquare, Send, Reply } from 'lucide-react';
import { Document } from '@/contexts/DocumentContext';
import { useVoice } from '@/contexts/VoiceContext';

interface DocumentCommentsProps {
  document: Document;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  replies?: Comment[];
}

export const DocumentComments: React.FC<DocumentCommentsProps> = ({ document }) => {
  const { speak } = useVoice();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'John Doe',
      content: 'Please review the contract terms in section 3.',
      timestamp: new Date('2024-01-15T10:30:00'),
      replies: [
        {
          id: '1-1',
          author: 'Jane Smith',
          content: 'I\'ve reviewed it and it looks good to me.',
          timestamp: new Date('2024-01-15T14:20:00')
        }
      ]
    },
    {
      id: '2',
      author: 'Admin User',
      content: 'Document is ready for final signatures.',
      timestamp: new Date('2024-01-16T09:15:00')
    }
  ]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Current User',
      content: newComment,
      timestamp: new Date(),
      replies: []
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    speak('Comment added successfully', 'normal');
  };

  const handleAddReply = (commentId: string) => {
    if (!replyContent.trim()) return;

    const reply: Comment = {
      id: `${commentId}-${Date.now()}`,
      author: 'Current User',
      content: replyContent,
      timestamp: new Date()
    };

    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        };
      }
      return comment;
    }));

    setReplyContent('');
    setReplyTo(null);
    speak('Reply added successfully', 'normal');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments & Collaboration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new comment */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button onClick={handleAddComment} disabled={!newComment.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Post Comment
          </Button>
        </div>

        {/* Comments list */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{getInitials(comment.author)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.author}</span>
                    <span className="text-xs text-gray-500">
                      {comment.timestamp.toLocaleDateString()} at {comment.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>

                  {/* Reply form */}
                  {replyTo === comment.id && (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAddReply(comment.id)}>
                          Reply
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setReplyTo(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 ml-4 border-l-2 border-gray-100 pl-4 space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-3">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">{getInitials(reply.author)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-xs">{reply.author}</span>
                              <span className="text-xs text-gray-500">
                                {reply.timestamp.toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-700">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet. Be the first to add one!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
