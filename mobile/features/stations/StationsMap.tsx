import { useMemo } from 'react';
import { WebView } from 'react-native-webview';
import type { Station } from '../../core/models/station.model';
import { colors } from '../../core/theme';

type Props = {
  stations: Station[];
  onSelect: (station: Station) => void;
};

type Point = {
  id: string;
  nom: string;
  ville: string;
  lat: number;
  lng: number;
  dispo: number;
  total: number;
};

function construireHtml(points: Point[]): string {
  const donnees = JSON.stringify(points);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #F4F8F5; }
    .pin { width: 18px; height: 18px; border-radius: 50%; border: 3px solid #fff;
           box-shadow: 0 1px 5px rgba(0,0,0,.35); }
    .pin-libre { background: #12A150; }
    .pin-complet { background: #DC2626; }
    .leaflet-popup-content { margin: 12px; min-width: 170px; font-family: sans-serif; }
    .popup-title { font-weight: 700; font-size: 14px; color: #0B1F17; }
    .popup-city { font-size: 12px; color: #5C7268; margin-top: 2px; }
    .popup-dispo { font-size: 12px; font-weight: 600; color: #0A6B36; margin-top: 6px; }
    .popup-full { color: #DC2626; }
    .popup-btn { margin-top: 10px; width: 100%; background: #12A150; color: #fff;
                 border: none; border-radius: 8px; padding: 9px; font-weight: 700; font-size: 12px; }
    .leaflet-control-attribution { font-size: 9px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var stations = __STATIONS__;

    var map = L.map('map', { zoomControl: false }).setView([33.5731, -7.5898], 6);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      detectRetina: true,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    var bounds = [];

    stations.forEach(function (s) {
      var complet = s.dispo === 0;

      var icone = L.divIcon({
        className: '',
        html: '<div class="pin ' + (complet ? 'pin-complet' : 'pin-libre') + '"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      var marqueur = L.marker([s.lat, s.lng], { icon: icone }).addTo(map);

      var contenu = document.createElement('div');

      var titre = document.createElement('div');
      titre.className = 'popup-title';
      titre.textContent = s.nom;

      var ville = document.createElement('div');
      ville.className = 'popup-city';
      ville.textContent = s.ville;

      var dispo = document.createElement('div');
      dispo.className = 'popup-dispo' + (complet ? ' popup-full' : '');
      dispo.textContent = s.dispo + ' borne(s) libre(s) sur ' + s.total;

      var bouton = document.createElement('button');
      bouton.className = 'popup-btn';
      bouton.textContent = 'Voir la station';
      bouton.onclick = function () {
        window.ReactNativeWebView.postMessage(s.id);
      };

      contenu.appendChild(titre);
      contenu.appendChild(ville);
      contenu.appendChild(dispo);
      contenu.appendChild(bouton);

      marqueur.bindPopup(contenu);
      bounds.push([s.lat, s.lng]);
    });

    if (bounds.length === 1) {
      map.setView(bounds[0], 13);
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [45, 45] });
    }
  </script>
</body>
</html>`.replace('__STATIONS__', donnees);
}

export default function StationsMap({ stations, onSelect }: Props) {
  const localisees = useMemo(
    () => stations.filter((s) => s.latitude !== 0 && s.longitude !== 0),
    [stations],
  );

  const points = useMemo<Point[]>(
    () =>
      localisees.map((s) => ({
        id: s.id,
        nom: s.nom,
        ville: s.ville,
        lat: s.latitude,
        lng: s.longitude,
        dispo: s.bornes.filter((b) => b.statut === 'DISPONIBLE').length,
        total: s.bornes.length,
      })),
    [localisees],
  );

  const html = useMemo(() => construireHtml(points), [points]);

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html, baseUrl: 'https://parkree.nalidapower.local' }}
      userAgent="ParkRee/1.0 (Nalida Power PFA - Solar Smart Parking Hub)"
      javaScriptEnabled
      domStorageEnabled
      mixedContentMode="always"
      style={{ flex: 1, backgroundColor: colors.background }}
      onMessage={(event) => {
        const station = localisees.find((s) => s.id === event.nativeEvent.data);
        if (station) onSelect(station);
      }}
    />
  );
}