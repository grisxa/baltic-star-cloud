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

  ngOnInit(): void {
    this.extractLocale(window.location.pathname);
    if (!this.siteLanguage) {
      this.onChange(this.languageList[0].code);
    }
  }

  private extractLocale(pathname: string) {
    this.siteLocale = pathname.split('/')[1];
    this.siteLanguage = this.languageList.find(
      (language) => language.code === this.siteLocale
    )?.label;
  }

  onChange(newLocale: string) {
    if (isDevMode()) {
      return;
    }
    const languageCodes = this.languageList.map((language: Language) => language.code);
    const paths = window.location.pathname.split('/').filter((part: string) => {
      return part !== '' && !languageCodes.includes(part);
    });

    window.location.href = `/${newLocale}/` + paths.join('/');
  }
}
