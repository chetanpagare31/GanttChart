import React from 'react';
import './App.css';
import TaskList from './components/TaskList';
import Navigation from './components/Navigation';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import GanttChart from './components/GanttChart';

function App() {
  return (
    <div className="App" style={{ margin: 0, padding: 0 }}>
      <Router>

        <Navigation />
        <Routes>
          <Route path="/" element={<TaskList />} />
          <Route path="/gantt-chart" element={<GanttChart />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
