[![Codacy Badge](https://app.codacy.com/project/badge/Grade/8c0827ae480d496a84255309b00e8d76)](https://www.codacy.com/gh/cse112-sp20/CartoGraphX-Web-App?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=cse112-sp20/CartoGraphX-Web-App&amp;utm_campaign=Badge_Grade) [![Maintainability](https://api.codeclimate.com/v1/badges/9adcf7b86bfb69c9d32d/maintainability)](https://codeclimate.com/github/cse112-sp20/CartoGraphX-Web-App/maintainability) ![Test coverage](https://github.com/cse112-sp20/CartoGraphX-Web-App/workflows/Test%20coverage/badge.svg) ![E2E Tests](https://github.com/cse112-sp20/CartoGraphX-Web-App/workflows/E2E%20Tests/badge.svg)  ![Unit Tests](https://github.com/cse112-sp20/CartoGraphX-Web-App/workflows/Unit%20Tests/badge.svg) ![Release](https://github.com/cse112-sp20/CartoGraphX-Web-App/workflows/Release/badge.svg)

# CartoGraphX Web App

The CartoGraphX Web App is used to display the tracked user-metrics gathered by the CartoGraphX VSCode extension. Currently, the project structure and the current editors of each file are displayed. This tool will greatly increase accountability because each developer’s work will be visible in real time.

## Running the web app
To run the web app and see your changes reflected, you can follow the instructions under the "Development" section. You can then log in using the account you've created in the VS Code Extension. You will then be able to view maps you've created by using the team map ID code specified in the extension.

## Features
<img align="center" src="https://github.com/cse112-sp20/CartoGraphX-Web-App/blob/master/readme.img/CartoGraphX_webapp_mapview.png"/>

CartoGraphX users are able to sign into the sign in using an email address and password created through the exentension.

When signed in, a user can delete their account, sign out, or display one of their project maps using an existing team map ID.

## Development
To get started, all you need to do is clone this repository and then run "npm install" to
install and update the packages required to run the site. To open the site, you must open index.html.

For now, you have to run the firebase cloud-functions locally. To do this, clone the CartoGraphx VS Code Extension repo:  
https://github.com/cse112-sp20/CartoGraphX-VS-Extension  

Then, request the 'serviceAccount.json' file from one of the Remote13 developers. Add this file at `/clound-functions/functions/serviceAccount.json`  
navigate to `CartoGraphX-VS-Extension/clound-functions/functions/` and run: `firebase serve --only functions`  
Make sure you have installed 'firebase-tools': `npm install -g firebase-tools`  

## Testing
| Command           | Description                                               |
| ---               | ---                                                       |
| npm install       | install/update packages locally                           |
| npm run unit-test | run all the mocha tests in the unit_tests directory       |
| npm run e2e-test  | run all the nightwatch tests in the e2e_tests directory   |

## Requirements
Must have npm installed to install / update packages and run tests.

### 1.0.0
Initial release

## Known Issues
Due to an issue where we can't push our new API to Google cloud functions, users will have to install the local API to their development environment.
