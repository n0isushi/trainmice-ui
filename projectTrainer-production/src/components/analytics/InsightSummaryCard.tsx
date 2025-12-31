import { Lightbulb } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface InsightSummaryCardProps {
  summary: string;
}

export function InsightSummaryCard({ summary }: InsightSummaryCardProps) {
  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardContent>
        <div className="flex gap-4 py-2">
          <div className="flex-shrink-0 p-3 bg-blue-600 rounded-lg">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-1">Key Insights</h3>
            <p className="text-blue-800 leading-relaxed">{summary}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
