import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { TrainerForm } from '../components/trainers/TrainerForm';
import { TrainerTabs } from '../components/trainers/TrainerTabs';
import { supabase } from '../utils/supabaseClient';
import { Trainer } from '../types';
import { Plus, Edit, Trash2 } from 'lucide-react';

export const TrainersPage: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrainers(data || []);
    } catch (error) {
      console.error('Error fetching trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrainer = async (data: Partial<Trainer>) => {
    try {
      const { error } = await supabase.from('trainers').insert(data);
      if (error) throw error;
      setShowAddModal(false);
      fetchTrainers();
    } catch (error) {
      console.error('Error adding trainer:', error);
    }
  };

  const handleUpdateTrainer = async (data: Partial<Trainer>) => {
    if (!editingTrainer) return;

    try {
      const { error } = await supabase
        .from('trainers')
        .update(data)
        .eq('id', editingTrainer.id);

      if (error) throw error;
      setShowEditModal(false);
      setEditingTrainer(null);
      fetchTrainers();
    } catch (error) {
      console.error('Error updating trainer:', error);
    }
  };

  const handleDeleteTrainer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trainer?')) return;

    try {
      const { error } = await supabase.from('trainers').delete().eq('id', id);
      if (error) throw error;
      fetchTrainers();
    } catch (error) {
      console.error('Error deleting trainer:', error);
    }
  };

  const openEditModal = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setShowEditModal(true);
  };

  const openDetailsModal = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Trainers</h1>
          <p className="text-gray-600 mt-1">{trainers.length} total trainers</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={18} className="mr-2" />
          Add Trainer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map((trainer) => (
          <Card key={trainer.id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800">{trainer.full_name}</h3>
                  <p className="text-sm text-gray-600">{trainer.email}</p>
                  {trainer.specialization && (
                    <p className="text-sm text-teal-600 mt-1">{trainer.specialization}</p>
                  )}
                </div>
                {trainer.hrdc_certified && (
                  <Badge variant="success">HRDC</Badge>
                )}
              </div>

              {trainer.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{trainer.bio}</p>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => openDetailsModal(trainer)}
                >
                  View Details
                </Button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(trainer)}
                    className="p-2 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteTrainer(trainer.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Trainer"
        size="lg"
      >
        <TrainerForm
          onSubmit={handleAddTrainer}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTrainer(null);
        }}
        title="Edit Trainer"
        size="lg"
      >
        {editingTrainer && (
          <TrainerForm
            trainer={editingTrainer}
            onSubmit={handleUpdateTrainer}
            onCancel={() => {
              setShowEditModal(false);
              setEditingTrainer(null);
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTrainer(null);
        }}
        title={selectedTrainer?.full_name || 'Trainer Details'}
        size="xl"
      >
        {selectedTrainer && (
          <TrainerTabs
            trainer={selectedTrainer}
            onUpdate={fetchTrainers}
          />
        )}
      </Modal>
    </div>
  );
};
