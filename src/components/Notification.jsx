import React ,{useState ,useEffect} from 'react'
import { scheduleTaskNotification , requestNotificationPermission } from '../services/notificationService'
function Notification({refreshKey}) {
    const [title, setTitle] = useState("")
    const [nofTime, setNofTime] = useState("")
    useEffect(() => {
      requestNotificationPermission()
    }, [])
    function addNof(e)
    {
      e.preventDefault();
        if (!title.trim() || !nofTime) return;
        scheduleTaskNotification({title,reminder_time:nofTime})
        setTitle("")
        setNofTime("")
    }
return (
    <div>
      <form onSubmit={addNof} className="task-form">
        <div className="form-group">
            <label htmlFor="task-title">Title *</label>
            <input
                id="task-title"
                type="text"
                placeholder="What needs to be notified?"
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
            />
        </div>
        <div className="form-group">
          <input type="time" onChange={(e) => setNofTime(e.target.value)} />
        </div>
        <div className="form-actions">
            <button type="submit" className="btn btn-primary">
            </button>
        </div>
      </form>
    </div>
  )
}

export default Notification
