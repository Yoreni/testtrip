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
        this.container.visible = true
        this.gameManager.load(selectedMode);
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
        {
            this.gameManager.unload();
            sceneManager.start("modeMenu");
        }

        //reset game
        this.#objects.resetIndicator.visible = this.resetKey.framesDown > 0 && this.resetKey.framesDown < 30;
        if (this.#objects.resetIndicator.visible)
            this.#objects.resetIndicator.draw(this.resetKey.framesDown / 30)
        if (this.resetKey.framesDown === 30)
            this.gameManager.restartGame();
    }

    destory() 
    {

    }

    init() {
        //add rasei
        this.#objects.rasei = PIXI.Sprite.from("assets/rasei.png");
        this.#objects.rasei.scale.set(0.4);
        this.#objects.rasei.position.set(0, canvasSize.height - this.#objects.rasei.height);
        this.container.addChild(this.#objects.rasei);

        this.#objects.resetIndicator =  new CircleBar(0, {label: "Restart", colour: 0xf4ae09});
        this.#objects.resetIndicator.position.set(300, 300)
        this.container.addChild(this.#objects.resetIndicator);
    }
}