import {Component, OnInit} from '@angular/core';

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
    this.siteLocale = window.location.pathname.split('/')[1];
    this.siteLanguage = this.languageList.find(
      (language) => language.code === this.siteLocale
    )?.label;
    if (!this.siteLanguage) {
      this.onChange(this.languageList[0].code);
    }
  }

  onChange(newLocale: string) {
    window.location.href = `/${newLocale}/`;
  }
}
