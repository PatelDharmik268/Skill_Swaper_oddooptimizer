import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { toast } from 'react-toastify';

const FeedbackForm = ({ userId, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [messageText, setMessageText] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setFormError('');

    if (rating === 0) {
      toast.error('Please select a rating.');
      return;
    }

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
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Feedback submitted successfully!');
        onClose();
      } else {
        toast.error(data.message || 'Failed to submit feedback.');
      }
    } catch (err) {
      toast.error('Failed to submit feedback.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          &times;
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
                  className={`cursor-pointer ${
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
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">Message</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[80px] focus:ring-2 focus:ring-purple-500"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Write your feedback..."
            />
          </div>
          {formError && (
            <div className="text-red-500 text-sm font-medium text-center">
              {formError}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg shadow"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;