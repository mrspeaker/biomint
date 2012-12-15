(function(){

// Ported from Stefan Gustavson's java implementation
// http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
// Read Stefan's excellent paper for details on how this code works.
//
// Sean McCullough banksean@gmail.com
 
/**
 * You can pass in a random number generator object if you like.
 * It is assumed to have a random() method.
 */
var ClassicalNoise = function(r) { // Classic Perlin noise in 3D, for comparison 
  if (r == undefined) r = Math;
  this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0], 
                                 [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1], 
                                 [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]]; 
  this.p = [];
  for (var i=0; i<256; i++) {
    this.p[i] = Math.floor(r.random()*256);
  }
  // To remove the need for index wrapping, double the permutation table length 
  this.perm = []; 
  for(var i=0; i<512; i++) {
    this.perm[i]=this.p[i & 255];
  }
};
 
ClassicalNoise.prototype.dot = function(g, x, y, z) { 
    return g[0]*x + g[1]*y + g[2]*z; 
};
 
ClassicalNoise.prototype.mix = function(a, b, t) { 
    return (1.0-t)*a + t*b; 
};
 
ClassicalNoise.prototype.fade = function(t) { 
    return t*t*t*(t*(t*6.0-15.0)+10.0); 
};
 
  // Classic Perlin noise, 3D version 
ClassicalNoise.prototype.noise = function(x, y, z) { 
  // Find unit grid cell containing point 
  var X = Math.floor(x); 
  var Y = Math.floor(y); 
  var Z = Math.floor(z); 
  
  // Get relative xyz coordinates of point within that cell 
  x = x - X; 
  y = y - Y; 
  z = z - Z; 
  
  // Wrap the integer cells at 255 (smaller integer period can be introduced here) 
  X = X & 255; 
  Y = Y & 255; 
  Z = Z & 255;
  
  // Calculate a set of eight hashed gradient indices 
  var gi000 = this.perm[X+this.perm[Y+this.perm[Z]]] % 12; 
  var gi001 = this.perm[X+this.perm[Y+this.perm[Z+1]]] % 12; 
  var gi010 = this.perm[X+this.perm[Y+1+this.perm[Z]]] % 12; 
  var gi011 = this.perm[X+this.perm[Y+1+this.perm[Z+1]]] % 12; 
  var gi100 = this.perm[X+1+this.perm[Y+this.perm[Z]]] % 12; 
  var gi101 = this.perm[X+1+this.perm[Y+this.perm[Z+1]]] % 12; 
  var gi110 = this.perm[X+1+this.perm[Y+1+this.perm[Z]]] % 12; 
  var gi111 = this.perm[X+1+this.perm[Y+1+this.perm[Z+1]]] % 12; 
  
  // The gradients of each corner are now: 
  // g000 = grad3[gi000]; 
  // g001 = grad3[gi001]; 
  // g010 = grad3[gi010]; 
  // g011 = grad3[gi011]; 
  // g100 = grad3[gi100]; 
  // g101 = grad3[gi101]; 
  // g110 = grad3[gi110]; 
  // g111 = grad3[gi111]; 
  // Calculate noise contributions from each of the eight corners 
  var n000= this.dot(this.grad3[gi000], x, y, z); 
  var n100= this.dot(this.grad3[gi100], x-1, y, z); 
  var n010= this.dot(this.grad3[gi010], x, y-1, z); 
  var n110= this.dot(this.grad3[gi110], x-1, y-1, z); 
  var n001= this.dot(this.grad3[gi001], x, y, z-1); 
  var n101= this.dot(this.grad3[gi101], x-1, y, z-1); 
  var n011= this.dot(this.grad3[gi011], x, y-1, z-1); 
  var n111= this.dot(this.grad3[gi111], x-1, y-1, z-1); 
  // Compute the fade curve value for each of x, y, z 
  var u = this.fade(x); 
  var v = this.fade(y); 
  var w = this.fade(z); 
   // Interpolate along x the contributions from each of the corners 
  var nx00 = this.mix(n000, n100, u); 
  var nx01 = this.mix(n001, n101, u); 
  var nx10 = this.mix(n010, n110, u); 
  var nx11 = this.mix(n011, n111, u); 
  // Interpolate the four results along y 
  var nxy0 = this.mix(nx00, nx10, v); 
  var nxy1 = this.mix(nx01, nx11, v); 
  // Interpolate the two last results along z 
  var nxyz = this.mix(nxy0, nxy1, w); 
 
  return nxyz; 
};

  window.ClassicalNoise = ClassicalNoise;

})();


// IMPLEMENTATION OF IMPROVED NOISE - COPYRIGHT 2002 KEN PERLIN.
(function(){
   var p = [];
   var permutation = [ 151,160,137,91,90,15,
   131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
   190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
   88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
   77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
   102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
   135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
   5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
   223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
   129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
   251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
   49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
   138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
 
   for (var i=0; i < 256 ; i++) 
     p[256+i] = p[i] = permutation[i]; 
 
   function noise(x, y, z) {
      var X = Math.floor(x) & 255,                  
          Y = Math.floor(y) & 255,                  
          Z = Math.floor(z) & 255;
      x -= Math.floor(x);                                
      y -= Math.floor(y);                               
      z -= Math.floor(z);
 
      var u = fade(x),                               
          v = fade(y),                                
          w = fade(z);
      var A = p[X  ]+Y, AA = p[A]+Z, AB = p[A+1]+Z,      
          B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z;      
 
      return lerp(w, lerp(v, lerp(u, grad(p[AA  ], x  , y  , z   ),  
                                     grad(p[BA  ], x-1, y  , z   )), 
                             lerp(u, grad(p[AB  ], x  , y-1, z   ),   
                                     grad(p[BB  ], x-1, y-1, z   ))), 
                     lerp(v, lerp(u, grad(p[AA+1], x  , y  , z-1 ),   
                                     grad(p[BA+1], x-1, y  , z-1 )),  
                             lerp(u, grad(p[AB+1], x  , y-1, z-1 ),
                                     grad(p[BB+1], x-1, y-1, z-1 ))));
   }
   function fade(t) { 
     return t * t * t * (t * (t * 6 - 15) + 10); 
   }
   function lerp(t, a, b) { 
     return a + t * (b - a); 
   }
   function grad(hash, x, y, z) {
      var h = hash & 15;                      
      var u = h<8 ? x : y,                 
          v = h<4 ? y : h==12||h==14 ? x : z;
      return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
   }
 
   window.noise = noise;
})();