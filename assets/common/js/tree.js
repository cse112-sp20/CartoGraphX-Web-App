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
let editorToFileKeyMap = {}; // editor  -> what file are they editing?

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
let subscribedToDirectoryTreeChanges = false;

// Command Line Test
let isCommandLineTest = false;
let intervalID        = undefined;

/**
 *  Create the tree described the team map and subscribe to changes
 *  to the tree.
 * 
 * @param {string} teamMapKey The firebase identification key for the map.
 */
const createTree = (teamMapKey, firebase) => {
  // Reference used to read from database.
  dbAccess = firebase.database();

  // Subscribe to team_map current_editors
  subscribeToChanges(TEAM_MAP, teamMapKey, (snap) => {
    editorToFileKeyMap = snap.val()["current_editors"];
    directoryTreeKey   = snap.val()["rootFolder"];

    editorsChanged  = true;
    
    if(subscribedToDirectoryTreeChanges){
      // If we have already subscribed below, then we don't need to run
      // the section again. The method below will be automatically called
      // when the directory tree structure is edited.
      return;
    }

    // Once we have subscribed to the team map info, also subscribe to changes
    // in the directory tree structure.
    subscribeToChanges(DIRECTORY_TREE, directoryTreeKey, async (snap) => {
      subscribedToDirectoryTreeChanges = true;
      
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
        intervalID = setInterval(() => { 
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
 * Use with the defined constants for easy and clean subscription
 * to a database element.
 * 
 * @param   {string}   Directory of the database you're reading.
 * @param   {string}   Key of the directory you're reading.
 * @param   {function} callback function for a change.
 * @returns {promise}  Eventually becomes the value you requested.
 */
const subscribeToChanges = (type, key, func) => {
  return dbAccess.ref(type + key).on('value', func);
}

/**
 * Helper function of initializeDirectoryTree. Generates a fileKey -> editor
 * map so that we can get editors names while displaying the tree.
 */
const generateFileKeyToNameMap = () => {
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
const displayDirectoryTree = () => {
  str = generateSourceTree(directoryTree)

  if(!isCommandLineTest){
    const preField = document.getElementById('tree');
    preField.innerHTML = str;
  }
}

// Various parts of the following code to print the directory tree structure are 
// based on the following StackOverflow response: https://stackoverflow.com/a/43105321

/**
 * Print the source graph of the JSON dir.
 * 
 * @param   {function} callback function for a change.
 * @returns {promise}  Eventually becomes the value you requested.
 */
const generateSourceTree = (dir) => {
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
const generateSourceTreeRec = (file, parentPrefix) => {
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
          formattedString += parentPrefix + currentPrefix[0] + key.split(",").join(".")  + "\n";
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
const listEditorsOf = (fileKey) => {
  let str = '(';
  let fileHadEntry = false;

  for(let editorName in editorToFileKeyMap){
    if(editorToFileKeyMap[editorName] == fileKey){
      str += colorText(editorName, "red") + ", ";
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
    return "";
  }
  
}

/**
 * Uses inline style to give color to a span of text.
 * 
 * @param {string} color color to give an html span
 * @param {*} text text to give color
 */
const colorText = (text, color) => {
  return '<span style="color:' + color + '">' + text + "</span>";
}

/**
 * Checks if this index is the last.
 * 
 * @param   {[]}     an array
 * @param   {number} an index
 * @returns {boolean} True if it is the last index.
 */
const isLastElementInArray = (arr, index) => {
  if (arr.length != 0) {
    return index == (arr.length - 1);
  } else {
    return index == arr.length;
  }
}


// TEST CODE
const setDirectoryStructure = (newMap) => {
  console.log("Setting directory");
  directoryTree = newMap;
}

const getDirectoryStructure = () => {
  return directoryTree;
}

const getEditorToFileKeyMap = () => {
  return editorToFileKeyMap;
}

const getFileKeyToNameMap = () => {
  return fileKeyToNameMap;
}
const setEditorToFileKeyMap = (newMap) => {
  editorToFileKeyMap = newMap;
}

const setCommandLineTest = () => {
  isCommandLineTest = true;
}

const cancelInterval = () => {
  clearInterval(intervalID);
}

testObject                             = {}
testObject["setDirectoryTree"]         = setDirectoryStructure;
testObject["generateSourceTree"]       = generateSourceTree;
testObject["generateFileKeyToNameMap"] = generateFileKeyToNameMap;
testObject["setEditorToFileKeyMap"]    = setEditorToFileKeyMap;
testObject["listEditorsOf"]            = listEditorsOf;
testObject["colorText"]                = colorText;
testObject["generateSourceTreeRec"]    = generateSourceTreeRec;
testObject["isLastElementInArray"]     = isLastElementInArray;
testObject["directoryTree"]            = directoryTree;
testObject["fileKeyToNameMap"]         = fileKeyToNameMap;
testObject["editorToFileKeyMap"]       = editorToFileKeyMap;
testObject["createTree"]               = createTree;
testObject["setCommandLineTest"]       = setCommandLineTest;
testObject["getDirectoryStructure"]    = getDirectoryStructure;
testObject["cancelInterval"]           = cancelInterval;
testObject["getEditorToFileKeyMap"]    = getEditorToFileKeyMap;
testObject["getFileKeyToNameMap"]      = getFileKeyToNameMap;