// MVC for managing the maps portion of this app

// model for google maps
var mapModel = {
	map: null,
	infoWindow: null,
	bounds: null,
	markers: []
};

// controller for google maps
var mapController = {

	init: function() {

		// create a new map
		mapModel.map = new google.maps.Map(document.getElementById('content'));

		// create bounds
		mapModel.bounds = new google.maps.LatLngBounds();

		// create info window
		mapModel.infoWindow = new google.maps.InfoWindow();

		// add markers to map
		this.__addMarkersToMapUsingLocations(locationViewModel.locations(), mapModel.map);

		// refresh map
		mapView.refresh(true);
	},

	__addMarkersToMapUsingLocations: function(locations, map) {

		var self = this;

		// loop through all locations to add markers to map
		locations.forEach(function(loc) {

			// create marker
			var marker = new google.maps.Marker({
				position: loc.location(),
				title: loc.name(),
				map: map
			});
			mapModel.markers.push(marker);

			// set marker for this location and set location for this marker
			// this is the main two-way reference between location and marker
			loc.marker(marker);
			marker.location = loc;

			// add in our own attributes to keep track of state
			self.setMarkerVisibility(marker, true);
			self.setMarkerSelected(marker, false);

			// add click listener for this marker
			self.__addClickListenerForMarker(marker, locationViewModel);

		});

	},

	__addClickListenerForMarker: function(marker, viewmodel) {

		var self = this;

		marker.addListener('click', function() {

			// update the viewmodel by setting the current location
			viewmodel.currentLocation(marker.location);

			// set selected to true only for this marker
			mapModel.markers.forEach(function(m) {
				self.setMarkerSelected(m, false);
			});
			self.setMarkerSelected(marker, true);

			// refresh map
			mapView.refresh();
		});

	},

	setMarkerVisibility: function(marker, isVisible) {
		marker.isVisible = isVisible;
	},

	setMarkerSelected: function(marker, isSelected) {
		marker.isSelected = isSelected;
	}

};

var mapView = {

	MAPS_ICON_DEFAULT: 'http://maps.google.com/mapfiles/ms/micons/red-dot.png',
	MAPS_ICON_SELECTED: 'http://maps.google.com/mapfiles/ms/micons/green-dot.png',
	NUM_FLICKR_PHOTOS: 4,
	NUM_FLICKR_PHOTOS_PER_ROW: 2,

	refresh: function(centerMap) {

		var self = this;

		// set default for centerMap parameter
		centerMap = typeof centerMap !== 'undefined' ? centerMap : false;

		// close info window first
		mapModel.infoWindow.close();

		// loop through each marker
		mapModel.markers.forEach(function(m) {

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
				mapModel.infoWindow.setContent(contentStr);
				mapModel.infoWindow.open(mapModel.map, m);

			} else {

				// remove animation and set icon to default
				m.setAnimation(null);
				m.setIcon(self.MAPS_ICON_DEFAULT);

			}

		});

		// if requested, center the map to fit all markers using collected bounds
		if (centerMap) {
			mapModel.markers.forEach(function(m) {
				// extend bounds using this marker
				mapModel.bounds.extend(m.getPosition());
			});
			mapModel.map.fitBounds(mapModel.bounds);
		}

	},

	clickMarker: function(marker) {
		google.maps.event.trigger(marker, 'click');
	}
};

// function called by google maps once loading is done
function initMap() {
	mapController.init();
}