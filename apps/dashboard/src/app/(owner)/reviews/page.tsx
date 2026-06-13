'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { arEG } from 'date-fns/locale';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function OwnerReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const fetchReviews = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          owner_reply,
          owner_reply_at,
          users ( full_name ),
          pitches!inner ( id, name, owner_id )
        `)
        .eq('pitches.owner_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReply = async (reviewId: string) => {
    const text = replyText[reviewId];
    if (!text || text.trim() === '') return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          owner_reply: text,
          owner_reply_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (error) throw error;
      
      // Update local state
      setReviews(reviews.map(r => 
        r.id === reviewId ? { ...r, owner_reply: text, owner_reply_at: new Date().toISOString() } : r
      ));
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إرسال الرد');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">تقييمات الملاعب</h1>
      <p className="text-muted-foreground">راجع تقييمات اللاعبين لملاعبك وقم بالرد عليها.</p>

      <div className="grid gap-6">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              لا توجد تقييمات حتى الآن.
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{review.pitches.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      من: {review.users?.full_name || 'مستخدم غير معروف'} • {format(new Date(review.created_at), 'PPP', { locale: arEG })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-full text-amber-600 font-bold">
                    <span>{review.rating}</span>
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-foreground leading-relaxed mb-6">{review.comment || 'لا يوجد تعليق.'}</p>

                {review.owner_reply ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-emerald-700 dark:text-emerald-500">ردك:</span>
                      <span className="text-xs text-muted-foreground mr-auto">
                        {format(new Date(review.owner_reply_at), 'PPP', { locale: arEG })}
                      </span>
                    </div>
                    <p className="text-sm text-emerald-800 dark:text-emerald-200">{review.owner_reply}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="اكتب ردك على هذا التقييم..."
                      value={replyText[review.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [review.id]: e.target.value })}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => handleReply(review.id)} 
                        disabled={!replyText[review.id] || submitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        إرسال الرد
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
