import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { TextareaWithLimit } from '../components/ui/TextareaWithLimit';
import { Tabs } from '../components/ui/Tabs';
import { TabPanel } from '../components/ui/TabPanel';
import { User, Briefcase, Award, Plus, Edit2, Trash2, Save, X, Camera, AlertCircle, MapPin } from 'lucide-react';
import { validatePersonalInfo, isProfileComplete, ValidationErrors } from '../lib/trainerProfileValidation';
import {
  fetchTrainerProfile,
  updateTrainerProfile,
  fetchQualifications,
  createQualification,
  updateQualification,
  deleteQualificationWithTrainerId,
  fetchWorkHistory,
  createWorkHistory,
  updateWorkHistory,
  deleteWorkHistoryWithTrainerId,
  validateWorkHistoryLimit,
  fetchPastClients,
  calculateDuration,
  formatQualificationType,
  getYearOptions
} from '../lib/trainerProfileService';
import {
  Trainer,
  TrainerQualification,
  TrainerWorkHistory,
  TrainerPastClient
} from '../types/database';
import { MultiSelect } from '../components/ui/MultiSelect';
import { PastClientsSection } from '../components/profile/PastClientsSection';

export function TrainerProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [qualifications, setQualifications] = useState<TrainerQualification[]>([]);
  const [workHistory, setWorkHistory] = useState<TrainerWorkHistory[]>([]);
  const [pastClients, setPastClients] = useState<TrainerPastClient[]>([]);

  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'other'>('personal');
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingOther, setIsEditingOther] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [originalTrainer, setOriginalTrainer] = useState<Trainer | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const [trainerData, quals, work, clients] = await Promise.all([
        fetchTrainerProfile(user.id),
        fetchQualifications(user.id),
        fetchWorkHistory(user.id),
        fetchPastClients(user.id)
      ]);

      // Set email from user if trainer doesn't have it
      if (trainerData && user?.email && !trainerData.email) {
        trainerData.email = user.email;
      }

      setTrainer(trainerData);
      setOriginalTrainer(trainerData);
      setQualifications(quals);
      setWorkHistory(work);
      setPastClients(clients);
    } catch (error) {
      console.error('Error loading profile data:', error);
      alert('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePersonalInfo = async () => {
    if (!user?.id || !trainer) return;

    // Ensure email is set from user for validation
    const trainerWithEmail = {
      ...trainer,
      email: user.email || trainer.email
    };

    const validationErrors = validatePersonalInfo(trainerWithEmail);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert('Please fix the validation errors before saving');
      return;
    }

    setSaving(true);
    try {
      // Exclude email from update since it's read-only
      const { email, ...updateData } = trainer;
      await updateTrainerProfile(user.id, updateData);
      alert('Personal information updated successfully');
      setIsEditingPersonal(false);
      setErrors({});
      await loadAllData();
    } catch (error) {
      console.error('Error updating personal info:', error);
      alert(error instanceof Error ? error.message : 'Failed to update personal information');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (originalTrainer) {
      setTrainer(originalTrainer);
    }
    setIsEditingPersonal(false);
    setErrors({});
  };

  const handleUpdateOtherInfo = async () => {
    if (!user?.id || !trainer) return;

    setSaving(true);
    try {
      await updateTrainerProfile(user.id, {
        state: trainer.state,
        city: trainer.city,
        country: trainer.country,
        areas_of_expertise: trainer.areas_of_expertise,
        languages_spoken: trainer.languages_spoken
      });
      alert('Other information updated successfully');
      setIsEditingOther(false);
      await loadAllData();
    } catch (error) {
      console.error('Error updating other info:', error);
      alert(error instanceof Error ? error.message : 'Failed to update other information');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelOtherEdit = () => {
    if (originalTrainer) {
      setTrainer(originalTrainer);
    }
    setIsEditingOther(false);
  };

  const handleFieldChange = (field: keyof Trainer, value: any) => {
    setTrainer(prev => prev ? { ...prev, [field]: value } : null);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-900 font-medium mb-2">No Trainer Profile Found</p>
        <p className="text-gray-600 text-sm">
          Your trainer profile could not be loaded. Please contact support if this issue persists.
        </p>
      </div>
    );
  }

  const tabs = [
    {
      id: 'personal',
      label: 'Personal',
      icon: <User className="w-4 h-4" />
    },
    {
      id: 'professional',
      label: 'Professional',
      icon: <Award className="w-4 h-4" />,
      badge: qualifications.length + workHistory.length
    },
    {
      id: 'other',
      label: 'Other Information',
      icon: <MapPin className="w-4 h-4" />
    }
  ];

  const profileIncomplete = !isProfileComplete(trainer);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trainer Profile</h1>
        <p className="text-gray-600 mt-1">Manage your professional profile and credentials</p>
      </div>

      {profileIncomplete && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900">Complete Your Profile</h3>
            <p className="text-sm text-blue-700 mt-1">
              Please update your profile with important information such as IC Number, Phone Number, and Professional Bio to help administrators and clients know more about you.
            </p>
          </div>
          {!isEditingPersonal && (
            <Button
              variant="primary"
              onClick={() => setIsEditingPersonal(true)}
              className="text-sm py-1.5 px-3 whitespace-nowrap"
            >
              Edit Profile
            </Button>
          )}
        </div>
      )}

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(tabId) => setActiveTab(tabId as 'personal' | 'professional' | 'other')} />

      <TabPanel value="personal" activeTab={activeTab}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              {!isEditingPersonal ? (
                <Button variant="outline" onClick={() => setIsEditingPersonal(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleUpdatePersonalInfo} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex items-center gap-6">
              <div className="relative">
                {trainer.profile_pic ? (
                  <img
                    src={trainer.profile_pic}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-gray-200">
                    <User className="w-12 h-12 text-blue-600" />
                  </div>
                )}
                {isEditingPersonal && (
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                    title="Change photo"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-900">{trainer.full_name || 'User'}</p>
                <p className="text-sm text-gray-500">{trainer.custom_trainer_id}</p>
                <p className="text-sm text-gray-600 mt-1">{user?.email || trainer.email || 'No email'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Trainer ID"
                value={trainer.custom_trainer_id}
                disabled
                helperText="System-generated ID"
              />
              <Input
                label="Full Name"
                value={trainer.full_name || ''}
                onChange={(e) => handleFieldChange('full_name', e.target.value)}
                disabled={!isEditingPersonal}
                required
                error={errors.full_name}
              />
              <Input
                label="IC Number"
                value={trainer.ic_number || ''}
                onChange={(e) => handleFieldChange('ic_number', e.target.value)}
                disabled={!isEditingPersonal}
                placeholder="XXXXXX-XX-XXXX"
                helperText="Format: 123456-12-1234"
                error={errors.ic_number}
              />
              <Input
                label="Race/Ethnicity"
                value={trainer.race || ''}
                onChange={(e) => handleFieldChange('race', e.target.value)}
                disabled={!isEditingPersonal}
                placeholder="e.g., Malay, Chinese, Indian"
                error={errors.race}
              />
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
                    <span className="text-xl">🇲🇾</span>
                    <span className="text-gray-700 font-medium">+60</span>
                  </div>
                  <input
                    type="tel"
                    value={trainer.phone_number?.replace(/^\+60/, '') || ''}
                    onChange={(e) => {
                      // Only allow digits
                      const digitsOnly = e.target.value.replace(/\D/g, '');
                      // Store with +60 prefix
                      handleFieldChange('phone_number', digitsOnly ? `+60${digitsOnly}` : '');
                    }}
                    disabled={!isEditingPersonal}
                    placeholder="123456789"
                    maxLength={10}
                    className={`w-full pl-20 pr-4 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 ${
                      errors.phone_number
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } ${!isEditingPersonal ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  />
                </div>
                {errors.phone_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                )}
                {!errors.phone_number && (
                  <p className="mt-1 text-sm text-gray-500">Enter your phone number without +60 prefix</p>
                )}
              </div>
              <Input
                label="Email Address"
                type="email"
                value={user?.email || trainer.email || ''}
                onChange={() => {}} // No-op since disabled
                disabled={true}
                required
                helperText="Email cannot be changed. This is your signup email."
                error={errors.email}
              />
              <Input
                label="HRDC Accreditation ID"
                value={trainer.hrdc_accreditation_id || ''}
                onChange={(e) => handleFieldChange('hrdc_accreditation_id', e.target.value)}
                disabled={!isEditingPersonal}
                placeholder="HRD-XXXXX"
                error={errors.hrdc_accreditation_id}
              />
              <Input
                label="HRDC Accreditation Valid Until"
                type="date"
                value={trainer.hrdc_accreditation_valid_until || ''}
                onChange={(e) => handleFieldChange('hrdc_accreditation_valid_until', e.target.value)}
                disabled={!isEditingPersonal}
                min={new Date().toISOString().split('T')[0]}
                error={errors.hrdc_accreditation_valid_until}
              />
            </div>

            <div className="mt-4">
              <TextareaWithLimit
                label="Professional Bio"
                value={trainer.professional_bio || ''}
                onChange={(e) => handleFieldChange('professional_bio', e.target.value)}
                disabled={!isEditingPersonal}
                rows={6}
                wordLimit={500}
                placeholder="Tell us about your professional experience, expertise, and training philosophy..."
                error={errors.professional_bio}
              />
            </div>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value="professional" activeTab={activeTab}>
        <div className="space-y-6">
          <QualificationsSection
            qualifications={qualifications}
            trainerId={user?.id || ''}
            onUpdate={loadAllData}
          />

          <WorkHistorySection
            workHistory={workHistory}
            trainerId={user?.id || ''}
            onUpdate={loadAllData}
          />
        </div>
      </TabPanel>

      <TabPanel value="other" activeTab={activeTab}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Location Information</h2>
                {!isEditingOther ? (
                  <Button variant="outline" onClick={() => setIsEditingOther(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancelOtherEdit}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={handleUpdateOtherInfo} disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Input
                  label="Country"
                  value={trainer.country || ''}
                  onChange={(e) => handleFieldChange('country', e.target.value)}
                  disabled={!isEditingOther}
                  placeholder="e.g., Malaysia"
                />
                <Input
                  label="State"
                  value={trainer.state || ''}
                  onChange={(e) => handleFieldChange('state', e.target.value)}
                  disabled={!isEditingOther}
                  placeholder="e.g., Selangor"
                />
                <Input
                  label="City"
                  value={trainer.city || ''}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  disabled={!isEditingOther}
                  placeholder="e.g., Petaling Jaya"
                />
              </div>

              <div className="space-y-4">
                <MultiSelect
                  label="Areas of Expertise"
                  value={trainer.areas_of_expertise || []}
                  onChange={(value) => handleFieldChange('areas_of_expertise', value)}
                  disabled={!isEditingOther}
                  placeholder="Type and press Enter to add expertise area"
                  helperText="e.g., Leadership, Communication, Project Management"
                />

                <MultiSelect
                  label="Languages Spoken"
                  value={trainer.languages_spoken || []}
                  onChange={(value) => handleFieldChange('languages_spoken', value)}
                  disabled={!isEditingOther}
                  placeholder="Type and press Enter to add language"
                  helperText="e.g., English, Malay, Mandarin"
                />
              </div>
            </CardContent>
          </Card>

          <PastClientsSection
            pastClients={pastClients}
            trainerId={user?.id || ''}
            onUpdate={loadAllData}
          />
        </div>
      </TabPanel>
    </div>
  );
}

// Qualifications Section Component
function QualificationsSection({
  qualifications,
  trainerId,
  onUpdate
}: {
  qualifications: TrainerQualification[];
  trainerId: string;
  onUpdate: () => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    qualification_name: '',
    institute_name: '',
    year_awarded: new Date().getFullYear(),
    qualification_type: 'undergraduate' as TrainerQualification['qualification_type']
  });
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setFormData({
      qualification_name: '',
      institute_name: '',
      year_awarded: new Date().getFullYear(),
      qualification_type: 'undergraduate'
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await updateQualification(editingId, { ...formData, trainer_id: trainerId });
      } else {
        await createQualification({ ...formData, trainer_id: trainerId });
      }
      resetForm();
      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save qualification');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (qual: TrainerQualification) => {
    setFormData({
      qualification_name: qual.qualification_name,
      institute_name: qual.institute_name,
      year_awarded: qual.year_awarded,
      qualification_type: qual.qualification_type
    });
    setEditingId(qual.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this qualification?')) return;
    try {
      await deleteQualificationWithTrainerId(trainerId, id);
      onUpdate();
    } catch (error) {
      alert('Failed to delete qualification');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Qualifications</h2>
          </div>
          {!isAdding && (
            <Button variant="primary" onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Qualification
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">
              {editingId ? 'Edit Qualification' : 'Add New Qualification'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Qualification Name"
                value={formData.qualification_name}
                onChange={(e) => setFormData({ ...formData, qualification_name: e.target.value })}
                placeholder="e.g., Bachelor of Science"
                required
              />
              <Input
                label="Institute Name"
                value={formData.institute_name}
                onChange={(e) => setFormData({ ...formData, institute_name: e.target.value })}
                placeholder="e.g., University of Malaya"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year Awarded</label>
                <select
                  value={formData.year_awarded}
                  onChange={(e) => setFormData({ ...formData, year_awarded: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {getYearOptions().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.qualification_type}
                  onChange={(e) => setFormData({ ...formData, qualification_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="postgraduate">Postgraduate (PhD, Masters)</option>
                  <option value="undergraduate">Undergraduate (Bachelor's)</option>
                  <option value="academic">Academic (Certificates, Diplomas)</option>
                  <option value="professional">Professional (Certifications)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {qualifications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No qualifications added yet</p>
          ) : (
            qualifications.map(qual => (
              <div key={qual.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {formatQualificationType(qual.qualification_type)}
                      </span>
                      <span className="text-sm text-gray-500">{qual.year_awarded}</span>
                    </div>
                    <h4 className="font-medium text-gray-900">{qual.qualification_name}</h4>
                    <p className="text-sm text-gray-600">{qual.institute_name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleEdit(qual)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={() => handleDelete(qual.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Work History Section Component
function WorkHistorySection({
  workHistory,
  trainerId,
  onUpdate
}: {
  workHistory: TrainerWorkHistory[];
  trainerId: string;
  onUpdate: () => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    position: '',
    year_from: new Date().getFullYear() - 5,
    year_to: new Date().getFullYear()
  });
  const [saving, setSaving] = useState(false);
  const [canAdd, setCanAdd] = useState(true);

  useEffect(() => {
    checkLimit();
  }, [workHistory]);

  const checkLimit = async () => {
    const allowed = await validateWorkHistoryLimit(trainerId);
    setCanAdd(allowed);
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      position: '',
      year_from: new Date().getFullYear() - 5,
      year_to: new Date().getFullYear()
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await updateWorkHistory(editingId, { ...formData, trainer_id: trainerId });
      } else {
        await createWorkHistory({ ...formData, trainer_id: trainerId });
      }
      resetForm();
      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save work history');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (work: TrainerWorkHistory) => {
    setFormData({
      company_name: work.company_name,
      position: work.position,
      year_from: work.year_from,
      year_to: work.year_to
    });
    setEditingId(work.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this work history entry?')) return;
    try {
      await deleteWorkHistoryWithTrainerId(trainerId, id);
      onUpdate();
    } catch (error) {
      alert('Failed to delete work history');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Work History <span className="text-sm text-gray-500">({workHistory.length}/5)</span>
            </h2>
          </div>
          {!isAdding && (
            <Button variant="primary" onClick={() => setIsAdding(true)} disabled={!canAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Work History
            </Button>
          )}
        </div>
        {!canAdd && (
          <p className="text-sm text-amber-600 mt-2">Maximum 5 work history entries reached</p>
        )}
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">
              {editingId ? 'Edit Work History' : 'Add Work History'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
              />
              <Input
                label="Position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Year</label>
                <select
                  value={formData.year_from}
                  onChange={(e) => setFormData({ ...formData, year_from: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {getYearOptions().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Year</label>
                <select
                  value={formData.year_to}
                  onChange={(e) => setFormData({ ...formData, year_to: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {getYearOptions().filter(y => y >= formData.year_from).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {workHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No work history added yet</p>
          ) : (
            workHistory.map(work => (
              <div key={work.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{work.position}</h4>
                    <p className="text-sm text-gray-600">{work.company_name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {work.year_from} - {work.year_to} ({calculateDuration(work.year_from, work.year_to)})
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleEdit(work)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={() => handleDelete(work.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
