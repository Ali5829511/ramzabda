import { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface PrintLayoutProps {
  title: string;
  subtitle?: string;
  docNumber?: string;
  date?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  watermark?: string;
  onClose: () => void;
}

export function PrintLayout({ title, subtitle, docNumber, date, children, footer, watermark, onClose }: PrintLayoutProps) {
  const today = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const content = (
    <div
      id="ramz-print-root"
      style={{
        fontFamily: "'Tajawal', 'Cairo', Arial, sans-serif",
        direction: 'rtl',
        background: 'white',
        minHeight: '100vh',
        color: '#1a1a1a',
        fontSize: '13px',
        lineHeight: '1.7',
        position: 'relative',
      }}
    >
      {/* Watermark */}
      {watermark && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%) rotate(-30deg)',
          fontSize: '80px', fontWeight: 800, color: 'rgba(245,158,11,0.06)',
          pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 0,
          userSelect: 'none',
        }}>
          {watermark}
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1, padding: '0 8mm' }}>
        {/* === HEADER === */}
        <div style={{
          background: 'linear-gradient(135deg, #b45309 0%, #d97706 40%, #f59e0b 100%)',
          margin: '0 -8mm',
          padding: '14px 24px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img src="/logo.png" alt="رمز الإبداع"
              style={{ width: '56px', height: '56px', objectFit: 'contain', background: 'white', borderRadius: '10px', padding: '4px' }} />
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '18px', letterSpacing: '0.3px' }}>
                شركة رمز الإبداع لإدارة الأملاك
              </div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '11px', marginTop: '2px' }}>
                Ramz Al-Ibda' Property Management Co.
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'left', color: 'white' }}>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>ramzabdae.com</div>
            {docNumber && <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '3px', fontFamily: 'monospace' }}>{docNumber}</div>}
            <div style={{ fontSize: '11px', marginTop: '2px', opacity: 0.85 }}>{date ?? today}</div>
          </div>
        </div>

        {/* Gold divider bar */}
        <div style={{ height: '4px', background: 'linear-gradient(to left, #92400e, #d97706, #fbbf24, #d97706, #92400e)', margin: '0 -8mm 0' }} />

        {/* Document title */}
        <div style={{
          background: '#1c1917',
          margin: '0 -8mm',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <div>
            <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '16px' }}>{title}</span>
            {subtitle && <span style={{ color: '#a8a29e', fontSize: '12px', marginRight: '10px' }}>{subtitle}</span>}
          </div>
          {docNumber && (
            <span style={{
              background: '#fbbf24', color: '#1c1917', padding: '3px 12px',
              borderRadius: '20px', fontSize: '12px', fontWeight: 700, fontFamily: 'monospace',
            }}>{docNumber}</span>
          )}
        </div>

        {/* === CONTENT === */}
        {children}

        {/* === FOOTER === */}
        <div style={{
          marginTop: '24px', borderTop: '2px solid #f59e0b',
          paddingTop: '12px',
        }}>
          {footer ?? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ fontSize: '11px', color: '#78716c' }}>
                <strong style={{ color: '#1c1917' }}>شركة رمز الإبداع لإدارة الأملاك</strong>
                {'  '}|{'  '}ramzabdae.com
              </div>
              <div style={{ fontSize: '11px', color: '#a8a29e', fontStyle: 'italic' }}>
                وثيقة سرية — جميع الحقوق محفوظة © {new Date().getFullYear()}
              </div>
              <div style={{ fontSize: '11px', color: '#78716c' }}>
                تاريخ الإصدار: {today}
              </div>
            </div>
          )}
        </div>

        {/* Signature Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', gap: '40px' }}>
          {['المستأجر', 'المؤجر / الشركة', 'المدير المفوّض'].map(label => (
            <div key={label} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ borderBottom: '1.5px solid #d97706', height: '32px', marginBottom: '6px' }} />
              <div style={{ fontSize: '11px', color: '#78716c' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Close / Print controls — screen only */}
      <div className="print-hide" style={{
        position: 'fixed', top: '16px', left: '16px',
        display: 'flex', gap: '10px', zIndex: 99999,
      }}>
        <button onClick={() => window.print()}
          style={{
            background: '#f59e0b', color: 'white', border: 'none',
            padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
            fontFamily: 'Tajawal, Arial, sans-serif', fontSize: '14px', fontWeight: 700,
          }}>
          🖨️ طباعة / PDF
        </button>
        <button onClick={onClose}
          style={{
            background: '#1c1917', color: 'white', border: 'none',
            padding: '10px 16px', borderRadius: '10px', cursor: 'pointer',
            fontFamily: 'Tajawal, Arial, sans-serif', fontSize: '14px',
          }}>
          ✕ إغلاق
        </button>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
}

// ── Helpers ──────────────────────────────────────
export function PrintSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }} className="no-break">
      <div style={{
        borderRight: '4px solid #f59e0b',
        paddingRight: '10px',
        marginBottom: '8px',
        color: '#92400e',
        fontWeight: 700,
        fontSize: '13px',
        letterSpacing: '0.3px',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export function PrintGrid({ children, cols = 3 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '10px 20px', marginBottom: '8px' }}>
      {children}
    </div>
  );
}

export function PrintField({ label, value, mono }: { label: string; value?: string | number | null; mono?: boolean }) {
  return (
    <div style={{ borderBottom: '1px solid #e7e5e4', paddingBottom: '4px' }}>
      <div style={{ fontSize: '10px', color: '#a8a29e', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontWeight: 600, color: '#1c1917', fontFamily: mono ? 'monospace' : undefined, fontSize: '12px' }}>
        {value !== undefined && value !== null && value !== '' ? String(value) : '—'}
      </div>
    </div>
  );
}

export function PrintTable({ headers, rows, totals }: {
  headers: string[];
  rows: (string | number | React.ReactNode)[][];
  totals?: (string | number | null)[];
}) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '12px' }}>
      <thead>
        <tr style={{ background: '#1c1917' }}>
          {headers.map((h, i) => (
            <th key={i} style={{
              padding: '8px 10px', color: '#fbbf24', fontWeight: 700,
              textAlign: 'right', borderBottom: '2px solid #d97706', fontSize: '11px',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} style={{ background: ri % 2 === 0 ? 'white' : '#fafaf9' }}>
            {row.map((cell, ci) => (
              <td key={ci} style={{
                padding: '7px 10px', borderBottom: '1px solid #e7e5e4',
                color: '#292524', verticalAlign: 'middle',
              }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
      {totals && (
        <tfoot>
          <tr style={{ background: '#fef3c7', borderTop: '2px solid #f59e0b' }}>
            {totals.map((t, i) => (
              <td key={i} style={{
                padding: '8px 10px', fontWeight: 800, color: '#92400e',
                fontSize: '12px',
              }}>{t ?? ''}</td>
            ))}
          </tr>
        </tfoot>
      )}
    </table>
  );
}
