import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ng2-charts (latest) — use the directive import
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

// Leaflet - named imports (prevents unused 'L' warning)
import {
  Map,
  tileLayer,
  marker,
  divIcon,
  polyline,
  LatLngExpression
} from 'leaflet';
@Component({
  selector: 'app-fleet-dashboard',
  imports: [CommonModule, FormsModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './fleet-dashboard.html',
  styleUrl: './fleet-dashboard.scss'
})
export class FleetDashboard implements OnInit, AfterViewInit, OnDestroy {
  // ViewChild for map container
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  // Leaflet objects
  map!: Map;
  vehicleMarkers: any[] = [];
  routeLine: any;
  markerIndex = 0;
  private mapInterval: any = null;

  // Demo route and vehicles
  route: LatLngExpression[] = [
    [28.6139, 77.2090],
    [28.6170, 77.2120],
    [28.6215, 77.2180],
    [28.6280, 77.2250],
    [28.6340, 77.2320],
    [28.6410, 77.2380],
  ];

  vehicles: { id: string; name: string; pos: LatLngExpression; speed: number }[] = [
    { id: 'B-6166 PZZ', name: 'Budi Gunawan', pos: [28.6139, 77.2090], speed: 52 },
    { id: 'B-5199 XYZ', name: 'Farhan Zamani', pos: [28.6170, 77.2120], speed: 60 },
    { id: 'B-2000 ABC', name: 'Robby Fira', pos: [28.6215, 77.2180], speed: 44 },
  ];

  // Driver updates (timeline)
  driverUpdates = [
    { id: 1, driver: 'Budi Gunawan', vehicle: 'B-6166 PZZ', type: 'stop', detail: 'SPBU Pertamina, Cibinong, Bogor', time: '19:16', distance: '30KM', status: 'Incident' },
    { id: 2, driver: 'Farhan Zamani', vehicle: 'B-5199 XYZ', type: 'start', detail: 'Sudirman, Jakarta pusat', time: '17:16', distance: '—', status: 'Start' },
    { id: 3, driver: 'Robby Fira', vehicle: 'B-2000 ABC', type: 'start', detail: 'Sudirman, Jakarta pusat', time: '17:16', distance: '—', status: 'Start' },
  ];

  // Leaderboard
  leaderboard = [
    { driver: 'Budi Gunawan', vehicle: 'B-6166 PZZ', score: 92, safety: 98, onTime: 95, incidents: 0 },
    { driver: 'Farhan Zamani', vehicle: 'B-5199 XYZ', score: 84, safety: 90, onTime: 88, incidents: 1 },
    { driver: 'Robby Fira', vehicle: 'B-2000 ABC', score: 78, safety: 76, onTime: 82, incidents: 2 },
  ];

  // Mileage bar chart
  mileageLabels: string[] = [];
  mileageData: number[] = [];
  public mileageChartData: ChartConfiguration<'bar'>['data'] = {
    labels: this.mileageLabels,
    datasets: [{ data: this.mileageData, label: 'Mileage (km)' }]
  };
  public mileageChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, suggestedMax: 6000 } }
  };
  private chartInterval: any = null;

  // Top stat cards
  totalFleet = 3200;
  activeFleet = 2800;
  idleFleet = 200;
  maintenanceDue = 200;

  // misc
  fuelPercent = 65;
  driverScoreAvg = 85;

  constructor() { }

  ngOnInit(): void {
    // init mileage demo (last 12 days)
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      this.mileageLabels.push(`${d.getDate()}/${d.getMonth() + 1}`);
      this.mileageData.push(Math.round(2500 + Math.random() * 3000));
    }
    this.updateMileageDataRef();

    // simulate chart live updates every 6s (push new day)
    this.chartInterval = setInterval(() => this.simulateMileageUpdate(), 6000);
  }

  ngAfterViewInit(): void {
    this.initMap();
    // simulate moving one vehicle along route every 2.5s
    this.mapInterval = setInterval(() => this.moveSingleVehicle(), 2500);
  }

  ngOnDestroy(): void {
    if (this.mapInterval) clearInterval(this.mapInterval);
    if (this.chartInterval) clearInterval(this.chartInterval);
    try { this.map?.remove(); } catch { }
  }

  // ---------- MAP ----------
  initMap() {
    const center = this.route[0];
    this.map = new Map(this.mapContainer.nativeElement).setView(center as LatLngExpression, 13);

    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    // route polyline
    this.routeLine = polyline(this.route, { color: '#4f46e5', weight: 4, opacity: 0.9 }).addTo(this.map);

    // create vehicle markers
    this.vehicles.forEach((v) => {
      const ic = divIcon({
        className: 'custom-leaflet-marker',
        html: `<div class="marker-dot small"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      const m = marker(v.pos as LatLngExpression, { icon: ic }).addTo(this.map);
      m.bindTooltip(`<strong>${v.id}</strong><br>${v.name}<br>${v.speed} km/h`, { direction: 'top' });
      this.vehicleMarkers.push(m);
    });

    this.map.fitBounds(this.routeLine.getBounds().pad(0.15));
  }

  moveSingleVehicle() {
    // move first vehicle along route
    this.markerIndex = (this.markerIndex + 1) % this.route.length;
    const next = this.route[this.markerIndex];
    // update marker and tooltip/speed
    const v = this.vehicles[0];
    v.pos = next as LatLngExpression;
    v.speed = Math.max(30, Math.min(100, v.speed + Math.round((Math.random() - 0.5) * 12)));
    const m = this.vehicleMarkers[0];
    m.setLatLng(next);
    m.setPopupContent(`<strong>${v.id}</strong><br>${v.name}<br>${v.speed} km/h`);
    m.setTooltipContent(`<strong>${v.id}</strong><br>${v.name}<br>${v.speed} km/h`);
    this.map.panTo(next, { animate: true, duration: 0.7 });

    // push a driver update occasionally
    if (Math.random() < 0.3) {
      this.driverUpdates.unshift({
        id: Date.now(),
        driver: v.name,
        vehicle: v.id,
        type: Math.random() < 0.5 ? 'stop' : 'start',
        detail: 'Auto update event',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        distance: `${Math.round(10 + Math.random() * 90)}KM`,
        status: Math.random() < 0.7 ? 'Info' : 'Incident'
      });
      // cap updates list to 12
      if (this.driverUpdates.length > 12) this.driverUpdates.pop();
    }
  }

  // ---------- CHART ----------
  simulateMileageUpdate() {
    // push/pop so chart animates like time series
    if (this.mileageLabels.length >= 12) {
      this.mileageLabels.shift();
      this.mileageData.shift();
    }
    const d = new Date();
    this.mileageLabels.push(`${d.getDate()}/${d.getMonth() + 1}`);
    this.mileageData.push(Math.round(2500 + Math.random() * 3000));
    this.updateMileageDataRef();
  }

  updateMileageDataRef() {
    this.mileageChartData = {
      labels: [...this.mileageLabels],
      datasets: [{ data: [...this.mileageData], label: 'Mileage (km)' }]
    };
  }
}