class LangManager
{
    /**
     * @type {String{}}
     */
    #translations = {};

    constructor(locale)
    {
        this.locale = locale;
        this.#fetchStrings();
    }

    #fetchStrings()
    {
        fetch(`lang/${this.locale}.json`)
        .then((response) => 
        {
            return response.json();
        }).then((data) => 
        {
            console.log("retrived translations");
            console.log()
            this.#translations = data;
        }).catch(error =>
        {
            console.log(error);
        });
    }

    /**
     * 
     * @param {String} translationKey
     * @param {String[]} placeholders 
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

    // raw()
    // {
    //     return this.#translations;
    // }
}