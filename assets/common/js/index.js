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

let directoryTree      = {}; // Actual directory structure
let fileKeyToNameMap   = {}; // fileKey -> fileName
let editorToFileKeyMap = {}; // editor  -> what file are the editing?

// DIRECTORY ACCESS CONSTANTS.
const DIRECTORY_TREE  = '/directory_trees/'
const TEAM_MAP        = '/team_maps/';
const CURRENT_EDITORS = '/current_editors/'
const FILE            = '/files/';
const USER            = '/users/';

// REFRESH RATE
const SECONDS_PER_REFRESH = 2;

// Make sure we don't repeat key steps that must be done once.
let firstTreePrint = true;
let editorsChanged = false;

// Only update the tree on these
let directoryStructureChanged = false;
let subscribedToEditorChanges = false;

const getMapForm = document.querySelector('#mapForm');

document.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log("getMapKey has been called!");
    let mapK = getMapForm['mapKey'].value;
    console.log(mapK);
    createTree(mapK);
});

/**
 *  Called after webpage loads. Initializes our database access,
 *  and currently displays a demo tree.
 */
function createTree(teamMapKey){
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

  // Subscribe to team_map current_editors
  subscribeToChanges(TEAM_MAP, teamMapKey, (snap) => {
    editorToFileKeyMap = snap.val()["current_editors"];
    directoryTreeKey   = snap.val()["rootFolder"];

    editorsChanged  = true;

    
    if(subscribedToEditorChanges){
      // If we have already subscribed to the directory tree using the information, 
      // in team_map then we don't have any more work to do.
      return;
    }

    // Once we have loaded the team_map info, load the directory tree.
    subscribeToChanges(DIRECTORY_TREE, directoryTreeKey, async snap => {
      subscribedToEditorChanges = true;
      
      // Update tree structure.
      directoryTree = snap.val();
      directoryStructureChanged = true;

      // Find new files.
      generateFileKeyToNameMap();

      // Only run this once to get our tree displayed / refreshing.
      if(firstTreePrint){
        displayDirectoryTree();
        firstTreePrint            = false;
        directoryStructureChanged = false;
        editorsChanged            = false;

        // Once we have loaded all the necessary information, 
        setInterval(() => { 
          if(editorsChanged || directoryStructureChanged){
            displayDirectoryTree(); 
            editorsChanged            = false;
            directoryStructureChanged = false;
          }
        }, SECONDS_PER_REFRESH * 1000);
      }
    });
  });
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
      if(fileKeyToNameMap.hasOwnProperty(subDir[file]) && fileKeyToNameMap[subDir[file]] == file){
        // We already know about this file, and it hasn't been renamed.
        continue;
      }

      if(typeof(subDir[file]) == 'string'){
        fileKeyToNameMap[subDir[file]] = file.split(',').join('.');
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
          formattedString += parentPrefix + currentPrefix[0] + fileKeyToNameMap[value] + " " +  listEditorsOf(value) + "\n";
        } else {
          formattedString += parentPrefix + currentPrefix[0] + fileKeyToNameMap[value]  + "\n";
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
function listEditorsOf(fileKey){
  let str = '(';
  let fileHadEntry = false;
  for(let editor in editorToFileKeyMap){
    if(editorToFileKeyMap[editor] == fileKey){
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