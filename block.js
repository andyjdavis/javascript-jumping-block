/*
 * A simple class that draws a block to the screen.
 * The block is affected by gravity, can jump and changes shape as it moves.
 *
 * This code does not come with any sort of warranty.
 * You are welcome to use it for whatever you like.
 * A credit would be nice but is not required.
 */


function drawRect(context, x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
}

//http://ejohn.org/blog/simple-javascript-inheritance/#postcomment
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();

Block = Class.extend({
    init: function(pos, size, color) {
        this.pos = pos;
        this.size = size;
        this.color = color;
        
        this.vel = [0, 0];
        this.originalsize = size;
    },
    update: function(dt) {
        this.size[0] = this.snapback(this.originalsize[0], this.size[0]);
        this.size[1] = this.snapback(this.originalsize[1], this.size[1]);
        
        //gravity
        if (this.pos[1] < gCanvas.height) {
            this.vel[1] += 10;
        }
        
        this.pos[0] += this.vel[0]*dt;
        this.pos[1] += this.vel[1]*dt;
        
        if (this.pos[1] > gCanvas.height) {
            this.pos[1] = gCanvas.height;
            this.vel[1] = 0;
            this.squish();
        }
    },
    draw: function(dt) {
        //this.pos is actually the bottom middle of the box
        var drawpos = [this.pos[0] - (this.size[0]/2), this.pos[1] - this.size[1]];
        drawRect(gContext, drawpos[0], drawpos[1], this.size[0], this.size[1], this.color);
    },
    squish: function() {
        this.size = [this.size[0]*1.5, this.size[1]*0.5];
    },
    jump: function() {
        this.size = [this.size[0]*0.5, this.size[1]*2];
        this.vel[1] -= 400;
    },
    snapback: function(original, current) {
        if (Math.abs(original - current) <= 2) {
            //near enough
            return current;
        }

        if (current < original) {
            return current * 1.05;
        } else {
            return current * 0.95;
        }
    }
});

function onKeyDown(event) {
    if (event.keyCode == 83) { //s
        gBlock.squish();
    } else if (event.keyCode == 74) { //j
        gBlock.jump();
    }
}
window.addEventListener('keydown', onKeyDown, false);

var gCanvas = document.getElementById('gamecanvas');
var gContext = gCanvas.getContext('2d');

function updateGame() {
    if (gBlock) {
        gBlock.update(dt);
    } else {
        var pos = [gCanvas.width*Math.random(), gCanvas.height*Math.random()];
        var size = [30, 40];
        gBlock = new Block(pos, size, 'red');
    }
}

function drawGame() {
    gContext.fillStyle = "black";
    gContext.fillRect(0 , 0, gCanvas.width, gCanvas.height);
    //context.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gBlock) {
        gBlock.draw();
    }
}

var gOldTime = Date.now();
var gNewTime = null;

gBlock = null;

//executed 60/second
var mainloop = function() {
    gNewtime = Date.now();
    dt = (gNewtime - gOldTime)/1000;
    gOldTime = gNewtime;
        
    updateGame();
    drawGame();
};

var ONE_FRAME_TIME = 1000 / 60; // 60 per second
setInterval( mainloop, ONE_FRAME_TIME );
