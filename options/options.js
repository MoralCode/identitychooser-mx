import { Options } from '../modules/options.js';
import { IcIdentities } from '../modules/identities.js';

class OptionsUI {
  constructor(options) {
    this.optionsBackend = options;
  }

  async init(event) {
    console.debug("OptionsUI#init -- begin");

    await this.localizePage();
    await this.updateUI();
    await this.setupListeners();

    console.debug("OptionsUI#init -- end");
  }

  async localizePage() {
    console.debug("OptionsUI#localizePage -- start");

    for (let el of document.querySelectorAll("[data-l10n-id]")) {
      let id = el.getAttribute("data-l10n-id");
      let i18nMessage = browser.i18n.getMessage(id);
      if(i18nMessage == "") {
        i18nMessage = id;
      }
      el.textContent = i18nMessage;
    }

    console.debug("OptionsUI#localizePage -- end");
  }

  async updateUI() {
    console.debug("OptionsUI#updateUI -- start");

    var options = await this.optionsBackend.getAllOptions();

    console.debug("OptionsUI#updateUI: sync options to UI");
    for (const [optionName, optionValue] of Object.entries(options)) {
      console.debug("OptionsUI#updateUI: option: ", optionName,
                    "value: ", optionValue);

      if (optionName in this.optionsBackend.defaultOptions) {
        var optionElement = document.getElementById(optionName);

        if(optionElement.classList.contains("icGeneralOption")) {
          optionElement.checked = optionValue;
        }
      }
    }

    console.debug("OptionsUI#updateUI: populate identity sort list");
    var icIdentities = new IcIdentities(this.optionsBackend);
    var identities = await icIdentities.getIdentities();
    var domIcIdentitySortList =
        document.getElementById("icIdentitySortList");

    for(const identity of identities) {
      console.debug("OptionsUI#updateUI: add identity ", identity.label);
      var identityDiv = document.createElement("div");
      identityDiv.classList.add("list-group-item");
      identityDiv.appendChild(document.createTextNode(identity.label));
      identityDiv.setAttribute("identityId", identity.id);
      domIcIdentitySortList.appendChild(identityDiv);
      console.debug("OptionsUI#updateUI: added identity ", identity.label);
    }

    new Sortable(domIcIdentitySortList, {
      animation: 150,
      ghostClass: 'blue-background-class',
      onSort: (e) => this.identitiesChanged(e)
    });

    console.debug("OptionsUI#updateUI -- end");
  }

  toIcIdentity(mailIdentity) {
    let name = mailIdentity.name;
    let email = mailIdentity.email;

    let label;
    if(name != '') {
      label = `${name} <${email}>`;
    } else {
      label = email;
    }
    return {
      "label": label,
      id: mailIdentity.id
    }
  }

  async setupListeners() {
    document.addEventListener("change", (e) => this.optionChanged(e));
  }

  async optionChanged(e) {
    if(e == null) {
      return;
    }

    if(e.target.tagName == "INPUT" &&
       e.target.type == "checkbox") {
      var optionName = e.target.id;
      var optionValue = e.target.checked;

      await this.optionsBackend.storeOption({
        [optionName]: optionValue
      });
    }
  }

  async identitiesChanged(e) {
    console.debug("OptionsUI#identitiesChanged -- begin");

    var domIcIdentitySortList =
        document.getElementById("icIdentitySortList");

    var positionInMenu = 0;
    var extendedProperties = {};
    for(const domIdentity of domIcIdentitySortList.children) {
      var identityId = domIdentity.getAttribute("identityId");

      extendedProperties[identityId] = {
        'showInMenu': true,
        'positionInMenu': positionInMenu++
      }
    }

    console.debug("OptionsUI#identitiesChanged -- new sort order: ",
                 extendedProperties);
    await this.optionsBackend.storeIdentitiesExtendedProps(extendedProperties);

    console.debug("OptionsUI#identitiesChanged -- end");
  }
}


var options = new Options();
var optionsUI = new OptionsUI(options);

document.addEventListener("DOMContentLoaded", (e) => optionsUI.init(e), {once: true});
