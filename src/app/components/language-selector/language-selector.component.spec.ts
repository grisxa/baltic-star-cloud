import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {AppRoutingModule} from '../../app-routing.module';

import {LanguageSelectorComponent} from './language-selector.component';

describe('LanguageSelectorComponent', () => {
  let component: LanguageSelectorComponent;
  let fixture: ComponentFixture<LanguageSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LanguageSelectorComponent],
      imports: [
        AppRoutingModule,
        FormsModule,
        MatSelectModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;
    spyOn(component, 'onChange');
    fixture.detectChanges();
  });

  it('should create and redirect to default language', () => {
    expect(component).toBeTruthy();
    expect(component.onChange).toHaveBeenCalledWith('en-US');
  });

  describe('locale detection', () => {
    it('should accept empty path', () => {
      component.extractLocale('');
      expect(component.siteLocale).not.toBeDefined();
      expect(component.siteLanguage).not.toBeDefined();
    });

    it('should accept just the root', () => {
      component.extractLocale('/');
      expect(component.siteLocale).not.toBeDefined();
      expect(component.siteLanguage).not.toBeDefined();
    });

    it('should match en-US', () => {
      component.extractLocale('/en-US');
      expect(component.siteLocale).toEqual('en-US');
      expect(component.siteLanguage).toEqual('English');
    });

    it('should match ru', () => {
      component.extractLocale('/ru');
      expect(component.siteLocale).toEqual('ru');
      expect(component.siteLanguage).toBeDefined();
    });

    it('should not match de (no translation)', () => {
      component.extractLocale('/de');
      expect(component.siteLocale).not.toBeDefined();
      expect(component.siteLanguage).not.toBeDefined();
    });
  });

  describe('path suffix extraction', () => {
    it('should accept empty path', () => {
      expect(component.localizedSuffix('')).toEqual([]);
    });

    it('should accept just the root', () => {
      expect(component.localizedSuffix('/')).toEqual([]);
    });

    it('should remove en-US', () => {
      expect(component.localizedSuffix('/en-US')).toEqual([]);
    });

    it('should remove ru', () => {
      expect(component.localizedSuffix('ru/any')).toEqual(['any']);
    });

    it('should keep anything else', () => {
      expect(component.localizedSuffix('none')).toEqual(['none']);
    });
  });

  describe('redirection', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(LanguageSelectorComponent);
      component = fixture.componentInstance;
      spyOn(component, 'localizedSuffix').and.returnValue(['test', 'path']);
      spyOn(component, 'getLocation').and.returnValue('/en-US/brevets');
      spyOn(component, 'setLocation').and.returnValue(undefined);
      //window.onbeforeunload = jasmine.createSpy();
      fixture.detectChanges();
    });
    it('should depend on a pathname', () => {
      expect(component).toBeTruthy();
      expect(component.getLocation).toHaveBeenCalled();
    });

    it('should use a hardcoded testing path', () => {
      expect(component.getLocation()).toEqual('/en-US/brevets');
    });

    it('should keep a suffix and replace the locale', () => {
      component.onChange('de');
      expect(component.getLocation).toHaveBeenCalled();
      expect(component.localizedSuffix).toHaveBeenCalledWith('/en-US/brevets');
      expect(component.setLocation).toHaveBeenCalledWith('/de/test/path');
    });
  });
});
