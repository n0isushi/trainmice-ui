import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { WEEKDAY_NAMES } from '../../lib/calendarUtils';
import { XCircle } from 'lucide-react';
import { apiClient } from '../../lib/api-client';

interface BlockDaysPanelProps {
  trainerId: string;
  blockedDays: number[];
  onUpdate: () => void;
}

export function BlockDaysPanel({ trainerId, blockedDays, onUpdate }: BlockDaysPanelProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>(blockedDays);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDays(blockedDays);
  }, [blockedDays]);

  const toggleDay = (dayOfWeek: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayOfWeek)
        ? prev.filter((d) => d !== dayOfWeek)
        : [...prev, dayOfWeek]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      await apiClient.saveTrainerBlockedDays(trainerId, selectedDays);

      onUpdate();
    } catch (err) {
      console.error('Error saving blocked days:', err);
      setError(err instanceof Error ? err.message : 'Failed to save blocked days');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(selectedDays.sort()) !== JSON.stringify(blockedDays.sort());

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Block Recurring Days</h3>
        <p className="text-sm text-gray-600 mt-1">
          Select days of the week to block for all future dates
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {WEEKDAY_NAMES.map((day, index) => (
            <label
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedDays.includes(index)}
                onChange={() => toggleDay(index)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">{day}</span>
              {selectedDays.includes(index) && (
                <XCircle className="w-4 h-4 text-red-500 ml-auto" />
              )}
            </label>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {hasChanges && (
          <div className="mt-4 flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="primary"
              className="flex-1"
            >
              {saving ? (
                <>
                  <LoadingSpinner />
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Button
              onClick={() => setSelectedDays(blockedDays)}
              disabled={saving}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        )}

        {selectedDays.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              Blocked days will only apply to future dates and won't affect existing bookings
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
