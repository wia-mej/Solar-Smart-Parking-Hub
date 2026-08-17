import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { StationService } from '../../core/services/station.service';
import {
  NewBorneRequest,
  Station,
  StatutStation,
  TypeBorne,
} from '../../core/models/station.model';

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

  // --- Formulaire "Nouvelle station" ---
  showModal = false;
  submitting = false;
  formError: string | null = null;
  newStationForm = this.emptyForm();

  constructor(
    private stationService: StationService,
    private cdr: ChangeDetectorRef,
  ) {}

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
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stations', err);
        this.errorMessage =
          'Impossible de charger les stations. Vérifiez que le backend est démarré.';
        this.loading = false;
        this.cdr.detectChanges();
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
    return station.bornes.filter((b) => b.statut === 'OCCUPEE' || b.statut === 'RESERVEE').length;
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

  // --- Formulaire "Nouvelle station" ---

  private emptyForm() {
    return {
      nom: '',
      adresse: '',
      ville: '',
      latitude: null as number | null,
      longitude: null as number | null,
      puissanceSolaireInstalleeKw: null as number | null,
      statut: 'ACTIVE' as StatutStation,
      bornes: [this.emptyBorne()],
    };
  }

  private emptyBorne(): NewBorneRequest {
    return { identifiant: '', type: 'AC' as TypeBorne, puissanceKw: 0 };
  }

  openModal(): void {
    this.newStationForm = this.emptyForm();
    this.formError = null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  addBorneRow(): void {
    this.newStationForm.bornes.push(this.emptyBorne());
  }

  removeBorneRow(index: number): void {
    this.newStationForm.bornes.splice(index, 1);
  }

  submitStation(): void {
    this.formError = null;

    if (!this.newStationForm.nom || !this.newStationForm.ville || !this.newStationForm.adresse) {
      this.formError = 'Le nom, la ville et l’adresse sont obligatoires.';
      return;
    }

    const bornesValides = this.newStationForm.bornes.filter((b) => b.identifiant.trim() !== '');
    if (bornesValides.length === 0) {
      this.formError = 'Ajoute au moins une borne avec un identifiant.';
      return;
    }

    this.submitting = true;

    this.stationService
      .createStation({
        nom: this.newStationForm.nom,
        adresse: this.newStationForm.adresse,
        ville: this.newStationForm.ville,
        latitude: this.newStationForm.latitude ?? 0,
        longitude: this.newStationForm.longitude ?? 0,
        puissanceSolaireInstalleeKw: this.newStationForm.puissanceSolaireInstalleeKw ?? 0,
        statut: this.newStationForm.statut,
        bornes: bornesValides,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.closeModal();
          this.loadStations();
        },
        error: (err) => {
          console.error('Erreur lors de la création de la station', err);
          this.formError = 'Impossible de créer la station. Vérifiez que le backend est démarré.';
          this.submitting = false;
          this.cdr.detectChanges();
        },
      });
  }
}