import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const employee = JSON.parse(localStorage.getItem('employee') || '{}');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await employeeAPI.getProfile();
      setProfile(response.data);
      setFormData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await employeeAPI.updateProfile(formData);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating profile: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>My Profile</h2>
        <p>Employee ID: {employee.employee_id}</p>
      </div>

      {message && <div className={message.includes('successfully') ? 'success' : 'error'}>{message}</div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Personal Information</h3>
          <button 
            className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {!isEditing ? (
          <div className="info-grid">
            <div className="info-item">
              <strong>First Name:</strong>
              <p>{profile?.first_name}</p>
            </div>
            <div className="info-item">
              <strong>Last Name:</strong>
              <p>{profile?.last_name}</p>
            </div>
            <div className="info-item">
              <strong>Email:</strong>
              <p>{profile?.email}</p>
            </div>
            <div className="info-item">
              <strong>Phone:</strong>
              <p>{profile?.phone || 'Not provided'}</p>
            </div>
            <div className="info-item">
              <strong>Gender:</strong>
              <p>{profile?.gender || 'Not specified'}</p>
            </div>
            <div className="info-item">
              <strong>Designation:</strong>
              <p>{profile?.designation}</p>
            </div>
            <div className="info-item">
              <strong>Department:</strong>
              <p>{profile?.department}</p>
            </div>
            <div className="info-item">
              <strong>Hire Date:</strong>
              <p>{profile?.hire_date ? new Date(profile.hire_date).toLocaleDateString('en-IN') : 'N/A'}</p>
            </div>
            <div className="info-item">
              <strong>Address:</strong>
              <p>{profile?.address || 'Not provided'}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success">Save Changes</button>
          </form>
        )}
      </div>

      <div className="card">
        <h3>Bank Details</h3>
        {!isEditing ? (
          <div className="info-grid">
            <div className="info-item">
              <strong>Bank Name:</strong>
              <p>{profile?.bank_name || 'Not provided'}</p>
            </div>
            <div className="info-item">
              <strong>Account Number:</strong>
              <p>{profile?.account_number ? '****' + profile.account_number.slice(-4) : 'Not provided'}</p>
            </div>
            <div className="info-item">
              <strong>IFSC Code:</strong>
              <p>{profile?.ifsc_code || 'Not provided'}</p>
            </div>
            <div className="info-item">
              <strong>PAN Number:</strong>
              <p>{profile?.pan_number || 'Not provided'}</p>
            </div>
          </div>
        ) : (
          <div className="form-row">
            <div className="form-group">
              <label>Bank Name</label>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                name="account_number"
                value={formData.account_number || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>IFSC Code</label>
              <input
                type="text"
                name="ifsc_code"
                value={formData.ifsc_code || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>PAN Number</label>
              <input
                type="text"
                name="pan_number"
                value={formData.pan_number || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
