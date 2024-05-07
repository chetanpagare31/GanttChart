import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
    return (
        <nav className="navbar">
            <ul className="nav-list">
                <li className="nav-item">
                    <Link to="/" className="nav-link">Main Table</Link>
                </li>
                <li className="nav-item">
                    <Link to="/gantt-chart" className="nav-link">Gantt Chart</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navigation;
