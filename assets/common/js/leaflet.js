/** 
 *  @fileOverview   Create the map with a non-earth coordinate system. Coordinates are in (y,x).
 *
 *  @author       Alistair Knox
 *
 */

var map = L.map('mapid', {
    crs: L.CRS.Simple,
    minZoom: 0,
    // renderer = L.svg({ padding: 0.01 }),
    preferCanvas: true
    
});
var absoluteBoundX = 1280;
var absoluteBoundY = 720;
let padding = 150;
var boundX = absoluteBoundX - padding;
var boundY = absoluteBoundY - padding;
var bounds = [[0,0], [absoluteBoundY, absoluteBoundX]];
var usedPoints = [];
var circleRadius = 35;
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
 * @param files - Array of file names to add
 */
function filesToMap(files) {

    
    for (let e of files) {
        console.log(e);
        let x_coord = (Math.random()*boundX) % 900 + 200;
        let y_coord = (Math.random()*boundY) % 500 + 100;
        // L.circle([y_coord, x_coord], {
        L.circle(genNextPoint(), {
        // let point = [southWest.lat + latSpan * Math.random(),southWest.lng + lngSpan * Math.random()];
        // L.circle(point, {
            color: '#93a',
            fillOpacity: 0.5,
            radius: 35,
        }).addTo(map).bindPopup(e.toString()).bindTooltip(e.toString(),
        {permanent: true, direction:"center"}
       ).openTooltip();
    }
}
/*
 * Generate a point with non overlapping area. (Constant radius for all points)
 */
function genNextPoint() {

    var point = [Math.random()*boundY + padding/2, Math.random()*boundX + padding/2];
    for (let i = 0; i < usedPoints.length; i++) {
        if (Math.abs(point[0] - usedPoints[i][0]) < 2*circleRadius + 2 && 
            Math.abs(point[1] - usedPoints[i][1]) < 2*circleRadius + 2) {
            // pick a new point and restart
            var point = [Math.random()*boundY + padding/2, Math.random()*boundX + padding/2];
            i = 0;
        }
    }
    usedPoints.push(point);
    return point;
}

// TEST CODE

testfiles = { "test.js":100,
              "test2.js":200,
              "test3.js":300,
              "test4.js":400,
              "test5.js":500,
              "test6.js":600,
}

let keymap = fileList.keys();
// console.log(keymap)
addListener(onTreeUpdate); // Tell the tree to call our onTreeUpdate method once it
                           // has gotten the tree from the database.

function onTreeUpdate(fileList){
    // filesToMap(directoryTree); // Code to run when the tree has been loaded.
    filesToMap(fileList)
}

// addFilesToMap(testfiles)

console.log(Symbol.iterator in Object((keymap)))
// console.log(fileKeyToNameMap);
  