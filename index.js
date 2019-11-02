const SVG = require('svg.js');
const $ = require('jquery');
const bootstrap = require('bootstrap');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
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
    const gridHeight = (window.innerHeight * 0.85) / cellH;
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight * 0.85;
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
                if (!(i == startX && j == startY) && !(i == endX && j == endY) && mouseDown && $(grid[i][j].node).attr('fill') == '#ffffff' && $('#placing').children('.active').children()[0].id == 'wall') {
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
                if (mouseDown && !(i == startX && j == startY) && !(i == endX && j == endY) && $(grid[i][j].node).attr('fill') == '#000000' && $('#placing').children('.active').children()[0].id == 'empty') {
                    const toAnimate = draw.rect(cellW, cellH).move(this.x(), this.y()).fill('#000').stroke({
                        color: '#fff',
                        opacity: 0.3
                    })
                    toAnimate.animate({
                        duration: 100
                    }).fill({
                        color: '#fff'
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
                    this.fill('#fff');
                }
            });
            grid[i][j].click(function () {
                if (!(i == startX && j == startY) && !(i == endX && j == endY) && $(grid[i][j].node).attr('fill') == '#ffffff' && $('#placing').children('.active').children()[0].id == 'wall') {
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
                if (!(i == startX && j == startY) && !(i == endX && j == endY) && $(grid[i][j].node).attr('fill') == '#000000' && $('#placing').children('.active').children()[0].id == 'empty') {
                    const toAnimate = draw.rect(cellW, cellH).move(this.x(), this.y()).fill('#000').stroke({
                        color: '#fff',
                        opacity: 0.3
                    })
                    toAnimate.animate({
                        duration: 100
                    }).fill({
                        color: '#fff'
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
                    this.fill('#fff');
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
        });
    });
    let finished = false;
    $('#stop').click(() => {
        finished = true;
        grid.forEach(row => {
            row.forEach(cell => {
                if ($(cell.node).attr('fill') != '#000000') cell.fill('#ffffff');
                cell.visited = false;
                cell.parent = null;
            });
        });
        $('.offLabel').removeClass('disabled');
        $('.off').prop('disabled', false);
        $('#solve').css('display', 'inline-block');
        $('#stop').css('display', 'none');
    })
    $('#solve').click(async () => {
        $('.offLabel').addClass('disabled');
        $('.off').attr('disabled', 'true');
        $('#solve').css('display', 'none');
        $('#stop').css('display', 'inline-block');
        finished = false;
        let queue = [];
        queue.push({
            x: startX,
            y: startY
        });
        let dx = [-1, 0, 1, 0];
        let dy = [0, -1, 0, 1];
        while (queue.length > 0) {
            const parent = queue.shift();
            // grid[parent.x][parent.y].visited = true;
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
                grid[current.x][current.y].animate({
                    duration: 300,
                    swing: true
                }).fill('#d051e0');
                queue.push(current);
            }
            await sleep(5);
            grid[parent.x][parent.y].animate({
                duration: 300,
                swing: true
            }).fill('#36cae0');
            if (finished) break;
        }
        // await sleep(1000);
        if (finished) {
            let current = grid[endX][endY];
            while (current != grid[startX][startY]) {
                current.animate(1000, 0, 'last').fill('#fff654');
                current = grid[current.parentCoords.x][current.parentCoords.y];
            }
            current.animate(1000, 0, 'last').fill('#fff654');
        }
        await sleep(2000);
        $('#stop').prop('disabled', false);
    });
});