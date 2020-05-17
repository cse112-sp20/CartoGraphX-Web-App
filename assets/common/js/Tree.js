/** 
 *  @fileOverview Implements a basic source code visualizer.
 *
 *  @author       Jackson Tuxhorn
 *
 *  @requires     NPM:npm_module_1
 *  @requires     BOWER:bower_module_1
 *  @requires     EXTERNAL:@link{https://www.gstatic.com/firebasejs/7.14.2/firebase-app.js firebase}
 *  @requires     EXTERNAL:@link{https://www.gstatic.com/firebasejs/7.14.2/firebase-analytics.js analytics}
 *  @requires     EXTERNAL:@link{https://www.gstatic.com/firebasejs/7.6.1/firebase-database.js database}
 */

var directoryTree;
var fileKeyToEditorsMap = {};

// DIRECTORY ACCESS CONSTANTS.
const DIRECTORY_TREE = '/directory_trees/'
const TEAM_MAP       = '/team_maps/';
const FILE           = '/files/';
const USER           = '/users/';

const DEMO_DIRECTORY_TREE_KEY = '6ABDc';

/**
 *  Called after webpage loads. Initializes our database access,
 *  and currently displays a demo tree.
 */
(function (){
    var firebaseConfig = {
        apiKey: "AIzaSyA8jCEXgEsLljtkEUg-RCgHaF6i2cag_kY",
        authDomain: "remote-13.firebaseapp.com",
        databaseURL: "https://remote-13.firebaseio.com",
        projectId: "remote-13",
        storageBucket: "remote-13.appspot.com",
        messagingSenderId: "113160307201",
        appId: "1:113160307201:web:fc2dda4c33c5d2ce4ff600",
        measurementId: "G-3F5MRDS2LK"
    };
    
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();

    // Reference used to read from database.
    dbAccess = firebase.database();

    // Load contents of this tree from firebase and display asynchronously.
    initializeDirectoryTree(DEMO_DIRECTORY_TREE_KEY);
    
    subscribeToChanges(DIRECTORY_TREE, DEMO_DIRECTORY_TREE_KEY, snap => {
      directoryTree = snap.val();
      displayDirectoryTree();
    })
}());

/**
 * Use with the defined constants for easy and clean one time
 * access to our database elements.
 * 
 * @param   {string}  Directory of the database you're reading.
 * @param   {string}  Key of the directory you're reading.
 * @returns {promise} Eventually becomes the value you requested.
 */
function getEntrySnapshotWithKey(type, key){
  return dbAccess.ref(type + key).once('value');
}

/**
 * Use with the defined constants for easy and clean one time
 * access to our database elements.
 * 
 * @param   {string}   Directory of the database you're reading.
 * @param   {string}   Key of the directory you're reading.
 * @param   {function} callback function for a change.
 * @returns {promise}  Eventually becomes the value you requested.
 */
function subscribeToChanges(type, key, func){
  return dbAccess.ref(type + key).on('value', func);
}

/**
 * Gets the database structure, then gets the status of all files associated
 * with this map, then displays the tree + current editors of files.
 * 
 * @param {string} Key of the directory you're reading.
 */
async function initializeDirectoryTree(key){
  await getEntrySnapshotWithKey(DIRECTORY_TREE, key).then(snap => {
    directoryTree = snap.val();
  });
  await generateFileMap(DIRECTORY_TREE);
  displayDirectoryTree();
}

/**
 * Helper function of initializeDirectoryTree. Generates a fileKey -> editor
 * map so that we can get editors names while displaying the tree.
 */
async function generateFileMap(){
  var toSearch    = [directoryTree];
  var fileKeyList = [];

  // Find the non-directory files.
  while(!(toSearch.length == 0)){
    subDir = toSearch.pop();
    for(var file in subDir){
      if(typeof(subDir[file]) == 'string'){
        fileKeyList.push(subDir[file]);
      } else {
        toSearch.push(subDir[file]);
      }
    }
  }

  // Get the current editors for each file.
  for(var index in fileKeyList){
    await getEntrySnapshotWithKey(FILE, fileKeyList[index]).then(snap => {
      fileKeyToEditorsMap[fileKeyList[index]] = snap.val()["current_editors"];
    })
  }

  // Get the names of the editors for each file.
  for(var fileKey in fileKeyToEditorsMap){
    var editorNameList = [];
    for(var editor in fileKeyToEditorsMap[fileKey]){
      await getEntrySnapshotWithKey(USER, fileKeyToEditorsMap[fileKey][editor]).then(snap => {
        var user = snap.val();
        editorNameList.push(user['firstName'] + " " + user['lastName']);
      })
    }

    fileKeyToEditorsMap[fileKey] = editorNameList;
  }
}

/**
 * Updates the HTML pre to display the current tree.
 */
function displayDirectoryTree(){
  const preField = document.getElementById('tree');

  str = generateSourceTree(directoryTree)
  preField.innerHTML = str;
}

// Various parts of the following code to print the directory tree structure are 
// based on the following StackOverflow response: https://stackoverflow.com/a/43105321

/**
 * Print the source graph of the JSON dir.
 * 
 * @param   {function} callback function for a change.
 * @returns {promise}  Eventually becomes the value you requested.
 */
function generateSourceTree(dir){
    var formattedString = "";

    for(topLevelFile in dir){
      if(typeof(dir[topLevelFile]) === 'string'){
        formattedString += topLevelFile + "\n";
      } else {
        formattedString += topLevelFile + "\n";
        formattedString += generateSourceTreeRec(dir[topLevelFile], "");
      }
    }

    return formattedString;
}

/**
 * Generates the code graph from the current file, and prepends the
 * filename with a parentPrefix.
 * 
 * @param   {object}  JSON representation of directory.
 * @param   {string}  prefix to prepend this line with.
 * @returns {promise} Eventually becomes the value you requested.
 */
function generateSourceTreeRec(file, parentPrefix){
    var PREFIXES = [[" ├─ ", " │  " ], [" └─ ", "    "]]
    var directoryStructure = Object.entries(Object.entries(file));
    var formattedString = "";

    // From https://stackoverflow.com/a/45254514
    for (const [index, [key, value]] of directoryStructure) {
        var currentPrefix;

        // If last element, use terminating prefixes.
        if(isLastElementInArray(directoryStructure, index)){
            currentPrefix = PREFIXES[1];
        } else {
            currentPrefix = PREFIXES[0];
        }

        // Base case: This is a filekey. 
        if(typeof(value) === 'string'){
          formattedString += parentPrefix + currentPrefix[0] + key + " " +  listEditorsOf(value) + "\n";
        } else {
          formattedString += parentPrefix + currentPrefix[0] + key + "\n";
          formattedString += generateSourceTreeRec(value, parentPrefix + currentPrefix[1]);
        }
    }

    return formattedString;
}

/**
 * Check if the file with this key is being edited by anyone.
 * 
 * @param   {string} Filekey to format an editor string for.
 * @returns {string} Formatted list of editors for the file.
 */
function listEditorsOf(key){
  var str = '(';
  var fileHadEntry = false;

  for(var fileKey in fileKeyToEditorsMap){
    if(key == fileKey){
      for(var editor in fileKeyToEditorsMap[fileKey]){
        str += fileKeyToEditorsMap[fileKey][editor] + ", ";
        fileHadEntry = true;
      }
    }
  }

  str += ')';

  if(fileHadEntry){
    // This is ugly. It just chops the last bit off and adds a paren
    // since we can't really check how many editors there will be 
    // when forming the list.
    return str.substring(0, str.length - 3) + ")";
  } else {
    // Otherwise it's empty and just prints ()
    return str;
  }
  
}

/**
 * Checks if this index is the last.
 * 
 * @param   {[]}     an array
 * @param   {number} an index
 * @returns {boolean} True if it is the last index.
 */
function isLastElementInArray(arr, index){
    return index == (arr.length - 1);
}