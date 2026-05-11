import i18n from '~@/i18n';

const { t } = i18n.global;

export const EMAIL_REGEX = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

export const INTERVAL_DAY = 0;
export const INTERVAL_WEEK = 1;
export const INTERVAL_MONTH = 2;

export const CYCLE_TYPE_OPTIONS = [
  {
    label: t('home.day'),
    value: INTERVAL_DAY,
    max: 7,
  },
  {
    label: t('home.week'),
    value: INTERVAL_WEEK,
    max: 2,
  },
  {
    label: t('home.month'),
    value: INTERVAL_MONTH,
    max: 1,
  },
];

export const WEEKDAY = [
  t('home.sunday'),
  t('home.monday'),
  t('home.tuesday'),
  t('home.wednesday'),
  t('home.thursday'),
  t('home.friday'),
  t('home.saturday'),
];

const getWeekOptions = () => {
  const list = [];
  for (let i = 1; i <= 7; i++) {
    const idx = i % 7;
    list.push({
      value: idx,
      label: WEEKDAY[idx],
    });
  }
  return list;
};

export const INTERVAL_WEEK_OPTIONS = getWeekOptions();
