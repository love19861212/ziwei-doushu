'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ZiweiChart } from '@/lib/ziwei/types';
import ShareCardCanvas, { captureShareCard, downloadDataURL } from './ShareCardCanvas';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  shareUrl: string;
  chart: ZiweiChart | null;
  birth: { year: string; month: string; day: string; hour: string; minute: string; gender: 'male' | 'female'; city?: string };
  highlight?: string;
}

export default function ShareModal({ open, onClose, shareUrl, chart, birth, highlight }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  // 【命盘分享二维码】动态加载 qrcode-generator
  const [qrDataURL, setQrDataURL] = useState<string | null>(null);
  const qrLoadedRef = useRef(false);

  // 动态加载 qrcode-generator UMD 脚本 (挂到 window.qrcode)
  useEffect(() => {
    if (qrLoadedRef.current) return;
    if (typeof window === 'undefined') return;
    if ((window as any).qrcode) {
      qrLoadedRef.current = true;
      return;
    }
    const s = document.createElement('script');
    s.src = '/lib/qrcode-generator.min.js';
    s.onload = () => { qrLoadedRef.current = true; };
    s.onerror = () => { console.error('qrcode-generator 加载失败'); };
    document.head.appendChild(s);
  }, []);

  // shareUrl 变化时, 生成二维码 dataURL
  useEffect(() => {
    if (!open || !shareUrl) {
      setQrDataURL(null);
      return;
    }
    // 等 qrcode 库加载
    const tryGen = () => {
      const qrcode = (window as any).qrcode;
      if (!qrcode) {
        setTimeout(tryGen, 100);
        return;
      }
      try {
        // typeNumber=0 自动检测, errorCorrectionLevel='M' 适中容错
        const qr = qrcode(0, 'M');
        qr.addData(shareUrl);
        qr.make();
        // createDataURL(cellSize, margin) 返回 data:image/gif;base64,...
        setQrDataURL(qr.createDataURL(8, 2));
      } catch (e) {
        console.error('二维码生成失败', e);
        setQrDataURL(null);
      }
    };
    tryGen();
  }, [open, shareUrl]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('input');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadImage = async () => {
    setDownloading(true);
    try {
      const dataURL = await captureShareCard();
      if (!dataURL) {
        alert('图片生成失败，请截图保存或刷新重试');
        return;
      }
      downloadDataURL(dataURL, `紫微命盘_${Date.now()}.png`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={e => e.stopPropagation()}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'white',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* 顶部标题 */}
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid rgba(184,146,42,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#3d2f10', letterSpacing: '0.12em' }}>
                ✦ 分享命盘
              </div>
              <button onClick={onClose}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%', border: 'none',
                  background: 'rgba(0,0,0,0.05)', color: '#666', fontSize: '16px',
                  cursor: 'pointer', lineHeight: 1,
                }}
              >×</button>
            </div>

            {/* 卡片图预览（实际渲染） */}
            <div style={{ padding: '20px', background: '#fbf6e8', display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
              {chart && (
                <ShareCardCanvas chart={chart} birth={birth} highlight={highlight} />
              )}
            </div>

            <div style={{ padding: '0 20px 12px', textAlign: 'center', fontSize: '11px', color: '#a89b7c', letterSpacing: '0.05em' }}>
              ↑ 朋友圈 / 微信 / 抖音 / 小红书 都能用
            </div>

            {/* 操作区 */}
            <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={downloadImage} disabled={downloading}
                style={{
                  padding: '14px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, #d4a948 0%, #b8922a 100%)',
                  color: 'white', fontSize: '14px', fontWeight: 600, letterSpacing: '0.15em',
                  cursor: downloading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(184,146,42,0.3)',
                  opacity: downloading ? 0.7 : 1,
                }}
              >
                {downloading ? '生成中…' : '⬇ 下载分享图'}
              </button>

              <button onClick={copyLink}
                style={{
                  padding: '14px', borderRadius: '10px',
                  border: '1px solid rgba(184,146,42,0.4)', background: 'white',
                  color: '#b8922a', fontSize: '14px', fontWeight: 500, letterSpacing: '0.12em',
                  cursor: 'pointer',
                }}
              >
                {copied ? '✓ 已复制链接' : '🔗 复制命盘链接'}
              </button>

              {/* 【命盘分享二维码】扫码看盘 */}
              {qrDataURL && (
                <div style={{
                  display:'flex', alignItems:'center', gap:14,
                  padding:'14px 16px',
                  background:'linear-gradient(135deg, rgba(184,146,42,0.06), rgba(184,146,42,0.02))',
                  border:'1.5px dashed rgba(184,146,42,0.4)',
                  borderRadius:12,
                }}>
                  <div style={{
                    flexShrink:0,
                    width:104, height:104,
                    background:'white',
                    borderRadius:8,
                    padding:6,
                    boxShadow:'0 2px 6px rgba(0,0,0,0.08)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <img src={qrDataURL} alt="命盘二维码" width={92} height={92} style={{display:'block'}} />
                  </div>
                  <div style={{flex:1, fontSize:12, color:'#5a4520', lineHeight:1.7}}>
                    <div style={{fontWeight:600, color:'#8b6a14', marginBottom:4, letterSpacing:'0.1em', fontSize:13}}>
                      📱 扫码看命盘
                    </div>
                    <div style={{color:'#7a6334', marginBottom:6}}>
                      微信扫描二维码，对方可看本张命盘 (只读)
                    </div>
                    <div style={{
                      fontSize:10, color:'#a89b7c', fontFamily:'ui-monospace, monospace',
                      wordBreak:'break-all', lineHeight:1.4,
                      maxHeight:36, overflow:'hidden',
                    }}>
                      {shareUrl.length > 60 ? shareUrl.slice(0, 60) + '…' : shareUrl}
                    </div>
                  </div>
                </div>
              )}

              <div style={{
                fontSize: '11px', color: '#a89b7c', lineHeight: 1.7,
                padding: '10px 12px', background: 'rgba(184,146,42,0.05)',
                borderRadius: '8px', marginTop: '4px',
              }}>
                <div style={{ marginBottom: '4px', fontWeight: 600, color: '#8b6a14' }}>使用提示：</div>
                · 下载图片可发朋友圈 / 抖音 / 小红书<br />
                · 复制链接发给微信好友，对方点开看自己的盘起点
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
