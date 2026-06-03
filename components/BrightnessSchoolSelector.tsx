'use client';
/**
 * 10 类排盘流派切换面板
 * 完全对标 Oracle 站 "✦ 排盘流派切换" 按钮
 *
 * 10 类开关 (按 Oracle 真实 schema):
 *  1. 14 主星亮度表
 *  2. 庚年四化
 *  3. 安天马
 *  4. 安天空
 *  5. 安截空旬空
 *  6. 安魁钺
 *  7. 安天使天伤
 *  8. 长生十二神
 *  9. 晚子时
 * 10. 闰月归属
 *
 * 支持 4 预设: 默认/文墨/倪海夏/中州/古籍
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SCHOOL_CATEGORIES,
  PRESETS,
  type SchoolConfig,
  type SchoolCategory,
} from '@/lib/ziwei/school-config';
import { BRIGHTNESS, ALL_14_STARS } from '@/lib/ziwei/brightness-schools';
import { getBrightnessLabel, getBrightnessColor } from '@/lib/ziwei/brightness-schools';

const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

interface SchoolSelectorProps {
  open: boolean;
  onClose: () => void;
  config: SchoolConfig;
  onConfigChange: (config: SchoolConfig) => void;
}

export default function SchoolSelector({
  open,
  onClose,
  config,
  onConfigChange,
}: SchoolSelectorProps) {
  const handleChange = (key: string, value: string) => {
    onConfigChange({ ...config, [key]: value });
  };

  const handlePreset = (presetConfig: SchoolConfig) => {
    onConfigChange(presetConfig);
  };

  const brightnessSchool = config.starBrightness || 'default';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={onClose}
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
              maxWidth: '520px',
              maxHeight: '92vh',
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
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--tx-1)' }}>
                  ✦ 排盘流派切换
                </div>
                <div style={{ fontSize: '11px', color: 'var(--tx-3)', marginTop: '2px' }}>
                  10 类开关 · 5 预设 · 完整对标 Oracle 站
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%', border: 'none',
                  background: 'rgba(0,0,0,0.05)', color: '#666', fontSize: '16px',
                  cursor: 'pointer', lineHeight: 1,
                }}
              >×</button>
            </div>

            {/* 预设 */}
            <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--bdr)' }}>
              <div style={{ fontSize: '10px', color: 'var(--tx-3)', marginBottom: '6px', letterSpacing: '0.1em' }}>
                预设
              </div>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {PRESETS.map(p => (
                  <button
                    key={p.name}
                    onClick={() => handlePreset(p.config)}
                    title={p.desc}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      background: 'var(--t-surface, rgba(255,255,255,0.04))',
                      border: '1px solid var(--bdr)',
                      color: 'var(--tx-1)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 10 类开关 */}
            <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px 40px' }}>
              {SCHOOL_CATEGORIES.map(cat => (
                <fieldset
                  key={cat.key}
                  style={{
                    border: 'none',
                    padding: 0,
                    margin: '0 0 18px',
                  }}
                >
                  <legend style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    color: 'var(--tx-1)',
                    marginBottom: '6px',
                    padding: 0,
                  }}>
                    {cat.label}
                  </legend>
                  <div style={{ fontSize: '10px', color: 'var(--tx-3)', marginBottom: '6px' }}>
                    {cat.desc}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {cat.options.map(opt => {
                      const isActive = config[cat.key] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleChange(cat.key, opt.value)}
                          style={{
                            textAlign: 'left',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: isActive ? 'rgba(212,168,67,0.15)' : 'transparent',
                            border: isActive ? '1px solid var(--ac)' : '1px solid var(--bdr)',
                            color: isActive ? 'var(--ac)' : 'var(--tx-1)',
                            cursor: 'pointer',
                            fontSize: '11px',
                            lineHeight: 1.4,
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>
                            {isActive ? '● ' : '○ '}{opt.label}
                          </span>
                          {opt.desc && (
                            <span style={{ marginLeft: '6px', fontSize: '9px', opacity: 0.6 }}>
                              {opt.desc}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}

              {/* 14 主星亮度表预览 */}
              <fieldset style={{ border: 'none', padding: 0, margin: '0 0 18px' }}>
                <legend style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tx-1)', marginBottom: '6px' }}>
                  亮度表预览（{brightnessSchool}）
                </legend>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '2px 0', color: 'var(--tx-3)', textAlign: 'left', position: 'sticky', top: 0, background: 'var(--bg-0)' }}>星</th>
                      {BRANCHES.map(b => (
                        <th key={b} style={{ padding: '2px 0', color: 'var(--tx-3)', textAlign: 'center', position: 'sticky', top: 0, background: 'var(--bg-0)' }}>{b}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_14_STARS.map(star => (
                      <tr key={star} style={{ borderTop: '1px solid var(--bdr)' }}>
                        <td style={{ padding: '2px 0', color: 'var(--tx-1)', fontWeight: 600 }}>{star}</td>
                        {BRANCHES.map((_, idx) => {
                          const level = (BRIGHTNESS as any)[brightnessSchool]?.[star]?.[idx] || 'normal';
                          return (
                            <td key={idx} style={{
                              padding: '2px 0',
                              textAlign: 'center',
                              color: getBrightnessColor(level as any),
                              fontWeight: 600,
                            }}>
                              {getBrightnessLabel(level as any).charAt(0)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </fieldset>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
