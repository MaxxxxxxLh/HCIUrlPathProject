chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    checkTabUrl(tab.url);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log(tab.url);
    checkTabUrl(tab.url);
  });
});

const checkTabUrl = (url) => {
  chrome.storage.sync.get(['redirectUrl', 'links'], (data) => {
    console.log(data.links.includes(extractBaseUrl(url)))
    console.log(data.links)
    if (data.redirectUrl && data.links && data.links.includes(extractBaseUrl(url))) {
      chrome.tabs.update({ url: data.redirectUrl });
    } 
  });
};

// Fonction pour extraire la partie de base de l'URL
function extractBaseUrl(url) {
  // Utiliser une regex pour extraire la partie de base de l'URL
  const regex = /^(.*?\/\/.*?\/).*$/;
  const match = url.match(regex);
  if (match && match.length > 1) {
    return match[1];
  } else {
    return url; // Retourner l'URL originale si aucun match n'est trouvé
  }
}
