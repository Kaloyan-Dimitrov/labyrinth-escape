const SVG = require("svg.js");
const $ = require("jquery");
const bootstrap = require("bootstrap");
const firebase = require("firebase");

$(() => {
  //
  // ─── CHECK IF THE USER IS LOGGED IN ─────────────────────────────────────────────
  //

  const uid = localStorage.getItem('uid');
  if (!uid) {
    window.location.href = "./index.html";
  }

  //
  // ─── INITIALIZE FIREBASE ────────────────────────────────────────────────────────
  //

  const firebaseConfig = {
    apiKey: "AIzaSyALmxph1nPf5oamgJSLRl6-3AsK0QiX318",
    authDomain: "labirynth-solver.firebaseapp.com",
    databaseURL: "https://labirynth-solver.firebaseio.com",
    projectId: "labirynth-solver",
    storageBucket: "labirynth-solver.appspot.com",
    messagingSenderId: "222488162206",
    appId: "1:222488162206:web:2fba50f01d3b6ff295b08f",
    measurementId: "G-QKH037DXDT"
  };
  const app = firebase.initializeApp(firebaseConfig);

  //
  // ─── RETRIEVE ALL THE MAZES FROM THE DATABASE ───────────────────────────────────
  //

  let mazes = [];
  let loadedMazes = false;
  firebase.firestore().collection(uid).get().then(res => {
    if(res.docs.length == 0) {
      $('.load-spinner').addClass('d-none');
      $('#load > i').removeClass('d-none');
      loadedMazes = true;
    }
    res.docs.forEach(d => {
      d.ref.get().then(val => {
        val.ref.get().then(value => {
          mazes.push(value.data());
          if(mazes.length == res.size) {
            $('#load').prop('disabled', false);
            $('.load-spinner').addClass('d-none');
            $('#load > i').removeClass('d-none');
            loadedMazes = true;
            listMazesInModal();
            console.log(mazes)
          }
        })
      });
    })
    
  });

  //
  // ─── INITIALIZING ALL BUTTONS AS BOOTSTRAP EXTRA BUTTONS ─────────────────────────
  //

  $(".btn").button();
  $('[data-toggle="tooltip"]').tooltip()

  //
  // ─── A VARIABLE AND METHODS TO BE ABLE TO ALWAYS CHECK IF MOUSE IS CLICKED ──────
  //

  let mouseDown = 0;
  document.body.onmousedown = function () {
    mouseDown = true;
  };
  document.body.onmouseup = function () {
    mouseDown = false;
  };

  //
  // ─── INITIALIZING BASIC VARIABLES ───────────────────────────────────────────────
  //
  const cellWidth = 20;
  const cellHeight = 20;
  const canvasWidth = Math.floor($('#drawing').width());
  const canvasHeight = Math.floor($('#drawing').height()) - cellHeight;
  const gridRows = Math.floor(canvasWidth / cellWidth);
  const gridColumns = Math.floor(canvasHeight / cellHeight);
  const drawingCanvas = SVG("drawing").size(gridRows * cellWidth, gridColumns * cellHeight);
  $(drawingCanvas.node).addClass('shadow');
  let startX, startY, endX, endY;
  let grid = [];
  const currentCheckedColor = "#d051e0";
  const visitedColor = "#36cae0";
  //
  // ─── DRAWING NEW THINGS HELPERS ─────────────────────────────────────────────────
  //

  const drawCell = (canvas, i, j, fillColor, strokeColor) => {
    fillColor = fillColor ? fillColor : "#fff";
    strokeColor = strokeColor ? strokeColor : "#000";
    return canvas
      .rect(cellWidth, cellHeight)
      .move(i * cellWidth, j * cellHeight)
      .fill(fillColor)
      .stroke({
        color: strokeColor,
        opacity: 0.3
      });
  };
  const drawEndSymbol = end => {
    end
      .circle(14)
      .fill("none")
      .move(3, 3)
      .attr({
        stroke: "#c00",
        "stroke-width": 2
      });
    end
      .circle(4)
      .fill("#c00")
      .move(8, 8);
    end.move(100, 100);
    endX = 5;
    endY = 5;
  };
  const drawStartSymbol = start => {
    start
      .polyline([
        [5, 3],
        [16, 10],
        [5, 17]
      ])
      .fill("#0c0")
      .move(5, 3);
    startX = 0;
    startY = 0;
  };
  const drawRoute = () => {
    let current = grid[endX][endY];
    while (current != grid[startX][startY]) {
      current.animate(1000, 0, "last").fill("#fff654");
      current = grid[current.parentCoords.x][current.parentCoords.y];
    }
    current.animate(1000, 0, "last").fill("#fff654");
  };

  //
  // ─── BOOLEAN HELPERS ────────────────────────────────────────────────────────────
  //

  const isEmpty = cell => $(cell.node).attr("fill") === "#ffffff";
  const isWall = cell => $(cell.node).attr("fill") === "#000000";
  const isCollidingStart = (x, y) => x === startX && y === startY;
  const isCollidingEnd = (x, y) => x === endX && y === endY;
  const isWithinBounds = (x, y) =>
    !(x < 0 || x >= gridRows || y < 0 || y >= gridColumns);

  //
  // ─── ANIMATION HELPERS ──────────────────────────────────────────────────────────
  //

  const animateFillWithColor = (cell, color) => {
    cell
      .animate({
        duration: 100
      })
      .fill({
        color: color
      });
  };
  const animateFillWithColorWhileSolving = (cell, color) => {
    cell
      .animate({
        duration: 300,
        swing: true
      })
      .fill(color);
  };
  const animateZoomInAndOut = cell => {
    cell
      .animate({
        duration: 100
      })
      .scale(1.5, 1.5)
      .animate({
        when: "after",
        duration: 100
      })
      .scale(1, 1);
  };
  const animateWall = (i, j, current) => {
    // Because of the animations i need to animate an additional rectangle in the same place
    const newToAnimate = drawCell(drawingCanvas, i, j);

    animateFillWithColor(newToAnimate, "#000");

    // Fill the real cell with the wall color
    current.fill("#000");
    return newToAnimate;
  };
  const animateEmpty = (i, j, current) => {
    const newToAnimate = drawCell(drawingCanvas, i, j, "#000", "#fff");

    animateFillWithColor(newToAnimate, "#fff");

    current.fill("#fff");
    return newToAnimate;
  };
  const zoomAndRemove = cell => {
    animateZoomInAndOut(cell);
    // Remove after the animations have ended
    setTimeout(() => {
      cell.remove();
    }, 300);
  };
  const animateOnPlacingSmth = (currentSelected, thisCell) => {
    let newToAnimate;
    if (isEmpty(grid[thisCell.i][thisCell.j]) && currentSelected === "wall")
      newToAnimate = animateWall(thisCell.i, thisCell.j, thisCell);
    if (isWall(grid[thisCell.i][thisCell.j]) && currentSelected === "empty")
      newToAnimate = animateEmpty(thisCell.i, thisCell.j, thisCell);
    if (newToAnimate) zoomAndRemove(newToAnimate);
  };

  //
  // ─── OTHER HELPERS ──────────────────────────────────────────────────────────────
  //

  const disableButtons = () => {
    $(".offLabel").addClass("disabled");
    $(".off").attr("disabled", "true");
    $("#solve").css("display", "none");
    $("#stop").css("display", "inline-block");
  };
  const enableButtons = () => {
    $(".offLabel").removeClass("disabled");
    $(".off").prop("disabled", false);
    $("#solve").css("display", "inline-block");
    $("#stop").css("display", "none");
  };
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const emptyName = () => {
    $('#maze-name').addClass('is-invalid');
    $('#tooltipName').html('Name should not be empty');
  };
  const removeErrors = () => {
    $('#maze-name').removeClass('is-invalid');
    $('#tooltipName').html('');
  };
  const listMazesInModal = () => {
    mazes.forEach(m => {
      $('.modal-body > .btn-group-vertical').append(`<button data-dismiss="modal" type="button" id="${m.name}" class="btn btn-outline-primary" ${gridRows < m.gridRows || gridColumns < m.gridColumns ? 'disabled data-toggle="tooltip" data-placement="right" title="This maze is too large"' : ''} >${m.name}</button>`)
    });
    $('.btn-group-vertical > .btn-outline-primary').click(loadMaze);
  };

  //
  // ─── MAIN ACTIONS ───────────────────────────────────────────────────────────────
  //
  const extractMaze = () => {
    const result = [];
    for(let i = 0; i < gridRows; i ++) {
      result[i] = [];
      for(let j = 0; j < gridColumns; j ++) {
        const current = grid[i][j];
        result[i][j] = isWall(current) ? 'w' : '_';
        if(isCollidingStart(i, j)) result[i][j] = 's';
        if(isCollidingEnd(i, j)) result[i][j] = 'e';
      }
    }
    return result;
  }
  const fillGrid = () => {
    grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (!isCollidingStart(i, j) && !isCollidingEnd(i, j) && !isWall(cell)) {
          cell.fill("#000000");
        }
      });
    });
  };
  const clearGrid = () => {
    grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (
          !isCollidingStart(i, j) &&
          !isCollidingEnd(i, j) &&
          !isEmpty(cell)
        ) {
          cell.fill("#ffffff");
        }
      });
    });
  };
  const clearRoute = () => {
    foundRoute = true;
    grid.forEach(row => {
      row.forEach(cell => {
        if ($(cell.node).attr("fill") != "#000000") cell.fill("#ffffff");
        cell.visited = false;
        cell.parent = null;
      });
    });
    enableButtons();
  };
  const solveMaze = async () => {
    disableButtons();
    foundRoute = false;
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
        // Check if it has found the target
        if (isCollidingEnd(current.x, current.y)) foundRoute = true;
        // Skip if out of bounds
        if (!isWithinBounds(current.x, current.y))
          continue;
        // Skip if wall
        if (isWall(grid[current.x][current.y]))
          continue;
        // Skip if visited
        if (grid[current.x][current.y].visited) continue;
        // Save that the cell is visited
        grid[current.x][current.y].visited = true;
        // Save the parent
        grid[current.x][current.y].parentCoords = parent;
        // Fill it the cell with the color for the currently checked cells
        animateFillWithColorWhileSolving(
          grid[current.x][current.y],
          currentCheckedColor
        );
        // Add it to the queue
        queue.push(current);
      }
      await sleep(5);
      // Fill it the cell with the color for the visited cells
      animateFillWithColorWhileSolving(grid[parent.x][parent.y], visitedColor);
      if (foundRoute) break;
    }

    // Draw the found route (if there is one)
    if (foundRoute) drawRoute();

    // Wait 2 secs, alert if there was no path found and enable the button, which is used to clear the found path
    await sleep(2000);
    if (!foundRoute)
      alert("I wasn't able to find a route from the start to the end");
    $("#stop").prop("disabled", false);
  };
  const saveMaze = async () => {
    const name = $('#maze-name').val();
    if(name == '') {
      emptyName();
      return;
    }
    let maze = {
      content: extractMaze()
    };
    maze = JSON.stringify(maze);
    if(loadedMazes) {
      if(mazes.find(m => m.maze == maze) != undefined) return;
    }
    console.log({
      name,
      maze,
      gridRows,
      gridColumns
    })
    mazes.push({
      name,
      maze,
      gridRows,
      gridColumns
    })
    listMazesInModal();
    firebase.firestore(app).collection(uid).add({
      name,
      maze,
      gridRows,
      gridColumns
    });
  }
  const initGrid = () => {
    for (let i = 0; i < gridRows; i++) {
      grid[i] = [];
      for (let j = 0; j < gridColumns; j++) {
        grid[i][j] = drawCell(drawingCanvas, i, j);
        grid[i][j].i = i;
        grid[i][j].j = j;
        grid[i][j].mouseover(cellMouseOver);
        grid[i][j].click(cellClick);
      }
    }
  };
  const loadMaze = (event) => {
    const whichMaze = mazes.find(m => m.name == event.target.id);
    applyMaze(whichMaze);
  };
  const applyMaze = (maze) => {
    const content = JSON.parse(maze.maze).content;
    if(gridRows < maze.gridRows || gridColumns < maze.gridColumns) {
      alert('Your current grid is too small');
      return;
    }
    content.forEach((row, i) => {
      row.forEach((cell, j) => {
        if(cell == '_') grid[i][j].fill("#ffffff");
        if(cell == 'w') grid[i][j].fill("#000000");
        if(cell == 's') {
          start.move(i * cellWidth, j * cellHeight);
          startX = i;
          startY = j;
        }
        if(cell == 'e') {
          end.move(i * cellWidth, j * cellHeight);
          endX = i;
          endY = j;
        }
      });
    });
  };

  //
  // ─── CELL ACTIONS ───────────────────────────────────────────────────────────────
  //

  const cellClick = function () {
    // Getting the current selected thing
    let currentSelected = $("#placing")
      .children(".active")
      .children()[0].id;

    if (!isCollidingStart(this.i, this.j) && !isCollidingEnd(this.i, this.j))
      animateOnPlacingSmth(currentSelected, this);
    if (currentSelected === "start" && !isWall(this)) {
      start.move(this.x(), this.y());
      startX = this.i;
      startY = this.j;
    }
    if (currentSelected === "end" && !isWall(this)) {
      end.move(this.x(), this.y());
      endX = this.i;
      endY = this.j;
    }
  };
  const cellMouseOver = function () {
    // Getting the current selected thing
    let currentSelected = $("#placing")
      .children(".active")
      .children()[0].id;
    if (
      !isCollidingStart(this.i, this.j) &&
      !isCollidingEnd(this.i, this.j) &&
      mouseDown
    )
      animateOnPlacingSmth(currentSelected, this);
  };

  //
  // ─── ACTUALLY CALL THE METHOD INITIALIZING THE GRID ─────────────────────────────
  //

  initGrid();

  //
  // ─── INITIALIZING AND DRAWING THE START AND END SYMBOLS ─────────────────────────
  //

  const start = drawingCanvas.group();
  drawStartSymbol(start);
  const end = drawingCanvas.group();
  drawEndSymbol(end);

  //
  // ─── MAIN EVENT HANDLERS ───────────────────────────────────────
  //

  let foundRoute = false;
  $("#fill").click(fillGrid);
  $("#clear").click(clearGrid);
  $("#stop").click(clearRoute);
  $("#solve").click(solveMaze);
  $('#save').click(saveMaze);
  $('form').submit(e => e.preventDefault());
  $('#maze-name').change(removeErrors);
  $('#load').change(removeErrors);
});