import { Component, OnInit } from '@angular/core';

interface StatCard {
  icon: 'dollar' | 'users' | 'activity' | 'zap';
  iconBg: 'teal' | 'orange';
  value: string;
  unit?: string;
  label: string;
  badgeText: string;
  badgeUp: boolean;
}

interface AlertItem {
  label: string;
  detail: string;
  time: string;
  severity: 'critical' | 'warning';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  lastUpdatedSeconds = 5;

  stats: StatCard[] = [
    { icon: 'dollar', iconBg: 'teal', value: '152 979', unit: 'DH', label: 'Revenus mensuels', badgeText: '+12.4%', badgeUp: true },
    { icon: 'users', iconBg: 'teal', value: '1 892', label: 'Abonnés actifs', badgeText: '+38 ce mois', badgeUp: true },
    { icon: 'activity', iconBg: 'orange', value: '5', unit: '%', label: 'Taux d\'occupation', badgeText: '+4.1 pts', badgeUp: true },
    { icon: 'zap', iconBg: 'teal', value: '16.9', unit: 'kW', label: 'Énergie produite', badgeText: '-2.3% vs prédit', badgeUp: false },
  ];

  occupancy = {
    occupied: 1,
    free: 21,
    broken: 0,
    total: 22,
    percent: 5,
  };

  alerts: AlertItem[] = [
    { label: 'Borne #12 — Casablanca Centre', detail: 'Hors ligne depuis 40 min', time: 'Il y a 40 min', severity: 'critical' },
    { label: 'Onduleur RZ2', detail: 'Rendement anormalement bas', time: 'Il y a 1 h', severity: 'critical' },
    { label: 'Capteur météo — Rabat Agdal', detail: 'Données manquantes', time: 'Il y a 2 h', severity: 'warning' },
  ];
  alertsTotal = 5;
  alertsCritical = 2;

  realPath = '';
  predictedPath = '';
  areaPath = '';
  chartWidth = 800;
  chartHeight = 300;
  xLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];

  donutRadius = 70;
  donutCircumference = 2 * Math.PI * this.donutRadius;
  donutDashArray = '';

  ngOnInit(): void {
    this.buildProductionChart();
    this.donutDashArray = `${(this.occupancy.percent / 100) * this.donutCircumference} ${this.donutCircumference}`;
  }

  private buildProductionChart(): void {
    const padding = 20;
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const gaussian = (h: number, peak: number, sigma: number, max: number) =>
      Math.max(0, max * Math.exp(-Math.pow(h - peak, 2) / (2 * sigma * sigma)));

    const real = hours.map((h) => gaussian(h, 13, 3.4, 95));
    const predicted = hours.map((h) => gaussian(h, 13, 3.6, 92) + (Math.sin(h) * 1.5));

    const maxValue = Math.max(...real, ...predicted) * 1.1;
    const stepX = this.chartWidth / (hours.length - 1);

    const toPoints = (series: number[]) =>
      series.map((v, i) => ({
        x: i * stepX,
        y: padding + (1 - v / maxValue) * (this.chartHeight - padding * 2),
      }));

    const realPoints = toPoints(real);
    const predictedPoints = toPoints(predicted);

    this.realPath = this.toSmoothPath(realPoints);
    this.predictedPath = this.toSmoothPath(predictedPoints);
    this.areaPath = `${this.realPath} L ${this.chartWidth} ${this.chartHeight} L 0 ${this.chartHeight} Z`;
  }

  private toSmoothPath(points: { x: number; y: number }[]): string {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }
}