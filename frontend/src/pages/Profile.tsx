import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Weight, Ruler, Target, Calendar, Edit2, Save, X } from 'lucide-react';
import EnhancedButton from '../components/EnhancedButton';
import './Profile.css';

interface UserProfile {
  age: number | null;
  weightKg: number | null;
  heightCm: number | null;
  fitnessGoal: string;
  activityLevel: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [profile, setProfile] = useState<UserProfile>({
    age: null,
    weightKg: null,
    heightCm: null,
    fitnessGoal: '',
    activityLevel: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editProfile, setEditProfile] = useState<UserProfile>({ ...profile });

  useEffect(() => {
    // Load user profile data
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // Mock data - replace with actual API call
      setProfile({
        age: 25,
        weightKg: 70,
        heightCm: 175,
        fitnessGoal: 'muscle_gain',
        activityLevel: 'moderate'
      });
      setEditProfile({
        age: 25,
        weightKg: 70,
        heightCm: 175,
        fitnessGoal: 'muscle_gain',
        activityLevel: 'moderate'
      });
    } catch (error) {
      showError('Failed to load profile data');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save profile data to backend
      setProfile({ ...editProfile });
      setIsEditing(false);
      showSuccess('Profile updated successfully! 💪');
    } catch (error) {
      showError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditProfile({ ...profile });
    setIsEditing(false);
  };

  const calculateBMI = () => {
    if (profile.weightKg && profile.heightCm) {
      const heightM = profile.heightCm / 100;
      return (profile.weightKg / (heightM * heightM)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-title">
          <User className="title-icon" />
          <h1>My Profile</h1>
        </div>
        {!isEditing && (
          <EnhancedButton
            variant="secondary"
            size="sm"
            icon={Edit2}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </EnhancedButton>
        )}
      </div>

      <div className="profile-content">
        {/* User Info Card */}
        <div className="profile-card">
          <div className="user-info">
            <div className="user-avatar">
              {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <h2>{user?.firstName} {user?.lastName}</h2>
              <p>{user?.email}</p>
              <span className="member-since">Member since 2024</span>
            </div>
          </div>
        </div>

        {/* Physical Stats */}
        <div className="stats-section">
          <h3>Physical Stats</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Calendar size={24} />
              </div>
              <div className="stat-info">
                <label>Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editProfile.age || ''}
                    onChange={(e) => setEditProfile({ ...editProfile, age: parseInt(e.target.value) || null })}
                    className="stat-input"
                  />
                ) : (
                  <span>{profile.age || 'Not set'}</span>
                )}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Weight size={24} />
              </div>
              <div className="stat-info">
                <label>Weight</label>
                {isEditing ? (
                  <div className="input-group">
                    <input
                      type="number"
                      value={editProfile.weightKg || ''}
                      onChange={(e) => setEditProfile({ ...editProfile, weightKg: parseFloat(e.target.value) || null })}
                      className="stat-input"
                    />
                    <span className="unit">kg</span>
                  </div>
                ) : (
                  <span>{profile.weightKg ? `${profile.weightKg} kg` : 'Not set'}</span>
                )}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Ruler size={24} />
              </div>
              <div className="stat-info">
                <label>Height</label>
                {isEditing ? (
                  <div className="input-group">
                    <input
                      type="number"
                      value={editProfile.heightCm || ''}
                      onChange={(e) => setEditProfile({ ...editProfile, heightCm: parseFloat(e.target.value) || null })}
                      className="stat-input"
                    />
                    <span className="unit">cm</span>
                  </div>
                ) : (
                  <span>{profile.heightCm ? `${profile.heightCm} cm` : 'Not set'}</span>
                )}
              </div>
            </div>

            {calculateBMI() && (
              <div className="stat-card bmi-card">
                <div className="stat-icon">
                  <Target size={24} />
                </div>
                <div className="stat-info">
                  <label>BMI</label>
                  <span className="bmi-value">{calculateBMI()}</span>
                  <span className={`bmi-category ${getBMICategory(parseFloat(calculateBMI()!)).toLowerCase()}`}>
                    {getBMICategory(parseFloat(calculateBMI()!))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fitness Goals */}
        <div className="goals-section">
          <h3>Fitness Goals</h3>
          <div className="goals-grid">
            <div className="goal-card">
              <label>Fitness Goal</label>
              {isEditing ? (
                <select
                  value={editProfile.fitnessGoal}
                  onChange={(e) => setEditProfile({ ...editProfile, fitnessGoal: e.target.value })}
                  className="goal-select"
                >
                  <option value="">Select goal</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="endurance">Improve Endurance</option>
                  <option value="strength">Build Strength</option>
                  <option value="general">General Fitness</option>
                </select>
              ) : (
                <span>{profile.fitnessGoal ? profile.fitnessGoal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not set'}</span>
              )}
            </div>

            <div className="goal-card">
              <label>Activity Level</label>
              {isEditing ? (
                <select
                  value={editProfile.activityLevel}
                  onChange={(e) => setEditProfile({ ...editProfile, activityLevel: e.target.value })}
                  className="goal-select"
                >
                  <option value="">Select level</option>
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light Activity</option>
                  <option value="moderate">Moderate Activity</option>
                  <option value="active">Very Active</option>
                  <option value="extra_active">Extra Active</option>
                </select>
              ) : (
                <span>{profile.activityLevel ? profile.activityLevel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not set'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className="edit-actions">
            <EnhancedButton
              variant="secondary"
              size="md"
              icon={X}
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </EnhancedButton>
            <EnhancedButton
              variant="gradient"
              size="md"
              icon={Save}
              onClick={handleSave}
              loading={loading}
              disabled={loading}
            >
              Save Changes
            </EnhancedButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
