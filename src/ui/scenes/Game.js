PlayerRenderer.addEvents();

class Game extends IScene 
{
    #objects;

    constructor() 
    {
        super();
        this.container = new PIXI.Container();
        this.#objects = {};
        this.gameManager = new GameManager(this.container);
    }

    start()
    {
        this.resetKey = new KeyDetector(controls.reset);
        this.quitKey = new KeyDetector(controls.quit);
        this.container.visible = true
        this.gameManager.load(selectedMode, modeSettings);
        this.gameManager.start();
    }

    stop() 
    {
        {
            {
                {
                    {   // i always write the cleanst code
                        {
                            {
                                {
                                    {
                                        {
                                            {
                                                {
                                                    {
                                                        {
                                                            {
                                                                {
                                                                    {
                                                                        {
                                                                            {
                                                                                {
                                                                                    {
                                                                                        {
                                                                                            {
                                                                                                {
                                                                                                    {
                                                                                                        {
                                                                                                            {
                                                                                                                {
                                                                                                                    {
                                                                                                                        {
                                                                                                                            {
                                                                                                                                {
                                                                                                                                    {
                                                                                                                                        {
                                                                                                                                            {
                                                                                                                                                {
                                                                                                                                                    {
                                                                                                                                                        {
                                                                                                                                                            {
                                                                                                                                                                {
                                                                                                                                                                    {
                                                                                                                                                                        {
                                                                                                                                                                            {
                                                                                                                                                                                {
                                                                                                                                                                                    {
                                                                                                                                                                                        {
                                                                                                                                                                                            {
                                                                                                                                                                                                {
                                                                                                                                                                                                    {
                                                                                                                                                                                                        {
                                                                                                                                                                                                            {
                                                                                                                                                                                                                {
                                                                                                                                                                                                                    {
                                                                                                                                                                                                                        {
                                                                                                                                                                                                                            {
                                                                                                                                                                                                                                {
                                                                                                                                                                                                                                    {
                                                                                                                                                                                                                                        {
                                                                                                                                                                                                                                            {
                                                                                                                                                                                                                                                this.gameManager.unload();
                                                                                                                                                                                                                                                this.container.visible = false;
                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                }
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                        }
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                }
                                                                                                                                                                                                            }
                                                                                                                                                                                                        }
                                                                                                                                                                                                    }
                                                                                                                                                                                                }
                                                                                                                                                                                            }
                                                                                                                                                                                        }
                                                                                                                                                                                    }
                                                                                                                                                                                }
                                                                                                                                                                            }
                                                                                                                                                                        }
                                                                                                                                                                    }
                                                                                                                                                                }
                                                                                                                                                            }
                                                                                                                                                        }
                                                                                                                                                    }
                                                                                                                                                }
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    update(delta) 
    {
        for (const player of this.gameManager.players)
        {
            if (player === null || player === undefined)
                return;

            if (player.logic.isAlive) 
            {
                player.logic.tick(delta)

                if (player.logic.AREtimer === 0)
                    player.input.inputs();
                
                player.render.update(delta);
            }
        }

        if (this.gameManager.hasEnded())
            sceneManager.start("results");

        //reset game
        this.#circleBarAction(this.resetKey, this.#objects.resetIndicator, 20, () => this.gameManager.restartGame());

        //quit game
        this.#circleBarAction(this.quitKey, this.#objects.quitIndicator, 45, () => sceneManager.start("modeMenu"));
    }

    /**
     * handles the logic for the user to hold down a key for an action to happen
     * 
     * @param {KeyDetector} key the user input to detect  
     * @param {CircleBar} indicator the circle bar to update  
     * @param {Number} frames the amount of frames te key needs to be held for the action 
     * @param {function} callback the action 
     */
    #circleBarAction(key, indicator, frames, callback)
    {
        indicator.visible = key.framesDown > 0 && key.framesDown < frames;
        if (indicator.visible)
            indicator.draw(key.framesDown / frames)
        if (key.framesDown === frames)
            callback();
    }

    destory() 
    {

    }

    init() 
    {
        //add rasei
        this.#objects.rasei = PIXI.Sprite.from("assets/rasei.png");
        this.#objects.rasei.scale.set(0.4);
        this.#objects.rasei.position.set(0, canvasSize.height - this.#objects.rasei.height);
        this.container.addChild(this.#objects.rasei);

        this.#objects.resetIndicator = new CircleBar(0, {label: "Restart", colour: 0xf4ae09});
        this.#objects.resetIndicator.position.set(300, 300)
        this.container.addChild(this.#objects.resetIndicator);

        this.#objects.quitIndicator = new CircleBar(0, {label: "Quit", colour: 0xe07d70});
        this.#objects.quitIndicator.position.set(300, 300)
        this.container.addChild(this.#objects.quitIndicator);
    }
}