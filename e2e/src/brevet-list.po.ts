import {browser, by, element} from 'protractor';

export class BrevetListPage {
  async navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl + 'brevets');
  }

  async getHeaderText(): Promise<string> {
    return element(by.css('app-root app-brevet-list h2')).getText();
  }
}
