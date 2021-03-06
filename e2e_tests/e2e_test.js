module.exports = {
  "Open google.com": function (browser) {
    browser
      // Load the index.html page and verify that the create form exists
      .url(require("path").resolve(__dirname + "../../index.html"))
      .waitForElementVisible("body")
      .waitForElementVisible("button[id=large-sign-button]")

      //hit the sign in button
      .assert.visible("button[id=large-sign-button]")
      .click("button[id=large-sign-button]")

      //assert sign in, and input the sign in with test user
      .waitForElementVisible("#firebaseui-container > div > form > div.firebaseui-card-header > h1")   
      .assert.visible("#firebaseui-container > div > form > div.firebaseui-card-actions > div > button")
      .assert.visible("#firebaseui-container > div > form > div.firebaseui-card-content > div > div.firebaseui-textfield.mdl-textfield.mdl-js-textfield.mdl-textfield--floating-label.is-upgraded > input")
      .assert.visible("#firebaseui-container > div > form > div.firebaseui-card-actions > div > button")
      .setValue("input[type=email]", "test@mail.com")
      .click("#firebaseui-container > div > form > div.firebaseui-card-actions > div > button")
      .assert.visible("#firebaseui-container > div > form > div.firebaseui-card-content > div:nth-child(3) > input")
      .assert.visible("#firebaseui-container > div > form > div.firebaseui-card-actions > div.firebaseui-form-actions > button")
      .setValue("input[type=password]", "testPassword")
      .click("#firebaseui-container > div > form > div.firebaseui-card-actions > div.firebaseui-form-actions > button")

      //check to see if the map is there
      .waitForElementVisible("#tree")
      .assert.visible("#tree")
      
      //check the manage maps page
      .assert.visible("div[id=mapManagePage]")
      .click("div[id=mapManagePage]")
      .assert.visible("input[id=mapKey]")
      .assert.visible("button[type=submit]")
      .assert.visible("div[id=manage-close-button]")
      .click("div[id=manage-close-button]")

      //checking around the user page
      .assert.visible("#userPage")
      .click("#userPage")
      .assert.visible("button[id=sign-out]")
      .assert.visible("#delete-account")
      .assert.containsText("#email", "test@mail.com")

      //sign out
      .click("button[id=sign-out]")
      

      .end();
  },
};