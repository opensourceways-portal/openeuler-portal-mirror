import { computed } from 'vue';

import i18n from '~@/i18n';

const { t } = i18n.global;

import IconWhitePaper from '~icons/yuanrong/icon-white-paper.svg';
import IconCodeRepo from '~icons/yuanrong/icon-code-repo.svg';

export const COMS_REPO_LIST = computed(() => {
  return [
    {
      name: t('ubOsComponent.deviceMgmt'),
      rowKey: 'name',
      children: [
        {
          module: 'UB Device Mgmt',
          rowKey: 'module',
          children: [
            {
              function: 'UBus Driver',
              desc: t('ubOsComponent.com1Desc'),
              repoLink: ['openeuler/kernel/tree/OLK-6.6/drivers/ub/ubus', 'openeuler/kernel/tree/OLK-6.6/drivers/ub/ubfi'],
              repo: ['openeuler/kernel/drivers/ub/ubus', 'openeuler/kernel/drivers/ub/ubfi'],
            },
            {
              function: 'UVB',
              desc: t('ubOsComponent.com2Desc'),
              repoLink: 'openeuler/kernel/tree/OLK-6.6/drivers/firmware/uvb',
              repo: 'openeuler/kernel/drivers/firmware/uvb',
            },
            {
              function: 'ubtool',
              desc: t('ubOsComponent.com3Desc'),
              repoLink: 'openeuler/kernel/tree/OLK-6.6/drivers/fwctl/ub',
              repo: 'openeuler/kernel/drivers/fwctl/ub',
            },
          ],
        },
        {
          module: 'UB User Driver',
          rowKey: 'module',
          children: [
            {
              function: 'User UDMA driver',
              desc: t('ubOsComponent.com4Desc'),
              repoLink: 'openeuler/umdk/tree/master/src/urma/hw/udma',
              repo: 'openeuler/umdk/src/urma/hw/udma',
            },
            {
              function: 'libcdma',
              desc: t('ubOsComponent.com5Desc'),
              repoLink: 'openeuler/cdma',
              repo: 'openeuler/cdma',
            },
            {
              function: 'libummu',
              desc: t('ubOsComponent.com6Desc'),
              repoLink: 'openeuler/ummu',
              repo: 'openeuler/ummu',
            },
          ],
        },
        {
          module: 'Tools',
          rowKey: 'module',
          children: [
            {
              function: 'ubutils',
              desc: t('ubOsComponent.com7Desc'),
              repoLink: 'openeuler/ubutils',
              repo: 'openeuler/ubutils',
            },
            {
              function: 'ubtool',
              desc: t('ubOsComponent.com8Desc'),
              repoLink: 'openeuler/ubctl',
              repo: 'openeuler/ubctl',
            },
          ],
        },
      ],
    },
    {
      name: t('ubOsComponent.memoryMgmt'),
      rowKey: 'name',
      children: [
        {
          module: 'Pooled Memory Mgmt',
          rowKey: 'module',
          children: [
            {
              function: 'OBMM',
              desc: t('ubOsComponent.com9Desc'),
              repoLink: 'openeuler/kernel/tree/OLK-6.6/drivers/ub/obmm',
              repo: 'openeuler/kernel/drivers/ub/obmm',
            },
            {
              function: 'ummu-core',
              desc: t('ubOsComponent.com10Desc'),
              repoLink: 'openeuler/kernel/tree/OLK-6.6/drivers/iommu/hisilicon/ummu-core',
              repo: 'openeuler/kernel/drivers/iommu/hisilicon/ummu-core',
            },
            {
              function: 'sysSentry',
              desc: t('ubOsComponent.com11Desc'),
              repoLink: 'openeuler/kernel/tree/OLK-6.6/drivers/ub/sentry',
              repo: 'openeuler/kernel/drivers/ub/sentry',
            },
          ],
        },
        {
          module: 'UBMM Lib',
          rowKey: 'module',
          children: [
            {
              function: 'libobmm',
              desc: t('ubOsComponent.com12Desc'),
              repoLink: 'openeuler/obmm',
              repo: 'openeuler/obmm',
            },
            {
              function: 'sysSentry Service',
              desc: t('ubOsComponent.com13Desc'),
              repoLink: 'openeuler/sysSentry',
              repo: 'openeuler/sysSentry',
            },
          ],
        },
      ],
    },
    {
      name: t('ubOsComponent.communication'),
      rowKey: 'name',
      children: [
        {
          module: 'Connection Mgmt & Communication',
          rowKey: 'module',
          children: [
            {
              function: 'ubcore',
              desc: t('ubOsComponent.com14Desc'),
              repoLink: 'openeuler/kernel/tree/OLK-6.6/drivers/ub/urma/ubcore',
              repo: 'openeuler/kernel/drivers/ub/urma/ubcore',
            },
            {
              function: 'uburma',
              desc: t('ubOsComponent.com15Desc'),
              repoLink: 'openeuler/kernel/tree/OLK-6.6/drivers/ub/urma/uburma',
              repo: 'openeuler/kernel/drivers/ub/urma/uburma',
            },
            {
              function: 'ubagg',
              desc: t('ubOsComponent.com16Desc'),
              repoLink: 'openeuler/kernel/tree/OLK-6.6/drivers/ub/urma/ubagg',
              repo: 'openeuler/kernel/drivers/ub/urma/ubagg',
            },
            {
              function: 'UMS',
              desc: t('ubOsComponent.com17Desc'),
              repoLink: 'openeuler/umdk/tree/master/src/usock/ums',
              repo: 'openeuler/umdk/src/usock/ums',
            },
          ],
        },
        {
          module: 'UBComm Lib',
          rowKey: 'module',
          children: [
            {
              function: 'liburma',
              desc: t('ubOsComponent.com18Desc'),
              repoLink: 'openeuler/umdk/tree/master/src/urma/lib/urma/core',
              repo: 'openeuler/umdk/src/urma/lib/urma/core',
            },
            {
              function: 'libubagg',
              desc: t('ubOsComponent.com19Desc'),
              repoLink: 'openeuler/umdk/tree/master/src/urma/lib/urma/bond',
              repo: 'openeuler/umdk/src/urma/lib/urma/bond',
            },
            {
              function: 'uvs',
              desc: t('ubOsComponent.com20Desc'),
              repoLink: 'openeuler/umdk/tree/master/src/urma/lib/uvs',
              repo: 'openeuler/umdk/src/urma/lib/uvs',
            },
            {
              function: 'libdlock',
              desc: t('ubOsComponent.com21Desc'),
              repoLink: 'openeuler/umdk/tree/master/src/ulock/dlock',
              repo: 'openeuler/umdk/src/ulock/dlock',
            },
            {
              function: 'liburpc',
              desc: t('ubOsComponent.com22Desc'),
              repoLink: 'openeuler/umdk/tree/master/src/urpc/framework',
              repo: 'openeuler/umdk/src/urpc/framework',
            },
            {
              function: 'libumq',
              desc: t('ubOsComponent.com23Desc'),
              repoLink: 'openeuler/umdk/tree/master/src/urpc/umq',
              repo: 'openeuler/umdk/src/urpc/umq',
            },
          ],
        },
        {
          module: 'Tools',
          rowKey: 'module',
          children: [
            {
              function: 'urma tools',
              desc: t('ubOsComponent.com25Desc'),
              repoLink: 'openeuler/umdk/tree/master/src/urma/tools',
              repo: 'openeuler/umdk/src/urma/tools',
            },
            {
              function: 'ums tools',
              desc: t('ubOsComponent.com26Desc'),
              repoLink: 'openeuler/umdk/tree/master/src/usock/ums/tools',
              repo: 'openeuler/umdk/src/usock/ums/tools',
            },
            {
              function: 'urpc tools',
              desc: t('ubOsComponent.com27Desc'),
              repoLink: 'openeuler/umdk/tree/master/src/urpc/tools',
              repo: 'openeuler/umdk/src/urpc/tools',
            },
          ],
        },
      ],
    },
    {
      name: t('ubOsComponent.virtualization'),
      rowKey: 'name',
      children: [
        {
          module: 'vfio-ub',
          rowKey: 'module',
          function: 'vfio-ub',
          desc: t('ubOsComponent.com28Desc'),
          repoLink: 'openeuler/kernel/tree/OLK-6.6/drivers/vfio/ubus',
          repo: 'openeuler/kernel/drivers/vfio/ubus',
        },
        {
          module: 'QEMU',
          function: 'qemu',
          desc: t('ubOsComponent.com29Desc'),
          repoLink: 'openeuler/qemu',
          repo: 'openeuler/qemu',
        },
        {
          module: 'libvirt',
          function: 'libvirt',
          desc: t('ubOsComponent.com30Desc'),
          repoLink: 'openeuler/libvirt',
          repo: 'openeuler/libvirt',
        },
      ],
    },
    {
      name: t('ubOsComponent.deviceDriver'),
      rowKey: 'name',
      children: [
        {
          module: 'unic driver',
          function: 'UNIC',
          desc: t('ubOsComponent.com31Desc'),
          repoLink: 'openeuler/kernel/tree/OLK-6.6/drivers/net/ub',
          repo: 'openeuler/kernel/drivers/net/ub',
        },
        {
          module: 'udma driver',
          function: 'UDMA driver',
          desc: t('ubOsComponent.com32Desc'),
          repoLink: 'openeuler/kernel/tree/OLK-6.6/drivers/ub/urma/hw/udma',
          repo: 'openeuler/kernel/drivers/ub/urma/hw/udma',
        },
        {
          module: 'cdma driver',
          function: 'CDMA',
          desc: t('ubOsComponent.com33Desc'),
          repoLink: 'openeuler/kernel/tree/OLK-6.6/drivers/ub/cdma',
          repo: 'openeuler/kernel/drivers/ub/cdma',
        },
        {
          module: 'ummu driver',
          function: 'ummu driver',
          desc: t('ubOsComponent.com34Desc'),
          repoLink: 'openeuler/kernel/tree/OLK-6.6/drivers/iommu/hisilicon',
          repo: 'openeuler/kernel/drivers/iommu/hisilicon',
        },
      ],
    },
    {
      name: t('ubOsComponent.perfOptimize'),
      rowKey: 'name',
      children: [
        {
          module: 'memlink',
          function: 'memlink',
          desc: t('ubOsComponent.com35Desc'),
          repoLink: 'openeuler/memlink',
          repo: 'openeuler/memlink',
        },
        {
          module: 'UB Turbo',
          rowKey: 'module',
          children: [
            {
              function: 'HAM',
              desc: t('ubOsComponent.com36Desc'),
              repoLink: 'openeuler/ham',
              repo: 'openeuler/ham',
            },
            {
              function: 'RMRS Agent',
              desc: t('ubOsComponent.com37Desc'),
              repoLink: 'openeuler/ubturbo',
              repo: 'openeuler/ubturbo',
            },
            {
              function: 'SMAP',
              desc: t('ubOsComponent.com38Desc'),
              repoLink: 'openeuler/ubturbo',
              repo: 'openeuler/ubturbo',
            },
          ],
        },
      ],
    },
  ];
});

export const relatedLinks = {
  zh: [
    {
      icon: IconWhitePaper,
      title: '灵衢总线官网',
      desc: '查看灵衢基础规范、白皮书等',
      href: 'https://www.unifiedbus.com/zh',
      isOutlink: true,
    },
    {
      icon: IconCodeRepo,
      title: '相关 SIG 组',
      desc: '查看 sig-UnifiedBus 会议、联系方式等信息',
      href: '/zh/sig/sig-UnifiedBus',
    },
  ],
  en: [
    {
      icon: IconWhitePaper,
      title: 'UnifiedBus',
      desc: 'Explore UnifiedBus specifications and white paper.',
      href: 'https://www.unifiedbus.com/en',
      isOutlink: true,
    },
    {
      icon: IconCodeRepo,
      title: 'sig-UnifiedBus',
      desc: 'View meeting schedules and contact details.',
      href: '/en/sig/sig-UnifiedBus',
    },
  ]
}
