# chrome-ext
Chrome extension

## Content scripts
A content script is “a JavaScript file that runs in the context of web pages.” This means that a content script can interact with web pages that the browser visits. Not every JavaScript file in a Chrome extension can do this; we’ll see why later.

Add this to your manifest.json file:

```json
"content_scripts": [
  {
    "matches": [
      "<all_urls>"
    ],
    "js": ["content.js"]
  }
]
```

This tells Chrome to inject content.js into every page we visit using the special <all_urls> URL pattern. If we want to inject the script on only some pages, we can use match patterns. Here are a few examples of values for "matches": `["https://mail.google.com/*", "http://mail.google.com/*"]`

## Browser Actions
When an extension adds a little icon next to your address bar, that’s a browser action. Your extension can listen for clicks on that button and then do something.

Put the icon.png from Google’s extension tutorial in your extension folder and add this to manifest.json:

```json
"browser_action": {
  "default_icon": "icon.png"
}
```
In order to use the browser action, we need to add message passing.

## Message passing
A content script has access to the current page, but is limited in the APIs it can access. For example, it cannot listen for clicks on the browser action. We need to add a different type of script to our extension, a background script, which has access to every Chrome API but cannot access the current page. As Google puts it:
So the content script will be able to pull a URL out of the current page, but will need to hand that URL over to the background script to do something useful with it. In order to communicate, we’ll use what Google calls message passing, which allows scripts to send and listen for messages. It is the only way for content scripts and background scripts to interact.
Add the following to tell manifest.json about the background script:

```json
"background": {
  "scripts": ["background.js"]
}
```
Now we’ll add background.js:

```javascript
// background.js

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  });
});
```

This sends an arbitrary JSON payload to the current tab. The keys of the JSON payload can be anything, but I chose "message" for simplicity. Now we need to listen for that message in content.js:
```javascript
// content.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      var firstHref = $("a[href^='http']").eq(0).attr("href");

      console.log(firstHref);
    }
  }
);
```