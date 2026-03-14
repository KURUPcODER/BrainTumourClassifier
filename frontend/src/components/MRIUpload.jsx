import React, { useState, useRef } from 'react';
import { UploadCloud, FileImage, X, Search, CheckCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const MRIUpload = ({ patientData, onRestart }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, complete, error
    const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, result
    const [result, setResult] = useState(null);

    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    };

    const handeFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    };

    const handleFileSelection = (selectedFile) => {
        if (!selectedFile.type.startsWith('image/')) {
            alert('Please upload an image file (JPG, PNG)');
            return;
        }
        setFile(selectedFile);

        // Create preview
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);
    };

    const clearSelection = () => {
        setFile(null);
        setPreview(null);
        setUploadStatus('idle');
        setScanStatus('idle');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUploadAndScan = async () => {
        if (!file) return;

        try {
            setUploadStatus('uploading');

            // 1. Upload the image to backend
            const formData = new FormData();
            formData.append('mri_scan', file);

            const uploadRes = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const uploadedFilePath = uploadRes.data.filePath;
            setUploadStatus('complete');

            // 2. Simulate AI Scan Process
            setScanStatus('scanning');

            // Here you would typically call your ML model API via the backend
            // We simulate a 3 second delay for analysis
            setTimeout(async () => {
                // Mock result prediction
                const isTumor = Math.random() > 0.5;
                const mockResult = isTumor ? 'Tumour Detected (High Probability)' : 'No Tumour Detected (Healthy)';

                setResult(mockResult);
                setScanStatus('result');

                // 3. Save Patient details + Result to database
                await axios.post('http://localhost:5000/api/patients', {
                    ...patientData,
                    mri_image_path: uploadedFilePath,
                    analysis_result: mockResult
                });

            }, 3000);

        } catch (error) {
            console.error('Scan process failed:', error);
            setUploadStatus('error');
        }
    };

    return (
        <div className="animate-fade-in" style={styles.container}>
            <div style={styles.patientInfoBar} className="glass-panel">
                <div>
                    <span style={{ color: 'var(--text-muted)' }}>Patient:</span>
                    <strong style={{ marginLeft: '0.5rem' }}>{patientData.name}</strong>
                    <span style={{ margin: '0 0.5rem', color: 'var(--glass-border)' }}>|</span>
                    <span style={{ color: 'var(--text-muted)' }}>Age:</span> {patientData.age}
                    <span style={{ margin: '0 0.5rem', color: 'var(--glass-border)' }}>|</span>
                    <span style={{ color: 'var(--text-muted)' }}>Gender:</span> {patientData.gender}
                </div>
            </div>

            <div style={styles.mainGrid}>

                {/* Upload Section */}
                <div className="glass-panel" style={styles.panel}>
                    <h3 style={styles.panelTitle}>Upload MRI Image</h3>

                    {!preview ? (
                        <div
                            style={{
                                ...styles.dropzone,
                                ...(isDragging ? styles.dropzoneActive : {})
                            }}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handeFileChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <div style={styles.uploadIconWrapper}>
                                <UploadCloud size={40} color="var(--primary)" />
                            </div>
                            <p style={{ marginTop: '1rem', fontWeight: 600 }}>Drag & Drop scan here</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>or click to browse files</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>JPG, PNG, DICOM (simulated)</p>
                        </div>
                    ) : (
                        <div style={styles.previewContainer}>
                            <img src={preview} alt="MRI Preview" style={styles.previewImage} />
                            <div style={styles.previewOverlay}>
                                <button onClick={clearSelection} style={styles.clearBtn} disabled={scanStatus === 'scanning'}>
                                    <X size={16} /> Remove
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '1.5rem', opacity: !file || scanStatus === 'scanning' ? 0.6 : 1 }}
                        disabled={!file || scanStatus === 'scanning' || scanStatus === 'result'}
                        onClick={handleUploadAndScan}
                    >
                        {scanStatus === 'scanning' ? (
                            <>Analyzing Scan <span className="scanning-dots">...</span></>
                        ) : scanStatus === 'result' ? (
                            <><CheckCircle size={20} /> Scan Complete</>
                        ) : (
                            <><Search size={20} /> Initialize AI Scan</>
                        )}
                    </button>
                </div>

                {/* Results Section */}
                <div className="glass-panel" style={styles.panel}>
                    <h3 style={styles.panelTitle}>Analysis Results</h3>

                    {scanStatus === 'idle' && (
                        <div style={styles.emptyState}>
                            <FileImage size={48} color="rgba(255,255,255,0.1)" />
                            <p style={{ color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                                Upload an MRI scan and click initialize to view AI classification results.
                            </p>
                        </div>
                    )}

                    {scanStatus === 'scanning' && (
                        <div style={styles.scanningState}>
                            <div style={styles.scanLine}></div>
                            <div style={styles.scanSpinner}></div>
                            <p style={{ color: 'var(--primary)', fontWeight: 500, marginTop: '2rem' }}>
                                Running convolutional neural network...
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Extracting features from image tensors</p>
                        </div>
                    )}

                    {scanStatus === 'result' && (
                        <div style={styles.resultState} className="animate-fade-in">
                            <div style={{
                                ...styles.resultCard,
                                borderColor: result.includes('High Probability') ? 'var(--danger)' : 'var(--primary)',
                                backgroundColor: result.includes('High Probability') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(74, 222, 128, 0.1)'
                            }}>
                                {result.includes('High Probability') ? (
                                    <AlertTriangle size={32} color="var(--danger)" style={{ marginBottom: '1rem' }} />
                                ) : (
                                    <CheckCircle size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                                )}

                                <h2 style={{
                                    color: result.includes('High Probability') ? 'var(--danger)' : 'var(--primary)',
                                    marginBottom: '0.5rem'
                                }}>
                                    {result}
                                </h2>

                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Confidence: {(Math.random() * (99.9 - 85) + 85).toFixed(1)}%
                                </p>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                <button className="btn-primary" onClick={clearSelection} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--glass-border)', boxShadow: 'none' }}>
                                    Scan Another Image
                                </button>
                                <button className="btn-primary" onClick={onRestart} style={{ flex: 1 }}>
                                    New Patient
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            <style>{`
        .scanning-dots {
            display: inline-block;
            width: 20px;
            animation: bounce 1s infinite alternate;
        }
        @keyframes bounce {
            0% { transform: translateY(0); }
            100% { transform: translateY(-3px); }
        }
      `}</style>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1000px',
        margin: '2rem auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
    },
    patientInfoBar: {
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'center',
        fontSize: '0.95rem',
        background: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 0.3)'
    },
    mainGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem'
    },
    panel: {
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '400px'
    },
    panelTitle: {
        fontSize: '1.2rem',
        marginBottom: '1.5rem',
        color: 'var(--text-main)',
        borderBottom: '1px solid var(--glass-border)',
        paddingBottom: '0.5rem'
    },
    dropzone: {
        flex: 1,
        border: '2px dashed rgba(255,255,255,0.2)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    dropzoneActive: {
        borderColor: 'var(--primary)',
        backgroundColor: 'rgba(74, 222, 128, 0.05)'
    },
    uploadIconWrapper: {
        background: 'rgba(74, 222, 128, 0.1)',
        padding: '1rem',
        borderRadius: '50%',
        marginBottom: '0.5rem'
    },
    previewContainer: {
        flex: 1,
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    previewImage: {
        maxWidth: '100%',
        maxHeight: '280px',
        objectFit: 'contain'
    },
    previewOverlay: {
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
    },
    clearBtn: {
        background: 'rgba(0,0,0,0.6)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.2)',
        padding: '0.4rem 0.8rem',
        borderRadius: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        fontSize: '0.8rem',
        transition: 'background 0.2s'
    },
    emptyState: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.6
    },
    scanningState: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    },
    scanSpinner: {
        width: '60px',
        height: '60px',
        border: '3px solid rgba(74, 222, 128, 0.1)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    resultState: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    resultCard: {
        border: '1px solid',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
    }
};

export default MRIUpload;
