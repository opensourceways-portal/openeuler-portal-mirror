import { request } from '~@/shared/axios';
import {
  SafetyBulletinQueryT,
  ComponentQueryT,
  CveQueryT,
} from '@/shared/@types/type-support';
import { CompatibilityQueryT } from '~@/@types/type-support';

/**
 * 获取安全公告列表
 * @param { SafetyBulletinQueryT } 列表请求参数
 * @returns {Promise<ResponseT>} 安全公告列表
 */
export function getSecurityList(params: SafetyBulletinQueryT) {
  const url = '/api-cve/cve-security-notice-server/securitynotice/findAll';
  return request.post(url, params).then((res) => {
    return res?.data;
  });
}

/**
 * 获取影响产品-下拉列表
 * @returns { Promise<ResponseT> } 影响产品数据
 */
export function getProductList() {
  const url =
    '/api-cve/cve-security-notice-server/securitynotice/getAffectedProduct';
  return request.get(url).then((res) => {
    return res?.data;
  });
}

/**
 * 获取影响组件-下拉列表
 * @param { ComponentQueryT } 请求参数
 * @returns { Promise<ResponseT> } 影响组件数据
 */
export function getComponentList(params: ComponentQueryT) {
  Object.keys(params).forEach((key) => {
    if (!params[key as keyof ComponentQueryT]) {
      delete params[key as keyof ComponentQueryT];
    }
  });
  const url =
    '/api-cve/cve-security-notice-server/securitynotice/getAffectedComponent';
  return request.get(url, { params }).then((res) => {
    return res?.data;
  });
}

/**
 * 获取安全公告详情
 * @param { string } securityNoticeNo 公告名称
 * @returns { Promise<ResponseT> } 安全公告详情
 */
export function getSecurityDetail(securityNoticeNo: string) {
  const url = `/api-cve/cve-security-notice-server/securitynotice/getBySecurityNoticeNo?securityNoticeNo=${securityNoticeNo}`;
  return request.get(url).then((res) => {
    return res?.data.result;
  });
}

/**
 * 获取Cve列表
 * @param { CveQueryT } 请求参数
 * @returns { Promise<ResponseT> } CVE列表
 */
export function getCveList(params: CveQueryT) {
  const url = '/api-cve/cve-security-notice-server/cvedatabase/findAll';
  return request.post(url, params).then((res) => {
    return res?.data;
  });
}

/**
 * 获取Cve详情信息
 * @param { string } id cveId
 * @param { string } name packageName
 * @return { Promise<ResponseT> } cve详情信息
 */
export function getCveDetail(id: string, name: string) {
  const url = `/api-cve/cve-security-notice-server/cvedatabase/getByCveIdAndPackageName?cveId=${id}&packageName=${name}`;
  return request.get(url).then((res) => {
    return res?.data;
  });
}

/**
 * 获取Cve详情-影响产品信息
 * @param { string } id cveId
 * @param { string } name packageName
 * @return { Promise<ResponseT> } cve详情 - 影响产品列表
 */
export function getAffectedProduct(id: string, name: string) {
  const url = `/api-cve/cve-security-notice-server/cvedatabase/getCVEProductPackageList?cveId=${id}&packageName=${name}`;
  return request.get(url).then((res) => {
    return res?.data;
  });
}

/**
 * 获取整机系统版本
 * @returns {Promise<ResponseT>} 操作系统分类数据
 */
export function getOS() {
  const url = '/api-cve/cve-security-notice-server/hardwarecomp/getOS';
  return request.get(url).then((res) => {
    return res.data;
  });
}

/**
 * 获取架构分类
 * @returns {Promise<ResponseT>} 架构分类数据
 */
export function getArchitecture() {
  const url = '/api-cve/cve-security-notice-server/hardwarecomp/getArchitecture';
  return request.get(url).then((res) => {
    return res.data;
  });
}

/**
 * 获取CPU-筛选条件
 * @param {string} lang 语言
 * @returns {Promise<ResponseT>} CPU数据
 */
export function getCpu(lang: string) {
  const url = `/api-cve/cve-security-notice-server/hardwarecomp/getCpu?lang=${lang}`;
  return request.get(url).then((res) => {
    return res.data;
  });
}

/**
 * 获取整机列表
 * @param {CompatibilityQueryT} params 整机列表请求参数
 * @returns {Promise<ResponseT>} 整机列表
 */
export function getCompatibilityList(params: CompatibilityQueryT) {
  const url = '/api-cve/cve-security-notice-server/hardwarecomp/findAll';
  return request.post(url, params).then((res) => {
    return res.data;
  });
}

/**
 * 获取板卡类型-筛选条件
 * @param {string} lang 语言
 * @returns {Promise<ResponseT>} 板卡类型数据
 */
export function getDriveTypes(lang: string) {
  const url = `/api-cve/cve-security-notice-server/drivercomp/getType?lang=${lang}`;
  return request.get(url).then((res) => {
    return res.data;
  });
}

/**
 * 获取板卡列表
 * @param {CompatibilityQueryT} params 获取板卡列表请求参数
 * @returns {Promise<ResponseT>} 板卡列表
 */
export function getDriverList(params: CompatibilityQueryT) {
  const url = '/api-cve/cve-security-notice-server/drivercomp/findAll';
  return request.post(url, params).then((res) => {
    return res.data;
  });
}

/**
 * 获取测试机构-筛选条件
 * @return {Promise<ResponseT>} 测试机构
 */
export function getTestOrganizations() {
  const url = '/api-certification/server/certification/software/filterCriteria';
  return request.get(url).then((res) => {
    return res.data;
  });
}

/**
 * 获取商业软件列表
 * @param {CompatibilityQueryT} params 商业软件列表请求参数
 * @return {Promise<BussinessSoftT>} {totalNum:number, data:[]} 商业软件数据
 */
export function getBusinessSoftwareList(params: CompatibilityQueryT) {
  const queryData = {
    pageSize: params['pages'].size,
    pageNo: params['pages'].page,
    testOrganization: params.testOrganization,
    osName: params.os,
    keyword: params.keyword,
    dataSource: new Array(params.dataSource),
    productType: new Array('软件'),
  };
  const url = `/api-certification/server/certification/software/communityChecklist`;
  return request.post(url, queryData).then((res) => {
    return res.data;
  });
}

/**
 * 获取解决方案数据
 * @returns {Object}
 */
export function getSolution(params: { lang: string }) {
  const url = '/api-cve/cve-security-notice-server/solutioncomp/getSolution';
  return request.get(url, { params }).then((res) => {
    return res.data;
  });
}

/**
 * 获取认证类型数据
 * @returns {Object}
 */
export function getCertificationType(params: { lang: string }) {
  const url =
    '/api-cve/cve-security-notice-server/solutioncomp/getCertificationType';
  return request.get(url, { params }).then((res) => {
    return res.data;
  });
}

/**
 * 获取解决方案列表
 * @param {} params 请求参数
 * @return {Object}
 */
export function getSolutionList(params: CompatibilityQueryT) {
  const url = '/api-cve/cve-security-notice-server/solutioncomp/findAll';
  return request.post(url, params).then((res) => {
    return res.data;
  });
}

/**
 * 获取整机-兼容性配置 详情信息
 * @param {string} id 参数-兼容性列表id
 */
export function getConfigurationInfo(id: string) {
  const url = ` /api-cve/cve-security-notice-server/hardwarecomp/getOne?id=${id}`;
  return request.get(url).then((res) => {
    return res.data;
  });
}

/**
 * 获取整机->兼容性配置 详情信息->Adapter and Drivers列表
 * @param {string} id 兼容性列表单条数据id
 */
export function getdetailAapterList(id: string) {
  const url = ` /api-cve/cve-security-notice-server/hardwarecomp/getAdapterList?hardwareId=${id}`;
  return request.get(url).then((res) => {
    return res.data;
  });
}
