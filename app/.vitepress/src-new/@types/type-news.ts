export interface ParamsT {
  category: string;
  lang: string;
  page: number;
  pageSize: number;
  archives?: string;
  author?: string;
  tags?: string;
}

interface Condition {
  archives?: string;
  tags?: string;
  author?: string;
}

export interface TagsParams {
  lang: string;
  category: string;
  want: string;
  condition?: Condition;
}

export interface NewsDataT {
  archives: string;
  articleName: string;
  author: any;
  banner: string;
  category: string;
  date: string;
  lang: string;
  path: string;
  summary: string;
  tags: string[];
  textContent: string;
  title: string;
  type: string;
}
