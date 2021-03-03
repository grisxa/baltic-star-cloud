import {browser, logging} from 'protractor';
import {BrevetListPage} from './brevet-list.po';

describe('Brevet list scope', () => {
  let page: BrevetListPage;

  beforeEach(() => {
    page = new BrevetListPage();
  });

  it('should display upcoming brevets header', async () => {
    await page.navigateTo();
    expect(await page.getHeaderText()).toEqual('Upcoming brevets');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
