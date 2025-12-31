import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { Select } from '../components/common/Select';
import { Textarea } from '../components/common/Textarea';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { apiClient } from '../lib/api-client';
import { CustomCourseRequest, Trainer } from '../types';
import { formatDateTime, formatCurrency } from '../utils/helpers';
import { CheckCircle, XCircle, User } from 'lucide-react';

export const CustomRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<CustomCourseRequest[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CustomCourseRequest | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignedTrainerId, setAssignedTrainerId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsResponse, trainersResponse] = await Promise.all([
        apiClient.getCustomRequests(),
        apiClient.getTrainers(),
      ]);

      // Map backend camelCase to frontend snake_case
      const mappedRequests: CustomCourseRequest[] = (requestsResponse.requests || []).map((r: any) => ({
        id: r.id,
        client_name: r.contactPerson || '',
        client_email: r.email || '',
        client_phone: r.clientPhone || null,
        course_title: r.courseName || '',
        description: r.reason || null,
        preferred_dates: r.preferredDates || null,
        budget: r.budget ? parseFloat(r.budget) : null,
        status: r.status?.toLowerCase() || 'pending',
        assigned_trainer_id: r.assignedTrainerId || null,
        admin_notes: r.adminNotes || null,
        created_at: r.createdAt || new Date().toISOString(),
        updated_at: r.updatedAt || new Date().toISOString(),
      }));

      setRequests(mappedRequests);

      // Map trainers
      const mappedTrainers: Trainer[] = (trainersResponse.trainers || []).map((t: any) => ({
        id: t.id,
        user_id: t.userId || null,
        email: t.email || '',
        full_name: t.fullName || '',
        phone: t.phoneNumber || null,
        specialization: Array.isArray(t.areasOfExpertise) && t.areasOfExpertise.length > 0 
          ? t.areasOfExpertise[0] 
          : null,
        bio: t.professionalBio || null,
        hourly_rate: null,
        hrdc_certified: !!t.hrdcAccreditationId,
        created_at: t.createdAt || new Date().toISOString(),
        updated_at: t.updatedAt || new Date().toISOString(),
      }));

      setTrainers(mappedTrainers);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: CustomCourseRequest) => {
    setSelectedRequest(request);
    setAssignedTrainerId(request.assigned_trainer_id || '');
    setAdminNotes(request.admin_notes || '');
    setShowAssignModal(true);
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this request?')) return;

    try {
      await apiClient.rejectRequest(id);
      // Backend handles notifications automatically
      fetchData();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      alert(error.message || 'Error rejecting request. Please try again.');
    }
  };

  const handleAssignAndApprove = async () => {
    if (!selectedRequest || !assignedTrainerId) return;

    try {
      const response = await apiClient.approveRequest(selectedRequest.id, {
        assignedTrainerId,
        adminNotes: adminNotes || undefined,
      });
      // Backend handles course creation and notifications automatically

      setShowAssignModal(false);
      setSelectedRequest(null);
      fetchData();
      alert('Request approved and course created successfully!');
    } catch (error: any) {
      console.error('Error approving request:', error);
      alert(error.message || 'Error approving request. Please try again.');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'warning';
    }
  };

  const getTrainerName = (trainerId: string | null) => {
    if (!trainerId) return 'Not assigned';
    const trainer = trainers.find(t => t.id === trainerId);
    return trainer?.full_name || 'Unknown';
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
          <h1 className="text-3xl font-bold text-gray-800">Custom Course Requests</h1>
          <p className="text-gray-600 mt-1">
            {requests.filter(r => r.status === 'pending').length} pending requests
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests.length === 0 ? (
          <Card>
            <div className="p-12 text-center text-gray-500">
              No course requests found
            </div>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {request.course_title}
                    </h3>
                    <Badge variant={getStatusVariant(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleApprove(request)}
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(request.id)}
                      >
                        <XCircle size={16} className="mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Client Information</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Name:</span> {request.client_name}</p>
                      <p><span className="font-medium">Email:</span> {request.client_email}</p>
                      {request.client_phone && (
                        <p><span className="font-medium">Phone:</span> {request.client_phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Course Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      {request.budget && (
                        <p>
                          <span className="font-medium">Budget:</span>{' '}
                          {formatCurrency(request.budget)}
                        </p>
                      )}
                      {request.preferred_dates && (
                        <p><span className="font-medium">Preferred Dates:</span> {request.preferred_dates}</p>
                      )}
                      <p><span className="font-medium">Submitted:</span> {formatDateTime(request.created_at)}</p>
                    </div>
                  </div>
                </div>

                {request.description && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
                    <p className="text-gray-600 text-sm">{request.description}</p>
                  </div>
                )}

                {request.assigned_trainer_id && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <User size={16} />
                    <span>
                      <span className="font-medium">Assigned Trainer:</span>{' '}
                      {getTrainerName(request.assigned_trainer_id)}
                    </span>
                  </div>
                )}

                {request.admin_notes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-1 text-sm">Admin Notes</h4>
                    <p className="text-gray-600 text-sm">{request.admin_notes}</p>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedRequest(null);
        }}
        title="Approve and Assign Trainer"
        size="md"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">
                {selectedRequest.course_title}
              </h3>
              <p className="text-sm text-gray-600">
                Client: {selectedRequest.client_name}
              </p>
            </div>

            <Select
              label="Assign Trainer"
              value={assignedTrainerId}
              onChange={(e) => setAssignedTrainerId(e.target.value)}
              options={[
                { value: '', label: 'Select a trainer' },
                ...trainers.map(trainer => ({
                  value: trainer.id,
                  label: `${trainer.full_name} - ${trainer.specialization || 'No specialization'}`,
                })),
              ]}
            />

            <Textarea
              label="Admin Notes (Optional)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              placeholder="Add any notes about this approval..."
            />

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedRequest(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleAssignAndApprove}
                disabled={!assignedTrainerId}
              >
                Approve & Create Course
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
