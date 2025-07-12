import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import { toast } from 'react-toastify';

const FeedbackModal = ({ isOpen, onClose, swapOffer, onSubmitFeedback }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitFeedback(rating, feedback);
      // Reset form
      setRating(0);
      setFeedback('');
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setFeedback('');
    setHoveredRating(0);
    onClose();
  };

  if (!isOpen || !swapOffer) return null;

  const otherUser = swapOffer.otherUser;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button 
          onClick={handleClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          <X size={24} />
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Rate Your Experience</h2>
          <p className="text-gray-600">
            How was your skill swap with{' '}
            <span className="font-semibold text-purple-600">{otherUser?.username}</span>?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Stars */}
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rate your experience (1-5 stars)
            </label>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-colors duration-200"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    } hover:text-yellow-400 hover:fill-current`}
                  />
                </button>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {rating > 0 && (
                <span>
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </span>
              )}
            </div>
          </div>

          {/* Feedback Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Feedback (Optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience, what went well, or suggestions for improvement..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-[100px] focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {feedback.length}/1000
            </div>
          </div>

          {/* Swap Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Swap Details</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <span className="font-medium">You offered:</span> {swapOffer.offeredSkills}
              </div>
              <div>
                <span className="font-medium">You learned:</span> {swapOffer.wantedSkills}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send size={20} />
                Submit Feedback
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal; 