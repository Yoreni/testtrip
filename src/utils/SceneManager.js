function SceneManager(pixiApp)
{
    this.scenes = {}
    this.activeScene = null
    this.app = pixiApp
    this.app.ticker.add(this.update.bind(this))
}

SceneManager.prototype.update = function(delta)
{
    let active = this.getActive()
    if(active)
    {
        active.update(delta / PIXI.settings.TARGET_FPMS);
    }
}

    /**
     * Adds the scene instance to function under this manager.
     * * If the name is already taken, it won't be added.
     * @param {string} sceneName The name you give to this scene instance.
     * @param {Scene} scene Instance of the scene you want to add.
     */
     SceneManager.prototype.add = function(sceneName, scene) {
        // TODO: Remove from previous manager if set
        if (!sceneName || this.contains(sceneName)) 
        {
            return;
        }
        this.scenes[sceneName] = scene;
        scene.app = this.app;
        scene.scenes = this;
        scene.hasRun = false
    }

    /**
     * Removed a scene from this manager.
     * * If this scene is currently active, it will be stopped first.
     * @param {string} name Name given to this scene instance.
     */
     SceneManager.prototype.remove = function(sceneName) {
        if (!sceneName || !this.contains(sceneName)) 
        {
            return false;
        }
        if (this.activeScene === sceneName) 
        {
            this.stop();
        }
        const scene = this.scenes[sceneName];
        scene.app = null;
        scene.scenes = null;
        if (scene.hasRun) 
        {
            scene.destroy();
            scene.hasRun = false;
        }
        delete this.scenes[sceneName];
        return true;
    }

    /**
     * Checks there is a scene with this name in this manager.
     * @param {string} name 
     * @returns {boolean}
     */
     SceneManager.prototype.contains = function(name)
    {
        return name in this.scenes;
    }

    /**
     * Starts a scene and set's it to be the active scene of this manager.
     * * Stops the previous active scene first if defined.
     * @param {string} name 
     */
    SceneManager.prototype.start = function(name)
    {
        if (!this.contains(name) || name === this.activeScene) 
        {
            return;
        }
       this.stop();
    
        // Start new
        this.activeScene = name;
        const active = this.getActive();
        if (active) 
        {
            if (!active.hasRun) 
            {
                active.init();
                active.hasRun = true;
            }
            this.app.stage.addChild(active.container);
            active.start();
        }
    }

    /**
     * Stops the scene and unsets it as the active scene in this manager.
     */
         SceneManager.prototype.stop = function() 
         {
            let active = this.getActive();
            if (active) 
            {
                this.activeScene = null;
                active.stop();
                this.app.stage.removeChild(active);
            }
        }

     /**
     * Getting the active scene in this manager.
     * @returns {Scene|null}
     */
     SceneManager.prototype.getActive = function()
     {
        return this.activeScene ? this.scenes[this.activeScene] : null;
     }
            
    /**
    * Getting the name of the active scene in this manager.
    * @returns {Scene|null}
    */
     SceneManager.prototype.getActiveName = function()
    {
        return this.activeScene;
    }
            
                /**
                 * Getting the names of all the scenes in this manager.
                 * @returns {string[]}
                 */
                 SceneManager.prototype.getSceneNames = function()
                {
                    return Object.keys(this.scenes);
                }