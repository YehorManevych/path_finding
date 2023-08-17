// let left = "kpokpoopoiikzllzkjklzl";
// let up = "dspolzgvpdoksg";

// let left = "kpokpoopoiikzllzkjklzlkpohpphkkho";
// let up = "spozgvdoks";


// let left = "deabcdezzzzdfkps";
// let up = "peaoczzzdieklp";

let left = "deabcdezzzzdfkps";
let up = "peacczzzdieklp";

let options = [];
let option_best_diffs = [];
let new_options = [];
let seen_nodes = [];
let i = 0;
let j = 0;

let textScale = 0.9;

let done = false;
let path;

let play = false;

let beam_cells = [];

function setup() {
  createCanvas(2000, 2000);
  init();
  button = createButton('PLAY');
  button.position(19, 19);
  button.mousePressed(() => play = !play);

  button = createButton('STEP');
  button.position(19, 50);
  button.mousePressed(onPressed);
}

function onPressed() {
  if (!path) {
    path = high();
  }
}

let counter = 1;
let offset = 50
let squareSize = 30;
let contentOffset = offset + 2 * squareSize;

function draw() {
  if (play) {
    onPressed();
  }
  background(255);
  height = (left.length + 2) * squareSize;
  y_max = height + offset;
  y_min = offset;
  width = (up.length + 2) * squareSize;
  x_max = width + offset;
  x_min = offset;
  for (var x = x_min; x <= x_max; x += squareSize) {
    for (var y = y_min; y <= y_max; y += squareSize) {
      stroke(0);
      strokeWeight(1);
      line(x, y_min, x, y_max);
      line(x_min, y, x_max, y);
    }
  }

  //draw headers
  fill(0)
  for (let i = 0; i < left.length; i++) {
    c = left[i];
    textSize(textScale * 25);
    text(c, x_min + squareSize / 6, (offset + squareSize * (i + 2) + squareSize / 2));
    textSize(textScale * 18);
    text(i, x_min + squareSize / 2, (offset + squareSize * (i + 2) + squareSize / 2));
  }
  for (let i = 0; i < up.length; i++) {
    c = up[i];
    textSize(textScale * 25);
    text(c, (offset + squareSize * (i + 2) + squareSize / 3), y_min + squareSize / 2);
    textSize(textScale * 18);
    text(i, (offset + squareSize * (i + 2) + squareSize / 3), y_min + squareSize);
  }

  //draw options
  for (let z = 0; z < options.length; z++) {
    let {
      i: i,
      j: j,
      vis: visited,
      w: w
    } = options[z];
    if (visited) {
      fill("orange")
    } else {
      fill("yellow")
    }
    square(contentOffset + squareSize * j, contentOffset + squareSize * i, squareSize - 1);
  }
  
   
  //draw path
  if (path) {
    for (let cell = path; cell; cell = cell.p) {
      fill('red')
      square(contentOffset + squareSize * cell.j, contentOffset + squareSize * cell.i, squareSize - 1);
    }
  }
  
  //draw equals
  for (let z = 0; z < options.length; z++) {
    let {
      i: i,
      j: j,
      vis: visited,
      w: w
    } = options[z];
    if (visited) {
      if (left[i] == up[j]) {
        fill("rgb(0, 168, 107)");
        square(contentOffset + squareSize * j, contentOffset + squareSize * i, squareSize - 1);
      }
    }
  }

  //draw beams
  for (let z = 0; z < beam_cells.length; z++) {
    let {
      i: i,
      j: j
    } = beam_cells[z];
    stroke(0);
    strokeWeight(1)
    fill("rgba(0,255,0, 0.25)")
    square(contentOffset + squareSize * j, contentOffset + squareSize * i, squareSize - 1);
  }

  //draw current pos
  fill("cyan")
  square(contentOffset + squareSize * j, contentOffset + squareSize * i, squareSize - 1);

  //draw weights
  for (let z = 0; z < options.length; z++) {
    let {
      i: i,
      j: j,
      w: w
    } = options[z];
    fill(0)
    textSize(textScale * 14);
    text(option_best_diffs[z], contentOffset + squareSize * (j + 0.1), contentOffset + squareSize * (i + 1 / 2), );
    text(w, contentOffset + squareSize * (j + 0.6), contentOffset + squareSize * (i + 1 / 2), );
  }

  //draw arrows
  for (let z = 0; z < options.length; z++) {
    let {
      i: i,
      j: j,
      w: w,
      p: p
    } = options[z];
    fill(0)
    if (p !== null) {
      arrow(p.j, p.i, j, i);
    }
  }

  function arrow(oj, oi, dj, di) {
    origin = cell_center(oj, oi);
    dest = cell_center(dj, di);
    r = 2;
    stroke(0);
    strokeWeight(1)
    line(origin.x, origin.y, dest.x, dest.y);
    push() //start new drawing state
    var angle = atan2(origin.y - dest.y, origin.x - dest.x); //gets the angle of the line
    translate(dest.x, dest.y); //translates to the destination vertex
    rotate(angle - HALF_PI); //rotates the arrow point
    triangle(-r * 0.5, r, r * 0.5, r, 0, -r / 2); //draws the arrow point as a triangle
    pop();
  }
}

function cell_center(i, j) {
  return createVector(contentOffset + (i + 1 / 2) * squareSize, contentOffset + (j + 1 / 2) * squareSize);
}

function hash(i, j) {
  return 1 + (1 + i) * left.length + j;
}

function init() {
  left_last = left.length - 1;
  up_last = up.length - 1;
  let obje = {
    i: left_last,
    j: up_last,
    w: 0,
    p: null,
    vis: false,
  };
  seen_nodes[hash(left_last, up_last)] = true;
  options = [obje];
}

function calculateBest(a){
  return abs(a.i - a.j) * 1 + a.w;;
}

function high() {  
  // console.log(counter)
  counter++
  let minimum = null;
  for (let o = 0; o < options.length; o++) {
    option = options[o];
    if (!options[o].vis) {
      if (minimum === null) {
        minimum = options[o];
      } else {
        let opt_best = calculateBest(option);
        option_best_diffs[o] = opt_best;
        
        let min_best = calculateBest(minimum);

        if (opt_best == min_best) {
          min_coord_sum = minimum.i + minimum.j;
          opt_coord_sum = option.i + option.j;
          minimum = opt_coord_sum < min_coord_sum ? option : minimum;
        } else {
          minimum = opt_best < min_best ? option : minimum;
        }
      }
    }
  }
  // console.log("minimum:")
  // console.log(JSON.parse(JSON.stringify(minimum)));
  i = minimum.i;
  j = minimum.j;
  new_options = lcs(minimum);
  minimum.vis = true;
  // new_options = new_options.filter(p => seen_nodes[hash(p.i, p.j)] !== true);
  new_options.forEach(n => {
    same = options.find(o => o.i == n.i && o.j == n.j)
    if (same) {
      if (n.w < same.w) {
        if (same.vis) {
          play = false;
        }
        index = options.indexOf(same);
        options[index] = n;
      }
    } else {
      options.push(n);
    }
  });
  console.log("new_options:")
  console.log(JSON.parse(JSON.stringify(new_options)));
  if (new_options.length == 0) {
    //end reached
    console.log("end")
    return minimum;
  }
  // console.log("options:")
  // console.log(JSON.parse(JSON.stringify(options)));
  // console.log(JSON.parse(JSON.stringify((options.filter(p => p.vis === false)))));

  new_options.forEach(x => seen_nodes[hash(x.i, x.j)] = true);
}

function lcs(parent) {
  if (parent.i == -1 && parent.j == -1) {
    return [];
  }
  if (parent.i == -1) {
    return [{
      i: parent.i,
      j: parent.j - 1,
      w: parent.w + 1,
      p: parent,
      vis: false,
    }];
  }
  if (parent.j == -1) {
    return [{
      i: parent.i - 1,
      j: parent.j,
      w: parent.w + 1,
      p: parent,
      vis: false,
    }];
  }
  if (left[parent.i] == up[parent.j]) {
    //take diagonal
    return [{
      i: parent.i - 1,
      j: parent.j - 1,
      w: parent.w,
      p: parent,
      vis: false,
    }];
  }
  // choose left or right
  // no mater witch is chosen the w = 1
  return [{
      i: parent.i,
      j: parent.j - 1,
      w: parent.w + 1,
      p: parent,
      vis: false,
    },
    {
      i: parent.i - 1,
      j: parent.j,
      w: parent.w + 1,
      p: parent,
      vis: false,
    }
  ];
}