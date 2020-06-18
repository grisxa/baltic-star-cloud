import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl'
})
export class SafeUrlPipe implements PipeTransform {

  constructor(private sanitized: DomSanitizer) {}
  transform(value: string, args?: any): any {
    console.log('= safe', value);
    return this.sanitized.bypassSecurityTrustResourceUrl(value);
  }
}
