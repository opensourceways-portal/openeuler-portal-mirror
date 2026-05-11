import quickStartBg from '~@/assets/category/intelligence/quick-start-bg.png';
import advancedMasterBg from '~@/assets/category/intelligence/advanced-master-bg.png';
import aiMasterBg from '~@/assets/category/intelligence/ai-master-bg.png';
import moreResourcesBg from '~@/assets/category/intelligence/more-resources-bg.png';

import quickStartBgDark from '~@/assets/category/intelligence/quick-start-bg-dark.png';
import advancedMasterBgDark from '~@/assets/category/intelligence/advanced-master-bg-dark.png';
import aiMasterBgDark from '~@/assets/category/intelligence/ai-master-bg-dark.png';
import moreResourcesBgDark from '~@/assets/category/intelligence/more-resources-bg.png';

export const deployList = [
  {
    id: 'quick-start',
    title: {
      zh: 'Witty Assistant',
      en: 'Witty Assistant',
    },
    img: quickStartBg,
    imgDark: quickStartBgDark,
    list: [
      {
        text: '智能助手 CLI 用户手册',
        href: 'https://docs.openeuler.openatom.cn/zh/docs/24.03_LTS_SP3/tools/ai/euler-copilot-framework/witty_assistant/witty_shell/user_guide/introduce.html',
      },
      {
        text: '智能助手 Web 用户手册',
        href: 'https://docs.openeuler.openatom.cn/zh/docs/24.03_LTS_SP3/tools/ai/euler-copilot-framework/witty_assistant/witty_web/user_guide/introduction.html',
      },
    ],
  },
  {
    id: 'advanced-master',
    title: {
      zh: 'XPU Turbo',
      en: 'XPU Turbo',
    },
    img: advancedMasterBg,
    imgDark: advancedMasterBgDark,
    list: [
      {
        text: 'XPU Turbo',
        href: 'https://docs.openeuler.openatom.cn/zh/docs/24.03_LTS_SP3/tools/ai/euler-copilot-framework/xpu_turbo/deploy_guide/deployment.html',
      },
    ],
  },
  {
    id: 'ai-master',
    title: {
      zh: 'AI全栈',
      en: 'AI Full Stack',
    },
    img: aiMasterBg,
    imgDark: aiMasterBgDark,
    list: [
      {
        text: 'AI容器镜像用户指南',
        href: 'https://docs.openeuler.openatom.cn/zh/docs/24.03_LTS_SP3/tools/ai/euler-copilot-framework/ai_full_stack/ai_container_image_userguide/ai_container_image_user_guide.html',
      },
      {
        text: 'AI大模型服务镜像使用指南',
        href: 'https://docs.openeuler.openatom.cn/zh/docs/24.03_LTS_SP3/tools/ai/euler-copilot-framework/ai_full_stack/ai_large_model_service_images_userguide/llm_service_image_user_guide.html',
      },
    ],
  },
  {
    id: 'more-resources',
    title: {
      zh: '更多资源',
      en: 'More resources',
    },
    img: moreResourcesBg,
    imgDark: moreResourcesBgDark,
    list: [
      {
        text: '版本与兼容性信息',
        href: 'https://atomgit.com/openeuler/euler-copilot-framework/blob/master/documents/user-guide/%E7%89%88%E6%9C%AC%E5%8F%8A%E5%85%BC%E5%AE%B9%E6%80%A7%E8%AF%B4%E6%98%8E.md',
      },
    ],
  },
];
