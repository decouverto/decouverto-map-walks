
var getJSON = require('./get-json.js');

getJSON('/walks.json', function (err, data) {
    if (err) return console.error(err);
    
    var markerSource = new ol.source.Vector();

    function addMarker(lon, lat, title) {

        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857'))
        });

        iconFeature.setStyle(new ol.style.Style({
            image: new ol.style.Icon(({
                anchor: [0.5, 35],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 0.75,
                src: '/images/marker_icon.png'
            })),
            text: new ol.style.Text({
                offsetY: -40,
                font: '14px Calibri,sans-serif',
                fill: new ol.style.Fill({ color: '#e74c3c' }),
                stroke: new ol.style.Stroke({
                    color: '#fff', width: 2
                }),
                text: title
            })
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
        addMarker(el.coord.longitude, el.coord.latitude, el.title);
        barycentre.longitude += el.coord.longitude
        barycentre.latitude += el.coord.latitude
        barycentre.n += 1
    });
    barycentre.longitude/=barycentre.n
    barycentre.latitude/=barycentre.n
    map.getView().setCenter(ol.proj.transform([barycentre.longitude, barycentre.latitude], 'EPSG:4326', 'EPSG:3857'));
});