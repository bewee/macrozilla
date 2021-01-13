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

This add-on follows the approach of ECA-rules ("event-condition-action"). This means that whenever one of the selected events/triggers gets fired (placed in "triggers", e.g. "property y of thing x was changed", "thing z was disconnected", "variable x was changed", "sunset started", etc) and all the conditions are fullfilled (placed in "conditions", e.g. "property y of thing x is greater than 200", "variable x contains the number 42", "it is after sunset", etc) then the actions (e.g. "set property y of thing x to value 17", "wait 10 seconds", "increment variable x", etc) get executed consecutively. Running the macro manually (play button in the lower right) will skip the triggers part and *not* check conditions but rather execute all the actions immediately.

Using the side menu of your gateway's website, you can open the administration page for macros and variables.
![Screenshot_20200928_150905](https://user-images.githubusercontent.com/44091658/94436383-aa61e380-019c-11eb-8704-3c35cc4553cd.png)
From there, you can add folders and macros/variables to these. Clicking on an existing macro/variable opens the editor.

In the add-on settings, you can choose between a text-based and a structogram-based editor.

# Code structure

## `classes/`
Each subfolder found here defines a "class", which is a collection of definitions of building elements. JSON objects are used to represent instances of a class. As an example, `x+y` is represented by something like `{"id":42,"type":"arithmetic","qualifier":"+","left":x,"right":y}`. Note that the type "arithmetic" is the name of the handling class and the qualifier "+" identifies the operation to be performed within this class.

A class consists at least of a `server.js` and a `client.js` as well as JSON-schemas used for validation of instances of each of its abilities. Abilities define how instances of this class can be used. Examples of abilities are executable, evaluable, settable and trigger. They are not stated in an instance but rather arise from the context (e.g. if a thing is placed into a triggers block, then its ability will be "trigger" and when it is placed into a logical not its ability will be "ebaluable"). 

For each ability, the `server.js` exports a function that defines how to process a  JSON instance ot this ability. This function may run async and may return something. Its "this" context is set to an execution context (see `lib/execution-context.js`).

The `client.js` defines which blocks (ability executable) and cards (all other abilities) this class provides, in which category to put them, how to group them and more.


## `lib/`
Core back-end code.

#### `lib/api-handler.js`
Communication with the front-end

#### `lib/db-handler.js`
Definition of and access to the database tables

#### `lib/macro-handler.js`
General handling of macros (load, execute, ...)

#### `lib/execution-context.js`
Passed to back-end of classes as "this" context. Capsules the parameters passed to this function (mainly the JSON instance) and offers helpers for logging, casting, validating JSON schemas and calling other classes.


## `static/`
Core front-end code.

#### `static/extension.js`
Define helpers, load views and add menu entries

#### `static/extension.css`
Add-On wide style applied to all views

#### `static/views/`
Each subfolder found here defines a view. Each view consists at least of an `index.js`, `index.html` and `index.css`.

##### `static/views/variablelist`
List of all variable folders and variables

##### `static/views/variableeditor`
Editing a variable

##### `static/views/macrolist`
List of all macro folders and macros

##### `static/views/editor`
Shared resources used by all macro editors

##### `static/views/editor-text`
Very basic text-based macro editor

##### `static/views/editor-structogram`
Structogram-like graphical macro editor
