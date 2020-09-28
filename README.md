# Macrozilla
This add-on for Mozilla WebThings Gateway enables you to build so-called macros in order to create more advanced rules.
![Screenshot_20200928_150609](https://user-images.githubusercontent.com/44091658/94436365-a6ce5c80-019c-11eb-8b5b-eb291361dcd4.png)

# Installation
Install this addon through the addon list or clone it to `~/.mozilla-iot/addons/` using git.

Reload your gateway's website (F5). There should now be two additional entries in the menu of your gateway's website.

In order to be able to use things, you have to take two additional step. 
1. Go to `Settings > Developer > Create local authorization`. Make sure that all devices are checked and that "monitor and control" is selected. Then click allow and copy the token from the first text field.
2. Go to `Settings > Add-Ons > Macrozilla > Configure` and paste your token in the access token field, then click save.

In order to be able to use sun events, you have to fill out the fields "latutide" and "longitude" in `Settings > Add-Ons > Macrozilla > Configure` and click save.

# Usage

Using the side menu of your gateway's website, you can open the administration page for macros and variables.
![Screenshot_20200928_150905](https://user-images.githubusercontent.com/44091658/94436383-aa61e380-019c-11eb-8704-3c35cc4553cd.png)
From there, you can add folders and macros/variables to these. Clicking on an existing macro/variable opens the editor.

In the add-on settings, you can choose between a text-based and a structogram-based editor. A new node-based editor is currently under development.

# Code structure

...
