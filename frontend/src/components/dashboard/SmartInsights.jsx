import { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

// Card with a short tip. Arrows change the tip, the button opens the matching tasks.
export default function SmartInsights({ insights, onView }) {
  const [index, setIndex] = useState(0);
  const current = index % insights.length; // safe even if the list gets shorter
  const insight = insights[current];

  const showPrevious = () => setIndex((current - 1 + insights.length) % insights.length);
  const showNext = () => setIndex((current + 1) % insights.length);

  return (
    <section className="card card--tab-right insights">
      <div className="card__head">
        <h2 className="card__title">
          <Sparkles size={22} style={{ color: 'var(--warning)', marginRight: 8 }} />
          Smart Insights
        </h2>
        <div className="insights__arrows">
          <button type="button" className="icon-btn" onClick={showPrevious} aria-label="Previous insight">
            <ArrowLeft size={20} />
          </button>
          <button type="button" className="icon-btn" onClick={showNext} aria-label="Next insight">
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      <p className="insights__text">{insight.text}</p>

      <button type="button" className="btn btn--primary insights__action" onClick={() => onView(insight.filter)}>
        VIEW TASKS
      </button>

      {/* Soft decoration in the bottom right corner */}
      <svg className="insights__art" viewBox="0 0 200 120" aria-hidden="true">
        <polygon points="0,120 70,30 130,120" fill="var(--accent)" opacity="0.35" />
        <polygon points="60,120 130,10 200,120" fill="var(--accent)" opacity="0.6" />
        <polygon points="130,10 150,45 120,40" fill="#ffffff" opacity="0.5" />
      </svg>
    </section>
  );
}
