import {Component, isDevMode, OnInit} from '@angular/core';

interface Language {
  code: string;
  label: string;
}

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html'
})
export class LanguageSelectorComponent implements OnInit {
  siteLanguage: string;
  siteLocale: string;

  languageList: Language[] = [
    {code: 'en-US', label: 'English'},
    {code: 'ru', label: 'Русский'},
  ];

  /**
   * A getter of the location's pathname
   */
  getLocation = () => window.location.pathname;

  /**
   * A setter of location's href (effectively redirects to the new address).
   * Disabled in the development mode due to redirection is unavailable.
   * @param path The new pathname
   */
  setLocation = (path: string) => !isDevMode() ? window.location.href = path : '';

  ngOnInit(): void {
    this.extractLocale(this.getLocation());
    if (!this.siteLanguage) {
      this.onChange(this.languageList[0].code);
    }
  }

  /**
   * Guess a locale based on the pathname like /en-US/page
   * @param pathname The path to examine
   */
  extractLocale(pathname: string) {
    const locale = pathname.split('/')[1];
    const match = this.languageList.find((language) => language.code === locale);
    this.siteLocale = match ? locale : undefined;
    this.siteLanguage = match ? match.label : undefined;
  }

  /**
   * Extract a suffix from the pathname when a locale is at the beginning.
   * @param pathname The path to examine
   */
  localizedSuffix(pathname: string): string[] {
    const languageCodes = this.languageList.map((language: Language) => language.code);
    return pathname.split('/').filter((part: string) => {
      return part !== '' && !languageCodes.includes(part);
    });
  }

  /**
   * Locale change callback: switch to /ru/path or similar.
   * Uses a suffix of the current path like /en-US/rest.
   * @param newLocale A language code
   */
  onChange(newLocale: string) {
    this.setLocation(`/${newLocale}/` + this.localizedSuffix(this.getLocation()).join('/'));
  }
}
