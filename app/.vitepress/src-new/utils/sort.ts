import { pinyin } from 'pinyin-pro';

export interface MemberItem {
  name: string;
  position: string[];
  [key: string]: any;
}

export function sortByPinyin<T extends MemberItem>(
  members: T[],
  chairmanTitle: string = '主席'
): T[] {
  if (!members?.length) return members;

  const chairman = members.filter((m) =>
    m.position?.includes(chairmanTitle)
  );
  const committee = members
    .filter((m) => !m.position?.includes(chairmanTitle))
    .sort((a, b) => {
      const pinyinA = getPinyinInitial(a.name);
      const pinyinB = getPinyinInitial(b.name);
      return pinyinA.localeCompare(pinyinB);
    });

  return [...chairman, ...committee];
}

function getPinyinInitial(name: string): string {
  if (!name) return '';
  return pinyin(name.charAt(0), {
    pattern: 'first',
    toneType: 'none',
  }).toUpperCase();
}