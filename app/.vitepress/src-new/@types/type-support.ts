export interface BaseQueryT {
  page: number;
  size: number;
}

export interface CompatibilityQueryT {
  pages: BaseQueryT;
  architecture: string;
  keyword: string;
  cpu: string;
  os: string;
  testOrganization: string;
  type: string;
  cardType: string;
  lang: string;
  dataSource: string;
  solution: string;
  certificationType: string;
}

export interface AdapterListT {
  architecture: string;
  boardModel: string;
  chipModel: string;
  chipVendor: string;
  date: string;
  deviceID: string;
  downloadLink: string;
  driverName: string;
  driverSize: string;
  hardwareId: number;
  id: number;
  item: string;
  lang: string;
  os: string;
  sha256: string;
  ssID: string;
  svID: string;
  type: string;
  updateTime: string;
  vendorID: string;
  version: string;
}
