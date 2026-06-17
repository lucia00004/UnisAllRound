export const MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>UNISA Campus Map</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { height: 100vh; width: 100vw; }
    .leaflet-popup-content-wrapper {
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .leaflet-popup-content {
      font-size: 14px;
      line-height: 1.4;
      font-weight: 600;
      color: #1A1C1E;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([40.7735, 14.7895], 15);
    
    var layers = {
      default: L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: 'Map data &copy; Google'
      }),
      satellite: L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: 'Map data &copy; Google'
      })
    };
    
    var currentLayer = layers.default;
    currentLayer.addTo(map);
    
    function setMapType(type) {
      map.removeLayer(currentLayer);
      currentLayer = layers[type] || layers.default;
      currentLayer.addTo(map);
    }
    
    var currentMarker = null;
    
    function selectPoint(lat, lng, name) {
      if (currentMarker) {
        currentMarker.setLatLng([lat, lng]);
      } else {
        currentMarker = L.marker([lat, lng]).addTo(map);
      }
      currentMarker.bindPopup('<b>' + name + '</b>');
      map.setView([lat, lng], 16, { animate: true });
      currentMarker.openPopup();
    }
    
    map.on('click', function(e) {
      var lat = e.latlng.lat;
      var lng = e.latlng.lng;
      
      if (currentMarker) {
        currentMarker.setLatLng([lat, lng]);
      } else {
        currentMarker = L.marker([lat, lng]).addTo(map);
      }
      currentMarker.bindPopup('<b>Caricamento...</b>').openPopup();
      
      // Notify parent that geocoding started
      var startMsg = JSON.stringify({ type: 'geocodingStart', lat: lat, lng: lng });
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(startMsg);
      } else {
        window.parent.postMessage(startMsg, '*');
      }

      fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + lng, {
        headers: {
          'Accept-Language': 'it,en'
        }
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        var name = data.name || data.display_name.split(',')[0] || 'Punto sulla mappa';
        if (!name || !isNaN(name) || name === 'bench' || name === 'yes') {
          name = data.address.road || 'Punto sulla mappa';
        }
        var detail = data.display_name || (lat.toFixed(5) + ', ' + lng.toFixed(5));
        var type = data.address.amenity || data.address.building || data.address.shop || data.address.tourism || 'Mappa';
        type = type.charAt(0).toUpperCase() + type.slice(1);

        currentMarker.bindPopup('<b>' + name + '</b>').openPopup();

        var msg = JSON.stringify({
          type: 'selectCustomPoint',
          point: {
            id: 'custom-' + lat + '-' + lng,
            name: name,
            type: type,
            detail: detail,
            lat: lat,
            lng: lng
          }
        });
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(msg);
        } else {
          window.parent.postMessage(msg, '*');
        }
      })
      .catch(function() {
        currentMarker.bindPopup('<b>Punto sulla mappa</b>').openPopup();
        var msg = JSON.stringify({
          type: 'selectCustomPoint',
          point: {
            id: 'custom-' + lat + '-' + lng,
            name: 'Punto sulla mappa',
            type: 'Mappa',
            detail: lat.toFixed(5) + ', ' + lng.toFixed(5),
            lat: lat,
            lng: lng
          }
        });
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(msg);
        } else {
          window.parent.postMessage(msg, '*');
        }
      });
    });
    
    window.addEventListener('message', function(e) {
      try {
        var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data.type === 'selectPoint') {
          selectPoint(data.lat, data.lng, data.name);
        } else if (data.type === 'setMapType') {
          setMapType(data.mapType);
        }
      } catch (err) {}
    });
  </script>
</body>
</html>
`;
