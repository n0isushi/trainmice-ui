import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface StrengthsWeaknessesCardProps {
  strengths: string[];
  improvementAreas: string[];
}

const QUESTION_LABELS: Record<string, string> = {
  q_content_clarity: 'Content Clarity',
  q_objectives_achieved: 'Objectives Achieved',
  q_materials_helpful: 'Materials Helpful',
  q_environment_learning: 'Learning Environment',
  q_trainer_knowledge: 'Trainer Knowledge',
  q_engagement: 'Engagement Level',
  q_new_knowledge: 'New Knowledge Gained',
  q_application_understanding: 'Practical Application',
  q_recommend_course: 'Course Recommendation'
};

export function StrengthsWeaknessesCard({ strengths, improvementAreas }: StrengthsWeaknessesCardProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">Performance Insights</h2>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Top Strengths</h3>
            </div>
            <div className="space-y-2">
              {strengths.map((strength, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg"
                >
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-green-900">
                    {QUESTION_LABELS[strength] || strength}
                  </span>
                </div>
              ))}
              {strengths.length === 0 && (
                <p className="text-sm text-gray-500">No data available</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-orange-100 rounded-lg">
                <TrendingDown className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Areas for Improvement</h3>
            </div>
            <div className="space-y-2">
              {improvementAreas.map((area, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-orange-900">
                    {QUESTION_LABELS[area] || area}
                  </span>
                </div>
              ))}
              {improvementAreas.length === 0 && (
                <p className="text-sm text-gray-500">No data available</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
