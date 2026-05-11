import { INTERVAL_MONTH, INTERVAL_WEEK, INTERVAL_WEEK_OPTIONS } from '~@/config/meeting';
import { findLabelFromOptions } from '~@/utils/common';

export const getPointStr = (cycle_type: number, points: number[]) => {
  if (cycle_type === INTERVAL_WEEK) {
    return points
      .sort((a, b) => {
        const aIdx = INTERVAL_WEEK_OPTIONS.findIndex((v) => v.value === a);
        const bIdx = INTERVAL_WEEK_OPTIONS.findIndex((v) => v.value === b);
        return aIdx - bIdx;
      })
      .map((point) => findLabelFromOptions(parseInt(point), INTERVAL_WEEK_OPTIONS))
      .join('、');
  }
  if (cycle_type === INTERVAL_MONTH) {
    return points.join('、') + '号';
  }
  return '';
};

// 处理发言人的序号
export const speakerNum = (val: string) => {
  const regex = /\d+/g;
  const match = val.match(regex) || '';

  return parseInt(match[0]);
};
