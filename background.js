chrome.omnibox.onInputEntered.addListener((text, disposition) => {
    chrome.storage.sync.get(['urlMappings'], function (result) {
      const mappings = result.urlMappings || {};
      if (mappings[text]) {
        const url = mappings[text];
        switch (disposition) {
          case 'currentTab':
            chrome.tabs.update({ url: url });
            break;
          case 'newForegroundTab':
            chrome.tabs.create({ url: url, active: true });
            break;
          case 'newBackgroundTab':
            chrome.tabs.create({ url: url, active: false });
            break;
        }
      } else {
        // If keyword not found, perform a search using the input
        const query = encodeURIComponent(text);
        chrome.tabs.create({ url: `https://www.google.com/search?q=${query}` });
      }
    });
  });
  