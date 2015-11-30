// MVVM for managing locations using Knockout.js

var locationsList = [
	{name: 'Stanley Park', location: {lat: 49.301705, lng: -123.1417}},
	{name: 'Vancouver Seawall', location: {lat: 49.296004, lng: -123.128218}},
	{name: 'Granville Island', location: {lat: 49.270622, lng: -123.134741}},
	{name: 'Museum of Anthropology', location: {lat: 49.269473, lng: -123.259362}},
	{name: 'Vancouver Aquarium', location: {lat: 49.300703, lng: -123.130774}},
	{name: 'VanDusen Botanical Garden', location: {lat: 49.238444, lng: -123.128936}},
	{name: 'Queen Elizabeth Park', location: {lat: 49.241325, lng: -123.11111}},
	{name: 'Granville Island Public Market', location: {lat: 49.272556, lng: -123.135050}},
	{name: 'False Creek', location: {lat: 49.269870, lng: -123.124763}},
	{name: 'English Bay Beach', location: {lat: 49.286154, lng: -123.143134}},
	{name: 'Spanish Banks', location: {lat: 49.278600, lng: -123.235254}},
	{name: 'Orpheum Theatre', location: {lat: 49.279802, lng: -123.120423}},
	{name: 'Vancouver Convention Centre', location: {lat: 49.289158, lng: -123.116312}},
	{name: 'Canada Place', location: {lat: 49.288836, lng: -123.110969}},
	{name: 'Nitobe Memorial Garden', location: {lat: 49.267024, lng: -123.260007}},
	{name: 'Bloedel Floral Conservatory', location: {lat: 49.242088, lng: -123.113831}},
	{name: 'Bill Reid Gallery', location: {lat: 49.284576, lng: -123.119144}},
	{name: 'Vancouver Lookout', location: {lat: 49.284613, lng: -123.112122}},
	{name: 'Gastown', location: {lat: 49.282808, lng: -123.106688}},
	{name: 'Marine Building', location: {lat: 49.287462, lng: -123.117046}},
	{name: 'Rogers Arena', location: {lat: 49.277933, lng: -123.108842}},
	{name: 'Kitsilano Beach', location: {lat: 49.274244, lng: -123.154708}},
	{name: 'Science World', location: {lat: 49.273353, lng: -123.103775}},
	{name: 'Jericho Beach', location: {lat: 49.272434, lng: -123.194407}},
	{name: 'Lions Gate Bridge', location: {lat: 49.314665, lng: -123.13921}},
	{name: 'Yaletown', location: {lat: 49.275702, lng: -123.119907}},
	{name: 'UBC Botanical Garden', location: {lat: 49.254039, lng: -123.250873}},
	{name: 'Third Beach', location: {lat: 49.303067, lng: -123.156567}},
	{name: 'Vancouver Maritime Museum', location: {lat: 49.278704, lng: -123.147166}},
	{name: 'Wreck Beach', location: {lat: 49.262304, lng: -123.261752}},
	{name: 'Sunset Beach', location: {lat: 49.279822, lng: -123.138607}},
	{name: 'Vancouver Art Gallery', location: {lat: 49.283008, lng: -123.120818}},
	{name: 'Dr. Sun Yat-Sen Classical Chinese Garden', location: {lat: 49.279649, lng: -123.103913}}
];
// sort list alphabetically
locationsList.sort(function(a, b) {
	var x = a.name.toLowerCase();
	var y = b.name.toLowerCase();
	return x < y ? -1 : x > y ? 1 : 0;
});

// location class
var Location = function(item) {
	this.name = ko.observable(item.name);
	this.location = ko.observable(item.location);
	this.marker = ko.observable();
};

// location viewmodel class
var LocationViewModel = function() {

	var self = this;

	// array of locations
	this.locations = ko.observableArray();
	locationsList.forEach(function(item) {
		var location = new Location(item);
		location.display = ko.observable(true);
		self.locations.push(location);
	});

	// store currently selected location
	this.currentLocation = ko.observable();

	// callback when a location in the list is clicked
	this.locationClicked = function(loc) {

		// set current location
		self.currentLocation(loc);

		// click associated marker to trigger all the info load
		mapView.clickMarker(loc.marker());
	};

	// filter
	this.filter = ko.observable();
	this.filter.subscribe(function(val) {
		self.locations().forEach(function(loc) {

			// set display variable
			var shouldDisplay = loc.name().toLowerCase().search(val.toLowerCase()) != -1;
			loc.display(shouldDisplay);

			// set visibility of associated marker
			mapController.setMarkerVisibility(loc.marker(), shouldDisplay);

			// if current location is not in the filter list anymore, remove animation and info
			if (!shouldDisplay && self.currentLocation() === loc) {

				// clear marker state
				mapController.setMarkerSelected(loc.marker(), false);

				// empty current location
				self.currentLocation(null);
			}
		});

		// ask map to refresh
		mapView.refresh();
	});

};

// bind viewmodel to knockout
var locationViewModel = new LocationViewModel();
ko.applyBindings(locationViewModel);