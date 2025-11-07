import React from 'react';
import DOMPurify from 'dompurify';

export default function StatCard({ label, value }) {
  const safeLabel = DOMPurify.sanitize(label); // [REQ:Sanitization:output] [REQ:XSS:encode]
  const safeValue = DOMPurify.sanitize(String(value)); // [REQ:Sanitization:output] [REQ:XSS:encode]
  return (
    <div className="card">
      <div className="muted" dangerouslySetInnerHTML={{ __html: safeLabel }} />
      <div style={{ fontSize: 24, fontWeight: 700 }} dangerouslySetInnerHTML={{ __html: safeValue }} />
    </div>
  );
}
