import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Trash2, Loader2, MessageSquare, Star, 
  Search, RefreshCw, ThumbsUp, ThumbsDown 
} from 'lucide-react';
import { reviewService } from '../services/reviewService';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected'
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // id of review being processed

  useEffect(() => {
    setLoading(true);
    const unsubscribe = reviewService.subscribeAllReviews(
      (data) => {
        setReviews(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error subscribing to reviews:", error);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getAllReviews();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      setActionLoading(reviewId);
      await reviewService.updateReviewStatus(reviewId, newStatus);
      // Update locally
      setReviews(prevReviews => 
        prevReviews.map(r => r.id === reviewId ? { ...r, status: newStatus } : r)
      );
    } catch (error) {
      alert("Failed to update status: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review permanently?")) return;
    try {
      setActionLoading(reviewId);
      await reviewService.deleteReview(reviewId);
      // Remove locally
      setReviews(prevReviews => prevReviews.filter(r => r.id !== reviewId));
    } catch (error) {
      alert("Failed to delete review: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter reviews based on status and search query
  const filteredReviews = reviews.filter(review => {
    const matchesTab = (review.status || 'pending') === activeTab;
    const matchesSearch = 
      (review.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.course || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.review || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Count summaries
  const pendingCount = reviews.filter(r => (r.status || 'pending') === 'pending').length;
  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  const rejectedCount = reviews.filter(r => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
          <p className="text-gray-500 mt-1">Approve or reject student testimonials to show on the landing page.</p>
        </div>
        <button 
          onClick={fetchReviews}
          className="flex items-center justify-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div 
          onClick={() => setActiveTab('pending')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-premium ${
            activeTab === 'pending' ? 'bg-[#0B2C5F] border-[#0B2C5F] text-white' : 'bg-white border-gray-100 text-gray-800 hover:border-[#0B2C5F]/20'
          }`}
        >
          <div>
            <span className={`text-xs font-bold uppercase tracking-wider block ${activeTab === 'pending' ? 'text-white/70' : 'text-gray-400'}`}>Pending Approval</span>
            <span className="text-3xl font-black mt-2 block">{pendingCount}</span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${activeTab === 'pending' ? 'bg-white/10' : 'bg-amber-50 text-amber-600'}`}>
            <MessageSquare size={24} />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('approved')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-premium ${
            activeTab === 'approved' ? 'bg-emerald-700 border-emerald-700 text-white' : 'bg-white border-gray-100 text-gray-800 hover:border-emerald-700/20'
          }`}
        >
          <div>
            <span className={`text-xs font-bold uppercase tracking-wider block ${activeTab === 'approved' ? 'text-white/70' : 'text-gray-400'}`}>Approved</span>
            <span className="text-3xl font-black mt-2 block">{approvedCount}</span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${activeTab === 'approved' ? 'bg-white/10' : 'bg-emerald-50 text-emerald-600'}`}>
            <CheckCircle size={24} />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('rejected')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-premium ${
            activeTab === 'rejected' ? 'bg-rose-700 border-rose-700 text-white' : 'bg-white border-gray-100 text-gray-800 hover:border-rose-700/20'
          }`}
        >
          <div>
            <span className={`text-xs font-bold uppercase tracking-wider block ${activeTab === 'rejected' ? 'text-white/70' : 'text-gray-400'}`}>Rejected</span>
            <span className="text-3xl font-black mt-2 block">{rejectedCount}</span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${activeTab === 'rejected' ? 'bg-white/10' : 'bg-rose-50 text-rose-600'}`}>
            <XCircle size={24} />
          </div>
        </div>
      </div>

      {/* Main List Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        {/* Search */}
        <div className="p-6 border-b border-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search reviews..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-xl outline-none focus:border-brand-blue text-sm" 
            />
          </div>
        </div>

        {/* List Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-brand-blue" size={32} />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="font-semibold text-sm">No reviews found in this tab.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredReviews.map((review) => (
                <div 
                  key={review.id} 
                  className={`p-6 rounded-2xl border border-gray-100 flex flex-col justify-between relative bg-slate-50/50 hover:bg-slate-50 transition-all ${
                    actionLoading === review.id ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <div className="space-y-4">
                    {/* Stars and date */}
                    <div className="flex justify-between items-center">
                      <div className="flex text-amber-400 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            fill={i < (review.rating || 5) ? "#f59e0b" : "transparent"} 
                            className={i < (review.rating || 5) ? "text-amber-500" : "text-gray-300"} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold">
                        {review.createdAt ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>

                    {/* Review text */}
                    <p className="text-gray-700 text-sm leading-relaxed font-bold italic">
                      "{review.review}"
                    </p>
                  </div>

                  {/* Review author & Action Footer */}
                  <div className="border-t border-gray-100 mt-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0B2C5F] text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                        {(review.author || 'S')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-gray-800 text-xs truncate">{review.author}</h4>
                        <span className="text-[10px] text-gray-400 font-bold block truncate">{review.course || 'NEXTSTEP Student'}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {review.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(review.id, 'approved')}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-all border border-emerald-100"
                          title="Approve Review"
                        >
                          <ThumbsUp size={12} />
                          <span>Approve</span>
                        </button>
                      )}
                      
                      {review.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(review.id, 'rejected')}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold transition-all border border-amber-100"
                          title="Reject Review"
                        >
                          <ThumbsDown size={12} />
                          <span>Reject</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                        title="Delete Review Permanently"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
