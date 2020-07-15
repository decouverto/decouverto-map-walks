
var getJSON = require('./get-json.js');


var element = document.getElementById('popup');

window.$ = window.jQuery = require('jquery');
require('./bootstrap')


getJSON('https://decouverto.fr/walks/first-points.json', function (err, data) {
    if (err) return console.error(err);

    var markerSource = new ol.source.Vector();

    function addMarker(lon, lat, title, id) {

        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857')),
            title: title,
            id: id
        });

        iconFeature.setStyle(new ol.style.Style({
            image: new ol.style.Icon(({
                anchor: [0.5, 35],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 0.75,
                src: '/images/marker_icon.png'
            }))
        }));

        markerSource.addFeature(iconFeature);
    }

    var map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            new ol.layer.Vector({
                source: markerSource
            })
        ],
        view: new ol.View({
            center: [0, 0],
            zoom: 0
        })
    });

    var popup = new ol.Overlay({
        element: element,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -50]
    });
    map.addOverlay(popup);
    map.on('click', function (e) {
        var feature = map.forEachFeatureAtPixel(e.pixel,
            function (feature) {
                return feature;
            });
        if (feature) {
            var coordinates = feature.getGeometry().getCoordinates();
            popup.setPosition(coordinates);
            $(element).attr('data-original-title', 'Balade');
            $(element).attr('data-placement', 'top');
            $(element).attr('data-html', true);
            $(element).attr('data-content', '<a target="_blank" href="https://decouverto.fr/rando/'+ feature.get('id') + '">' + feature.get('title') +  '</a>');
            $(element).popover('show');
        } else {
            $(element).popover('destroy');
        }
    });
    map.on('pointermove', function(e) {
        if (e.dragging) {
          $(element).popover('destroy');
          return;
        }
        var hit = this.forEachFeatureAtPixel(e.pixel, function(feature, layer) {
            return true;
        }); 
        if (hit) {
            this.getTargetElement().style.cursor = 'pointer';
        } else {
            this.getTargetElement().style.cursor = '';
        }
      });

    // set center
    map.getView().setZoom(8);

    // set markers
    barycentre = {
        longitude: 0,
        latitude: 0,
        n: 0
    }

    // set markers
    data.forEach(function (el) {
        addMarker(el.coord.longitude, el.coord.latitude, el.title, el.id);
        barycentre.longitude += el.coord.longitude
        barycentre.latitude += el.coord.latitude
        barycentre.n += 1
    });
    barycentre.longitude /= barycentre.n
    barycentre.latitude /= barycentre.n
    map.getView().setCenter(ol.proj.transform([barycentre.longitude, barycentre.latitude], 'EPSG:4326', 'EPSG:3857'));
});