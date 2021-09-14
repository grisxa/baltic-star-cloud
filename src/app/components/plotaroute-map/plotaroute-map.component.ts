import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-plotaroute-map',
  templateUrl: './plotaroute-map.component.html',
  styleUrls: ['./plotaroute-map.component.scss']
})
export class PlotarouteMapComponent implements OnChanges {
  @Input() mapId?: number;
  url?: string;

  ngOnChanges(changes: SimpleChanges) {
    this.mapId = changes.mapId.currentValue;
    this.url = `https://www.plotaroute.com/embedmap/${this.mapId}?units=km&hills=show`;
  }
}
