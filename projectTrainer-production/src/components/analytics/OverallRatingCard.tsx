import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface OverallRatingCardProps {
  rating: number;
}

export function OverallRatingCard({ rating }: OverallRatingCardProps) {
  const getColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 bg-green-50 border-green-200';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-8 h-8 fill-current" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-8 h-8">
            <Star className="w-8 h-8 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star className="w-8 h-8 fill-current" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-8 h-8 text-gray-300" />
        );
      }
    }
    return stars;
  };

  return (
    <Card className={`border-2 ${getColor(rating)}`}>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">Overall Performance Rating</h2>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center py-4">
          <div className={`text-6xl font-bold mb-4 ${getColor(rating)}`}>
            {rating.toFixed(1)}
          </div>
          <div className="flex gap-1 mb-2">
            {renderStars(rating)}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Average rating across all feedback criteria
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
