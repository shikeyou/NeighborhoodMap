// singleton class to handle fetching of flickr photos using ajax
var FlickrClient = (function () {

    var instance;

    function createInstance() {

    	var BASE_URL = 'https://api.flickr.com/services/rest/';
	    var FLICKR_API_KEY = 'ce190e05b11ca689a9c1fac8c9de619d';
	    var PARAMETERS = {
	        'method': 'flickr.photos.search',
	        'api_key': FLICKR_API_KEY,
	        'safe_search': '1',
	        'extras': 'url_m',
	        'format': 'json',
	        'nojsoncallback': '1'
	    };

	    // encodes parameters and joins them together
	    function escapeParameters(args) {

	    	escapedArgs = [];

	        for (var key in args) {
	        	if (args.hasOwnProperty(key)) {
		            escapedArgs.push(key + '=' + encodeURIComponent(args[key]));
	        	}
	        }

	        return (escapedArgs.length > 0 ? '?' : '') + escapedArgs.join('&');
	    }

	    //gets total pages for a flickr request
	    function getTotalPages(args, resultHandler) {

	    	var requestUrl = BASE_URL + escapeParameters(args);
	    	$.ajax({
				url: requestUrl,
				success: function(response) {
					resultHandler(response['photos']['pages']);
				},
				error: function(request, textStatus, errorThrown) {
					// return 0 to the result handler to indicate failure
					resultHandler(0);
				}
			});

	    }

	    // fetches photos from flickr
	    function fetchPhotos(args, count, completionHandler) {

			//do a http request first to find the total number of pages
			getTotalPages(
				args,
				function(totalPages) {

					if (totalPages === 0) {
						//return empty array to completion handler to indicate failure
						completionHandler([]);
						return;
					}

					//do the actual http request to fetch all photos for a random page within this upper limit
		            var pageLimit = Math.min(totalPages, 40);
		            var randomPage = Math.floor(Math.random() * pageLimit) + 1;
		            fetchPhotosForPage(randomPage, args, count, completionHandler);
				}
			);


	    }

	    // fetches photos from flickr for a particular page
	    function fetchPhotosForPage(pageNum, args, count, completionHandler) {

	    	// add page parameter
	    	args['page'] = pageNum;

	    	var requestUrl = BASE_URL + escapeParameters(args);
	    	$.ajax({
				url: requestUrl,
				success: function(response) {

					var photoUrls = [];

					//get list of photo urls from the response
					var responsePhotos = response['photos']['photo'];
					var i, len;
					for (i = 0, len = responsePhotos.length; i < len; i++) {
						photoUrls.push(responsePhotos[i]['url_m']);
					}

					//return this list of photo urls to the completionHandler
					completionHandler(photoUrls);
				},
				error: function(request, textStatus, errorThrown) {
					// return empty array to the completion handler to indicate failure
					completionHandler([]);
				}
			});
	    }

        return {

        	// public method to fetch photos from flickr using search text and coordinates
        	fetchPhotosUsingTextAndCoordinates: function(searchText, lat, lon, count, completionHandler) {

		    	var args = PARAMETERS;
		    	args['text'] = searchText;
		    	args['lat'] = lat;
		    	args['lon'] = lon;
		    	args['per_page'] = Math.min(count, 500);

		    	fetchPhotos(args, count, completionHandler);
		    }

        };
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };

})();