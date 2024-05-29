class LangaugeSelector extends PopUp
{
    async _addContent()
    {
        const langauges = await langManager.getLangauges();

        for (const [index, language] of Object.entries(langauges))
        {
            let button = new Button(language.name, {
                onClick: () => LangaugeSelector.#setLanguage(language.code)
            });
            button.y = (index * 60) + 10;
            button.x = 10;
            this.addChild(button);
        }
    }

    /**
     * 
     * @param {string} languageCode 
     */
    static #setLanguage(languageCode)
    {
        otherSettings.language = languageCode;
        saveSettingsToLocalStorange();
        location.reload();
    }
}