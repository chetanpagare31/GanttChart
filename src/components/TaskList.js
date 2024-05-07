import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomDropdown from './CustomDropdown';
import './TaskList.css'
// import GanttChart from './GanttChart';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [showSaveButton, setShowSaveButton] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const [selectedTaskIds, setSelectedTaskIds] = useState([]);
    const [selectedDropdownId, setSelectedDropdownId] = useState(null);


    const handleDropdownToggle = (taskId) => {
        setSelectedDropdownId(taskId === selectedDropdownId ? null : taskId);
    };

    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/task');
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleInputChange = async (taskId, field, value) => {
        try {
            let formattedValue = value;

            if (field === 'start_date' || field === 'end_date') {
                formattedValue = value.toISOString().split('T')[0];
            }
            console.log(value);
            console.log(formattedValue);
            const updatedTasks = tasks.map(task => {
                if (task.id === taskId) {
                    return { ...task, [field]: formattedValue };
                }
                return task;
            });

            setTasks(updatedTasks); // Update tasks state first

            const taskToUpdate = updatedTasks.find(task => task.id === taskId);
            if (taskToUpdate) {
                await axios.put(`http://localhost:8000/api/task/${taskId}`, taskToUpdate);
                console.log(`Task with ID ${taskId} updated successfully!`);
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };



    const saveTask = async (taskId) => {
        try {
            const taskToUpdate = tasks.find(task => task.id === taskId);
            await axios.put(`http://localhost:8000/api/task/${taskId}`, taskToUpdate);
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };


    const handleDeleteSelectedTasks = async () => {
        try {
            const remainingTasks = tasks.filter(task => !selectedTaskIds.includes(task.id));
            setTasks(remainingTasks);

            await Promise.all(selectedTaskIds.map(taskId => axios.delete(`http://localhost:8000/api/task/${taskId}`)));

            setSelectedTaskIds([]);
        } catch (error) {
            console.error('Error deleting tasks:', error);
        }
    };


    const toggleTaskSelection = (taskId) => {
        if (selectedTaskIds.includes(taskId)) {
            setSelectedTaskIds(selectedTaskIds.filter(id => id !== taskId));
        } else {
            setSelectedTaskIds([...selectedTaskIds, taskId]);
        }
    };
    const handleAddColumn = () => {
        console.log('Add a new column');
    };


    const renderTaskRows = () => {
        return tasks.map((task) => (
            <tr key={task.id}>
                <td>
                    <input
                        type="checkbox"
                        onChange={() => toggleTaskSelection(task.id)}
                    />
                </td>
                <td>
                    <input
                        type="text"
                        value={task.item}
                        onChange={(e) => handleInputChange(task.id, 'item', e.target.value)}
                        onBlur={() => saveTask(task.id)}
                    />
                </td>
                <td>
                    <CustomDropdown
                        value={task.person}
                        options={['Chetan Pagare', 'Hari', 'Saranya']}
                        onChange={(value) => handleInputChange(task.id, 'person', value)}
                        isOpen={task.id === selectedDropdownId}
                        onToggle={() => handleDropdownToggle(task.id)}
                    />
                </td>
                <td className={getStatusColorClass(task.status)}>
                    <CustomDropdown
                        value={task.status}
                        options={['In Progress', 'Done', 'On Hold']}
                        onChange={(value) => handleInputChange(task.id, 'status', value)}
                        isOpen={task.id === selectedDropdownId}
                        onToggle={() => handleDropdownToggle(task.id)}
                    />
                </td>

                <td className="timeline-cell">
                    <div className="date-picker-container">
                        <DatePicker
                            selected={new Date(task.start_date)}
                            onChange={date => handleInputChange(task.id, 'start_date', date)}
                            dateFormat="dd MMM yy"
                        />

                        <DatePicker
                            selected={new Date(task.end_date)}
                            onChange={date => handleInputChange(task.id, 'end_date', date)}
                            dateFormat="dd MMM yy"
                            className="custom-datepicker-input"
                        />
                    </div>
                </td>

                <td>
                    <CustomDropdown
                        value={task.tags}
                        options={['backend task', 'frontend task', 'Testing']}
                        onChange={(value) => handleInputChange(task.id, 'tags', value)}
                        isOpen={task.id === selectedDropdownId}
                        onToggle={() => handleDropdownToggle(task.id)}

                    />
                </td>
            </tr>
        ));
    };




    const getStatusColorClass = (status) => {
        switch (status) {
            case 'In Progress':
                return 'status-in-progress';
            case 'Done':
                return 'status-done';
            case 'On Hold':
                return 'status-on-hold';
            default:
                return '';
        }
    };

    const createNewTask = () => ({
        item: '',
        person: '',
        status: '',
        start_date: new Date(),
        end_date: new Date(),
        tags: ''
    });
    const [newTask, setNewTask] = useState(createNewTask());


    const handleAddNewTask = () => {
        const freshTask = createNewTask();
        setNewTask(freshTask);
        setShowSaveButton(true);
    };

    const handleSaveNewTask = async () => {
        try {
            const formattedNewTask = {
                ...newTask,
                start_date: formatDate(newTask.start_date),
                end_date: formatDate(newTask.end_date)
            };

            const response = await axios.post('http://localhost:8000/api/task', formattedNewTask);
            const savedTask = response.data;
            setTasks([...tasks, savedTask]);
            setNewTask(createNewTask());
            setShowSaveButton(false); 
            console.log('New task saved successfully!');
        } catch (error) {
            console.error('Error saving new task:', error);
        }
    };

    return (
        <div>
            <h1>Task List</h1>

            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Item</th>
                        <th>Person</th>
                        <th>Status</th>
                        <th>Timeline</th>
                        <th>Tags</th>
                        <th>
                            <button onClick={handleAddColumn}>+</button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {renderTaskRows()}

                        {showSaveButton && (
                            <tr key="new-task-row">
                                <td style={{ height: '20px', width: '20px' }}></td>

                                <td>
                                    <input
                                        type="text"
                                        value={newTask.item}
                                        onChange={(e) => setNewTask({ ...newTask, item: e.target.value })}
                                    />
                                </td>
                                <td>
                                    <CustomDropdown
                                        value={newTask.person}
                                        options={['Chetan Pagare', 'Hari', 'Saranya']}
                                        onChange={(value) => setNewTask({ ...newTask, person: value })}
                                    />
                                </td>
                                <td className={getStatusColorClass(newTask.status)}>
                                    <CustomDropdown
                                        value={newTask.status}
                                        options={['In Progress', 'Done', 'On Hold']}
                                        onChange={(value) => setNewTask({ ...newTask, status: value })}
                                    />
                                </td>


                                <td className="timeline-cell">
                                    <div className="date-picker-container">
                                    <DatePicker
                                        selected={newTask.start_date}
                                        onChange={(date) => setNewTask({ ...newTask, start_date: date })}
                                        dateFormat="dd MMM yy" // Optional: Display format
                                    />
                                    <DatePicker
                                        selected={newTask.end_date}
                                        onChange={(date) => setNewTask({ ...newTask, end_date: date })}
                                        dateFormat="dd MMM yy" // Optional: Display format
                                    />

                                    </div>
                                    
                                </td>
                                <td>
                                    <CustomDropdown
                                        value={newTask.tags}
                                        options={['backend task', 'frontend task', 'Testing']}
                                        onChange={(value) => setNewTask({ ...newTask, tags: value })}
                                    />
                                </td>
                                <td colSpan='6'>
                                    <button onClick={handleSaveNewTask}>Save</button>
                                </td>
                            </tr>

                    
                            )}
                        <td>
                            <button onClick={handleAddNewTask}>+</button>
                        </td>
                </tbody>
            </table>
            <br></br>
            <button onClick={handleDeleteSelectedTasks} disabled={selectedTaskIds.length === 0}>
                Delete Selected Tasks
            </button>

            <button className="save-button">
                Save
            </button>

        </div>
    );
};

export default TaskList;