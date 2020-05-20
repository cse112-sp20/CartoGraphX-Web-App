var assert = require('assert');
require("../assets/common/js/index");

describe('Index', function() {
    describe('#generateSourceTree()', function() {
      it('should return return the right tree', function() {
        let testDirectoryTree = {"root": {"fileInRoot": "filekey1", "subdir": {"file,In,Subdir": "filekey2"}}};
        let editorToFileMap = {"Bob": "filekey1"};

        testObject.setDirectoryTree(testDirectoryTree);
        testObject.generateFileKeyToNameMap();
        testObject.setEditorToFileKeyMap(editorToFileMap);

        assert.equal(testObject.generateSourceTree(testDirectoryTree), 'root\n ├─ fileInRoot (<span style=\"color:red\">Bob</span>)\n └─ subdir\n     └─ file.In.Subdir \n')
      });
    });
  });