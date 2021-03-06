/** 
 *  @fileOverview   Create the map with a non-earth coordinate system. Coordinates are in (y,x).
 *
 *  @author       Alistair Knox
 *
 */

var map = L.map('mapid', {
    crs: L.CRS.Simple,
    minZoom: -1,
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
var initialSeed = 3;
var seed = initialSeed;

var layerGroup = L.layerGroup().addTo(map)

var avatarIcon = L.icon({
    iconUrl: 'img/avatar.png',
    fillOpacity: 0.2,
    iconSize:     [50, 50], // size of the icon
    iconAnchor:   [25, 60], // point of the icon which will correspond to marker's location
});


map.setMaxBounds(bounds);
map.fitBounds(bounds);

/*
 * @param files - Array of file names to add
 */
function filesToMap(files) {
    for (let e of files) {
        L.circle(genNextPoint(), {
            color: '#8A2BE2',
            fillOpacity: 0.5,
            radius: 35,
        }).addTo(map).bindPopup(e.toString()).bindTooltip(e.toString(),
        {permanent: true, direction:"center"}
       ).openTooltip();
    }
}

/*
 * @param fileKeyToNameMap - Dictionary of File keys : file names 
 * Displays editors on the map
 */
function activeFilesToMap(fileKeyToNameMap) {
    for (let [k,v] of Object.entries(fileKeyToNameMap)) {
        let coords = genNextPoint()

        // leaflet glitch doesn't display colors properly
        // if (listEditorsOf(k).length == 0) {
        //     var color = '#FFFFF'
        // } else {
        //     var color = '#00FF7F'
        // }

        var editorString = "<br>Editors: (none)"
        if (listEditorsOf(k).length > 0) {
            L.marker(coords, {icon: avatarIcon}).addTo(map);
            editorString = "<br>Editors: " + listEditorsOf(k)
        }

        layerGroup.addLayer(
            L.circle(coords, {
                color: '#00FF7F',
                fillOpacity: 0.5,
                radius: 35,
            }).addTo(map).bindPopup("File: " + v + editorString).bindTooltip(v.toString() + '\n' + listEditorsOf(k),
            {permanent: true, direction:"center"}
            ).openTooltip()
        )
    }
}


/*
 * Generate a point with non overlapping area. (Constant radius for all points)
 */
function genNextPoint() {
    var point = [random()*boundY + padding/2, random()*boundX + padding/2];
    for (let i = 0; i < usedPoints.length; i++) {
        if (Math.abs(point[0] - usedPoints[i][0]) < 2*circleRadius + 2 && 
            Math.abs(point[1] - usedPoints[i][1]) < 2*circleRadius + 2) {
            // pick a new point and restart
            var point = [random()*boundY + padding/2, random()*boundX + padding/2];
            i = 0;
        }
    }
    usedPoints.push(point);
    return point;
}

// Source: https://stackoverflow.com/a/19303725
// Generates random numbers from seed
function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

// Completely redraw map on db refresh
function resetMap() {
    seed = initialSeed
    usedPoints = []
    layerGroup.clearLayers()
}

addListener(onTreeUpdate); // Tell the tree to call our onTreeUpdate method once it
                           // has gotten the tree from the database.

function onTreeUpdate(fileKeyToNameMap){
    // console.log(fileKeyToNameMap)
    resetMap()
    activeFilesToMap(fileKeyToNameMap)
}



