const el = id => document.getElementById(id);
const r = el('r'), g = el('g'), b = el('b');
const rnum = el('rnum'), gnum = el('gnum'), bnum = el('bnum');
const x = el('x'), y = el('y'), z = el('z');
const xnum = el('xnum'), ynum = el('ynum'), znum = el('znum');
const l = el('l'), a = el('a'), b2 = el('b2');
const lnum = el('lnum'), anum = el('anum'), b2num = el('b2num');
const swatch = el('swatch'), warn = el('warn');
const hexpicker = el('hexpicker'), hexval = el('hexval');

const Xn = 95.047, Yn = 100.000, Zn = 108.883;

function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
function toHex(r,g,b){return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')}

function srgbToLinear(c){
  c = c/255;
  return c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4);
}
function linearToSrgb(c){
  const v = c <= 0.0031308 ? 12.92*c : 1.055*Math.pow(c,1/2.4)-0.055;
  return clamp(Math.round(v*255),0,255);
}

function rgbToXyz(R,G,B){
  const rlin = srgbToLinear(R);
  const glin = srgbToLinear(G);
  const blin = srgbToLinear(B);
  let X = (0.4124564*rlin + 0.3575761*glin + 0.1804375*blin) * 100;
  let Y = (0.2126729*rlin + 0.7151522*glin + 0.0721750*blin) * 100;
  let Z = (0.0193339*rlin + 0.1191920*glin + 0.9503041*blin) * 100;
  return {X,Y,Z};
}

function xyzToRgb(X,Y,Z){
  X /= 100; Y /= 100; Z /= 100;
  let rlin =  3.2404542*X -1.5371385*Y -0.4985314*Z;
  let glin = -0.9692660*X +1.8760108*Y +0.0415560*Z;
  let blin =  0.0556434*X -0.2040259*Y +1.0572252*Z;
  const R = linearToSrgb(rlin);
  const G = linearToSrgb(glin);
  const B = linearToSrgb(blin);
  const clipped = rlin<0 || glin<0 || blin<0 || rlin>1 || glin>1 || blin>1;
  return {R,G,B,clipped};
}

function f_xyz(t){
  const delta = 6/29;
  return t > Math.pow(delta,3) ? Math.cbrt(t) : (t/(3*delta*delta) + 4/29);
}
function inv_f(t){
  const delta = 6/29;
  return t > delta ? Math.pow(t,3) : 3*delta*delta*(t - 4/29);
}
function xyzToLab(X,Y,Z){
  let fx = f_xyz(X / Xn);
  let fy = f_xyz(Y / Yn);
  let fz = f_xyz(Z / Zn);
  let L = 116*fy - 16;
  let a = 500*(fx - fy);
  let b = 200*(fy - fz);
  return {L,a,b};
}
function labToXyz(L,a,b){
  let fy = (L + 16)/116;
  let fx = fy + (a/500);
  let fz = fy - (b/200);
  let X = Xn * inv_f(fx);
  let Y = Yn * inv_f(fy);
  let Z = Zn * inv_f(fz);
  return {X,Y,Z};
}

function updateFromRGB(){
  const R = Number(r.value), G = Number(g.value), B = Number(b.value);
  rnum.value = R; gnum.value = G; bnum.value = B;
  const hx = toHex(R,G,B);
  hexval.textContent = hx; hexpicker.value = hx;
  const {X,Y,Z} = rgbToXyz(R,G,B);
  x.value = +X.toFixed(3); y.value = +Y.toFixed(3); z.value = +Z.toFixed(3);
  xnum.value = +X.toFixed(3); ynum.value = +Y.toFixed(3); znum.value = +Z.toFixed(3);
  const lab = xyzToLab(X,Y,Z);
  l.value = +lab.L.toFixed(2); a.value = +lab.a.toFixed(2); b2.value = +lab.b.toFixed(2);
  lnum.value = +lab.L.toFixed(2); anum.value = +lab.a.toFixed(2); b2num.value = +lab.b.toFixed(2);
  swatch.style.background = hx;
  warn.style.display = 'none';
}

function updateFromXYZ(){
  let X = Number(x.value), Yv = Number(y.value), Z = Number(z.value);
  xnum.value = +X.toFixed(3); ynum.value = +Yv.toFixed(3); znum.value = +Z.toFixed(3);
  const lab = xyzToLab(X,Yv,Z);
  l.value = +lab.L.toFixed(2); a.value = +lab.a.toFixed(2); b2.value = +lab.b.toFixed(2);
  lnum.value = +lab.L.toFixed(2); anum.value = +lab.a.toFixed(2); b2num.value = +lab.b.toFixed(2);
  const {R,G,B,clipped} = xyzToRgb(X,Yv,Z);
  r.value = R; g.value = G; b.value = B;
  rnum.value = R; gnum.value = G; bnum.value = B;
  const hx = toHex(R,G,B);
  hexval.textContent = hx; hexpicker.value = hx;
  swatch.style.background = hx;
  warn.style.display = clipped ? 'block' : 'none';
}

function updateFromLab(){
  let L = Number(l.value), aa = Number(a.value), bb = Number(b2.value);
  lnum.value = +L.toFixed(2); anum.value = +aa.toFixed(2); b2num.value = +bb.toFixed(2);
  const {X,Y: Yv, Z} = labToXyz(L,aa,bb);
  x.value = +X.toFixed(3); y.value = +Yv.toFixed(3); z.value = +Z.toFixed(3);
  xnum.value = +X.toFixed(3); ynum.value = +Yv.toFixed(3); znum.value = +Z.toFixed(3);
  const {R,G,B,clipped} = xyzToRgb(X,Yv,Z);
  r.value = R; g.value = G; b.value = B;
  rnum.value = R; gnum.value = G; bnum.value = B;
  const hx = toHex(R,G,B);
  hexval.textContent = hx; hexpicker.value = hx;
  swatch.style.background = hx;
  warn.style.display = clipped ? 'block' : 'none';
}

function wire(range, num){
  range.addEventListener('input', ()=>{ num.value = range.value; if(range===r||range===g||range===b) updateFromRGB(); else if(range===x||range===y||range===z) updateFromXYZ(); else updateFromLab(); });
  num.addEventListener('change', ()=>{ let v = Number(num.value);
    if(range.min) v = Math.max(Number(range.min), v);
    if(range.max) v = Math.min(Number(range.max), v);
    range.value = v; num.value = v;
    if(range===r||range===g||range===b) updateFromRGB(); else if(range===x||range===y||range===z) updateFromXYZ(); else updateFromLab();
  });
}

wire(r,rnum); wire(g,gnum); wire(b,bnum);
wire(x,xnum); wire(y,ynum); wire(z,znum);
wire(l,lnum); wire(a,anum); wire(b2,b2num);

hexpicker.addEventListener('input', ()=>{
  const col = hexpicker.value;
  hexval.textContent = col;
  const R = parseInt(col.substr(1,2),16);
  const G = parseInt(col.substr(3,2),16);
  const B = parseInt(col.substr(5,2),16);
  r.value = R; g.value = G; b.value = B;
  rnum.value = R; gnum.value = G; bnum.value = B;
  updateFromRGB();
});

function init(){
  r.value=255; g.value=0; b.value=0;
  updateFromRGB();
}
init();