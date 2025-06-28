import React, { useState, useEffect } from 'react';
import './Calendar.css';

const DailyTracker = () => {
  // Initialize state with localStorage data or defaults
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tasks')) || [];
    } catch (e) {
      return [];
    }
  });
  
  const [feeling, setFeeling] = useState('Good');
  const [productivity, setProductivity] = useState(5);
  const [studyHours, setStudyHours] = useState(0);
  const [journal, setJournal] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    const task = prompt('Enter your task:');
    if (task) {
      const newTask = {
        id: Date.now().toString(),
        task,
        date: selectedDate.toDateString(),
        completed: false,
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
    }
  };

  const deleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    }
  };

  const handleDragStart = (id) => {
    localStorage.setItem('draggedTaskId', id);
  };

  const handleDrop = (toCompleted) => {
    const draggedId = localStorage.getItem('draggedTaskId');
    if (!draggedId) return;

    setTasks(prevTasks => 
      prevTasks.map(t => 
        t.id === draggedId ? { ...t, completed: toCompleted } : t
      )
    );
    localStorage.removeItem('draggedTaskId');
  };

  const saveJournal = () => {
    alert('Journal saved for ' + selectedDate.toDateString());
  };

  const getCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    // Add empty slots for days before the first day of the month
    const days = Array(firstDayOfMonth).fill(null);
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  // Filter tasks for the selected date
  const tasksForSelectedDate = tasks.filter(t => t.date === selectedDate.toDateString());
  const remainingTasks = tasksForSelectedDate.filter(t => !t.completed);
  const completedTasks = tasksForSelectedDate.filter(t => t.completed);

  return (
    <div className="tracker-container">
      <header className="tracker-header">
        <h1>📅 Daily Tracker</h1>
        <p>Plan your day and track your progress</p>
      </header>

      <section className="tracker-main">
        <div className="tracker-date">
          <h2>{selectedDate.toDateString()}</h2>
          <p>📝 {tasksForSelectedDate.length} tasks &nbsp; ✅ {completedTasks.length} completed</p>
          <button className="add-task" onClick={addTask}>+ Add Task</button>
        </div>

        <div className="tracker-body">
          <div className="calendar">
            <h3>{selectedDate.toLocaleString('default', { month: 'long' })} {selectedDate.getFullYear()}</h3>
            <div className="calendar-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="calendar-weekday">{day}</div>
              ))}
            </div>
            <div className="calendar-grid">
              {getCalendarDays().map((day, index) => (
                <div
                  key={day ? day.toDateString() : `empty-${index}`}
                  className={`calendar-day ${day ? '' : 'empty'} ${
                    day && day.toDateString() === selectedDate.toDateString() ? 'active' : ''
                  }`}
                  onClick={() => day && setSelectedDate(day)}
                >
                  {day ? day.getDate() : ''}
                </div>
              ))}
            </div>
            <button className="today-btn" onClick={() => setSelectedDate(new Date())}>Today</button>
          </div>

          <div className="tasks-section two-columns">
            <div
              className="task-card"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(false)}
            >
              <h3>🕗 Remaining Tasks</h3>
              {remainingTasks.length === 0 ? (
                <p>No tasks</p>
              ) : (
                remainingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="task-item remaining-tasks"
                    draggable
                    onDragStart={() => handleDragStart(t.id)}
                  >
                    <span className="task-text">{t.task}</span>
                    <button 
                      className="delete-task-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(t.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            <div
              className="task-card completed"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(true)}
            >
              <h3>✅ Completed</h3>
              {completedTasks.length === 0 ? (
                <p>No completed tasks</p>
              ) : (
                completedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="task-item completed-tasks"
                    draggable
                    onDragStart={() => handleDragStart(t.id)}
                  >
                    <span className="task-text">{t.task}</span>
                    <button 
                      className="delete-task-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(t.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="journal-section">
          <h3>📖 Daily Journal</h3>
          <div className="journal-fields">
            <label>How are you feeling?</label>
            <select value={feeling} onChange={(e) => setFeeling(e.target.value)}>
              <option value="Good">😀 Good</option>
              <option value="Okay">😐 Okay</option>
              <option value="Bad">😔 Bad</option>
            </select>

            <label>Productivity (1-10)</label>
            <input 
              type="number" 
              min="1" 
              max="10" 
              value={productivity} 
              onChange={(e) => {
                const val = Math.min(10, Math.max(1, parseInt(e.target.value) || 5));
                setProductivity(val);
              }} 
            />

            <label>Study Hours</label>
            <input 
              type="number" 
              min="0"
              value={studyHours} 
              onChange={(e) => setStudyHours(Math.max(0, parseInt(e.target.value) || 0))} 
            />

            <label>What happened today?</label>
            <textarea 
              value={journal} 
              onChange={(e) => setJournal(e.target.value)} 
              placeholder="Write about your day..." 
            />

            <button className="save-btn" onClick={saveJournal}>📥 Save Entry</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DailyTracker;