const SVG = require('svg.js');
const $ = require('jquery');
const bootstrap = require('bootstrap');
$(() => {
    $('.btn').button();
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
    let startX, startY, endX, endY;
    grid = [];
    for (let i = 0; i < gridWidth; i++) {
        grid[i] = [];
        for (let j = 0; j < gridHeight; j++) {
            grid[i][j] = draw.rect(cellW, cellH).move(i * cellW, j * cellH).fill('#fff').stroke({
                color: '#000',
                opacity: 0.3
            });
            grid[i][j].mouseover(function () {
                if (mouseDown && $(grid[i][j].node).attr('fill') == '#ffffff' && $('#placing').children('.active').children()[0].id == 'wall') {
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
                if ($(grid[i][j].node).attr('fill') == '#ffffff' && $('#placing').children('.active').children()[0].id == 'wall') {
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
                if ($('#placing').children('.active').children()[0].id == 'start') {
                    start.move(this.x() + 5, this.y() + 3);
                    startX = i;
                    startY = j;
                    console.log({
                        startX,
                        startY
                    });
                }
                if ($('#placing').children('.active').children()[0].id == 'end') {
                    end.move(this.x(), this.y());
                    endX = i;
                    endY = j;
                    console.log({
                        endX,
                        endY
                    })
                }
            });
        }
    }
    const start = draw.polyline([
        [5, 3],
        [16, 10],
        [5, 17]
    ]).fill('#0c0').move(cellW + 5, cellH + 3);
    startX = 1;
    startY = 1;
    const end = draw.group();
    end.circle(14).fill('none').move(3, 3).attr({
        stroke: '#c00',
        'stroke-width': 2
    });
    end.circle(4).fill('#c00').move(8, 8)
    end.move(100, 100);
    endX = 5;
    endY = 5;
    $('#clear').click(() => {
        grid.forEach(row => {
            row.forEach(cell => {
                cell.fill('#ffffff');
                cell.visited = false;
                cell.parent = null;
            });
        })
    });
    $('#solve').click(() => {
        let queue = [];
        queue.push({
            x: startX,
            y: startY
        });
        let dx = [-1, 0, 1, 0];
        let dy = [0, -1, 0, 1];
        while (queue.length > 0) {
            const parent = queue.shift();
            let finished = false;
            for (let i = 0; i < 4; i++) {
                const current = {
                    x: parent.x + dx[i],
                    y: parent.y + dy[i]
                };
                if (current.x == endX && current.y == endY) finished = true;
                if (current.x < 0 || current.x > gridWidth || current.y < 0 || current.y > gridHeight || $(grid[current.x][current.y].node).attr('fill') == '#000000') continue;
                if (grid[current.x][current.y].visited) continue;
                grid[current.x][current.y].visited = true;
                grid[current.x][current.y].parentCoords = parent;
                grid[current.x][current.y].fill('#070');
                console.log(current.x, current.y);
                queue.push(current);
            }
            if (finished) break;
        }
        let current = grid[endX][endY];
        while (current != grid[startX][startY]) {
            current.fill('#a0a');
            console.log(current.parentCoords)
            current = grid[current.parentCoords.x][current.parentCoords.y];
        }
        current.fill('#a0a');
    });
});