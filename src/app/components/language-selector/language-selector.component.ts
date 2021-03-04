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

  getLocation = () => window.location.pathname;

  // in the development mode redirection is unavailable
  setLocation = (path: string) => !isDevMode() ? window.location.href = path : '';

  ngOnInit(): void {
    this.extractLocale(this.getLocation());
    if (!this.siteLanguage) {
      this.onChange(this.languageList[0].code);
    }
  }

  extractLocale(pathname: string) {
    const locale = pathname.split('/')[1];
    const match = this.languageList.find((language) => language.code === locale);
    this.siteLocale = match ? locale : undefined;
    this.siteLanguage = match ? match.label : undefined;
  }

  localizedSuffix(pathname: string): string[] {
    const languageCodes = this.languageList.map((language: Language) => language.code);
    return pathname.split('/').filter((part: string) => {
      return part !== '' && !languageCodes.includes(part);
    });
  }

  onChange(newLocale: string) {
    this.setLocation(`/${newLocale}/` + this.localizedSuffix(this.getLocation()).join('/'));
  }
}
