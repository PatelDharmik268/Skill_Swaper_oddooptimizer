import React, { useState, memo } from 'react';
import { User } from 'lucide-react';

const LazyImage = memo(({ src, alt, className, fallbackSize = 24 }) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`${className} bg-gray-300 flex items-center justify-center`}>
        <User size={fallbackSize} className="text-gray-500" />
      </div>
    );
  }

  return (
    <img
      loading="lazy"
      src={src}
      alt={alt}
      className={`${className} transition-opacity duration-300`}
      onError={() => setError(true)}
    />
  );
});

export default LazyImage;
