import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { Trainer } from '../../types';

interface TrainerFormProps {
  trainer?: Trainer;
  onSubmit: (data: Partial<Trainer>) => Promise<void>;
  onCancel: () => void;
}

export const TrainerForm: React.FC<TrainerFormProps> = ({
  trainer,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    full_name: trainer?.full_name || '',
    email: trainer?.email || '',
    phone: trainer?.phone || '',
    specialization: trainer?.specialization || '',
    bio: trainer?.bio || '',
    hourly_rate: trainer?.hourly_rate?.toString() || '',
    // Removed hrdc_certified - HRDC verification should only be done via Verify HRDC Certification button
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={!!trainer}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <Input
          label="Specialization"
          value={formData.specialization}
          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
        />
      </div>

      <Input
        label="Hourly Rate (MYR)"
        type="number"
        step="0.01"
        value={formData.hourly_rate}
        onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
      />

      <Textarea
        label="Bio"
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        rows={4}
      />

      {/* HRDC Certification removed - use "Verify HRDC Certification" button in trainers list instead */}

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : trainer ? 'Update Trainer' : 'Add Trainer'}
        </Button>
      </div>
    </form>
  );
};
