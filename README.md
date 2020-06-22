# Staking App

## Install deps

### `yarn`

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br/>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br/>
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br/>
See the section about [running tests](#running-tests) for more information.

### `yarn run build`

Builds the app for production to the `build` folder.<br/>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br/>
Your app is ready to be deployed!

## Ui-kit
The videocoin projects share a ui library (cloud-ui-kit), which you can find here: https://github.com/videocoin/cloud-ui-kit.
Before starting the application you will need to install the ui-kit. From the project root run

### `git submodule update --init`
Now cd into src/ui-kit and run

### `yarn`
Once the submodules dependencies have finished installing you can cd back up to the top and run start the dev server.

### Usage

For a usage example look at the Logo component in Header.tsx. You can also look at the videocoin cloud ui (https://github.com/videocoin/cloud-ui)
, which uses the kit extensively.