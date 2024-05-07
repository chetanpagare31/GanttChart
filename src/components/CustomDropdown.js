import React, { useState, useEffect, useRef } from 'react';
import './CustomDropdown.css';

const CustomDropdown = ({ value, options, onChange }) => {
    const [showOptions, setShowOptions] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowOptions(false); 
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleOptionClick = (option) => {
        onChange(option);
        setShowOptions(false);
    };

    const toggleDropdown = () => {
        setShowOptions(!showOptions);
    };

    return (
        <div className="custom-dropdown" ref={dropdownRef}>
            <div className="selected-option" onClick={toggleDropdown}>
                {value ? value : 'Select'}
            </div>
            {showOptions && (
                <div className="options-container">
                    {options.map((option) => (
                        <div
                            key={option}
                            className="option"
                            onClick={() => handleOptionClick(option)}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
