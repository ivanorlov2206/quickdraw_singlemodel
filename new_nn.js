var canvases = [];
const NAME_LEN = 15;

var model;
var utils;
var findContours;
var arrayToPtr, ptrToArray;


function make_random_name() {
  var s = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
  var len = s.length;
  var res = '';

  for (var i = 0 ; i < NAME_LEN; i++) {
    res += s.charAt(Math.floor(Math.random() * len));
  }
  return res;
}


function create_canv(w, h) {
  let canv = document.createElement("canvas");
  canv.width = w;
  canv.height = h;
  canv.id = make_random_name();
  canv.hidden = true;
  canvases.push(canv);
  document.body.appendChild(canv);
  return canv;
}

function crop_and_center_image(canv, sz) {
  let w = canv.width;
  let h = canv.height;
  var nw, nh;

  if (w > h) {
    nh = sz / w * h;
    nw = sz;
    console.log(nw, nh);
  } else {
    nw = sz / h * w;
    nh = sz;
  }

  var cnv_resized = create_canv(nw, nh);
  var imgc = cnv_resized.getContext('2d');
  imgc.drawImage(canv, 0, 0, nw, nh);

  var iy = (sz - nh) / 2;
  var ix = (sz - nw) / 2;

  var new_image = create_canv(sz, sz);
  var nc = new_image.getContext('2d');
  nc.fillStyle = "black";
  nc.fillRect(0, 0, sz, sz);
  for (var x = 0; x < sz; x++) {
    for (var y = 0; y < sz; y++) {
      if (x >= ix && x < ix + nw && y >= iy && y < iy + nh) {
        var dat = imgc.getImageData(x - ix, y - iy, 1, 1);
        if (dat.data[0] != 0)
          nc.putImageData(dat, x, y);
      }
    }
  }

  return new_image;
}

async function predict(canv, model_name) {


  var arr = process_image(canv, 64);
  let tf_arr = tf.tensor2d(arr);

  var classes = ['airplane', 'alarm clock', 'ambulance', 'angel', 'animal migration', 'ant', 'anvil', 'apple', 'arm', 'asparagus', 'axe', 'backpack', 'banana', 'bandage', 'barn', 'baseball', 'baseball bat', 'basket', 'basketball', 'bat', 'bathtub', 'beach', 'bear', 'beard', 'bed', 'bee', 'belt', 'bench', 'bicycle', 'binoculars', 'bird', 'birthday cake', 'blackberry', 'blueberry', 'book', 'boomerang', 'bottlecap', 'bowtie', 'bracelet', 'brain', 'bread', 'bridge', 'broccoli', 'broom', 'bucket', 'bulldozer', 'bus', 'bush', 'butterfly', 'cactus', 'cake', 'calculator', 'calendar', 'camel', 'camera', 'camouflage', 'campfire', 'candle', 'cannon', 'canoe', 'car', 'carrot', 'castle', 'cat', 'ceiling fan', 'cell phone', 'cello', 'chair', 'chandelier', 'church', 'circle', 'clarinet', 'clock', 'cloud', 'coffee cup', 'compass', 'computer', 'cookie', 'cooler', 'couch', 'cow', 'crab', 'crayon', 'crocodile', 'crown', 'cruise ship', 'cup', 'diamond', 'dishwasher', 'diving board', 'dog', 'dolphin', 'donut', 'door', 'dragon', 'dresser', 'drill', 'drums', 'duck', 'dumbbell', 'ear', 'elbow', 'elephant', 'envelope', 'eraser', 'eye', 'eyeglasses', 'face', 'fan', 'feather', 'fence', 'finger', 'fire hydrant', 'fireplace', 'firetruck', 'fish', 'flamingo', 'flashlight', 'flip flops', 'floor lamp', 'flower', 'flying saucer', 'foot', 'fork', 'frog', 'frying pan', 'garden', 'garden hose', 'giraffe', 'goatee', 'golf club', 'grapes', 'grass', 'guitar', 'hamburger', 'hammer', 'hand', 'harp', 'hat', 'headphones', 'hedgehog', 'helicopter', 'helmet', 'hexagon', 'hockey puck', 'hockey stick', 'horse', 'hospital', 'hot air balloon', 'hot dog', 'hot tub', 'hourglass', 'house', 'house plant', 'hurricane', 'ice cream', 'jacket', 'jail', 'kangaroo', 'key', 'keyboard', 'knee', 'ladder', 'lantern', 'laptop', 'leaf', 'leg', 'light bulb', 'lighthouse', 'lightning', 'line', 'lion', 'lipstick', 'lobster', 'lollipop', 'mailbox', 'map', 'marker', 'matches', 'megaphone', 'mermaid', 'microphone', 'microwave', 'monkey', 'moon', 'mosquito', 'motorbike', 'mountain', 'mouse', 'moustache', 'mouth', 'mug', 'mushroom', 'nail', 'necklace', 'nose', 'ocean', 'octagon', 'octopus', 'onion', 'oven', 'owl', 'paint can', 'paintbrush', 'palm tree', 'panda', 'pants', 'paper clip', 'parachute', 'parrot', 'passport', 'peanut', 'pear', 'peas', 'pencil', 'penguin', 'piano', 'pickup truck', 'picture frame', 'pig', 'pillow', 'pineapple', 'pizza', 'pliers', 'police car', 'pond', 'pool', 'popsicle', 'postcard', 'potato', 'power outlet', 'purse', 'rabbit', 'raccoon', 'radio', 'rain', 'rainbow', 'rake', 'remote control', 'rhinoceros', 'river', 'roller coaster', 'rollerskates', 'sailboat', 'sandwich', 'saw', 'saxophone', 'school bus', 'scissors', 'scorpion', 'screwdriver', 'sea turtle', 'see saw', 'shark', 'sheep', 'shoe', 'shorts', 'shovel', 'sink', 'skateboard', 'skull', 'skyscraper', 'sleeping bag', 'smiley face', 'snail', 'snake', 'snorkel', 'snowflake', 'snowman', 'soccer ball', 'sock', 'speedboat', 'spider', 'spoon', 'spreadsheet', 'square', 'squiggle', 'squirrel', 'stairs', 'star', 'steak', 'stereo', 'stethoscope', 'stitches', 'stop sign', 'stove', 'strawberry', 'streetlight', 'string bean', 'submarine', 'suitcase', 'sun', 'swan', 'sweater', 'swing set', 'sword', 't-shirt', 'table', 'teapot', 'teddy-bear', 'telephone', 'television', 'tennis racquet', 'tent', 'the eiffel tower', 'the great wall of china', 'the mona lisa', 'tiger', 'toaster', 'toe', 'toilet', 'tooth', 'toothbrush', 'toothpaste', 'tornado', 'tractor', 'traffic light', 'train', 'tree', 'triangle', 'trombone', 'truck', 'trumpet', 'umbrella', 'underwear', 'van', 'vase', 'violin', 'washing machine', 'watermelon', 'waterslide', 'whale', 'wheel', 'windmill', 'wine bottle', 'wine glass', 'wristwatch', 'yoga', 'zebra', 'zigzag'];
  let offset = tf.scalar(127.5);
  tf_arr = tf_arr.sub(offset).div(offset).reshape([-1, 64, 64, 1]);

  const {values, indices} = tf.topk(model.predict(tf_arr), 5);
  var ind_js = Array.from(indices.dataSync());
  for (var i = 0; i < ind_js.length; i++){
    console.log(classes[ind_js[i]]);
    if(classes[ind_js[i]] == model_name) {
      return true;
    }
  }
  return false;
}

function image_to_array(canv, sz) {
  var ctx = canv.getContext('2d');
  var arr = [];
  for (var i = 0; i < sz; i++) {
    var la = [];
    for (var j = 0; j < sz; j++) {
      var d = ctx.getImageData(j, i, 1, 1).data[0];
      if (d > 0)
        la.push(255);
      else {
        la.push(0);
      }
    }
    arr.push(la);
  }
  return arr;
}


function process_image(canv, size) {
  var ctx = canv.getContext('2d');
  var data = new Int32Array(ctx.getImageData(0, 0, canv.width, canv.height).data);
  console.log(canv.width + " " + canv.height);
  let contours = ptrToArray(findContours(arrayToPtr(data), canv.width, canv.height), 4);
  console.log(contours);
  var border_h = 0;
  var border_v = 0;
  var nw = contours[2] - contours[0];
  var nh = contours[3] - contours[1];
  if (nw < 128)
    border_h = 128 - nw;
  if (nh < 128)
    border_v = 128 - nh;
  var cropped = create_canv(contours[2] - contours[0] + border_h, contours[3] - contours[1] + border_v);
  cropped.getContext('2d').fillStyle = "black";
  cropped.getContext('2d').fillRect(0, 0, cropped.width, cropped.height);


  var left = contours[0], top = contours[1], w = contours[2] - contours[0], h = contours[3] - contours[1];
  cropped.getContext('2d').drawImage(canv, left - border_h / 2, top - border_v / 2, w + left + border_h / 2, h + top + border_v / 2, 0, 0, w + left + border_h / 2, h + top + border_v / 2);
  var centered = crop_and_center_image(cropped, size);
  return image_to_array(centered, size);
}

function clear_canvases() {
  for (var i = 0; i < canvases.length; i++) {
    canvases[i].remove();
  }
  canvases = [];
}


function createPredictor(div, width, height, pensize, models_addr) {
  (async () => {
  model = await tf.loadGraphModel(models_addr + '/model/model.json');
  })();

  function loadUtils() {
    var oReq = new XMLHttpRequest();
    oReq.responseType = "arraybuffer";
    oReq.addEventListener("load", function() {
      var arrayBuffer = oReq.response;
      Utils['wasmBinary'] = arrayBuffer;
      (async () => {
        utils = await Utils({ wasmBinary: Utils.wasmBinary });
        var nByte = 4;
        findContours = utils.cwrap('findContours', null, ['number', 'number', 'number'])
        arrayToPtr = function(arr) {
          var ptr = utils._malloc(arr.length * nByte);
          utils.HEAP32.set(arr, ptr / nByte);
          return ptr;
        };
        ptrToArray = function(ptr, length) {
          var array = new Int32Array(length);
          var pos = ptr / nByte;
          array.set(utils.HEAP32.subarray(pos, pos + length));
          return array;
        };

      })();
    });
    oReq.open("GET", "wasm_utils.wasm");
    oReq.send();
  }
  loadUtils();

  let canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.id = make_random_name();

  var context = canvas.getContext("2d");

  var w = canvas.width;
  var h = canvas.height;
  context.fillStyle = "black";
  context.fillRect(0, 0, w, h);
  context.lineCap = "round";
  context.lineWidth = pensize;

  var mouse = {x: 0, y: 0};
  var draw = false;

  canvas.addEventListener("pointerdown", function(e) {
      mouse.x = e.pageX - this.offsetLeft;
      mouse.y = e.pageY - this.offsetTop;
      draw = true;
  });
  canvas.addEventListener("pointermove", function(e) {
      if (draw == true) {
          mouse.x = e.pageX - this.offsetLeft;
          mouse.y = e.pageY - this.offsetTop;

          context.fillStyle = "white";
          context.strokeStyle = "#FFFFFF";
          context.beginPath();
          context.moveTo(mouse.x, mouse.y);
          context.lineTo(mouse.x - e.movementX, mouse.y - e.movementY);
          context.stroke();
          context.closePath();
      }
  });
  canvas.addEventListener("pointerup", function(e) {
      mouse.x = e.pageX - this.offsetLeft;
      mouse.y = e.pageY - this.offsetTop;
      draw = false;
  });

  div.appendChild(canvas);
  var obj = {};
  obj.main_canv = canvas;
  obj.canvases = [];
  obj.clear_canvas = function() {
    var ctx = this.main_canv.getContext('2d');
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, w, h);
  }
  obj.clear_canvases = clear_canvases;
  obj.predict = function(model_name, models_addr) {
    return predict(this.main_canv, model_name, models_addr);
  };
  return obj;
}
