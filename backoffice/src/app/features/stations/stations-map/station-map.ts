import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as L from 'leaflet';

import { Station } from '../../../core/models/station.model';

@Component({
  selector: 'app-stations-map',
  standalone: true,
  imports: [],
  templateUrl: './stations-map.html',
  styleUrl: './stations-map.scss',
})
export class StationsMap implements AfterViewInit, OnChanges, OnDestroy {
  @Input() stations: Station[] = [];

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private map: L.Map | null = null;
  private markers: L.Marker[] = [];

  ngAfterViewInit(): void {
    this.map = L.map(this.mapContainer.nativeElement, { zoomControl: true }).setView(
      [33.5731, -7.5898],
      6,
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.renderMarkers();

    setTimeout(() => this.map?.invalidateSize(), 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stations'] && this.map) {
      this.renderMarkers();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private renderMarkers(): void {
    if (!this.map) return;

    this.markers.forEach((m) => m.remove());
    this.markers = [];

    const localisees = this.stations.filter((s) => s.latitude !== 0 && s.longitude !== 0);
    const bounds: L.LatLngTuple[] = [];

    for (const station of localisees) {
      const dispo = station.bornes.filter((b) => b.statut === 'DISPONIBLE').length;
      const complet = dispo === 0;

      const icon = L.divIcon({
        className: '',
        html: `<div class="station-pin ${complet ? 'pin-complet' : 'pin-libre'}"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const marker = L.marker([station.latitude, station.longitude], { icon }).addTo(this.map);

      const popup = document.createElement('div');
      popup.className = 'station-popup';
      const titre = document.createElement('div');
      titre.className = 'popup-title';
      titre.textContent = station.nom;
      const ville = document.createElement('div');
      ville.className = 'popup-city';
      ville.textContent = station.ville;
      const dispoEl = document.createElement('div');
      dispoEl.className = 'popup-dispo' + (complet ? ' popup-full' : '');
      dispoEl.textContent = `${dispo} borne(s) libre(s) sur ${station.bornes.length}`;
      popup.append(titre, ville, dispoEl);

      marker.bindPopup(popup);
      this.markers.push(marker);
      bounds.push([station.latitude, station.longitude]);
    }

    if (bounds.length === 1) {
      this.map.setView(bounds[0], 13);
    } else if (bounds.length > 1) {
      this.map.fitBounds(bounds, { padding: [45, 45] });
    }
  }
}