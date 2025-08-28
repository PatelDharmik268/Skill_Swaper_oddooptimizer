import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { toast } from 'react-toastify';

const FeedbackForm = ({ userId, swapOfferId, fromUserId, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [messageText, setMessageText] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setFormError('');

    if (rating === 0) {
      toast.error('Please select a rating.');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId,
          rating,
          message: messageText,
          fromUserId,
          swapOfferId
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Feedback submitted successfully!');
        if (onSuccess) {
          onSuccess(data.updatedUserRating);
        }
        onClose();
      } else {
        toast.error(data.message || 'Failed to submit feedback.');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      toast.error('Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setMessageText('');
    setHoverRating(0);
    setFormError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold mb-6 text-center">Submit Feedback</h2>
        <form className="space-y-6" onSubmit={handleSubmitFeedback}>
          <div>
            <label className="block mb-2 font-medium text-gray-700">Rate the Service</label>
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={24}
                  className={`cursor-pointer transition-colors duration-200 ${
                    (hoverRating || rating) >= star
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>
            {rating > 0 && (
              <div className="text-center text-sm text-gray-600">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </div>
            )}
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">Message (Optional)</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[80px] focus:ring-2 focus:ring-purple-500 resize-none"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Write your feedback..."
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {messageText.length}/1000
            </div>
          </div>
          {formError && (
            <div className="text-red-500 text-sm font-medium text-center">
              {formError}
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm; 