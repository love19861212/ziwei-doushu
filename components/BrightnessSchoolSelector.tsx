'use client';
/**
 * 主星亮度表切换面板
 * Oracle 站叫 "14 主星亮度表" 按钮 (右下角✦)
 *
 * 功能:
 *  - 5 派系选择: 默认/斗数全书/现代修正v1/中州派/现代修正v2
 *  - 14 主星 × 12 地支 = 168 个亮度值显示
 *  - 选择后实时刷新命盘
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BRIGHTNESS_SCHOOL_INFO,
  BRIGHTNESS,
  ALL_14_STARS,
  type BrightnessSchool,
  getBrightnessLabel,
  getBrightnessColor,
} from '@/lib/ziwei/brightness-schools';

// 12地支
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

interface BrightnessSchoolSelectorProps {
  open: boolean;
  onClose: () => void;
  currentSchool: BrightnessSchool;
  onSchoolChange: (school: BrightnessSchool) => void;
}

export default function BrightnessSchoolSelector({
  open,
  onClose,
  currentSchool,
  onSchoolChange,
}: BrightnessSchoolSelectorProps) {
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
              maxWidth: '480px',
              maxHeight: '85vh',
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
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--tx-1)' }}>
                  14 主星亮度表
                </div>
                <div style={{ fontSize: '11px', color: 'var(--tx-3)', marginTop: '2px' }}>
                  切换不同派系的庙旺落陷判断
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

            {/* 派系选择 */}
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--bdr)' }}>
              <div style={{ fontSize: '11px', color: 'var(--tx-3)', marginBottom: '8px', letterSpacing: '0.1em' }}>
                排盘派系
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(Object.keys(BRIGHTNESS_SCHOOL_INFO) as BrightnessSchool[]).map(school => {
                  const info = BRIGHTNESS_SCHOOL_INFO[school];
                  const isActive = school === currentSchool;
                  return (
                    <button
                      key={school}
                      onClick={() => onSchoolChange(school)}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: isActive ? 'rgba(212,168,67,0.15)' : 'transparent',
                        border: isActive ? '1px solid var(--ac)' : '1px solid var(--bdr)',
                        color: isActive ? 'var(--ac)' : 'var(--tx-2)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>
                        {isActive ? '● ' : '○ '}{info.label}
                      </div>
                      <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.7 }}>
                        {info.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 亮度表 */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '12px 18px',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--tx-3)', marginBottom: '8px', letterSpacing: '0.1em' }}>
                14 主星 × 12 地支 庙旺表（{BRIGHTNESS_SCHOOL_INFO[currentSchool].label}）
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '4px 2px', color: 'var(--tx-3)', textAlign: 'left', position: 'sticky', top: 0, background: 'var(--bg-0)' }}>星</th>
                    {BRANCHES.map(b => (
                      <th key={b} style={{ padding: '4px 0', color: 'var(--tx-3)', textAlign: 'center', position: 'sticky', top: 0, background: 'var(--bg-0)' }}>{b}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_14_STARS.map(star => (
                    <tr key={star} style={{ borderTop: '1px solid var(--bdr)' }}>
                      <td style={{ padding: '4px 2px', color: 'var(--tx-1)', fontWeight: 600 }}>{star}</td>
                      {BRANCHES.map((_, idx) => {
                        const level = BRIGHTNESS[currentSchool][star]?.[idx] || 'normal';
                        return (
                          <td key={idx} style={{
                            padding: '4px 0',
                            textAlign: 'center',
                            color: getBrightnessColor(level),
                            fontWeight: 600,
                          }}>
                            {getBrightnessLabel(level).charAt(0)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: '8px', fontSize: '9px', color: 'var(--tx-3)', display: 'flex', gap: '12px' }}>
                <span><span style={{ color: '#22c55e' }}>庙</span>=庙旺</span>
                <span><span style={{ color: '#94a3b8' }}>平</span>=平和</span>
                <span><span style={{ color: '#ef4444' }}>陷</span>=落陷</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
