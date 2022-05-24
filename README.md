# zapier-maximizer-example

## What is this?

This project is an example Zapier app that lets you connect your Zaps to the Maximizer.Web.Data API of your on-premise Maximizer CRM installation.

In this example, you'll find some basic functionality to allow you to search for, create, and trigger on Custom (aka "CustomIndependent") objects within Maximizer, but the project is really intended as a starting point upon which you can build your own custom functionality.

## Why should I use it?

You shouldn't. Whenever possible, you should use the [out-of-the-box Maximizer CRM integration for Zapier](https://zapier.com/help/doc/how-get-started-with-maximizer-on-zapier). It is built and maintained by Maximizer, will add support for the latest Maximizer functionality, doesn't require any custom coding on your part, and is compatible with Maximizer's cloud offering, Maximizer CRM Live.

But if you have a use-case that isn't supported by the Maximizer CRM Zapier integration, or if your workflow would be too complex to implement directly in a Zap, you can use this project to build out your own custom logic incorporating Maximizer.Web.Data API functionality.

## Disclaimer

This example project is not supported by or affiliated with Maximizer or Zapier in any way. If you encounter any problems with the example, please create an issue here, but don't expect support or help from Maximizer or Zapier. Oh, and it will not work with the Maximizer CRM Live cloud product (though you could easily extend it to add CRM Live support if you were so inclined).

## I'm sold! Let's get started!

Woah, slow down friend. Before you start working with this project, you're going to need to do a few things...

### Set up a Zapier Developer Account

In order to deploy your own private Zap App, you will need a Zapier Developer Account. It's free to sign up, and you can do so [here](https://zapier.com/platform).

You'll also need a regular Zapier account to create Zaps using your custom Zap App. If you don't already have a Zapier account, you can sign up for one [here](https://zapier.com/).

### Read the Zapier CLI Docs

This project is built using the Zapier CLI. If you're not already familiar with it, I would strongly recommend reading the [Getting Started with Zapier Platform CLI guide](https://platform.zapier.com/cli_tutorials/getting-started), and/or following the [Zapier CLI Tutorial](https://developer.zapier.com/cli-guide/introduction) to learn about the platform and the core concepts involved with building a Zap App.

The remainder of this guide assumes that you have a dev environment that meets the [Zapier CLI requirements](https://github.com/zapier/zapier-platform/blob/master/packages/cli/README.md#requirements), you have the Zapier CLI installed, and you have logged-in to your account via the `zapier login` command.

### Get the Code and Make it Your Own

Clone the repo to your local machine:
```
git clone git@github.com:jasontdc/zapier-maximizer-example.git
```

Edit the `package.json` file and change the `name` property to the name you want to use for your custom app. It should be unique, as it is used in the example as the ApplicationId for any Custom records created in Maximizer by the app.

Then, install the dependencies required by the app:
```
npm install
```

### Register the App

In order to deploy the app to your Zapier developer account, you first have to register it, which you can do by running the following command in the project root:
```
zapier register "My Custom Zap App"
```
Of course, you'll want to change the name to be reflective of your own app. This is how your app will appear in the Zapier UI, so you should be able to uniquely identify your app by its name.

Registering the app will create a `.zapierapprc` file in the project root containing an ID and Key that uniquely identify your app on the Zapier platform. You only need to do this once, and you should check the `.zapierapprc` file in to source control so that you don't lose the ID associated with your app.

### Test and Deploy

Before you deploy your app, it's always a good idea to test it. The example includes unit tests which you can run using the following command:
```
zapier test
```
The Zapier CLI will also perform validation of your app to make sure that it's structurally sound and ready to deploy (you'll see some warnings and messages about incomplete publishing tasks--you can ignore those for now).

Assuming all of the tests pass, you are ready to deploy your app:
```
zapier push
```
When you run this command, Zapier will build and deploy your app. If there are no errors, your app is now live!

### Invite Users

Once your Zap App is deployed, you'll need to invite users to use it. At least initially, this will just be you, as you'll need to send an invite to your own Zapier account so that you can test out your Zap App.

You can send out an invite using the following command:
```
zapier users:add user@example.com 1.0.0
```
Replace the email address with the email that's associated with your Zapier account (remember, your Zapier account and your Zapier Developer account are separate), and make sure the version number matches the version that you've deployed, in case you've changed it.

Once you receive the invitation email, click the link in the link in the email to accept the invitation, and then click the "Accept Invite and Build Zap" button to add the Zap App to your account.

### Connect Your Maximizer Server

Once you've accepted the invitation to use your Zap App, you will be able to select your app when adding a trigger or action to one of your Zaps. In the Zapier UI, enter the name of your Zap App (the one you entered in the "Register" step above) in the "Search apps..." textbox, and you should see your app as an option.

#### Create an OAuth2 Profile in Maximizer

The first time you use your app in a Zap, you will need to connect it to your Maximizer Address Book. But before you do that, you'll need to set up an OAuth profile in Maximizer Administrator. And to do that, you need to get the redirect URI for your Zap App.

Here's what you'll need to do:

1. Run `zapier describe` and copy the "Redirect URI" value from the Authentication section in the output.
2. Log in to Maximizer, and open Administrator (Administration > Administrator).
3. Select "System Options", and then the "OAuth 2.0 Settings" tab.
4. Click "Add", enter a name for your app's OAuth profile, and copy the URI from step 1 into the "Redirect URI" field, then click "Save".

Make a note of the Client ID and Client Secret values that are generated; you'll need them later. But keep them secret!

#### Connect Your App

With the Client ID and Client Secret of your Maximizer OAuth2 profile in hand, you're ready to connect your Zap App. Here's how to do that:

1. Create a new Zap, and add a trigger or action from your new app.
2. When you get to the "Choose Account" step, click the "Sign in to your-zap-app-name (1.0.0)" button. A "Connect an Account" dialog will appear.
3. Enter your Client ID and Client Secret in the appropriate fields, and in the "Maximizer URL" field, enter the base URL of your Maximizer server. For example, if you log in to Maximizer at "https://www.example.com/MaximizerWebAccess/" you would enter "https://www.example.com" (without the trailing slash).
4. Click "Yes, Continue", and you will be taken to the Maximizer OAuth2 login page.
5. Select the Address Book that you want to log in to, enter your Maximizer User ID and Password, and click "Log In".

After logging-in to Maximizer, your new connection should be available to select in your Zap, and it will also show up in the "Custom Integrations" section in the "My Apps" page in your Zapier account.

### Start Zapping

With your Zap App connected to your Maximizer Address Book, you can now start building Zaps using the triggers and actions in your custom app.

And when you're ready to start building out your own functionality, check out the latest Zapier docs: https://github.com/zapier/zapier-platform/blob/master/packages/cli/README.md.

## Additional Notes

### Test Coverage

The exmample project includes a `jest.config` file that specifies requirements for test coverage, with limits that are set at 80% for branches, functions, lines, and statements. If you want to check the test coverage for the project, run this command:
```
npm run coverage
```

### Using the Local Zapier CLI

The `package.json` includes the `zapier-platform-cli` package as a dev dependency. This means that you don't have to install the Zapier CLI globally on your machine. After running `npm install` you'll be able to run Zapier CLI commands using the locally installed binary within the project like so:
```
npm run zapier <command>
```
For example, you can `npm run zapier test` or `npm run zapier push`. If you need to pass parameters to the CLI commands, you can do so by including them after an `--` string, like so:
```
npm run zapier <command> -- --<option>=<value> 
```
For example, you could get detailed Zapier console logs like this: `npm run zapier logs -- --type=console --detailed`.


### VSCode DevContainer

If you use VSCode, the example project includes a devcontainer definition file that you can use with the VSCode Remote Development extension pack. For details on how to get started developing in containers with VSCode check out the docs here: https://code.visualstudio.com/docs/remote/containers
