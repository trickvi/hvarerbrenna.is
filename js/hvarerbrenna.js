$(document).foundation();

var bonfires = [];
var source = new ol.source.Vector();
var bonfire_icon = new ol.style.Icon({ src: 'img/bonfire.png' });
var iconStyle = new ol.style.Style({ image: bonfire_icon });

var reykjavik = new ol.View({
    center: ol.proj.transform([-21.9422367, 64.145981],
			      'EPSG:4326', 'EPSG:3857'),
    zoom: 10
});

var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        }),
	new ol.layer.Vector({
	    source: source
        })
    ],
    view: reykjavik
});

$.ajax({ url: "data/bonfires.json", mimeType: "application/json"})
    .success(function(data) {
	bonfires = data.bonfires;
	for (idx in bonfires) {
	    var point = new ol.geom.Point(
		ol.proj.transform(
		    [bonfires[idx].longitude, bonfires[idx].latitude],
		    'EPSG:4326', 'EPSG:3857')
	    );
	    var bonfire = new ol.Feature({geometry: point});
	    bonfire.setStyle(iconStyle);
	    source.addFeature(bonfire);
	}

	navigator.geolocation.getCurrentPosition(function(position) {
	    var latitude = position.coords.latitude;
	    var longitude = position.coords.longitude;
    
	    var closest = undefined;
	    for (idx in bonfires) {
		var bonfire = bonfires[idx];
		var distance = Math.sqrt(
		    Math.pow((bonfire.longitude-longitude), 2) + Math.pow((bonfire.latitude-latitude), 2)
		);

		if ((closest === undefined) || (distance < closest.distance)) {
		    closest = $.extend({}, bonfire);
		    closest.distance = distance;
		}
	    }

	    var pan = ol.animation.pan({
		duration: 1000,
		source: reykjavik.getCenter()
	    });
	    map.beforeRender(pan);

	    reykjavik.setCenter(
		ol.proj.transform(
		    [closest.longitude, closest.latitude],
		    'EPSG:4326', 'EPSG:3857')
	    );
	    reykjavik.setZoom(16);
	    $('#bonfire').text(closest.name);
	    $('#openstreetmap-link').attr(
		'href',
		'http://www.openstreetmap.org/?mlat=' +
		    closest.latitude +
		    '&mlon=' +
		    closest.longitude +
		    '#map=16/'+
		    closest.latitude +
		    '/' +
		    closest.longitude);
	    $('.hide').removeClass('hide');
	});
    });
