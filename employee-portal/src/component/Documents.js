import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    file: null
  });
  const employee = JSON.parse(localStorage.getItem('employee') || '{}');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await employeeAPI.getDocuments();
      setDocuments(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      file: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.file) {
      setMessage('Please provide both title and file');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('document_type', formData.title);
    formDataToSend.append('document', formData.file);

    setUploading(true);
    try {
      await employeeAPI.uploadDocument(formDataToSend);
      setMessage('Document uploaded successfully!');
      setFormData({ title: '', file: null });
      setShowForm(false);
      fetchDocuments();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error uploading document: ' + (error.response?.data?.error || error.message));
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await employeeAPI.deleteDocument(id);
        setMessage('Document deleted successfully!');
        fetchDocuments();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Error deleting document: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  if (loading) return <div className="loading">Loading documents...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>My Documents</h2>
        <p>Employee ID: {employee.employee_id}</p>
      </div>

      {message && <div className={message.includes('successfully') ? 'success' : 'error'}>{message}</div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Upload Document</h3>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Upload Document'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
            <div className="form-group">
              <label>Document Type</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Passport, Driving License, Certificate, Aadhar Card"
                required
              />
            </div>
            <div className="form-group">
              <label>Choose File</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                required
              />
              <small style={{ color: '#7f8c8d' }}>Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB)</small>
            </div>
            <button type="submit" className="btn btn-success" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
        )}
      </div>

      <div className="card">
        <h3>My Documents</h3>
        {documents.length === 0 ? (
          <p style={{ color: '#7f8c8d' }}>No documents uploaded yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th>File Name</th>
                  <th>File Size</th>
                  <th>Upload Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.document_type || 'N/A'}</td>
                    <td>{doc.document_name || 'N/A'}</td>
                    <td>{doc.file_size ? `${(doc.file_size / 1024).toFixed(2)} KB` : 'N/A'}</td>
                    <td>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-IN') : 'N/A'}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => handleDelete(doc.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
