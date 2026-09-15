import React from 'react';
import {
  AlertTriangle,
  Zap,
  Info,
  CalendarDays,
  Bot
} from "lucide-react";

export const AlertsSection = ({ alerts = [] }) => {
  return (
    <div className="doc-card doc-alerts-card">
      <div className="doc-card-header">
        <h3 className="doc-card-title">Alerts</h3>
        <span className="doc-alert-count-badge">{alerts.length} Active</span>
      </div>

      <div className="doc-alerts-body">
        {alerts.length === 0 ? (
          <p className="doc-empty-text">No critical alerts or warnings logged for this patient.</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`doc-alert-item doc-alert-severity-${(alert.severity || 'INFO').toLowerCase()}`}
            >
              <div className="doc-alert-icon">
                {alert.severity === 'CRITICAL' ? <AlertTriangle size={24} /> : alert.severity === 'WARNING' ? <Zap size={24} /> : <Info size={24} />}
              </div>
              <div className="doc-alert-content">
                <div className="doc-alert-top">
                  <h4 className="doc-alert-title">{alert.title}</h4>
                  <span className="doc-alert-level">{alert.severity}</span>
                </div>
                <p className="doc-alert-desc">{alert.description}</p>
                {alert.addedDate && <span className="doc-alert-date">Logged on: {alert.addedDate}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsSection;
