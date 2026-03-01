import React, { forwardRef } from 'react';
import './IDCardTemplates.css';

const IDCardTemplates = forwardRef(({ student, templateType }, ref) => {
    if (!student) return null;

    const { name, roll_no, class_name, department, institution_type, photo_url } = student;

    // Decide layout class based on templateType
    const layoutClass = `id-card template-${templateType.toLowerCase()}`;

    // Base URLs
    const imageUrl = photo_url.startsWith('blob:') ? photo_url : `http://localhost:3000${photo_url}`;

    return (
        <div className="id-card-wrapper" ref={ref}>
            <div className={layoutClass}>
                {/* Header Section */}
                <div className="card-header">
                    <h2 className="institution-name">Nexus {institution_type}</h2>
                    <p className="tagline">Excellence in Education</p>
                </div>

                {/* Body Section */}
                <div className="card-body">
                    <div className="photo-container">
                        <img src={imageUrl} alt={name} className="student-photo" crossOrigin="anonymous" />
                    </div>

                    <div className="student-details">
                        <h3 className="student-name">{name}</h3>
                        <p className="student-dept">{department}</p>

                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">ID NO</span>
                                <span className="info-value">{roll_no}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">CLASS</span>
                                <span className="info-value">{class_name}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="card-footer">
                    <div className="barcode-placeholder">
                        {/* Simple CSS Barcode simulation */}
                        <div className="barcode-bars"></div>
                    </div>
                    <p className="validity">Valid till: 2027</p>
                </div>
            </div>
        </div>
    );
});

export default IDCardTemplates;
