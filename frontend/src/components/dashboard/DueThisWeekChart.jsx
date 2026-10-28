// Bar chart made with plain divs. One bar per day (Mon to Sun).
// Bar height = number of tasks due that day. Today is highlighted.
export default function DueThisWeekChart({ days }) {
  const max = Math.max(1, ...days.map((day) => day.count));

  return (
    <div className="bars" role="img" aria-label="Tasks due on each day of this week">
      {days.map((day) => (
        <div key={day.label} className={`bars__col${day.isToday ? ' is-today' : ''}`}>
          <div className="bars__plot">
            {day.count > 0 ? (
              <div className="bar" style={{ height: `${(day.count / max) * 100}%` }}>
                {day.count}
              </div>
            ) : (
              <div className="bar bar--empty" />
            )}
          </div>
          <span className="bars__label">{day.label}</span>
        </div>
      ))}
    </div>
  );
}
