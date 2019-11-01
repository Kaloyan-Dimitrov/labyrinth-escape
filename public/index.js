const SVG = require('svg.js');
const $ = require('jquery');
$(() => {
    let mouseDown = 0;
    document.body.onmousedown = function () {
        ++mouseDown;
    }
    document.body.onmouseup = function () {
        --mouseDown;
    }
    const cellW = 20;
    const cellH = 20;
    const gridWidth = window.innerWidth / cellW;
    const gridHeight = (window.innerHeight * 0.8) / cellH;
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight * 0.8;
    const draw = SVG('drawing').size(canvasWidth, canvasHeight + 4);
    grid = [];
    for (let i = 0; i < gridWidth; i++) {
        grid[i] = [];
        for (let j = 0; j < gridHeight; j++) {
            grid[i][j] = draw.rect(cellW, cellH).move(i * cellW, j * cellH).fill('#fff').stroke({
                color: '#000',
                opacity: 0.3
            });
            grid[i][j].mouseover(function () {
                if (mouseDown && $(grid[i][j].node).attr('fill') == '#ffffff') {
                    const toAnimate = draw.rect(cellW, cellH).move(this.x(), this.y()).fill('#fff').stroke({
                        color: '#000',
                        opacity: 0.3
                    })
                    toAnimate.animate({
                        duration: 100
                    }).fill({
                        color: '#000'
                    });
                    toAnimate.animate({
                        duration: 100
                    }).scale(1.5, 1.5).animate({
                        when: 'after',
                        duration: 100
                    }).scale(1, 1);
                    setTimeout(() => {
                        toAnimate.remove();
                    }, 300);
                    this.fill('#000');
                }
            });
            grid[i][j].click(function () {
                if ($(grid[i][j].node).attr('fill') == '#ffffff') {
                    const toAnimate = draw.rect(cellW, cellH).move(this.x(), this.y()).fill('#fff').stroke({
                        color: '#000',
                        opacity: 0.3
                    })
                    toAnimate.animate({
                        duration: 100
                    }).fill({
                        color: '#000'
                    });
                    toAnimate.animate({
                        duration: 100
                    }).scale(1.5, 1.5).animate({
                        when: 'after',
                        duration: 100
                    }).scale(1, 1);
                    setTimeout(() => {
                        toAnimate.remove();
                    }, 300);
                    this.fill('#000');
                }
            });
        }
    }
});