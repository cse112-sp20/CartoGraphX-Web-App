var assert = require('assert');
require("../assets/common/js/tree");
var firebase = require("firebase");

/**
 * This test will mock a response directoryTree from firebase 
 * and then test that the generateSourceTree return the correct source tree. 
 */
describe("Tree", () => {
  testObject.setCommandLineTest();
  describe("#generateSourceTree()", () => {
    /** setup for testing */

    let testDirectoryTree = {"root": {"fileInRoot": "filekey1", "subdir": {"file,In,Subdir": "filekey2"}}};
    let editorToFileMap = {"Bob": "filekey1"};

    testObject.setDirectoryTree(testDirectoryTree);
    testObject.generateFileKeyToNameMap();
    testObject.setEditorToFileKeyMap(editorToFileMap);

    /** testing if generateFileKeyToNameMap created the correct map */
    it("fileKeyToNameMap should contain the correct map", () => {
      assert.equal(testObject.fileKeyToNameMap["filekey1"], "fileInRoot");
      assert.equal(testObject.fileKeyToNameMap["filekey2"], "file.In.Subdir");
    });

    /** testing listEditorsOf if returning currect editor for file */
    it("should return the right editor for file", () => {
      assert.equal(testObject.listEditorsOf("filekey1"), '(<span style="color:red">Bob</span>)');
    });

    /** testing listEditorsOf if file does not have an editor */
    it("should return no editor for file", () => {
      assert.equal(testObject.listEditorsOf("filekey2"), "");
    });
    
    /** testing colorText if returning currect string */
    it("should return the right editor for file", () => {
      assert.equal(testObject.colorText("TEST", "green"), '<span style="color:green">TEST</span>');
    });

    /** checking if generateSourceTree created correct tree */
    it("should return the right tree", () => {
      assert.equal(testObject.generateSourceTreeRec(testDirectoryTree, ""), ' └─ root\n     ├─ fileInRoot (<span style=\"color:red\">Bob</span>)\n     └─ subdir\n         └─ file.In.Subdir \n');
    });

    /** checking if generateSourceTree is given an empty directory */
    it("should return empty tree", () => {
      assert.equal(testObject.generateSourceTreeRec({}, ""), "");
    });

    /** checking if generateSourceTree created correct tree */
    it("should return the right tree", () => {
      assert.equal(testObject.generateSourceTree(testDirectoryTree), 'root\n ├─ fileInRoot (<span style=\"color:red\">Bob</span>)\n └─ subdir\n     └─ file.In.Subdir \n');
    });

    /** checking if generateSourceTree is given an empty directory */
    it("should return empty tree", () => {
      assert.equal(testObject.generateSourceTree({}), "");
    });
  });

  describe("#isLastElementInArray()", () => {
    /** checking if isLastElementInArray */
    it("should be last element of tree", () => {
      assert.equal(testObject.isLastElementInArray([0], 0), true);
    });

    /** checking if isLastElementInArray */
    it("should be last element of tree", () => {
      assert.equal(testObject.isLastElementInArray([0, 1, 2, 3, 4, 5], 5), true);
    });

    /** checking if isLastElementInArray */
    it("should be last element of tree", () => {
      assert.equal(testObject.isLastElementInArray([0, 1, 2, 3, 4, 5], 4), false);
    });


    /** checking if isLastElementInArray */
    it("should be last element of tree", () => {
      assert.equal(testObject.isLastElementInArray([], 0), true);
    });
  });

  describe("#firebaseIntegration", function () { // Scoping issues require this NOT be an arrow function.
    this.timeout(5000); // Super big timeout because it's a database call.

    it("Should contain info from database", (done) => {
      var config = {
        apiKey: "AIzaSyA8jCEXgEsLljtkEUg-RCgHaF6i2cag_kY",
        authDomain: "remote-13.firebaseapp.com",
        databaseURL: "https://remote-13.firebaseio.com",
        storageBucket: "remote-13.appspot.com",
        messagingSenderId: "113160307201",
        appId: "1:113160307201:web:fc2dda4c33c5d2ce4ff600",
        measurementId: "G-3F5MRDS2LK"
      };
  
      testObject.setCommandLineTest();
  
      console.log("Doing firebase test");
  
      firebase.initializeApp(config)
      testObject.createTree("TEST_MAP", firebase);
  
      setTimeout(() => {
        assert.equal('Mini-project-CRUD-app' in testObject.getDirectoryStructure(), true);
        assert.equal('Phillip' in testObject.getEditorToFileKeyMap(), true);
        assert.equal(testObject.getEditorToFileKeyMap()['Phillip'] in testObject.getFileKeyToNameMap(), true);

        testObject.cancelInterval();
        firebase.database().goOffline();
        done();
      });
    });
  });
});