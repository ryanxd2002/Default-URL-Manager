document.addEventListener('DOMContentLoaded', function () {
  const keywordInput = document.getElementById('keyword');
  const urlInput = document.getElementById('url');
  const addButton = document.getElementById('add');
  const urlList = document.getElementById('urlList');

  // Function to normalize URLs
  function normalizeURL(url) {
    try {
      let normalized = url.trim();
      
      // Add protocol if missing
      if (!/^https?:\/\//i.test(normalized)) {
        normalized = 'https://' + normalized;
      }
      
      const urlObj = new URL(normalized);
      
      // Ensure 'www.' prefix
      if (!urlObj.hostname.startsWith('www.')) {
        urlObj.hostname = 'www.' + urlObj.hostname;
      }
      
      return urlObj.toString();
    } catch (e) {
      return null;
    }
  }

  // Load existing URLs from storage
  chrome.storage.sync.get(['urlMappings'], function (result) {
    const mappings = result.urlMappings || {};
    for (let [keyword, url] of Object.entries(mappings)) {
      addListItem(keyword, url);
    }
  });

  // Add new mapping
  addButton.addEventListener('click', function () {
    const keyword = keywordInput.value.trim();
    const url = urlInput.value.trim();
    
    if (keyword && url) {
      const normalizedURL = normalizeURL(url);
      
      if (!normalizedURL) {
        alert('Please enter a valid URL.');
        return;
      }

      chrome.storage.sync.get(['urlMappings'], function (result) {
        const mappings = result.urlMappings || {};
        mappings[keyword] = normalizedURL;
        chrome.storage.sync.set({ urlMappings: mappings }, function () {
          addListItem(keyword, normalizedURL);
          keywordInput.value = '';
          urlInput.value = '';
        });
      });
    } else {
      alert('Both fields are required.');
    }
  });

  // Function to add item to the list
  function addListItem(keyword, url) {
    const li = document.createElement('li');
    li.textContent = `${keyword} -> ${url}`;
    
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'remove-btn';
    removeBtn.addEventListener('click', function () {
      chrome.storage.sync.get(['urlMappings'], function (result) {
        const mappings = result.urlMappings || {};
        delete mappings[keyword];
        chrome.storage.sync.set({ urlMappings: mappings }, function () {
          urlList.removeChild(li);
        });
      });
    });

    li.appendChild(removeBtn);
    urlList.appendChild(li);
  }
});
