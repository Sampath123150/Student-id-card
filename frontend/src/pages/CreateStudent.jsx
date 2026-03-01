import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, Save, CheckCircle } from 'lucide-react';
import IDCardTemplates from '../components/IDCardTemplates';

// Auto-select template based on institution type
const getRecommendedTemplate = (type) => {
    switch (type) {
        case 'School': return 'Standard';
        case 'College': return 'Vertical';
        case 'University': return 'Smart';
        case 'Corporate': return 'Smart';
        default: return 'Standard';
    }
};

const CreateStudent = () => {
    const [formData, setFormData] = useState({
        name: '',
        roll_no: '',
        class_name: '',
        department: '',
        institution_type: 'College'
    });

    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const [templateType, setTemplateType] = useState('Vertical');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Handle Input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-update template recommendation
        if (name === 'institution_type') {
            setTemplateType(getRecommendedTemplate(value));
        }
    };

    // Handle Photo Upload
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    // Drag and Drop handlers
    const onDragOver = (e) => {
        e.preventDefault();
    }

    const onDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
            setError('');
        } else {
            setError('Please upload a valid image file.');
        }
    }

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!photo) {
            setError('Please upload a student photograph.');
            return;
        }

        setLoading(true);
        setError('');

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            submitData.append(key, formData[key]);
        });
        submitData.append('photo', photo);

        try {
            await axios.post('/api/students', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccess(true);
            // Reset after 3 seconds
            setTimeout(() => {
                setSuccess(false);
                setFormData({
                    name: '', roll_no: '', class_name: '', department: '', institution_type: 'College'
                });
                setPhoto(null);
                setPhotoPreview('');
            }, 3000);

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create student ID.');
        } finally {
            setLoading(false);
        }
    };

    // Preview object for the ID Card Template
    const previewStudent = {
        ...formData,
        photo_url: photoPreview || 'https://via.placeholder.com/150',
        // Fallbacks for empty forms
        name: formData.name || 'Student Name',
        roll_no: formData.roll_no || 'ID-000',
        class_name: formData.class_name || 'Class/Year',
        department: formData.department || 'Department',
        institution_type: formData.institution_type
    };

    return (
        <div className="create-student-page">
            <h1 className="page-title">Generate ID Card</h1>
            <p className="page-subtitle">Fill in student details to generate a beautiful ID card instantly.</p>

            <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1fr', gap: '3rem' }}>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="glass-panel">
                    {error && <div className="error-message" style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

                    <div className="form-group">
                        <label className="form-label">Institution Type</label>
                        <select
                            name="institution_type"
                            value={formData.institution_type}
                            onChange={handleInputChange}
                            className="form-select"
                        >
                            <option value="School">School</option>
                            <option value="College">College</option>
                            <option value="University">University</option>
                            <option value="Corporate">Corporate</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text" name="name"
                                value={formData.name} onChange={handleInputChange}
                                className="form-input" placeholder="John Doe" required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Roll / ID Number</label>
                            <input
                                type="text" name="roll_no"
                                value={formData.roll_no} onChange={handleInputChange}
                                className="form-input" placeholder="CS-2024-001" required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Class / Year</label>
                            <input
                                type="text" name="class_name"
                                value={formData.class_name} onChange={handleInputChange}
                                className="form-input" placeholder="3rd Year" required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <input
                                type="text" name="department"
                                value={formData.department} onChange={handleInputChange}
                                className="form-input" placeholder="Computer Science" required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Student Photograph</label>
                        <div
                            className="file-upload-wrapper"
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                            onClick={() => document.getElementById('photo-upload').click()}
                        >
                            {photoPreview ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <img src={photoPreview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%', marginBottom: '0.5rem' }} />
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click to change</span>
                                </div>
                            ) : (
                                <>
                                    <UploadCloud size={32} className="upload-icon" />
                                    <p>Drag & drop or Click to upload</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>PNG, JPG up to 5MB</p>
                                </>
                            )}
                            <input
                                type="file"
                                id="photo-upload"
                                className="file-input"
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={loading || success}>
                        {loading ? <span className="loader"></span> : success ? <><CheckCircle size={18} /> Generated Successfully</> : <><Save size={18} /> Generate ID Card</>}
                    </button>
                </form>

                {/* Preview Section */}
                <div className="preview-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="template-selector" style={{ display: 'flex', gap: '1rem', background: 'var(--surface)', padding: '0.5rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                        {['Standard', 'Vertical', 'Smart'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setTemplateType(type)}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    background: templateType === type ? 'var(--primary)' : 'transparent',
                                    color: templateType === type ? 'white' : 'var(--text)',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="preview-container glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '550px' }}>
                        <IDCardTemplates student={previewStudent} templateType={templateType} />
                    </div>

                </div>

            </div>
        </div>
    );
};

export default CreateStudent;
