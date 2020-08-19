export class Options {
  constructor() {
    this.defaultOptions = {
      icEnableComposeMessage: true,
      icEnableReplyMessage: true,
      icEnableForwardMessage: true
    };
  }

  async run() {
    console.log("Options#run");

    await this.localizePage();
    await this.updateUI();
    await this.setupListeners();
  }

  async setupDefaultOptions() {
    var icOptions = await browser.storage.local.get();

    for(const [optionName, defaultValue] of Object.entries(this.defaultOptions)) {
      if(!(optionName in icOptions)) {
        browser.storage.local.set({ [optionName] : defaultValue});
      }
    }
  }

  async isEnabledComposeMessage() {
    return this.isEnabledOption("icEnableComposeMessage", true);
  }

  async isEnabledReplyMessage() {
    return this.isEnabledOption("icEnableReplyMessage", true);
  }

  async isEnabledForwardMessage() {
    return this.isEnabledOption("icEnableForwardMessage", true);
  }

  async isEnabledOption(option, defaultValue) {
    var icOptions = await browser.storage.local.get();

    var ret = defaultValue;
    if(option in icOptions) {
      ret = icOptions[option];
    }

    return ret;
  }

  async localizePage() {
    console.log("Options#localizePage");
  }

  async updateUI() {
    var options = await browser.storage.local.get();

    console.log(options);

    for (const [optionName, optionValue] of Object.entries(options)) {
      console.log(`${optionName}: ${optionValue}`);

      var optionElement = document.getElementById(optionName);

      if(optionElement.tagName == "INPUT" &&
         optionElement.type == "checkbox") {

        optionElement.checked = optionValue;
      }
    }
  }

  async setupListeners() {
    console.log("Options#setupListeners");

    document.addEventListener("change", this.optionChanged);
  }

  async optionChanged(e) {
    console.log("Options#optionChanged");

    if(e == null) {
      return;
    }

    if(e.target.tagName == "INPUT" &&
       e.target.type == "checkbox") {
      var optionName = e.target.id;
      var optionValue = e.target.checked;

      console.log(optionName);
      console.log(optionValue);

      await browser.storage.local.set({
        [optionName]: optionValue
      });

      console.log("nach browser.storage.local.set");
    }
  }
}
