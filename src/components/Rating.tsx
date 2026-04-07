import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';

interface RatingProps {
  initialRating?: number;
  maxRating?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Rating({ 
  initialRating = 0, 
  maxRating = 5, 
  onRate, 
  readonly = false,
  size = 'md',
  className = ''
}: RatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-5 w-5',
    lg: 'h-8 w-8'
  };

  const handleRate = (value: number) => {
    if (readonly) return;
    setRating(value);
    if (onRate) onRate(value);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(maxRating)].map((_, index) => {
        const value = index + 1;
        const isActive = (hover || rating) >= value;
        
        return (
          <motion.button
            key={index}
            whileHover={!readonly ? { scale: 1.2 } : {}}
            whileTap={!readonly ? { scale: 0.9 } : {}}
            onClick={() => handleRate(value)}
            onMouseEnter={() => !readonly && setHover(value)}
            onMouseLeave={() => !readonly && setHover(0)}
            disabled={readonly}
            className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'} ${
              isActive ? 'text-yellow-400' : 'text-slate-300'
            }`}
            type="button"
          >
            <Star 
              className={`${sizes[size]} ${isActive ? 'fill-current' : 'fill-none'}`} 
              strokeWidth={2}
            />
          </motion.button>
        );
      })}
      {readonly && initialRating > 0 && (
        <span className={`mr-2 font-bold text-slate-600 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {initialRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
