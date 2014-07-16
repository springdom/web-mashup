//Global variables to call
var mOptions;
var mapObject;
var infowindow = new google.maps.InfoWindow();
var markers = [];
var max_Rez = 1;
var imgRes;
var map;
var lat;
var lng;
var APIKey = "5662e7fa386344839e1f2b30c9f5c6b6";
var flickrKey = "aa4c42fc32ef87979b75995323b9e2dd";

//Create New Map
function createMap() {
    geocoder = new google.maps.Geocoder();
    var mLatLang = new google.maps.LatLng(-42.0000, 174.0000);
    mOptions = {
        center: mLatLang,
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    };

    //draws map in mapHolder div
    var mCanvas = document.getElementById('mapHolder');
    mapObject = new google.maps.Map(mCanvas, mOptions);
}
//function for grabbing koordinates api data
function Loc753(currentlat, currentlng) {
    // Pick the kind of data you want. layer is the data set. 753 = walking tracks;
    // Find this on Koordinates site by looking at the links at the bottom of each example page
    // x & y are latitude and longitude. radius is how big a circle (in meters) you want them to look
    var URL = "http://api.koordinates.com/api/vectorQuery.json/?key=" + APIKey + "&layer=753&x=" + currentlng + "&y=" + currentlat + "&radius=100000";
    //grabs the area koordinates
    var URL2 = "http://api.koordinates.com/api/vectorQuery.json/?key=" + APIKey + "&layer=754&x=" + currentlng + "&y=" + currentlat + "&radius=100000&geometry=true";
    //Use jQuery to hit the URL.The result comes back in the variable "response".
    // It is a JSON objects
    $.getJSON(URL, function (response) {
        $.getJSON(URL2, function (response1) { //Jquery to hit url 2

            var divDisplay = document.getElementById("content");
            // Drill down in the JSON object to find the  pieces that you want.
            var featuresArray = response["vectorQuery"]["layers"]["753"]["features"];
            //checks if click is outside New Zealand
            if ((featuresArray[0] == null) || (featuresArray[0] === undefined)) {
                alert("Only support tracks in New Zealand");
            } else {
                var km = (1 / 1000) * featuresArray[0].distance;

                divDisplay.innerHTML += "<p>Track:<br><strong>" + featuresArray[0]["properties"]["DESCRIPTION"] + "</strong></p>";
                divDisplay.innerHTML += "<p><strong>Distance:<br></strong> " + km.toFixed(2) + "km</p>";

                var featuresArray1 = response1["vectorQuery"]["layers"]["754"]["features"];
                //display Area Name
                divDisplay.innerHTML += "<p><strong>Area Name:<br></strong> " + featuresArray1[0]["properties"]["Name"] + "</p>";
                //grabs Area name
                var Areaname = featuresArray1[0]["properties"]["Name"];
                var flickrTag = Areaname.split(' ').join('+')
                var URL3 = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + flickrKey + "&tags=" + flickrTag + " ;&format=json&nojsoncallback=1&privacy_filter=1&per_page=30&safe_search=1&tag_mode=all";

                $.getJSON(URL3, function (response3) { //jquery hit flickr url
                    var Pics = document.getElementById("gallery");
                    var photosArray = response3["photos"]["photo"];

                    if (photosArray[0] == null) { //check if exist
                        Pics.innerHTML = "<p>No Pictures found in the selected area </p>";
                    } else {
                        //loop through each i mage
                        for (var i = 0; i < photosArray.length; i++) {
                            var img_src = "http://farm" + photosArray[i].farm + ".static.flickr.com/" + photosArray[i].server + "/" + photosArray[i].id + "_" + photosArray[i].secret + ".jpg";

                            var a_href = "http://www.flickr.com/photos/" + photosArray[i].owner + "/" + photosArray[i].id + "/";
                            Pics.innerHTML += "<div class='col-md-4'><a alt=" + photosArray[i].title + " href=" + a_href + ">" + photosArray[i].title + "<img class='img-thumbnail' src=" + img_src + " data-title=" + photosArray[i].title + " ></a><div><br/>";
                        }
                    }
                });
            }
        });
        clearDiv();

    });
}
//loads other results in the area()km radius
function Results(currentlat, currentlng, featuresArray) {
    var URL2 = "http://api.koordinates.com/api/vectorQuery.json/?key=" + APIKey + "&layer=753&x=" + currentlng + "&y=" + currentlat + "&max_results=" + max_Rez + "&radius=100000";

    //Use jQuery to hit the URL.The result comes back in the variable "response".
    // It is a JSON objects
    $.getJSON(URL2, function (response) {
        var divDisplay = document.getElementById("results");

        divDisplay.innerHTML += "<br/>";

        // Drill down in the JSON object to find the bits and pieces that you want.
        var featuresArray = response["vectorQuery"]["layers"]["753"]["features"];
        //checks if click is outside New Zealand

        divDisplay.innerHTML += "Tracks near" + featuresArray[0]["properties"]["DESCRIPTION"] + "(100km radius)<br/>";
        for (var i = 1; i < featuresArray.length; i++) {
            divDisplay.innerHTML += "<p><strong>Track Name:</strong> " + featuresArray[i]["properties"]["DESCRIPTION"] + "</p><br/>";

            var km = (1 / 1000) * featuresArray[0].distance;
            divDisplay.innerHTML += "<p><strong>Distance:<br></strong> " + km.toFixed(2) + "km</p>";
            divDisplay.innerHTML += "<br/>";
        }
    });
}
//search by coordinates
function searchBar() {
    var input = document.getElementById('coord').value;
    var latlngStr = input.split(',', 2);
    var lat = parseFloat(latlngStr[0]);
    var lng = parseFloat(latlngStr[1]);
    var latlng = new google.maps.LatLng(lat, lng);

    geocoder.geocode({
        'latLng': latlng,
    }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                mapObject.setZoom(9);
                var marker = new google.maps.Marker({
                    position: latlng,
                    map: map
                });
                infowindow.setContent(results[1].formatted_address);
                infowindow.open(mapObject, marker);
                markers.push(marker);
            } else {
                alert('No results found');
            }
        } else {
            alert('Geocoder failed due to: ' + status);
        }
        Loc753(lat, lng);
    });
}
//detects click on map and gets coordinates
function clicker() {
    google.maps.event.addListener(mapObject, 'click', function (event) {
        var testDisplay = document.getElementById('content');
        lat = event.latLng.lat();
        lng = event.latLng.lng();

        Loc753(lat, lng);
    });
    var btnView = document.getElementById("ViewResults");
    var results = document.getElementById("max_results");
    btnView.onclick = function () {
        if (lat === undefined || (lng === undefined)) {
            alert("Please ensure you have clicked a location on the map");
        } else {
            var res = document.getElementById("results");
            res.innerHTML = "";
            max_Rez = results.value;
            Results(lat, lng);
        }
    }
}
//places new marker on map
function placeMarker(position, map) {
    google.maps.event.addListener(mapObject, 'click', function (event) {
        placeMarker(event.latLng, mapObject);
    });

    var marker = new google.maps.Marker({
        position: position,
        map: map,
    });
    //adds new markers to array
    markers.push(marker);
    //zoom into location
    google.maps.event.addListener(marker, 'click', function () {
        map.panTo(this.getPosition());
        map.setZoom(8);
        infowindow.setContent("" + position + "");
        infowindow.open(mapObject, marker);
    });
}
// Sets the map on all markers in the array.
function setAllMap(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}
// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setAllMap(null);
}
// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    clearMarkers();
    markers = [];
}
//clears the div
function clearDiv() {
    var txtTracks = document.getElementById("content");
    var Pics = document.getElementById("gallery");
    txtTracks.innerHTML = "";
    Pics.innerHTML = "";
}

function styles() {
    $("#togSH").click(function () {
        $("#results").toggle("medium");
    });
}
//loads each function
function init() {
    createMap();
    clicker();
    placeMarker();
    styles();
}
//checks for button click
window.onload = function () {
    var btnshow = document.getElementById("clrMarker");
    var btntxt = document.getElementById("clrDiv");
    var btnCoord = document.getElementById("search");
    var btnAddr = document.getElementById("search2");
    btnshow.onclick = function () {
        deleteMarkers();
    }
    btnCoord.onclick = function () {
        searchBar();
    }
}
google.maps.event.addDomListener(window, 'load', init);