import React, { useRef } from 'react';
import { usePlaceRate } from '../../context/PlaceRateContext';
import { VibrancyWheelCanvas } from './VibrancyWheelCanvas';
import { calculateProjectScore } from '../../utils/scoring';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const ReportView: React.FC = () => {
  const { activeProject, template } = usePlaceRate();
  const reportRef = useRef<HTMLDivElement>(null);

  if (!activeProject) return null;

  const totalScore = calculateProjectScore(activeProject);
  const hardElements = template.elements.filter(e => e.type === 'hard');
  const softElements = template.elements.filter(e => e.type === 'soft');

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${activeProject.name}-report.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    }
  };

  const handleShare = () => {
    const text = `PlaceRate Report: ${activeProject.name}\nVibrancy Score: ${totalScore}/100\n${activeProject.addr}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${activeProject.name} - PlaceRate Report`,
        text: text,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Report summary copied to clipboard!');
    }
  };

  return (
    <div className="report-wrap" style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <div
        ref={reportRef}
        className="report-sheet"
        style={{
          backgroundColor: 'var(--surface)',
          padding: 40,
          borderRadius: 'var(--radius-lg)',
          marginBottom: 24,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>
            PlaceRate Report
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
            Vibrancy Community Assessment
          </p>
        </div>

        {/* Project Details */}
        <div
          style={{
            backgroundColor: 'var(--surface2)',
            padding: 20,
            borderRadius: 'var(--radius)',
            marginBottom: 32,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>
            Project Details
          </h2>
          <div className="report-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
            <div>
              <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Project Name</p>
              <p style={{ color: 'var(--text)', fontWeight: 500, textTransform: 'uppercase' }}>{activeProject.name}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Location</p>
              <p style={{ color: 'var(--text)', fontWeight: 500, textTransform: 'uppercase' }}>{activeProject.addr || 'N/A'}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Type</p>
              <p style={{ color: 'var(--text)', fontWeight: 500 }}>{activeProject.type}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Date</p>
              <p style={{ color: 'var(--text)', fontWeight: 500 }}>{activeProject.date}</p>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div
          style={{
            textAlign: 'center',
            backgroundColor: 'var(--surface2)',
            padding: 32,
            borderRadius: 'var(--radius)',
            marginBottom: 32,
          }}
        >
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
            Overall Vibrancy Score
          </p>
          <div style={{ fontSize: 56, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
            {totalScore}
            <span style={{ fontSize: 20, color: 'var(--text-dim)' }}> / 100</span>
          </div>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 160, height: 160 }}>
              <VibrancyWheelCanvas size={160} />
            </div>
          </div>
        </div>

        {/* Hard Elements Breakdown */}
        <div className="element-scope" style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>
            Hard Elements Assessment
          </h2>
          <div className="report-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {hardElements.map(element => {
              const score = activeProject.scores?.[element.id] || 0;
              const percentage = element.maxPoints > 0 ? Math.round((score / element.maxPoints) * 100) : 0;
              const hex = element.color || 'var(--el-default)';

              return (
                <div
                  key={element.id}
                  style={{
                    padding: 16,
                    backgroundColor: hex === 'var(--el-default)' ? 'var(--surface2)' : hex,
                    borderRadius: 'var(--radius)',
                    color: hex === 'var(--el-default)' ? 'var(--text)' : 'var(--text)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{element.name}</p>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{percentage}%</p>
                  </div>
                  <div
                    style={{
                      height: 6,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        width: `${percentage}%`,
                        transition: 'width 300ms ease',
                      }}
                    />
                  </div>
                  <p style={{ fontSize: 12, marginTop: 8, opacity: 0.8 }}>
                    {Math.round(score)} / {element.maxPoints} points
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Soft Elements Breakdown */}
        <div className="element-scope">
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>
            Soft Elements Assessment
          </h2>
          <div className="report-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {softElements.map(element => {
              const score = activeProject.scores?.[element.id] || 0;
              const percentage = element.maxPoints > 0 ? Math.round((score / element.maxPoints) * 100) : 0;
              const hex = element.color || 'var(--el-default)';

              return (
                <div
                  key={element.id}
                  style={{
                    padding: 16,
                    backgroundColor: hex === 'var(--el-default)' ? 'var(--surface2)' : hex,
                    borderRadius: 'var(--radius)',
                    color: hex === 'var(--el-default)' ? 'var(--text)' : 'var(--text)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{element.name}</p>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{percentage}%</p>
                  </div>
                  <div
                    style={{
                      height: 6,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        width: `${percentage}%`,
                        transition: 'width 300ms ease',
                      }}
                    />
                  </div>
                  <p style={{ fontSize: 12, marginTop: 8, opacity: 0.8 }}>
                    {Math.round(score)} / {element.maxPoints} points
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button
          onClick={handleDownloadPDF}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 600,
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-text)',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.85';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <span aria-hidden="true" style={{ fontFamily: 'Material Icons', fontSize: 18 }}>
            download
          </span>
          Download PDF
        </button>
        <button
          onClick={handleShare}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 600,
            backgroundColor: 'var(--surface2)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface2)';
          }}
        >
          <span aria-hidden="true" style={{ fontFamily: 'Material Icons', fontSize: 18 }}>
            share
          </span>
          Share
        </button>
      </div>
    </div>
  );
};
