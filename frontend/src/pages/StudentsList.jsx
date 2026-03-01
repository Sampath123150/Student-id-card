import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Trash2, Download, Search, AlertCircle } from 'lucide-react';
import IDCardTemplates from '../components/IDCardTemplates';
import html2canvas from 'html2canvas';

const StudentsList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Track template view mode per student, default based on type
    const [templateModes, setTemplateModes] = useState({});
    const cardRefs = useRef({});

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await axios.get('/api/students');
            setStudents(res.data);

            // Initialize layout templates based on institution
            const modes = {};
            res.data.forEach(s => {
                modes[s.id] = getRecommendedTemplate(s.institution_type);
            });
            setTemplateModes(modes);
        } catch (err) {
            setError('Failed to fetch students. Ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const getRecommendedTemplate = (type) => {
        switch (type) {
            case 'School': return 'Standard';
            case 'College': return 'Vertical';
            case 'University': return 'Smart';
            case 'Corporate': return 'Smart';
            default: return 'Standard';
        }
    };

    const setTemplateMode = (id, type) => {
        setTemplateModes(prev => ({ ...prev, [id]: type }));
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}? This will securely backup the photo to /backups and then delete the record.`)) {
            try {
                await axios.delete(`/api/students/${id}`);
                setStudents(prev => prev.filter(s => s.id !== id));
            } catch (err) {
                alert('Failed to delete student.');
            }
        }
    };

    const handleDownload = async (id, name) => {
        const cardElement = cardRefs.current[id];
        if (cardElement) {
            try {
                const canvas = await html2canvas(cardElement, {
                    scale: 3, // High resolution
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: null // Transparent background
                });

                const image = canvas.toDataURL("image/png");
                const link = document.createElement('a');
                link.href = image;
                link.download = `${name.replace(/\s+/g, '_')}_IDCard.png`;
                link.click();
            } catch (err) {
                console.error("Error generating image:", err);
                alert("Failed to download image.");
            }
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="students-list-page">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>All Rendered IDs</h1>
                    <p className="page-subtitle" style={{ marginBottom: '0' }}>Manage and download student ID cards.</p>
                </div>

                <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', width: '300px' }}>
                    <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                    <input
                        type="text"
                        placeholder="Search by name, ID, or Dept..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text)', outline: 'none', width: '100%' }}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center mt-8"><span className="loader"></span></div>
            ) : error ? (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '1rem', borderRadius: '0.5rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={20} /> {error}
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className="glass-panel text-center mt-8">
                    <p style={{ color: 'var(--text-muted)' }}>No students found.</p>
                </div>
            ) : (
                <div className="cards-grid">
                    {filteredStudents.map(student => (
                        <div key={student.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>

                            <div className="card-controls" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(15, 23, 42, 0.5)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                                    {['Standard', 'Vertical', 'Smart'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setTemplateMode(student.id, type)}
                                            style={{
                                                padding: '0.25rem 0.5rem',
                                                fontSize: '0.75rem',
                                                border: 'none',
                                                borderRadius: '0.25rem',
                                                cursor: 'pointer',
                                                background: templateModes[student.id] === type ? 'var(--primary)' : 'transparent',
                                                color: templateModes[student.id] === type ? 'white' : 'var(--text-muted)'
                                            }}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                                <div className="actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleDownload(student.id, student.name)}
                                        className="btn btn-outline"
                                        style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                                        title="Download ID Card"
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(student.id, student.name)}
                                        className="btn btn-danger"
                                        style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                                        title="Delete Student"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Render ID Card specifically to be captured */}
                            <div
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 10px, transparent 10px, transparent 20px)',
                                    borderRadius: '0.5rem',
                                    padding: '1rem',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* We attach a ref so html2canvas can target this DOM element */}
                                <IDCardTemplates
                                    ref={el => cardRefs.current[student.id] = el}
                                    student={student}
                                    templateType={templateModes[student.id] || 'Standard'}
                                />
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentsList;
