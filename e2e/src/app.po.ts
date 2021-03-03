import {browser, by, element} from 'protractor';

export class AppPage {
  async navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl);
  }

  async getHomeIconText(): Promise<string> {
    return element(by.css('app-root .home mat-icon')).getText();
  }

  async getHomeLinkText(): Promise<string> {
    return element(by.css('app-root .home a')).getText();
  }

  async getLanguageSelectorText(): Promise<string> {
    return element(by.css('app-root app-language-selector .mat-select-value')).getText();
  }

}
