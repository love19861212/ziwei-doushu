'use client';
/**
 * 全盘报告弹窗 — 调 /api/report
 *
 * 行为:
 *  - 打开 → POST /api/report with pro=false
 *  - 收到 402 → 显示升级卡片（错误信息 + features 列表 + 升级按钮）
 *  - 收到 200 → 显示完整 Markdown 报告
 *  - 用户可点"试看完整版(模拟 PRO)"→ 切到完整报告
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ZiweiChart } from '@/lib/ziwei/types';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  chart: ZiweiChart;
}

interface ReportError {
  error: string;
  upgradeUrl?: string;
  preview?: string;
  features?: string[];
}

interface ReportSuccess {
  report: string;
  length: number;
  format: string;
}

export default function ReportModal({ open, onClose, chart }: ReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReportError | null>(null);
  const [success, setSuccess] = useState<ReportSuccess | null>(null);
  const [simulatedPro, setSimulatedPro] = useState(false);
  const [exporting, setExporting] = useState(false);

  // 打开时拉数据
  useEffect(() => {
    if (!open) return;
    setError(null);
    setSuccess(null);
    setSimulatedPro(false);
    loadReport(false);
  }, [open]);

  const loadReport = async (pro: boolean) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart, options: { pro } }),
      });
      const data = await res.json();
      if (res.status === 402) {
        setError(data as ReportError);
      } else if (res.ok) {
        setSuccess(data as ReportSuccess);
      } else {
        setError({ error: data.error || '生成失败' });
      }
    } catch (e) {
      setError({ error: e instanceof Error ? e.message : '网络错误' });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePro = () => {
    setSimulatedPro(true);
    loadReport(true);
  };

  const handleDownload = () => {
    if (!success) return;
    const blob = new Blob([success.report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `紫微全盘报告_${chart.birthInfo?.name || 'unknown'}_${new Date().toISOString().slice(0,10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!success) return;
    // 简单实现: 用新窗口打印
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>紫微全盘报告</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.8; padding: 0 20px; }
            h1 { color: #B8922A; border-bottom: 2px solid #B8922A; padding-bottom: 8px; }
            h2 { color: #B8922A; margin-top: 32px; }
            h3 { color: #555; }
            strong { color: #1A1A18; }
            hr { border: none; border-top: 1px solid #ccc; margin: 32px 0; }
            ul, ol { margin: 8px 0; padding-left: 24px; }
          </style>
        </head>
        <body>
          ${success.report.split('\n').map(line => {
            if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
            if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
            if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
            if (line.startsWith('---')) return '<hr />';
            if (line.startsWith('- ')) return `<li>${line.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</li>`;
            if (line.trim() === '') return '<br />';
            return `<p>${line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
          }).join('\n')}
        </body>
      </html>
    `);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  // 真 PDF 导出 (用 jspdf + html2canvas dynamic import)
  const handleExportPDF = async () => {
    if (!success) return;
    setExporting(true);
    try {
      // 动态加载 jspdf (UMD 脚本, 挂到 window.jspdf)
      if (!(window as any).jspdf) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = '/lib/jspdf.umd.min.js';
          s.onload = () => resolve();
          s.onerror = () => reject(new Error('jspdf 加载失败'));
          document.head.appendChild(s);
        });
      }
      const { jsPDF } = (window as any).jspdf;
      if (!jsPDF) throw new Error('jsPDF 未定义');

      // 动态加载 html2canvas (dynamic import, 不依赖 window 全局)
      const html2canvas = (await import('html2canvas')).default;

      // 创建临时 DOM 渲染报告 (隐藏)
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-99999px';
      container.style.top = '0';
      container.style.width = '595pt';  // A4 宽度
      container.style.padding = '40pt';
      container.style.fontFamily = '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
      container.style.fontSize = '11pt';
      container.style.lineHeight = '1.8';
      container.style.color = '#1A1A18';
      container.style.background = 'white';
      container.innerHTML = success.report.split('\n').map(line => {
        if (line.startsWith('# ')) return `<h1 style="color:#B8922A;border-bottom:2px solid #B8922A;padding-bottom:6pt;font-size:18pt;margin:0 0 16pt;">${line.slice(2)}</h1>`;
        if (line.startsWith('## ')) return `<h2 style="color:#B8922A;margin:24pt 0 8pt;font-size:14pt;">${line.slice(3)}</h2>`;
        if (line.startsWith('### ')) return `<h3 style="color:#555;margin:16pt 0 4pt;font-size:12pt;">${line.slice(4)}</h3>`;
        if (line.startsWith('---')) return '<hr style="border:none;border-top:1px solid #ccc;margin:24pt 0;" />';
        if (line.startsWith('- ')) return `<div style="padding-left:16pt;">• ${line.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</div>`;
        if (line.trim() === '') return '<div style="height:8pt;"></div>';
        return `<p style="margin:6pt 0;">${line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
      }).join('');
      document.body.appendChild(container);

      // 截图
      const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', logging: false });
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const imgWidth = 595;  // A4 宽度 pt
      const pageHeight = 842; // A4 高度 pt
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      document.body.removeChild(container);
      doc.save(`紫微全盘报告_${chart.birthInfo?.name || 'unknown'}_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e) {
      console.error('[PDF 导出失败]', e);
      alert('PDF 导出失败: ' + (e instanceof Error ? e.message : '未知错误') + '\n请使用 Markdown 下载或打印功能。');
    } finally {
      setExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-0)',
              width: '100%',
              maxWidth: '640px',
              maxHeight: '90vh',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              border: '1px solid var(--bdr-med)',
              borderBottom: 'none',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* 标题栏 */}
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--bdr)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📄</span>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--tx-1)' }}>
                    紫微全盘报告
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--tx-3)', marginTop: '2px' }}>
                    {loading ? '生成中…' : success ? `${success.length} 字符` : error ? '需升级专业版' : ''}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  fontSize: '20px',
                  color: 'var(--tx-3)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0 4px',
                  lineHeight: 1,
                }}
              >×</button>
            </div>

            {/* 内容区 */}
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              {loading && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--tx-3)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                  <div>AI 正在排盘解读…</div>
                </div>
              )}

              {/* 错误状态 (402 付费墙) */}
              {error && !loading && (
                <div>
                  {/* 升级提示卡 */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(212,168,67,0.12), rgba(212,168,67,0.04))',
                    border: '1px solid rgba(212,168,67,0.4)',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    marginBottom: '20px',
                  }}>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔒</div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--tx-1)', marginBottom: '4px' }}>
                      全盘报告为专业版专属
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--tx-2)', marginBottom: '16px' }}>
                      {error.error}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <a
                        href={error.upgradeUrl || '/subscription'}
                        style={{
                          padding: '8px 18px',
                          background: 'var(--ac)',
                          color: 'white',
                          borderRadius: '999px',
                          fontSize: '13px',
                          fontWeight: 500,
                          textDecoration: 'none',
                        }}
                      >
                        升级专业版
                      </a>
                      <button
                        onClick={handleSimulatePro}
                        style={{
                          padding: '8px 18px',
                          background: 'transparent',
                          color: 'var(--tx-2)',
                          border: '1px solid var(--bdr-med)',
                          borderRadius: '999px',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        🎁 体验完整版
                      </button>
                    </div>
                  </div>

                  {/* features 列表 */}
                  {error.features && (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tx-2)', marginBottom: '8px', letterSpacing: '0.1em' }}>
                        专业版专属功能
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {error.features.map((f, i) => (
                          <div key={i} style={{
                            padding: '6px 10px',
                            background: 'var(--t-surface, rgba(255,255,255,0.02))',
                            border: '1px solid var(--bdr)',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: f.startsWith('✅') ? '#22c55e' : 'var(--tx-2)',
                          }}>
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 报告概要预览 */}
                  {error.preview && (
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tx-2)', marginBottom: '8px', letterSpacing: '0.1em' }}>
                        报告概要预览（前 800 字）
                      </div>
                      <pre style={{
                        background: 'var(--t-surface, rgba(255,255,255,0.02))',
                        border: '1px solid var(--bdr)',
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '11px',
                        lineHeight: 1.6,
                        color: 'var(--tx-2)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", monospace',
                      }}>
                        {error.preview}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* 成功状态 (200 报告) */}
              {success && !loading && (
                <div>
                  {/* 报告操作按钮 */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleDownload}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--ac)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      ⬇️ 下载 Markdown
                    </button>
                    <button
                      onClick={handleExportPDF}
                      disabled={exporting}
                      style={{
                        padding: '6px 12px',
                        background: exporting ? 'rgba(0,0,0,0.05)' : 'transparent',
                        color: exporting ? 'var(--tx-3)' : 'var(--tx-1)',
                        border: '1px solid var(--bdr-med)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: exporting ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {exporting ? '⏳ 生成中...' : '📑 下载 PDF'}
                    </button>
                    <button
                      onClick={handlePrint}
                      style={{
                        padding: '6px 12px',
                        background: 'transparent',
                        color: 'var(--tx-1)',
                        border: '1px solid var(--bdr-med)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      🖨️ 打印
                    </button>
                    {simulatedPro && (
                      <span style={{
                        padding: '6px 12px',
                        background: 'rgba(34,197,94,0.1)',
                        color: '#22c55e',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 500,
                      }}>
                        ✓ 体验版
                      </span>
                    )}
                  </div>

                  {/* 报告正文 */}
                  <pre style={{
                    background: 'var(--t-surface, rgba(255,255,255,0.02))',
                    border: '1px solid var(--bdr)',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '12px',
                    lineHeight: 1.8,
                    color: 'var(--tx-1)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", monospace',
                    maxHeight: '60vh',
                    overflowY: 'auto',
                  }}>
                    {success.report}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
