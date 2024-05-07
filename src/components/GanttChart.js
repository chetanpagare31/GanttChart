import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import Gantt from 'dhtmlx-gantt';
import './GanttChart.css'

const GanttChart = () => {
    const [tasks, setTasks] = useState([]);
    const [modifiedTasks, setModifiedTasks] = useState([]);

    const fetchTasks = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/task');
            const formattedTasks = response.data.map(task => ({
                id: task.id,
                text: task.item,
                start_date: new Date(task.start_date),
                end_date: new Date(task.end_date),
                duration: calculateDuration(task.start_date, task.end_date),
                progress: 0,
                status: task.status, 
            }));
            setTasks(formattedTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }, []);

    const calculateDuration = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return durationInDays;
    };

    useEffect(() => {
        const fetchAndSetTasks = async () => {
            await fetchTasks();
        };
        fetchAndSetTasks();
    }, [fetchTasks]);

    useEffect(() => {
        if (tasks.length > 0) {
            Gantt.init('gantt-container');
            Gantt.clearAll();
            Gantt.parse({ data: tasks });

            Gantt.templates.task_class = (start, end, task) => {
                const color = getStatusColor(task.status); // Get color based on task status
                return `gantt_task_${color}`;
            };

            Gantt.attachEvent('onAfterTaskUpdate', (id, task) => {
                const updatedTask = {
                    id,
                    text: task.text,
                    start_date: task.start_date,
                    end_date: task.end_date,
                    progress: task.progress || 0,
                };
                setModifiedTasks(prevModifiedTasks => {
                    const existingIndex = prevModifiedTasks.findIndex(t => t.id === id);
                    if (existingIndex !== -1) {
                        const updatedModifiedTasks = [...prevModifiedTasks];
                        updatedModifiedTasks[existingIndex] = updatedTask;
                        return updatedModifiedTasks;
                    } else {
                        return [...prevModifiedTasks, updatedTask];
                    }
                });
            });
            const currentTimeLine = document.createElement('div');
            currentTimeLine.style.cssText = `
                position: absolute;
                top: 0;
                left: ${calculateTimePosition()}px;
                width: 2px;
                height: 100%;
                background-color: red;
                pointer-events: none;
            `;
            Gantt.$task_data.appendChild(currentTimeLine);

            const updateCurrentTimeLine = () => {
                currentTimeLine.style.left = `${calculateTimePosition()}px`;
            };

            setInterval(updateCurrentTimeLine, 60000); 

            
            Gantt.attachEvent('onBeforeTaskDrag', (id, mode, task) => {
                const { start_date, end_date } = task;
                const minDate = Gantt.getState().min_date;
                const maxDate = Gantt.getState().max_date;

                if (start_date < minDate || end_date > maxDate) {
                    return false; 
                }
                return true; 
            });
        }
    
    }, [tasks, fetchTasks]);

    const calculateTimePosition = () => {
        const now = new Date();
        const totalWidth = Gantt.$task_data.offsetWidth;
        const startDate = Gantt.getState().min_date;
        const endDate = Gantt.getState().max_date;
        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const dayWidth = totalWidth / totalDays;

        const minutesSinceStartOfDay = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
        const daysElapsed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        const position = daysElapsed * dayWidth + (minutesSinceStartOfDay / (24 * 60)) * dayWidth;
        return position;
    };
    
    const formatDateForBackend = date => {
        return date.toISOString().split('T')[0];
    };

    const handleTaskTimelineUpdate = async (taskId, start_date, end_date) => {
        const formattedStartDate = formatDateForBackend(new Date(start_date));
        const formattedEndDate = formatDateForBackend(new Date(end_date));
        
        
        try {
            await axios.put(`http://localhost:8000/api/task/${taskId}`, {
                start_date: formattedStartDate,
                end_date: formattedEndDate,
            });
            console.log(`Timeline for Task with ID ${taskId} updated successfully!`);
        } catch (error) {
            console.error(`Error updating timeline for Task with ID ${taskId}:`, error);
        }
    };
    

    const handleSaveChanges = async () => {
        try {
            await Promise.all(
                modifiedTasks.map(async task => {
                    const { id, start_date, end_date } = task;
                    await handleTaskTimelineUpdate(id, start_date, end_date);
                })
            );
    
            console.log(modifiedTasks);
            setModifiedTasks([]);
            console.log('All timeline updates saved successfully!');
        } catch (error) {
            console.error('Error saving timeline updates:', error);
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'In Progress':
                return 'orange';
            case 'Done':
                return 'green';
            case 'On Hold':
                return 'red';
            default:
                return 'gray';
        }
    };

    return (
        <div>
            <h1>Gantt Chart</h1>
            <button onClick={handleSaveChanges} style={{ marginBottom: '20px' }}>Save Changes</button>
                <div id="gantt-container" style={{ width: '100%', height: '500px' }}></div>
        </div>
    );
};

export default GanttChart;
