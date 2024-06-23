class LineChart extends PIXI.Container
{
    constructor(settings)
    {
        super()

        let canvas = document.getElementById('line_graph')
        canvas.style.display = "inherit"
        let ctx = canvas.getContext('2d')
        let myChart = new Chart(ctx, settings)

        let chart_sprite = new PIXI.Sprite()
        let chart_texture = PIXI.Texture.from(canvas)
        chart_sprite.texture = chart_texture
        chart_texture.update()

        this.addChild(chart_sprite)
    }
}