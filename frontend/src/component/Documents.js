import React, { useState, useEffect, useCallback } from 'react';
import { employeeAPI } from '../services/api';

const DOWNLOAD_BASE = 'http://localhost:5000';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  useEffect(() => {
    fetchDocuments();
  }, []);

  const filterDocuments = useCallback(() => {
    let filtered = documents.filter(doc => {
      const matchesSearch = 
        (doc.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (doc.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (doc.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (doc.document_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
      const matchesEmployee = employeeFilter === 'all' || doc.employee_id === employeeFilter;
      
      return matchesSearch && matchesEmployee;
    });
    setFilteredDocuments(filtered);
  }, [documents, employeeFilter, searchTerm]);

  useEffect(() => {
    filterDocuments();
  }, [filterDocuments]);

  const fetchDocuments = async () => {
    try {
      const response = await employeeAPI.getAllDocuments();
      setDocuments(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setLoading(false);
    }
  };

  const handleDownload = (doc) => {
    const cleanPath = doc.file_path?.startsWith('/') ? doc.file_path : `/${doc.file_path || ''}`;
    const url = `${DOWNLOAD_BASE}${cleanPath}`;
    window.open(url, '_blank');
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.document_name}"?`)) {
      return;
    }

    try {
      await employeeAPI.deleteDocument(doc.id);
      alert('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  if (loading) return <div className="loading">Loading documents...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Employee Documents</h2>
      </div>

      <div className="card">
        <div className="filter-section" style={{ marginBottom: '20px' }}>
          <input 
            type="text"
            placeholder="Search by employee name, ID, or document name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd',
              marginRight: '10px',
              flex: 1
            }}
          />
          <select 
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd'
            }}
          >
            <option value="all">All Employees</option>
            {[...new Set(documents.map(d => d.employee_id))].sort().map(empId => {
              const emp = documents.find(d => d.employee_id === empId);
              return (
                <option key={empId} value={empId}>
                  {emp.first_name} {emp.last_name} ({empId})
                </option>
              );
            })}
          </select>
        </div>

        <p style={{ color: '#666', marginBottom: '10px' }}>Showing {filteredDocuments.length} of {documents.length} documents</p>

        {filteredDocuments.length === 0 ? (
          <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '20px' }}>No documents found.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Document Name</th>
                  <th>Document Type</th>
                  <th>File Size</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.first_name} {doc.last_name}</td>
                    <td>{doc.employee_id}</td>
                    <td>{doc.document_name}</td>
                    <td>{doc.document_type || 'N/A'}</td>
                    <td>{doc.file_size ? `${(doc.file_size / 1024).toFixed(2)} KB` : 'N/A'}</td>
                    <td>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-IN') : 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleDownload(doc)}
                        >
                          Download
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(doc)}
                        >
                          Delete
                        </button>
                      </div>
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
