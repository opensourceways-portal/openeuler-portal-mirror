// 列表数据
export interface SecurityListsT {
  affectedComponent: string;
  affectedProduct: string;
  announcementTime: string;
  cveId?: string;
  cveList?: string;
  cvrf?: null;
  description?: string;
  id: number;
  introduction?: string;
  notice_type?: string;
  packageHelperList?: [];
  packageHotpatchList?: null;
  packageList?: [];
  packageName: string;
  referenceDocuments: string;
  referenceList?: string;
  revisionHistory?: string;
  securityNoticeNo: string;
  subject?: string;
  summary: string;
  type: string;
  updateTime: string;
}

export interface BaseQueryT {
  page: number;
  size: number;
}

// 搜索参数
export interface SafetyBulletinQueryT {
  pages: BaseQueryT;
  keyword: string;
  type: [];
  date: [];
  affectedProduct: [];
  affectedComponent: string;
  noticeType: string;
}
