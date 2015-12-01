// MVC for managing the maps portion of this app

'use strict';

// model for google maps
var mapModel = {
	markers: []
};

// controller for google maps
var mapController = {

	init: function() {

		// create a new map
		mapView.map = new google.maps.Map(document.getElementById('content'));

		// create bounds
		mapView.bounds = new google.maps.LatLngBounds();

		// create info window
		mapView.infoWindow = new google.maps.InfoWindow();

		// create markers
		this.__createMarkersForLocations(locationViewModel.locations());

		// init map view
		mapView.init();
	},

	__createMarkersForLocations: function(locations) {

		var self = this;

		// loop through all locations to create markers
		locations.forEach(function(loc) {

			// create marker
			var marker = new google.maps.Marker({
				position: loc.location(),
				title: loc.name()
			});
			mapModel.markers.push(marker);

			// add in our own attributes to keep track of state
			marker.isVisible = true;
			marker.isSelected = false;

			// set marker for this location and set location for this marker
			// this is the main two-way reference between location and marker
			loc.marker(marker);
			marker.location = loc;

		});

	},

	setMarkerVisibility: function(marker, isVisible) {
		marker.isVisible = isVisible;
	},

	setMarkerSelected: function(marker, isSelected) {
		marker.isSelected = isSelected;
	},

	getMarkers: function() {
		return mapModel.markers;
	}

};

var mapView = {

	MAPS_ICON_DEFAULT: 'http://maps.google.com/mapfiles/ms/micons/red-dot.png',
	MAPS_ICON_SELECTED: 'http://maps.google.com/mapfiles/ms/micons/green-dot.png',
	NUM_FLICKR_PHOTOS: 4,
	NUM_FLICKR_PHOTOS_PER_ROW: 2,

	map: null,
	infoWindow: null,
	bounds: null,

	init: function() {

		var self = this;

		// for each marker
		var markers = mapController.getMarkers();
		markers.forEach(function(m) {

			// set map
			m.setMap(self.map);

			// add event handler
			self.__addClickListenerForMarker(m);

			// extend bounds
			self.bounds.extend(m.getPosition())
		});

		// refresh map
		self.refresh();

		// center the map on init, to fit all markers using collected bounds
		self.fitBounds();
	},

	__addClickListenerForMarker: function(marker, viewmodel) {

		var self = this;

		var markers = mapController.getMarkers();
		marker.addListener('click', function() {

			// update the location viewmodel by setting the current location
			locationViewModel.currentLocation(marker.location);

			// set selected to true only for this marker
			markers.forEach(function(m) {
				mapController.setMarkerSelected(m, false);
			});
			mapController.setMarkerSelected(marker, true);

			// refresh map
			self.refresh();
		});

	},

	fitBounds: function() {
		this.map.fitBounds(this.bounds);
	},

	refresh: function() {

		var self = this;

		// close info window first
		self.infoWindow.close();

		// loop through each marker
		var markers = mapController.getMarkers();
		markers.forEach(function(m) {

			// set visibility
			m.setVisible(m.isVisible);

			// perform updates based on selection state
			if (m.isSelected) {

				// set bounce animation and selected icon
				m.setAnimation(google.maps.Animation.BOUNCE);
				m.setIcon(self.MAPS_ICON_SELECTED);

				// prepare content for info window
				var contentStr = '<h2>' + m.title + '</h2>';
				var i, ilen, j;
				for (i = 0, ilen = self.NUM_FLICKR_PHOTOS / self.NUM_FLICKR_PHOTOS_PER_ROW; i < ilen; i++) {
					contentStr += '<div class="imgRow">';
					for (j = 0; j < self.NUM_FLICKR_PHOTOS_PER_ROW; j++) {
						contentStr += '<div class="imgCol"><img src="images/loading.jpg" class="thumbnail" id="img' + ((i * self.NUM_FLICKR_PHOTOS_PER_ROW) + j + 1) + '"></div>';
					}
					contentStr += '</div>';
				}

				// fetch flickr photos for this marker asynchronously
				FlickrClient.getInstance().fetchPhotosUsingTextAndCoordinates(
					m.title,
					m.position.lat(), m.position.lng(),
					self.NUM_FLICKR_PHOTOS,
					function(photoUrls) {

						// attach photos to info window
						var i, len;
						for (i = 0, len = photoUrls.length; i < len; i++) {
							$('#img' + (i+1)).attr('src', photoUrls[i]);
						}

						// attach error image to the rest of the photos, if any left
						for (i = len; i < self.NUM_FLICKR_PHOTOS; i++) {
							$('#img' + (i+1)).attr('src', 'images/error.jpg');
						}
					}
				);

				// open info window for this marker
				self.infoWindow.setContent(contentStr);
				self.infoWindow.open(self.map, m);

			} else {

				// remove animation and set icon to default
				m.setAnimation(null);
				m.setIcon(self.MAPS_ICON_DEFAULT);

			}

		});
	},

	clickMarker: function(marker) {
		google.maps.event.trigger(marker, 'click');
	}
};

// auto fit all markers to map view upon window resize
window.onresize = function() {
	mapView.fitBounds();
}

// function called by google maps once loading is done
function initMap() {
	mapController.init();
}