import {Component} from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer) {
    this.matIconRegistry
      .addSvgIcon(
        'icon_bed',
        this.domSanitizer
          .bypassSecurityTrustResourceUrl('/assets/icons/iconify-bed.svg')
      ).addSvgIcon(
      'icon_qr',
      this.domSanitizer
        .bypassSecurityTrustResourceUrl('/assets/icons/iconify-qr.svg')
    );
  }
}
