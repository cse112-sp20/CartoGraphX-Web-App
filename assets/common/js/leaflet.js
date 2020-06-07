/** 
 *  @fileOverview   Create the map with a non-earth coordinate system. Coordinates are in (y,x).
 *
 *  @author       Alistair Knox
 *
 */

var map = L.map('mapid', {
    crs: L.CRS.Simple,
    minZoom: 0,
    preferCanvas: true
    
});
var absoluteBoundX = 1280;
var absoluteBoundY = 720;
var boundX = 1280;
var boundY = 720;
var bounds = [[0,0], [absoluteBoundY, absoluteBoundX]];
var image = L.imageOverlay('img/honeycomb-grey-5120x2880.png', bounds, {
    opacity: 0.8,
}).addTo(map);
// map.setMaxBounds(bounds);
// map.setView( [140, 170], 1);
map.fitBounds(bounds);

/*
 * @param files - dictionary of files : sizes to add
 */
function addFilesToMap(files) {
    var maxlines = 0;
    var edge_padding = 200;
    // Scale radius based on largest file
    for (var key in files) {
        if (files[key] > maxlines) {
            maxlines = files[key];
        }
    }

    for (var key in files) {
        var x_coord = (Math.random()*boundX) % 1000;
        var y_coord = (Math.random()*boundY) % 600;
        L.circle([y_coord, x_coord], {
            color: 'red',
            fillOpacity: 0.5,
            radius: 150*files[key]/boundX,
        }).addTo(map).bindPopup(key.toString()).bindTooltip(key.toString(),
        {permanent: true, direction:"center"}
       ).openTooltip();
    }
}

/*
 * @param files - Object of file keys : names to add
 */
function filesToMap(keysToNames) {
    for (let e of keysToNames) {
        console.log(e);
        let x_coord = (Math.random()*boundX) % 1000;
        let y_coord = (Math.random()*boundY) % 600;
        L.circle([y_coord, x_coord], {
            color: 'red',
            fillOpacity: 0.5,
            radius: 30,
        }).addTo(map).bindPopup(keysToNames[e].toString()).bindTooltip(keysToNames[e].toString(),
        {permanent: true, direction:"center"}
       ).openTooltip();
    }
}

var circle = L.circle([250, 500], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 80
}).addTo(map).bindPopup("<b>File:</b> test.js\
Editors: (None)");

var circle2 = L.circle([450, 610], {
    color: 'green',
    fillColor: '#1f3',
    fillOpacity: 0.5,
    radius: 120
}).addTo(map).bindPopup("Circle");

var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

// map.on('click', onMapClick);

testfiles = { "test.js":100,
              "test2.js":200,
              "test3.js":300,
              "test4.js":400,
              "test5.js":500,
              "test6.js":600,
}



// TEST CODE

let keymap = fileList;
console.log(keymap)

// console.log(keymap)
// filesToMap(keymap)



console.log(Symbol.iterator in Object((keymap)))


// console.log(fileKeyToNameMap);
  