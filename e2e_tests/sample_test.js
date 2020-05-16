module.exports = {
  "Open google.com": function (browser) {
    browser
      // Load the tables.html page and verify that the create form exists
      .url(require("path").resolve(__dirname + "../../src/index.html"))
      .waitForElementVisible("body")
      .assert.visible("h1[id=title-header]")
      .end();
  },
};