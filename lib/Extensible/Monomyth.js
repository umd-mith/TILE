/*
 * From Original Monomyth on GitHub:
 * 
 * Copyright (c) 2009, University of Maryland. All rights reserved.
 * Distributed under the terms of a BSD-style license. See COPYING for details.
 */

// This must come first. It's just an object to use as a namespace
Monomyth = {};


(function() {
     this.Monomyth.Class = function(){};
     var doInit = true;

     this.Monomyth.Class.extend = function(opts) {
         // make a skeleton instance to inherit from
         doInit = false;
         var superInst = new this();
         doInit = true;

         // copy methods from the arg
         for (var name in opts) {
             // make sure we're not copying inherited properties...
             if (!opts.hasOwnProperty(name)) continue;
             // if we're overriding a method, prepare this.$super for it
             superInst[name] = (typeof opts[name] == "function" &&
                           typeof superInst[name] == "function") ?
                 (function (funcName, superFunc, curFunc) {
                      return function () {
                          var tmp = this.$super;
                          this.$super = superFunc;
                          var ret = curFunc.apply(this, arguments);
                          this.$super = tmp;
                          return ret;
                      };
                  })(name, superInst[name], opts[name]) :
             opts[name];
         }

         // create our dummy class
         var newClass = function () {
             // don't call init if we're creating a skeleton or we don't have
             // an init method to call
             if (doInit && this.init) {
                 this.init.apply(this, arguments);
             }
         };
         newClass.prototype = superInst;
         // setting the proto will clobber the constructor
         newClass.constructor = newClass;
         // add an extend method to the class
         newClass.extend = arguments.callee;
         return newClass;
     };
})();
