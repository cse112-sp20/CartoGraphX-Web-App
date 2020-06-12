module.exports = {
  src_folders: ["e2e_tests"],

  webdriver: {
    start_process: true,
    server_path: require("chromedriver").path,
    port: 9515,
    log_path: false,
  },

  test_settings: {
    default: {
      desiredCapabilities: {
        browserName: "chrome",
      },
    },
  },
};
