import {browser, logging} from 'protractor';
import {AppPage} from './app.po';

describe('Application scope', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display home link', async () => {
    await page.navigateTo();
    expect(await page.getHomeLinkText()).toEqual('Brevet list');
  });

  it('should display home icon', async () => {
    await page.navigateTo();
    expect(await page.getHomeIconText()).toEqual('home');
  });

  it('should miss a default language', async () => {
    await page.navigateTo();
    expect(await page.getLanguageSelectorText()).toEqual('');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
