import {Component} from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer,
              public router: Router) {
    this.matIconRegistry
      .addSvgIcon(
        'icon_bed',
        this.domSanitizer
          .bypassSecurityTrustResourceUrl('/assets/icons/iconify-bed.svg')
      )
      .addSvgIcon(
        'icon_qr',
        this.domSanitizer
          .bypassSecurityTrustResourceUrl('/assets/icons/iconify-qr.svg')
      )
      .addSvgIcon(
        'icon_strava',
        this.domSanitizer
          .bypassSecurityTrustResourceUrl('/assets/icons/strava.svg')
      );
  }
}
