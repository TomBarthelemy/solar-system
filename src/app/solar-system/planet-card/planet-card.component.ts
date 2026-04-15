import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PLANET_DISPLAY_DATA, PlanetDisplayData } from '../planet-display-data';

@Component({
  selector: 'app-planet-card',
  templateUrl: './planet-card.component.html',
  styleUrls: ['./planet-card.component.scss'],
})
export class PlanetCardComponent {
  @Input() planet!: string;
  @Input() planetOrder!: string[];
  @Input() accentColor = 'rgba(255,255,255,0.3)';

  @Output() closed = new EventEmitter<void>();
  @Output() navigated = new EventEmitter<-1 | 1>();

  readonly planetData = PLANET_DISPLAY_DATA;

  get data(): PlanetDisplayData {
    return this.planetData[this.planet];
  }

  get selectedPlanetIndex(): number {
    return this.planetOrder.indexOf(this.planet);
  }

  get prevPlanetName(): string {
    const idx = this.selectedPlanetIndex;
    return this.planetData[
      this.planetOrder[(idx - 1 + this.planetOrder.length) % this.planetOrder.length]
    ]?.displayName ?? '';
  }

  get nextPlanetName(): string {
    const idx = this.selectedPlanetIndex;
    return this.planetData[
      this.planetOrder[(idx + 1) % this.planetOrder.length]
    ]?.displayName ?? '';
  }
}
