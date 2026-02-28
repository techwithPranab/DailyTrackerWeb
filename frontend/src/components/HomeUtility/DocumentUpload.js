'use client';

import { useState, useRef } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const DOC_TYPES = ['Warranty', 'Manual', 'Invoice', 'ServiceReport', 'Other'];

const isImage = (url) => /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url);

export default function DocumentUpload({ utilityId, documents = [], onUpdated }) {
  const [docName,    setDocName]    = useState('');
  const [docType,    setDocType]    = useState('Other');
  const [file,       setFile]       = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [deleting,   setDeleting]   = useState(null);
  const fileRef = useRef();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please choose a file'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('name', docName || file.name);
      fd.append('type', docType);

      // Use axios with multipart header override
      const { data } = await api.post(`/utilities/${utilityId}/documents`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Document uploaded');
      setDocName(''); setDocType('Other'); setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      onUpdated(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Delete this document?')) return;
    setDeleting(docId);
    try {
      const { data } = await api.delete(`/utilities/${utilityId}/documents/${docId}`);
      toast.success('Document deleted');
      onUpdated(data.data);
    } catch {
      toast.error('Failed to delete document');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      {/* Upload form */}
      <form onSubmit={handleUpload} className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">📎 Upload Document</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <input
            type="text"
            value={docName}
            onChange={e => setDocName(e.target.value)}
            placeholder="Document name (optional)"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select value={docType} onChange={e => setDocType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={e => setFile(e.target.files[0] || null)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 file:mr-2 file:text-xs file:border-0 file:bg-blue-50 file:text-blue-700 file:rounded file:px-2 file:py-1 cursor-pointer"
          />
        </div>
        {file && (
          <p className="text-xs text-gray-500 mb-2">
            Selected: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
        <button type="submit" disabled={uploading || !file}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {uploading ? 'Uploading…' : '⬆ Upload'}
        </button>
      </form>

      {/* Document list */}
      {documents.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No documents uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {documents.map(doc => (
            <li key={doc._id}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3">
              {/* Thumbnail or icon */}
              {isImage(doc.cloudinaryUrl) ? (
                <img src={doc.cloudinaryUrl} alt={doc.name}
                  className="h-10 w-10 object-cover rounded border border-gray-200 flex-shrink-0" />
              ) : (
                <div className="h-10 w-10 flex items-center justify-center bg-red-50 rounded border border-red-100 flex-shrink-0 text-xl">
                  📄
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                <p className="text-xs text-gray-400">{doc.type} · {new Date(doc.uploadedAt).toLocaleDateString()}</p>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <a href={doc.cloudinaryUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded border border-blue-100 hover:bg-blue-50">
                  View
                </a>
                <button
                  onClick={() => handleDelete(doc._id)}
                  disabled={deleting === doc._id}
                  className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded border border-red-100 hover:bg-red-50 disabled:opacity-50">
                  {deleting === doc._id ? '…' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
