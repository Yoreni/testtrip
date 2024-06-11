class LangManager
{
    static #SUPORTED_LANGAUGES = ["en_en", "en_en_yer3_1", "de"];

    /**
     * @type {String{}}
     */
    #translations = {};
    #languages;

    constructor(locale)
    {
        this.locale = locale;
        this.#languages = this.getLangauges();
    }

    async fetchStrings()
    {
        try 
        {
            const response = await fetch(`lang/${this.locale}.json`);
            const data = await response.json();
            console.log("retrieved translations");
            this.#translations = data;
        } 
        catch (error) 
        {
            console.log(error);
        }
        return;
    }

    /**
     * 
     * @param {string} langaugeCode 
     */
    async #getNativeName(langaugeCode)
    {
        try 
        {
            const response = await fetch(`lang/${langaugeCode}.json`);
            const data = await response.json();
            return data["meta"]["nativeName"];
        } 
        catch (error) 
        {
            console.error(error);
        }
    }

    /**
     * 
     * @param {String} translationKey
     * @param {String[]} placeholders
     * 
     * @returns {String}
     */
    get(translationKey, ...placeholders)
    {
        const path = translationKey.split(".");

        try
        {
            let translation = this.#translations;
            for (const step of path)
                translation = translation[step];

            if (translation == undefined)
                return translationKey;
            
            //apply placeholders
            placeholders.forEach(function (value, index) 
            {
                translation = translation.replace(`{$${index}}`, value);
            });
            return translation;
        }
        catch (error)
        {
            return translationKey;
        }
    }

    /**
     * 
     * @param {Number} number 
     */
    formatNumber(number)
    {
        return number.toLocaleString(this.#translations["meta"]["numberLocal"]);
    }

    /**
     * Gets a list of langauges that this game has been translated to.
     * 
     * @returns {Object[](name: string, code: string)} name is the name of the langauge in that language, code is the languages ISO code
     */
    async getLangauges()
    {
        if (this.#languages !== undefined)
            return this.#languages;

        let langauges = []
        for (let code of LangManager.#SUPORTED_LANGAUGES)
        {
            langauges.push({
                "name": await this.#getNativeName(code),
                code
            })
        }

        return langauges;
    }
}