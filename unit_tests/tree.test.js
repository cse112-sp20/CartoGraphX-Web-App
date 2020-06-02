var assert = require('assert');
require("../assets/common/js/tree");


/**
 * This test will mock a response directoryTree from firebase 
 * and then test that the generateSourceTree return the correct source tree. 
 */
describe("Index", () => {
    describe("#generateSourceTree()", () => {
      it("should return return the right tree", () => {
        let testDirectoryTree = {"root": {"fileInRoot": "filekey1", "subdir": {"file,In,Subdir": "filekey2"}}};
        let editorToFileMap = {"Bob": "filekey1"};

        testObject.setDirectoryTree(testDirectoryTree);
        testObject.generateFileKeyToNameMap();
        testObject.setEditorToFileKeyMap(editorToFileMap);

        assert.equal(testObject.generateSourceTree(testDirectoryTree), 'root\n ├─ fileInRoot (<span style=\"color:red\">Bob</span>)\n └─ subdir\n     └─ file.In.Subdir \n')
      });
    });
  });