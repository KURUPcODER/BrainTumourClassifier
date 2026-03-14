import React, { useState } from 'react';
import { User, Activity } from 'lucide-react';

const PatientForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male'
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name) return alert('Patient Name is required');
        onSubmit(formData);
    };

    return (
        <div className="glass-panel animate-fade-in" style={styles.formContainer}>
            <div style={styles.header}>
                <User size={32} color="var(--primary)" />
                <h2 style={styles.title}>Patient Details</h2>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Patient Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="E.g., John Doe"
                        className="glass-input"
                        required
                    />
                </div>

                <div style={styles.row}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Age</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            placeholder="Years"
                            className="glass-input"
                            min="0"
                            max="120"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="glass-input"
                            style={{ paddingRight: '2.5rem', appearance: 'none' }}
                        >
                            <option value="Male" style={{ color: 'black' }}>Male</option>
                            <option value="Female" style={{ color: 'black' }}>Female</option>
                            <option value="Other" style={{ color: 'black' }}>Other</option>
                        </select>
                    </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                    <Activity size={20} />
                    Proceed to Scan Upload
                </button>
            </form>
        </div>
    );
};

const styles = {
    formContainer: {
        maxWidth: '500px',
        margin: '4rem auto',
        padding: '2.5rem',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
    },
    title: {
        fontSize: '1.8rem',
        margin: 0,
        color: 'var(--text-main)'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
    },
    row: {
        display: 'flex',
        gap: '1rem'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flex: 1
    },
    label: {
        fontSize: '0.9rem',
        color: 'var(--text-muted)',
        fontWeight: 500
    }
};

export default PatientForm;
