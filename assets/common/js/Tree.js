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

let directoryTree;
let fileKeyToNameMap   = {};
let editorToFileKeyMap = {};

// DIRECTORY ACCESS CONSTANTS.
const DIRECTORY_TREE  = '/directory_trees/'
const TEAM_MAP        = '/team_maps/';
const CURRENT_EDITORS = '/current_editors/'
const FILE            = '/files/';
const USER            = '/users/';

// REFRESH RATE
const SECONDS_PER_REFRESH = 2;

// DEMO CONSTANTS
const DEMO_DIRECTORY_TREE_KEY = '6ABDc';
const DEMO_TEAM_MAP_KEY       = '-M7dIwiWCwphSFKAE9RF'

let firstTreePrint = true;
let editorsChanged = false;
let directoryStructureChanged = false;

let directoryTreeKey = DEMO_DIRECTORY_TREE_KEY;
let teamMapKey       = DEMO_TEAM_MAP_KEY;

/**
 *  Called after webpage loads. Initializes our database access,
 *  and currently displays a demo tree.
 */
async function createTree(){
    let firebaseConfig = {
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

    // teamMapKey = [url query thing]
  
    // Subscribe to team_map current_editors
    await subscribeToChanges(TEAM_MAP, teamMapKey, (snap) => {
      editorToFileKeyMap = snap.val()["current_editors"];
      editorsChanged  = true;


    });
    
    // Load contents of this tree from firebase, list to its files, and display asynchronously.
    await subscribeToChanges(DIRECTORY_TREE, directoryTreeKey, async snap => {
      directoryTree = snap.val();
      directoryStructureChanged = true;

      // Find new files.
      generateFileKeyToNameMap();

      if(firstTreePrint){
        displayDirectoryTree();
        firstTreePrint            = false;
        directoryStructureChanged = false;
        editorsChanged            = false;
      }
    });


    // Update the tree with new user editor positions every 10 seconds.
    // We could add a boolean here to only update if a file has changed in the interval.
    setInterval(() => { 
      if(editorsChanged || directoryStructureChanged){
        displayDirectoryTree(); 
        editorsChanged            = false;
        directoryStructureChanged = false;
      }
    }, SECONDS_PER_REFRESH * 1000);

}

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
 * Use with the defined constants for easy and clean subscription
 * to a database element.
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
 * Helper function of initializeDirectoryTree. Generates a fileKey -> editor
 * map so that we can get editors names while displaying the tree.
 */
function generateFileKeyToNameMap(){
  let toSearch    = [directoryTree];
  let fileKeyList = [];

  // Find the non-directory files.
  while(!(toSearch.length == 0)){
    subDir = toSearch.pop();
    for(let file in subDir){
      if(fileKeyToNameMap.hasOwnProperty(subDir[file])){
        continue;
      }

      if(typeof(subDir[file]) == 'string'){
        fileKeyToNameMap[subDir[file]] = file.replace(',', '.');
      } else {
        toSearch.push(subDir[file]);
      }
    }
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
    let formattedString = "";

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
    let PREFIXES = [[" ├─ ", " │  " ], [" └─ ", "    "]]
    let directoryStructure = Object.entries(Object.entries(file));
    let formattedString = "";

    // From https://stackoverflow.com/a/45254514
    for (const [index, [key, value]] of directoryStructure) {
        let currentPrefix;

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
 * @param   {string} File key to format an editor string for.
 * @returns {string} Formatted list of editors for the file.
 */
function listEditorsOf(key){
  let str = '(';
  let fileHadEntry = false;
  for(let editor in editorToFileKeyMap){
    if(editorToFileKeyMap[editor] == key){
      str += '<span style="color:red">' + editor + "</span>, ";
      fileHadEntry = true;
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

testObject = {}