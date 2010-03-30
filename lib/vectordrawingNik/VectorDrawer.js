(function ($, R, _) {
     var rootNS = this;
     var TOO_SMALL = 2;
     var CLOSE_ENOUGH = 8;
     var EPSILON = 10e-6;
     // TODO: make these configurable
     var INIT_ATTRS = {"stroke-width": "1px", "stroke": "black"};
     var SELECTED_ATTRS = {"stroke-width": "1px", "stroke": "#ff6666"};

     function makePathStr(ps) {
         return "M " + _.map(ps, function(p) {return p.x + " " + p.y;}).join(" L ");
     }

     function whereLinesIntersect(a1, a2, b1, b2) {
         var bXdiff = b1.x-b2.x, bYdiff = b1.y-b2.y;
         var aXdiff = a1.x-a2.x, aYdiff = a1.y-a2.y;
         var aDet = a1.x*a2.y - a1.y*a2.x, bDet = b1.x*b2.y - b1.y*b2.x,
             denom = aXdiff*bYdiff - aYdiff*bXdiff;
         var interX = (aDet*bXdiff - aXdiff*bDet)/denom,
             interY = (aDet*bYdiff - aYdiff*bDet)/denom;
         return {x: interX, y: interY};
     }

     // given the endpoints (a1,a2,b1,b2) of two line segments,
     // determine if they intersect
     function lineSegsIntersect(a1, a2, b1, b2) {
         var i = whereLinesIntersect(a1, a2, b1, b2);
         // check if it's within the segment
         return i.x > _.min([a1.x,a2.x]) && i.x < _.max([a1.x,a2.x]) &&
             i.y > _.min([a1.y,a2.y]) && i.y < _.max([a1.y,a2.y]) &&
             i.x > _.min([b1.x,b2.x]) && i.x < _.max([b1.x,b2.x]) &&
             i.y > _.min([b1.y,b2.y]) && i.y < _.max([b1.y,b2.y]);
     }

     function eachPoint(pathStr, func) {
         // copy without the beginning "M " or ending " z", then split on " L "
         var parts = pathStr.substr(2, path.length-4).split(" L ");
         var np = makePathStr(_.map(parts, function(p){
             var xy = p.split(" ");
             return func({x: xy[0]*1, y: xy[1]*1});
         }));
         return np + " z";
         
     }

     function shiftShape(o, shift) {
         var ret = {con: o.con, scale: o.scale};
         if (o.con == "rect") {
             ret.x = o.x + shift.x;
             ret.y = o.y + shift.y;
             ret.width = o.width;
             ret.height = o.height;
             ret.args = [ret.x, ret.y, ret.width, ret.height];
         } else if (o.con == "ellipse") {
             ret.cx = o.cx + shift.x;
             ret.cy = o.cy + shift.y;
             ret.rx = o.rx;
             ret.ry = o.ry;
             ret.args = [ret.cx, ret.cy, ret.rx, ret.ry];
         } else if (o.con == "path") {
             ret.points = _.map(o.points, function (p) {
                 return {x: p.x+shift.x, y: p.y+shift.y};
             });
             ret.args = makePathStr(ret.points);
         } else {
             throw "should not be reached";
         }
         return ret;
     }

     function relScale(vd, o) {
         return vd._scale/o.scale;
     }


     function pointDistSq(a, b) {
         var dx = a.x-b.x, dy = a.y-b.y;
         return dx*dx + dy*dy;
     }

     function pointNearLineSegment(l, p) {
         // easy case: we're within range of the endpoints
         if (_.any(l, function (lp) {
                 return pointDistSq(lp, p) < CLOSE_ENOUGH*CLOSE_ENOUGH;
             }))
             return true;

         // calculate nearest point on the line (point such that it
         // and the queried point form a line segment orthogonal to
         // the queried line segment)
         var ldx = l[0].x-l[1].x, ldy = l[0].y-l[1].y;
         var lslope = ldx/ldy;
         
         var dump; // dummy point
         if (isFinite(lslope)) {
             dump = (lslope < EPSILON && lslope > -EPSILON) ?
                 {x: p.x + 10, y: p.y} : {x: p.x - 10*lslope, y: p.y+10};
         } else {
             dump = {x: p.x, y: p.y + 10};  
         }

         var i = whereLinesIntersect(l[0], l[1], dump, p);

         // is this point actually within the queried line segment?
         if (i.x < _.min([l[0].x, l[1].x]) ||
             i.x > _.max([l[0].x, l[1].x]) ||
             i.y < _.min([l[0].y, l[1].y]) ||
             i.y > _.max([l[0].y, l[1].y]))
             return false;

         return pointDistSq(i, p) < CLOSE_ENOUGH*CLOSE_ENOUGH;
     }

     function pointDistFromEllipse(po, eo) {
         // algorithm described in
         // "Quick computation of the distance between a point and an ellipse"
         // by L. Maisonobe <luc@spaceroots.org>
         // September 2003, revised May 2005, minor revision February 2006

         var one_third = 1/3;
         var cube_root = function(n) {
             var cube_root_abs_n = Math.pow(Math.abs(n), one_third);
             return n < 0? -cube_root_abs_n : cube_root_abs_n;
         };

         // ae = major axis
         // ap = minor axis
         // r = distance from center along major axis
         // z = distance from center along minor axis
         var ae, ap, r, z;
         if (eo.rx > eo.ry) {
             ae = eo.rx;
             ap = eo.ry;
             r = po.x-eo.cx;
             z = po.y-eo.cy;
         } else {
             ae = eo.ry;
             ap = eo.rx;
             r = po.y-eo.cy;
             z = po.x-eo.cx;
         }
         // by symmetry, we don't care about signs
         r = Math.abs(r);
         z = Math.abs(z);

         // f = flattening
         var f = 1 - ap/ae;
         var one_minus_f_sq = Math.pow((1-f), 2);

         var p_dist_center = Math.sqrt(r*r + z*z);

         // near center requires special handling
         if (p_dist_center < EPSILON)
             return ap;

         var cos_zeta = r/p_dist_center,
             sin_zeta = z/p_dist_center,
             t = z/(r + p_dist_center);
         var a = one_minus_f_sq*cos_zeta*cos_zeta + sin_zeta*sin_zeta,
             b = one_minus_f_sq*r*cos_zeta + z*sin_zeta,
             c = one_minus_f_sq*(r*r - ae*ae) + z*z;
         var k = c/(b + Math.sqrt(b*b - a*c));
         var phi = Math.atan2(z - k*sin_zeta, one_minus_f_sq*(r-k*cos_zeta));
         var one_minus_f_sq_times_diff_r_sq_ae_sq_plus_z_sq = c;

         if (Math.abs(k) < EPSILON*p_dist_center) {
             return k;
         }

         var inside = one_minus_f_sq_times_diff_r_sq_ae_sq_plus_z_sq <= 0;

         var calc_tilde_phi = function(z_, tilde_t_, r_, k_) {
             var tilde_t_sq = tilde_t_*tilde_t_;
             return Math.atan2(z_*(1+tilde_t_sq)-2*k_*tilde_t_,
                     one_minus_f_sq*(r_*(1+tilde_t_sq) - k_*(1-tilde_t_sq)));
         };

         var d;
         for (var iter = 0; iter < 100; iter++) {
             // paper Java differ on computing a and c. Java works
             a = one_minus_f_sq_times_diff_r_sq_ae_sq_plus_z_sq + one_minus_f_sq*(2*r + k)*k; 
             b = -4*k*z/a;
             c = 2*(one_minus_f_sq_times_diff_r_sq_ae_sq_plus_z_sq + (1 + f*(2-f))*k*k)/a;
             d = b;

             // paper and Java differ here too. Again, Java works
             b += t;
             c += t*b;
             d += t*c;

             // find the other real root
             var Q = (3*c - b*b)/9,
                 R = (b*(9*c - 2*b*b) - 27*d)/54;
             var D = Q*Q*Q + R*R;
             var tilde_t, tilde_phi;
             if (D >= 0) {
                 var sqrt_D = Math.sqrt(D);
                 tilde_t = cube_root(R + sqrt_D) + cube_root(R - sqrt_D) - b/3;
                 tilde_phi = calc_tilde_phi(z, tilde_t, r, k);
             } else {
                 Q = -Q;
                 var sqrt_Q = Math.sqrt(Q);
                 var theta = Math.acos(R/(Q*sqrt_Q));
                 tilde_t = 2*sqrt_Q*Math.cos(theta/3) - b/3;
                 tilde_phi = calc_tilde_phi(z, tilde_t, r, k);
                 if (tilde_phi*phi < 0) {
                     tilde_t = 2*sqrt_Q*Math.cos((theta + 2*Math.PI)/3) - b/3;
                     tilde_phi = calc_tilde_phi(z, tilde_t, r, k);
                     if (tilde_phi*phi < 0) {
                         tilde_t = 2*sqrt_Q*Math.cos((theta + 4*Math.PI)/3) - b/3;
                         tilde_phi = calc_tilde_phi(z, tilde_t, r, k);
                     }
                 }
             }

             var delta_phi = Math.abs(tilde_phi - phi)/2;
             phi = Math.abs(tilde_phi + phi)/2;

             var cos_phi = Math.cos(phi), sin_phi = Math.sin(phi);
             var sin_phi_sq = sin_phi*sin_phi;
             var sqrt_stuff = Math.sqrt(1 - f*(2-f)*sin_phi_sq);
             if (delta_phi < EPSILON) {
                 return r*cos_phi + z*sin_phi - ae*sqrt_stuff;
             }

             var delta_r = r - (ae*cos_phi)/sqrt_stuff,
                 delta_z = z - (ae*one_minus_f_sq*sin_phi)/sqrt_stuff;
             k = Math.sqrt(delta_r*delta_r + delta_z*delta_z);
             if (inside) k = -k;
             t = delta_z/(delta_r + k);
         }

         // instead of emitting an error, return our best
         return r*cos_phi + z*sin_phi - ae*sqrt_stuff;
     }

     // TODO: object-ify our shapes
     function isNear(p, o) {
         if (o.con == "rect") {
             var farX = o.x+o.width, farY = o.y+o.height;
             var ul = {x: o.x, y: o.y}, ur = {x: farX, y:o.y},
                 ll = {x: o.x, y: farY}, lr = {x: farX, y:farY};
             return _.any([[ul, ur], [ur, lr], [lr, ll], [ll, ul]], function (seg){
                 return pointNearLineSegment(seg, p);
             });
         } else if (o.con == "ellipse") {
             return Math.abs(pointDistFromEllipse(p, o)) < CLOSE_ENOUGH;
         } else if (o.con == "path") {
             // convert list of points into pairs of points for line segments
             var line_segs = _.map(o.points, function (po, i){
                 return [i?o.points[i-1] : _.last(o.points), po];
             });
             return _.any(line_segs, function (l){
                 return pointNearLineSegment(l, p);
             });
         } else {
             throw "should not be reached";
         }
     }

     // TODO: make this take an object for options instead of a pile of 
     // order-dependant args

     // initDrawMode should be one of the modes
     // overElm is the element that this VectorDrawer will be laid on top of
     // Note: the VectorDrawer will not move or resize if the element does

     /**
      * Class: VectorDrawer
      */
     /**
      * Constructor: VectorDrawer
      * Constructor for a new VectorDrawer
      * 
      * Parameters:
      * initDrawMode - {String} Initial draw mode. Should be one of 'r', 'p', 'e',
      *   or 's' (for rectangle, polygon, ellipse, and select respectively).
      *   Defaults to 's'.
      * initScale - {Number} Initial scale of the image. Defaults to 1.
      * initObjs - {Array} An initial set of objects (from VectorDrawer.savable). Defaults to []
      * overElem - {jQuerySelector} The element to overlay with this VectorDrawer.
      *   Can be a DOM element, string, etc. Defaults to "img" (the first image in the page)
      */
     var VectorDrawer = function (initDrawMode, initScale, initObjs, overElm) {
         var self = this;
         // only thing that methods access at the moment
         self._drawMode = initDrawMode || 's';
         self._scale = initScale || 1;
         self._allObjs = initObjs || [];
         self._start = self._obj = self._points = null;

         // XXX: should handle wandering out of the area...
         overElm = $(overElm || "img");
         self._over = {
             elm: $(overElm),
             offset: overElm.offset(),
             origWidth: overElm.width()/initScale,
             origHeight: overElm.height()/initScale};
         self._buildCanvas();
     };
     VectorDrawer.prototype = {};
     VectorDrawer.constructor = VectorDrawer;
     jQuery.extend(VectorDrawer.prototype, {
         /**
          * Method: drawMode
          * Sets or gets the current drawMode. If no argument is given,
          * returns the current drawMode.
          * 
          * Parameters:
          * drawMode - {String} the drawMode to set
          */
         drawMode: function(newMode) {
             if (newMode != null) {
                 if (self._obj) self._obj.cur.attr(INIT_ATTRS);
                 this._drawMode = newMode;
             }
             return this._drawMode;
         },
         /**
          * Method: scale
          * Sets or gets the current scale. If no argument is given,
          * returns the current scale. This will attempt to resize the element
          * that this VectorDrawer overlays.
          * 
          * Parameters:
          * scale - {Number} the scale to set
          */
         scale: function(newScale) {
             var self = this;
             if (newScale == null || newScale < 0) {
                 return self._scale;
             }
             self._scale = newScale;
             var newSize = {
                 width: self._over.origWidth*self._scale,
                 height: self._over.origHeight*self._scale
             };
             self._over.elm.css(newSize);
             _.each(self._allObjs, function (o) {
                 o.cur.remove();
                 o.cur = null;
             });
             self._canvas.elm.remove();
             this._buildCanvas();
             return self._scale;
         },
         /**
          * Method: savable
          * Returns an array representing all the shapes/objects currently drawn
          * by this VectorDrawer. These should not be fiddled with if you plan
          * to pass them to the constructor as its initObjs argument.
          */
         savable: function() {
             return _.map(this._allObjs, function(o){
                 var r = {};
                 _.each(["scale", "con", "args", "x", "y", "width", "height",
                     "points", "cx", "cy", "rx", "ry"],
                     function (p) {if (p in o) r[p] = o[p];});
                 return r;
             });
         },
         _buildCanvas: function() {
             var self = this;
             self._paper = R(self._over.offset.left, self._over.offset.top,
                 self._over.elm.width(), self._over.elm.height());
             self._canvas = {elm:$(self._paper.canvas)};
             self._canvas.off = self._canvas.elm.offset();
             self._over.offset = self._over.elm.offset();
             self._installHandlers();
             _.each(self._allObjs, function (o) {
                 o.cur = self._paper[o.con].apply(self._paper, o.args);
                 var rs = relScale(self, o);
                 o.cur.scale(rs, rs, 0, 0);
             });
         },
         // given an event e, figure out where it is relative to the canvas
         _getCanvasXY: function (e) {
             var self = this;
             return {
                 x: e.clientX-self._canvas.off.left,
                 y: e.clientY-self._canvas.off.top
             };
         },
         _installHandlers: function() {
             var self = this;

             self._canvas.elm.mousedown(function(e) {
                 if (1 != e.which) return;
                 e.preventDefault();

                 var cur = self._getCanvasXY(e);
                 if (self._drawMode == 'r') {
                     self._start = cur;
                     self._obj = self._paper.rect(self._start.x, self._start.y, 0, 0);
                     self._obj.attr(INIT_ATTRS);
                 } else if (self._drawMode == 'e') {
                     self._start = cur;
                     self._obj = self._paper.ellipse(self._start.x, self._start.y, 0, 0);
                     self._obj.attr(INIT_ATTRS);
                 } else if (self._drawMode == 'p') {
                     if (self._points) {
                         var f = _.first(self._points);
                         var a = cur.x - f.x,
                             b = cur.y - f.y;
                         var maybeClosing = false;
                         if (Math.sqrt(a*a + b*b) < CLOSE_ENOUGH) {
                             maybeClosing = true;
                         }
                         if (self._points.length > 2) {
                             // if we're closing the polygon,
                             // then we skip the first line
                             var inter = false,
                                 ps = self._points.slice(maybeClosing? 2:1, -2),
                                 lp = self._points[maybeClosing? 1 : 0],
                                 pcur = self._points[self._points.length-2];
                             _.each(ps, function(cp) {
                                 if (lineSegsIntersect(lp, cp, pcur, cur)) {
                                     inter = true;
                                     _.breakLoop();
                                 }
                                 lp = cp;
                             });
                             // intersection detected, don't use this
                             if (inter) return;
                         }
                         if (maybeClosing) {
                             self._points.pop();
                             var path = makePathStr(self._points) + " z";
                             self._obj.attr({"path": path});
                             var bbox = self._obj.getBBox();
                             if (bbox.width > TOO_SMALL && bbox.height > TOO_SMALL) {
                         
                                 self._allObjs.push({
                                     cur: self._obj,
                                     con: "path",
                                     args: [path],
                                     points: self._points,
                                     scale: self._scale
                                 });
                             }
                             self._obj = self._points = null;
                             return; // done!
                         }
                     } else {
                         self._points = [cur];
                         self._obj = self._paper.path(makePathStr(self._points));
                         self._obj.attr(INIT_ATTRS);
                     }
                     self._points.push({x: cur.x, y: cur.y});
                 } else if (self._drawMode == 's') {
                     if (self._obj) self._obj.cur.attr(INIT_ATTRS);
                     self._obj = null;
                     var targetObj = _.first(_.select(self._allObjs,
                         function(o){
                             return isNear(cur, o);
                         }));
                     if (!targetObj) return;
                     targetObj.cur.attr(SELECTED_ATTRS);
                     self._obj = targetObj;
                     self._start = cur;
                 } else {
                     throw "should not be reached";
                 }
             }).mouseup(function (e) {
                 if (1 != e.which) return;
                 e.preventDefault();

                 if (self._drawMode == 'r' || self._drawMode == 'e') {
                     if (!self._obj) return;
                     var metaObj = {
                         cur: self._obj,
                         scale: self._scale
                     };
                     if (self._drawMode == 'r') {
                         var as = self._obj.attr(["x", "y", "width", "height"]);
                         $.extend(metaObj, {
                             con: "rect",
                             args: [as.x, as.y, as.width, as.height],
                             x: as.x,
                             y: as.y,
                             width: as.width,
                             height: as.height
                         });
                     } else if (self._drawMode == 'e') {
                         var as = self._obj.attr(["cx", "cy", "rx", "ry"]);
                         $.extend(metaObj, {
                             con: "ellipse",
                             args: [as.cx, as.cy, as.rx, as.ry],
                             cx: as.cx,
                             cy: as.cy,
                             rx: as.rx,
                             ry: as.ry
                         });
                     } else {
                         throw "should not be reached";
                     }
                     var bbox = metaObj.cur.getBBox();
                     if (bbox.width > TOO_SMALL && bbox.height > TOO_SMALL) self._allObjs.push(metaObj);
                     self._start = self._obj = null;
                 } else if (self._drawMode == 'p') {
                     // do nothing
                 } else if (self._drawMode == 's') {
                     self._start = null; // stop moving
                     var o = self._obj;
                     if (o && o.newO) {
                         _.each(["scale", "con", "args", "x", "y", "width", "height",
                             "points", "cx", "cy", "rx", "ry"],
                             function (p) {if (p in o) o[p] = o.newO[p];});
                     }
                 } else {
                     throw "should not be reached";
                 }
             }).mousemove(function (e) {
                 if (!self._obj) return;
                 e.preventDefault();

                 var cur = self._getCanvasXY(e);
                 if (self._drawMode == 'r' || self._drawMode == 'e') {
                     if (!self._obj) return;

                     var tl = {x: _.min([cur.x, self._start.x]), y: _.min([cur.y, self._start.y])},
                     br = {x: _.max([cur.x, self._start.x]), y: _.max([cur.y, self._start.y])},
                     halfWidth = (br.x-tl.x)/2,
                     halfHeight = (br.y-tl.y)/2;

                     if (self._drawMode == 'r') {
                         self._obj.attr({
                             x: tl.x, y: tl.y,
                             width: br.x - tl.x,
                             height: br.y - tl.y
                         });
                     } else if (self._drawMode == 'e') {
                         self._obj.attr({
                             cx: tl.x + halfWidth,
                             cy: tl.y + halfHeight,
                             rx: halfWidth,
                             ry: halfHeight
                         });
                     } else {
                         throw "should not be reached";
                     }
                 } else if (self._drawMode == 'p') {
                     if (!self._points) return;

                     var lp = _.last(self._points);
                     lp.x = cur.x;
                     lp.y = cur.y;
                     self._obj.attr({"path": makePathStr(self._points)});
                 } else if (self._drawMode == 's') {
                     if (!self._start || !self._obj) return;

                     var st = self._start;
                     var o = self._obj;
                     var rs = relScale(self, o);
                     var shift = {x: (cur.x-st.x)/rs, y: (cur.y-st.y)/rs};
                     o.newO = shiftShape(o, shift);
                     if (o.con == "rect") {
                         o.cur.attr({x: o.newO.x*rs, y: o.newO.y*rs*rs});
                     } else if (self._obj.con == "ellipse") {
                         o.cur.attr({cx: o.newO.cx*rs, cy: o.newO.cy*rs});
                     } else if (self._obj.con == "path") {
                         o.cur.attr({path: makePathStr(_.each(o.newO.points, function(p){
                             return {x: p.x*rs, y: p.y*rs};
                         })) + " z"});
                     } else {
                         throw "should not be reached";
                     }
                 } else {
                     throw "should not be reached";
                 }
             });
             // doesn't figure out if our canvas has focus
             // having multiple ops (in different canvases) seems pretty FUBAR, tho
             $(document).keydown(function(e) {
                 if (e.result == 1132423) return 1132423; // never again!

                 // if it's escape, stop what we're doing
                 if (e.keyCode === 27) {
                     if (self._obj) self._obj.remove();
                     self._start = self._obj = self._points = null;
                 } else if ((e.keyCode === 46 || e.keyCode === 8)
                           && self._drawMode == 's' && self._obj) {
                     // delete or backspace
                     var o = self._obj;
                     if (o && confirm("You are about to delete annotation. Is that okay?")) {
                         self._allObjs = _.reject(self._allObjs, function (c){return c == o;});
                         o.cur.remove();
                         self._start = self._obj = self._points = null;
                     }
                 }
                 return 1132423;
             });
         }
     });

     rootNS.VectorDrawer = VectorDrawer;
})(jQuery, Raphael, _);

/* XXX revive overlayed objects for contrast
var p1 = paper.path("M10 10L90 90L10 90z");
p1.attr({"stroke": "black", "stroke-width": 1.5});
var p2 = paper.path("M10 10L90 90L10 90z");
p2.attr({"stroke": "white", "stroke-width": 0.5});
*/