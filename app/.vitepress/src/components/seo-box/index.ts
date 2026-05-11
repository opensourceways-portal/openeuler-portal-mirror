import type { App } from 'vue';
import SeoBox from './src/seo-box';

SeoBox.install = function (app: App) {
  app.component(SeoBox.name, SeoBox);
};

export { SeoBox };
