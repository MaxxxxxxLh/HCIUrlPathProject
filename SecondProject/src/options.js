document.addEventListener('DOMContentLoaded', async function () {
  const rootElement = document.getElementById('root');
  console.log("Popup Loaded");

  // Initialiser l'état de l'URL et des liens
  let url = '';
  let links = [];

  // Fonction pour charger l'URL et les liens
  const loadUrl = () => {
    chrome.storage.sync.get(['redirectUrl', 'links'], (data) => {
      if (data.redirectUrl) {
        url = data.redirectUrl;
      }
      if (data.links) {
        links = data.links;
      }
      render();
    });
  };

  // Fonction pour enregistrer l'URL
  const saveUrl = () => {
    chrome.storage.sync.set({ redirectUrl: url });
  };

  // Fonction pour enregistrer l'URL quand l'input change
  const handleChange = (event) => {
    url = event.target.value;
    saveUrl();
  };

  // Fonction pour ajouter un nouveau lien
  const handleAddLink = () => {
    const newLinkInput = document.getElementById('newLinkInput');
    const newLink = newLinkInput.value.trim();
    if (newLink && !links.includes(newLink)) {
      links.push(newLink);
      chrome.storage.sync.set({ links: links }, () => {
        render();
      });
      newLinkInput.value = '';  // Clear the input field after adding the link
    } else {
      alert(`${newLink} is already in the blocked links!`);
    }
  };

  // Fonction pour supprimer un lien
  const handleRemoveLink = (linkToRemove) => {
    links = links.filter(link => link !== linkToRemove);
    chrome.storage.sync.set({ links: links }, () => {
      render();
    });
  };

  // Fonction pour définir le lien de redirection
  const setRedirectUrl = () => {
    chrome.storage.sync.set({ redirectUrl: url }, () => {
      alert(`Redirect URL set to: ${url}`);
    });
    
    // Ajouter une vérification avant de modifier les onglets
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      if (!tabs || tabs.length === 0 || tabs[0].id === undefined) {
        console.error('Tabs cannot be edited right now');
        return;
      }
  
      const tabId = tabs[0].id;
      chrome.tabs.update(tabId, { url: url });
    });
  };
  

  // Fonction pour rendre l'interface utilisateur
  const render = () => {
    // Créer les éléments
    const div = document.createElement('div');
    const h1 = document.createElement('h1');
    const input = document.createElement('input');
    const addLinkInput = document.createElement('input');
    const addLinkButton = document.createElement('button');
    const setRedirectButton = document.createElement('button');
    const linksDiv = document.createElement('div');

    // Définir les attributs
    h1.textContent = 'URL to redirect';

    input.type = 'text';
    input.value = url;
    input.addEventListener('input', handleChange);

    setRedirectButton.textContent = 'Set Redirect URL';
    setRedirectButton.addEventListener('click', setRedirectUrl);
    
    addLinkInput.id = 'newLinkInput';
    addLinkInput.type = 'text';
    addLinkInput.placeholder = 'Enter new link';

    addLinkButton.textContent = 'Add Link';
    addLinkButton.addEventListener('click', handleAddLink);

 

    // Ajouter les éléments au div
    div.appendChild(h1);
    div.appendChild(input);
    div.appendChild(setRedirectButton);
    div.appendChild(addLinkInput);
    div.appendChild(addLinkButton);


    // Afficher les liens ajoutés
    links.forEach(linkText => {
      const linkElement = document.createElement('div');
      const linkTextElement = document.createElement('span');
      const removeLinkIcon = document.createElement('span');

      linkTextElement.textContent = linkText;
      removeLinkIcon.innerHTML = '&#10006;';
      removeLinkIcon.className = 'remove-link-icon';
      removeLinkIcon.addEventListener('click', () => handleRemoveLink(linkText));

      linkElement.appendChild(linkTextElement);
      linkElement.appendChild(removeLinkIcon);
      linksDiv.appendChild(linkElement);
      linksDiv.appendChild(document.createElement('br'));
    });

    // Ajouter les éléments au div
    div.appendChild(linksDiv);

    // Remplacer le contenu de l'élément root
    rootElement.innerHTML = '';
    rootElement.appendChild(div);
  };

  // Charger l'URL et les liens au démarrage
  loadUrl();
});
