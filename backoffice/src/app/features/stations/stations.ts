import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { StationService } from '../../core/services/station.service';
import { Station, StatutStation } from '../../core/models/station.model';

@Component({
  selector: 'app-stations',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './stations.html',
  styleUrl: './stations.scss',
})
export class Stations implements OnInit {
  searchTerm = '';
  statusFilter: StatutStation | 'all' = 'all';

  stations: Station[] = [];
  loading = true;
  errorMessage: string | null = null;

  statusLabels: Record<StatutStation, string> = {
    ACTIVE: 'Active',
    MAINTENANCE: 'Maintenance',
    HORS_SERVICE: 'Hors service',
  };

  constructor(private stationService: StationService) {}

  ngOnInit(): void {
    this.loadStations();
  }

  loadStations(): void {
    this.loading = true;
    this.errorMessage = null;

    this.stationService.getAllStations().subscribe({
      next: (stations) => {
        this.stations = stations;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stations', err);
        this.errorMessage =
          'Impossible de charger les stations. Vérifiez que le backend est démarré.';
        this.loading = false;
      },
    });
  }

  get filteredStations(): Station[] {
    return this.stations.filter((s) => {
      const matchesSearch =
        !this.searchTerm ||
        s.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        s.ville.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || s.statut === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  setStatusFilter(status: StatutStation | 'all'): void {
    this.statusFilter = status;
  }

  bornesOccupied(station: Station): number {
    return station.bornes.filter((b) => b.statut === 'OCCUPEE').length;
  }

  bornesFree(station: Station): number {
    return station.bornes.filter((b) => b.statut === 'DISPONIBLE').length;
  }

  bornesBroken(station: Station): number {
    return station.bornes.filter((b) => b.statut === 'HORS_SERVICE').length;
  }

  occupancyPercent(station: Station): number {
    if (station.bornes.length === 0) return 0;
    return Math.round((this.bornesOccupied(station) / station.bornes.length) * 100);
  }
}