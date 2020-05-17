var assert = require('assert');
require("../assets/common/js/Tree");

describe('Tree', function() {
    describe('#generateSourceTree()', function() {
      it('should return return the right tree', function() {
        let testDirectoryStructure = {"root": {"fileInRoot": "filekey1", "subdir": {"fileInSubdir": "filekey2"}}};
        let testFileToEditorMap = {"filekey1": ["Larry the Snail", "bob"], "filekey2": []};

        testObject.setFileKeyToEditorsMap(testFileToEditorMap);

        assert.equal(testObject.generateSourceTree(testDirectoryStructure), "root\n ├─ fileInRoot (<span style=\"color:red\">Larry the Snail</span>, <span style=\"color:red\">bob</span>)\n └─ subdir\n     └─ fileInSubdir ()\n");
      });
    });
  });