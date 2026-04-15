import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SolarSystemComponent } from './solar-system/solar-system.component';
import { PlanetCardComponent } from './solar-system/planet-card/planet-card.component';

@NgModule({
  declarations: [
    AppComponent,
    SolarSystemComponent,
    PlanetCardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
