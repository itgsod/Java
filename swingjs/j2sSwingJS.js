// j2sSwingJS.js 
// NOTE: updates to this file should be copies to j2sjmol.js

// latest author: Bob Hanson, St. Olaf College, hansonr@stolaf.edu


// NOTES by Bob Hanson

// BH 7/31/2016 2:56:07 PM fix for compiler error using overrideMethod for functions that contain superCall()
// BH 7/31/2016 5:56:59 AM floatToInt and floatToChar need to consider NaN
// BH 7/23/2016 6:03:20 PM work-around for new Boolean(string), since native JavaScript Boolean does not support that;
//                         uses "new Boolean" --> "Boolean.from" in build.xml
// BH 7/23/2016 8:00:43 AM added Clazz._traceOutput
// BH 7/21/2016 12:37:01 PM added note for infinite loop when a dependency file is needed but not found loading a UI file. (Clazz._isQuiet) 
// BH 7/20/2016 6:21:36 PM  class.getClassLoader().getResource(URL) does not find correct base directory
// BH 7/19/2016 11:20:03 AM static nested class instances are referenced by the Java compiler as "Outer$Inner" 
//                          and must be able to be references as such in Clazz._4Name
// BH 7/18/2016 10:21:40 PM abstract classes that have prepareFields must declare a default superconstructor
// BH 7/18/2016 10:28:47 AM adds System.nanoTime()
// BH 7/17/2016 4:19:07 PM prepareFields modified to save b$[] in outer class, not inner
//                         thus saving considerably on overhead when inner classes are created
//                         Also note that use of @j2sOverrideConstructor 
// BH 7/11/2016 11:32:29 PM adds XxxxArray.getClass()
// BH 7/7/2016 10:24:36 AM fixed Float.isInfinite(), Double.isInfinite()
// BH 7/7/2016 10:12:20 AM added Number.compare(a,b) (technically just Float and Double)
// BH 7/7/2016 7:10:09 AM note added about String and CharSequence
// BH 7/6/2016 5:30:24 PM adds Character.charCount(c)
// BH 7/6/2016 6:26:41 AM adds String.format()
// BH 7/4/2016 1:34:18 PM Frame1$Dialog1 uses wrong instance of Window in prepareCallbacks #23 
// BH 7/3/2016 3:49:29 PM tweak of delegate, replacing evaluateMethod with findMethod
// BH 6/16/2016 5:55:33 PM adds Class.isInstance(obj)
// BH 6/16/2016 3:27:50 PM adds System property java.code.version == "50" (Java 1.6)
// BH 6/16/2016 1:47:41 PM fixing java.lang.reflect.Constructor and java.lang.reflect.Method
// BH 6/15/2016 6:04:13 PM subclass of B, where B is an abstract subclass of C fails
// BH 6/15/2016 5:16:01 PM adds java.lang.Math = Math
// BH 6/15/2016 5:16:19 PM removing alert in relation to overridden private method. 
//                         more importantly would be a private xxx() between 
//                         super and sub, sub missing the function, and super having it.
// AR 6/14/2016 10:47:04 AM added java-specific Math.xxx; Math.rint fixed
// BH 6/13/2016 11:53:30 PM https://groups.google.com/forum/#!topic/java2script/mjrUxnp1VS8 interface beats class fixed
// BH 6/12/2016 10:19:41 PM ensuring Class.forName("....").newInstance() requires a default constructor
// BH 6/12/2016 5:07:22 PM complete rewrite of inheritance field preparation and constructors
// BH 6/12/2016 11:17:43 AM removing Clazz.dateToString
// BH 6/9/2016 9:40:31 AM refactoring SAEM for efficiencies
// BH 6/8/2016 4:19:55 PM "con$truct" renamed "$prepare$" and placed ahead of constructor (two places)
// BH 6/7/2016 9:29:59 PM adds updateNode check for over 100 iterations, 
//                        which is probably an error and is easily spotted

// see earlier notes at swingjs/doc/j2snotes.txt
 
LoadClazz = function() {

// BH c$ is the ONLY global used in SwingJS now. I do not think it is necessary,
// but it is created by the compiler, and I have not found a post-compile work-around.
// It is used as a local variable in class definitions to point to the 
// current method. See Clazz.p0p and Clazz.pu$h

c$ = null;

if (!window["j2s.clazzloaded"])
	window["j2s.clazzloaded"] = false;

if (window["j2s.clazzloaded"])return;

window["j2s.clazzloaded"] = true;

window["j2s.object.native"] = true;

 /* http://j2s.sf.net/ *//******************************************************************************
 * Copyright (c) 2007 java2script.org and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Zhou Renjian - initial API and implementation
 *****************************************************************************/
/*******
 * @author zhou renjian
 * @create Nov 5, 2005
 *******/
 


/**
 * Class Clazz. All the methods are static in this class.
 */
/* static */
/*Class = */ Clazz = {
  _isQuiet: false,
  _debugging: false
};

;(function(Clazz, J2S) {


try {
Clazz._debugging = (document.location.href.indexOf("j2sdebug") >= 0);
} catch (e) {
}

Clazz._traceOutput = null; // will alert in system.out.println with a message

var __debuggingBH = false;

var _globals = ["j2s.clazzloaded", "j2s.object.native"];
Clazz.setGlobal = function(a, v) {
	_globals.push(a);
	window[a] = v;
}

Clazz.getGlobals = function() {
	return _globals.sort().join("\n");
}

Clazz.setConsoleDiv = function(d) {
	window["j2s.lib"] && (window["j2s.lib"].console = d);
};

var supportsNativeObject = window["j2s.object.native"];

Clazz.Console = {};

Clazz.duplicatedMethods = {};

Clazz._preps = {}; // prepareFields functions based on class name

// BH Clazz.getProfile monitors exactly what is being delegated with SAEM,
// which could be a bottle-neck for function calling.
// This is critical for performance optimization.

// J2S.getProfile()

var _profile = null;

Clazz._startProfiling = function(doProfile) {
  _profile = (doProfile && self.JSON ? {} : null);
}

/**
 * show all methods that have the same signature.
 *  
 */
Clazz.showDuplicates = function(quiet) {
  var s = "";
  var a = Clazz.duplicatedMethods;
  var n = 0;
  for (var key in a)
    if (a[key] > 1) {
      s += a[key] + "\t" + key + "\n";
      n++;
    }
  s = "Duplicates: " + n + "\n\n" + s;
  System.out.println(s);
  if (!quiet)
    alert(s);
}

Clazz.getProfile = function() {
  	var s = "";
	if (_profile) {
		var l = [];
		for (var i in _profile) {
			var n = "" + _profile[i];
			l.push("        ".substring(n.length) + n + "\t" + i);
		}
		s = l.sort().reverse().join("\r\n");
		_profile = {};
	}
	return s; //+ __signatures;
}

/**
 * Return the class of the given class or object.
 *
 * @param clazzHost given class or object
 * @return class name
 */
/* public */
Clazz.getClass = function (clazzHost) {
	if (!clazzHost)
		return Clazz._O;	// null/undefined is always treated as Object
	if (typeof clazzHost == "function")
		return clazzHost;
	var clazzName;
	if (clazzHost instanceof CastedNull) {
		clazzName = clazzHost.clazzName;
	} else {
		switch (typeof clazzHost) {
		case "string":
			return String;
	  case "object":
			if (!clazzHost.__CLASS_NAME__)
				return (clazzHost.constructor || Clazz._O);
			clazzName = clazzHost.__CLASS_NAME__;
		break;
		default:
			return clazzHost.constructor;
		}
	}
	return evalType(clazzName, true);
};


///////////////////// method creation ////////////////////////////////

// sequence in Clazz.load function parameter:

// declarePackage
// decorateAsClass or declareType
// prepareFields
// makeConstructor
// defineMethod, overrideMethod...
// defineStatics

// c$.$StateTracker$1$ = function () {
// pu$h(self.c$);
// c$ = declareAnonymous (sun.java2d, "StateTracker$1", null, sun.java2d.StateTracker);
// overrideMethod 
// c$ = p0p ();

Clazz.declareInterface = function (prefix, name, interfacez, _declareInterface) {
	var clazzFun = function () {};
	decorateFunction(clazzFun, prefix, name);
	if (interfacez)
		implementOf(clazzFun, interfacez);
  clazzFun.$$INT$$ = clazzFun;
	return clazzFun;
};

Clazz.decorateAsClass = function (clazzFun, prefix, name, clazzParent, 
		interfacez, parentClazzInstance, _decorateAsClass) {    
	var prefixName = (prefix ? prefix.__PKG_NAME__ || prefix.__CLASS_NAME__ : null);
	var qName = (prefixName ? prefixName + "." : "") + name;
    if (Clazz._Loader._classPending[qName]) {
      delete Clazz._Loader._classPending[qName];
      Clazz._Loader._classCountOK++;
      Clazz._Loader._classCountPending--;
    }
  if (Clazz._Loader && Clazz._Loader._checkLoad) {
    //System.out.println("decorating class " + prefixName + "." + name);
    Clazz._lastDecorated = prefixName + "." + name
  }
	if (unloadedClasses[qName])
		clazzFun = unloadedClasses[qName];
	decorateFunction(clazzFun, prefix, name);
  if (clazzParent)
		inheritClass(clazzFun, clazzParent);
	if (interfacez)
		implementOf(clazzFun, interfacez);
	return clazzFun;
};

Clazz.declareType = function (prefix, name, clazzParent, interfacez, 
		parentClazzInstance, _declareType) {
	return Clazz.decorateAsClass (function () { Clazz.instantialize (this, arguments);}, 
    prefix, name, clazzParent, interfacez, parentClazzInstance);
};

Clazz.prepareFields = function (clazz, fieldsFun) {
  Clazz._preps[clazz.__CLASS_NAME__] = fieldsFun;
  // BH even if it is overwritten, a default constructor
  // that checks for a superconstructor must be present
  // if fields such as byte[] a = new byte[30] are declared
  Clazz.makeConstructor(clazz, function() {
  Clazz.superConstructor (this, clazz, []);
  });
};

/**
 * Make constructor for the class with the given function body and parameters
 * signature.
 * 
 * @param clazzThis host class
 * @param funBody constructor body
 * @param rawSig constructor parameters signature
 */
/* public */
Clazz.makeConstructor = function (clazzThis, funBody, rawSig) {
	var f$ = Clazz.defineMethod (clazzThis, "construct", funBody, rawSig);
  //System.out.println(">>>>" + clazzThis.__CLASS_NAME__ + getParamTypes(rawSig || []).typeString)
};

/**
 * Override constructor for the class with the given function body and
 * parameters signature. 
 * 
 * @param clazzThis host class
 * @param funBody constructor body
 * @param rawSig constructor parameters signature
 */
/* public */
Clazz.overrideConstructor = function (clazzThis, funBody, rawSig) {
	Clazz.overrideMethod (clazzThis, "construct", funBody, rawSig);
};

/* public */
Clazz.declareAnonymous = function (prefix, name, clazzParent, interfacez, 
		parentClazzInstance, _declareAnonymous) {
	var f = function () {
		Clazz.prepareCallback(this, arguments);
		Clazz.instantialize (this, arguments);
	};
	return Clazz.decorateAsClass (f, prefix, name, clazzParent, interfacez, 
			parentClazzInstance);
};

/*
 * Override the existed methods which are in the same name.
 * Overriding methods is provided for the purpose that the JavaScript
 * does not need to search the whole hierarchied methods to find the
 * correct method to execute.
 * Be cautious about this method. Incorrectly using this method may
 * break the inheritance system.
 *
 * @param clazzThis host class in which the method to be defined
 * @param funName method name
 * @param funBody function object, e.g function () { ... }
 * @param rawSig paramether signature, e.g ["string", "number"]
 */
/* public */
Clazz.overrideMethod = function(clazzThis, funName, funBody, rawSig) {
  // there are problems. for example, 
  
  // A extends B
  // A.xxx() {
  //   B.yyy()
  // }
  
  // B.xxx() {
  // }
  
  // B.yyy() {
  //   super.xxx()
  // }
  
  // compiler may indicate A.xxx() as overrideMethod 
  // but then the stack is missing.
  
  var sig = formatSignature(rawSig);
  if (Clazz._Loader._checkLoad)
    checkDuplicate(clazzThis, funName, sig);
    
	if (Clazz.unloadClass) 
    assureInnerClass(clazzThis, funBody);
	funBody.exName = funName;	
  funBody.sigs = {sig: sig};
	funBody.claxxOwner = clazzThis;
	return addProto(clazzThis.prototype, funName, funBody);
};

/*
 * Define method for the class with the given method name and method
 * body and method parameter signature.
 *
 * @param clazzThis host class in which the method to be defined
 * @param funName method name
 * @param funBody function object, e.g function () { ... }
 * @param rawSig paramether signature, e.g ["string", "number"]
 * @return method of the given name. The method may be funBody or a wrapper
 * of the given funBody.
 */
/* public */

Clazz.saemCount0 = 0 // methods defined        5400 (Ripple.js)
Clazz.saemCount1 = 0 // delegates created       937
Clazz.saemCount2 = 0 // delegates bound         397

Clazz.defineMethod = function (clazzThis, funName, funBody, rawSig) {
    Clazz.saemCount0++;
	if (Clazz.unloadClass) 
    assureInnerClass(clazzThis, funBody);
  rawSig || (rawSig = "");
	funBody.exName = funName;
  funBody.sigs = {};
	var sig = formatSignature(rawSig);
	var proto = clazzThis.prototype;
	var f$ = proto[funName];

  //System.out.println(document.title="sc " + Clazz.saemCount0 + "/" + Clazz.saemCount1 + "/" + Clazz.saemCount2 + " " + clazzThis.__CLASS_NAME__ + " " + funName + sig);

  if (Clazz._Loader._checkLoad)
    checkDuplicate(clazzThis, funName, sig);
	if (!f$ || (f$.claxxOwner === clazzThis && f$.sigs.sig == sig)) {
		// property "sig" will be used as a mark of only-one method
		funBody.sigs.sig = sig;
		funBody.claxxOwner = clazzThis;
		funBody.exClazz = clazzThis; // make it traceable
		return addProto(proto, funName, funBody);
	}

	funBody.exClazz = clazzThis; // make it traceable
  // we have found a duplicate
	var oldFun = null;
	var oldStack = f$.stack;
  var hadStack = (!!oldStack);
	if (!hadStack) {
		/* method is not defined by Clazz.defineMethod () */
		oldFun = f$;
    oldStack = [];
		if (oldFun.claxxOwner) {
			oldStack[0] = oldFun.claxxOwner;
    }
	}
	/*
	 * Method that is already defined in super class will be overridden
	 * with a new proxy method with class hierarchy stored in a stack.
	 * That is to say, the super methods are lost in this class' proxy
	 * method. 
	 * When method are being called, methods defined in the new proxy 
	 * method will be searched through first. And if no method fitted,
	 * it will then try to search method in the super class stack.
	 */
  var doDelegate = (!hadStack || f$.claxxRef !== clazzThis);
  if (doDelegate) {
		//Generate a new delegating method for the class
    var isConstruct = (funName == "construct"); 
    Clazz.saemCount1++;
  	var delegate = function () {    
      var f = findMethod(this, clazzThis, arguments);
      if (f == -1 || f == null)
        return null;
      var args = fixNullParams(arguments);
      return f.apply(this, args); 
    };
  	delegate.claxxRef = clazzThis;
  	delegate.methodName = funName;
    delegate.sigs = {};
    delegate.dsigs = {};
		f$ = addProto(proto, funName, delegate);				
		// Keep the class inheritance stack
		var a = f$.stack = [];
		for (var i = 0; i < oldStack.length; i++)
			a[i] = oldStack[i];
	}
	if (findArrayItem(f$.stack, clazzThis) < 0) 
      f$.stack.push(clazzThis);
	if (!hadStack) {
  	if (oldFun.claxxOwner === clazzThis) {
      setSignature(f$, oldFun, oldFun.sigs.sig);
      delete oldFun.sigs;
			delete oldFun.claxxOwner;
		} else if (!oldFun.claxxOwner) {
      // The function is not defined by Clazz.defineMethod ()
      // For example, .equals(obj)
      // In this case, we assign a "one-parameter; unknown" model, resulting in an automatic fail. 
      // TODO: check the way this works.
      setSignature(f$, oldFun, "\\void");
      f$.sigs.fparams[0] = oldFun;
    }   
	}
  setSignature(f$, funBody, sig);
	return f$;
};                     

var findMethod = function(obj, clazzThis, args) {
  var pTypes = getParamTypes(args);
	var dsig = clazzThis.__CLASS_NAME__ + pTypes.typeString;
  var dsigs = arguments.callee.caller.dsigs; // delegate.dsigs
  var f = dsigs[dsig]; 
  if (!f) {
    Clazz.saemCount2++;
    var claxxRef = arguments.callee.caller.claxxRef;
    var fxName = arguments.callee.caller.methodName;
    var fx = obj[fxName];
	  var f = bindMethod(claxxRef, fx, fxName, args, pTypes);
    dsigs[dsig] = (f == null ? -1 : f);
  }
  return f;
}
Clazz.defineStatics = function(clazz) {
	for (var j = arguments.length, i = (j - 1) / 2; --i >= 0;) {
		var val = arguments[--j]
		var name = arguments[--j];
		clazz[name] = clazz.prototype[name] = val;
	}
};

/**
 * Define the enum constant.
 * @param classEnum enum type
 * @param enumName enum constant
 * @param enumOrdinal enum ordinal
 * @param initialParams enum constant constructor parameters
 */
Clazz.defineEnumConstant = function (clazzEnum, enumName, enumOrdinal, initialParams, clazzEnumExt) {
	var o = (clazzEnumExt ? new clazzEnumExt() : new clazzEnum());
	// BH avoids unnecessary calls to SAEM
	o.$name = enumName;
	o.$ordinal = enumOrdinal;
	//Clazz.superConstructor (o, clazzEnum, [enumName, enumOrdinal]);
	if (initialParams && initialParams.length)
		o.construct.apply(o, initialParams);
	clazzEnum[enumName] = clazzEnum.prototype[enumName] = o;
	if (!clazzEnum["$ values"]) {
		clazzEnum["$ values"] = [] 
		clazzEnum.values = function() { return this["$ values"]; };
	}
	clazzEnum["$ values"].push(o);
};

///////////////////////// public supporting method creation //////////////////////

/**
 * Prepare "callback" for instance of anonymous Class.
 * For example for the callback:
 *     this.callbacks.MyEditor.sayHello();
 *     
 * This is specifically for inner classes that are referring to 
 * outer class methods and fields.   
 *
 * @param objThis the host object for callback
 * @param args arguments object. args[0] will be classThisObj -- the "this"
 * object to be hooked
 * 
 * Attention: parameters should not be null!
 */
Clazz.prepareCallback = function (innerObj, args) {
	var outerObj = args[0];
	//var cbName = "b$"; // "callbacks";
	if (innerObj && outerObj && outerObj !== window) {
    // BH: A major change here -- save the b$ array with the OUTER class,
    //     not the inner class, as it is a property of the outer class and
    //     does not have to be recreated upon every new instance of the inner class.    
    var b = outerObj.$b$;
    if (!b) {
      // BH -- must first transfer the outer class's own callbacks
      b = outerObj.$b$ = appendMap({}, outerObj.b$);        
    	// all references to outer class and its superclass objects must be here as well
  		b[Clazz.getClassName(outerObj, true)] = outerObj;
  		var clazz = Clazz.getClass(outerObj);
  		while (clazz.superClazz)
        b[Clazz.getClassName(clazz = clazz.superClazz, true)] = outerObj;
    }
    innerObj.b$ = b;
	}
	// note that args is an instance of arguments -- NOT an array; does not have the .shift() method!
	for (var i = 0, n = args.length - 1; i < n; i++)
		args[i] = args[i + 1];
	args.length--;
};

/**
 * Construct instance of the given inner class.
 *
 * @param classInner given inner class, alway with name like "*$*"
 * @param innerObj this instance which can be used to call back.
 * @param finalVars final variables which the inner class may use
 * @return the constructed object
 *
 * @see Clazz#cloneFinals
 */
Clazz.innerTypeInstance = function (clazzInner, outerObj, finalVars) {
	if (!clazzInner)
		clazzInner = arguments.callee.caller;
  var n = arguments.length - 3;
  var haveFinals = (finalVars || outerObj.$finals); 
	if (!haveFinals) {
    // actual number of arguments is arguments.length - 3;
		switch (n) {
		case 0:
      // null constructor
			return new clazzInner(outerObj);
		case 1:
      // when arguments[3] === Clazz.inheritArgs (i.e. arguments[3].$J2SNOCREATE$ == true), 
      // we have an inner class that is a subclass of another inner class, 
      // and we are simply creating a new instance, not actually running its constructor 
			return (outerObj.__CLASS_NAME__ == clazzInner.__CLASS_NAME__ 
          && arguments[3].$J2SNOCREATE$ ? outerObj : new clazzInner(outerObj, arguments[3]));
		case 2:
			return new clazzInner(outerObj, arguments[3], arguments[4]);
		case 3:
			return new clazzInner(outerObj, arguments[3], arguments[4], 
					arguments[5]);
		case 4:
			return new clazzInner(outerObj, arguments[3], arguments[4], 
					arguments[5], arguments[6]);
		case 5:
			return new clazzInner(outerObj, arguments[3], arguments[4], 
					arguments[5], arguments[6], arguments[7]);
		case 6:
			return new clazzInner(outerObj, arguments[3], arguments[4], 
					arguments[5], arguments[6], arguments[7], arguments[8]);
		case 7:
			return new clazzInner(outerObj, arguments[3], arguments[4], 
					arguments[5], arguments[6], arguments[7], arguments[8],
					arguments[9]);
		}
	}
	var obj = new clazzInner(outerObj, Clazz.inheritArgs);
  if (haveFinals) {
		// f$ is short for the once-chosen "$finals"
    var of$ = outerObj.f$;
    obj.f$ = (finalVars ? 
      (of$ ? appendMap(appendMap({}, of$), finalVars) : finalVars)
      : of$ ? of$ : null);
  }
	var args = new Array(n);
	for (var i = n; --i >= 0;)
		args[i] = arguments[i + 3];
	Clazz.instantialize(obj, args);
	return obj;
};

/**
 * Clone variables whose modifier is "final".
 * Usage: var o = Clazz.cloneFinals ("name", name, "age", age);
 *
 * @return Object with all final variables
 */
Clazz.cloneFinals = function () {
	var o = {};
	var len = arguments.length / 2;
	for (var i = len; --i >= 0;)
		o[arguments[i + i]] = arguments[i + i + 1];
	return o;
};

Clazz.isClassDefined = function(clazzName) {
	if (!clazzName) 
		return false;		/* consider null or empty name as non-defined class */
	if (Clazz.allClasses[clazzName])
		return true;
	var pkgFrags = clazzName.split (/\./);
	var pkg = null;
	for (var i = 0; i < pkgFrags.length; i++)
		if (!(pkg = (pkg ? pkg[pkgFrags[i]] : Clazz.allPackage[pkgFrags[0]]))) {
			return false;
    }
  return (pkg && (Clazz.allClasses[clazzName] = true));
};

/**
 * Return the class name of the given class or object.
 *
 * @param clazzHost given class or object
 * @return class name
 */
/* public */
Clazz.getClassName = function(obj, fAsClassName) {
	if (obj == null)
		return "NullObject";
	if (obj instanceof CastedNull)
		return obj.clazzName;
	switch(typeof obj) {
	case "number":
		return "n";
	case "boolean":
		return "b";
	case "string":
		// Always treat the constant string as String object.
		// This will be compatiable with Java String instance.
		return "String";
	case "function":
		if (obj.__CLASS_NAME__)
			return (fAsClassName ? obj.__CLASS_NAME__ : "Class"); // user defined class name
		var s = obj.toString();
		var idx0 = s.indexOf("function");
		if (idx0 < 0)
			return (s.charAt(0) == '[' ? extractClassName(s) : s.replace(/[^a-zA-Z0-9]/g, ''));
		var idx1 = idx0 + 8;
		var idx2 = s.indexOf ("(", idx1);
		if (idx2 < 0)
			return "Object";
		s = s.substring (idx1, idx2);
		if (s.indexOf("Array") >= 0)
			return "Array"; 
		s = s.replace (/^\s+/, "").replace (/\s+$/, "");
		return (s == "anonymous" || s == "" ? "Function" : s);
	case "object":
		if (obj.__CLASS_NAME__) // user defined class name
			return obj.__CLASS_NAME__;
		if (!obj.constructor)
			return "Object"; // For HTML Element in IE
		if (!obj.constructor.__CLASS_NAME__) {
			if (obj instanceof Number)
				return "Number";
			if (obj instanceof Boolean)
				return "Boolean";
			if (obj instanceof Array || obj.BYTES_PER_ELEMENT)
				return "Array";
			var s = obj.toString();
      // "[object Int32Array]"
			if (s.charAt(0) == '[')
				return extractClassName(s);
		}
  	return Clazz.getClassName(obj.constructor, true);
	}
  // some new, unidentified class
  return "Object";
};

///////////////////////// private supporting method creation //////////////////////

var appendMap = function(a, b) {
	if (b)
		for (var s in b)
			a[s] = b[s];
  return a;
}

var hashCode = 0;

var NullObject = function () {};

if (supportsNativeObject) {
	Clazz._O = function () {};
	Clazz._O.__CLASS_NAME__ = "Object";
	Clazz._O["getClass"] = function () { return Clazz._O; }; 
} else {
	Clazz._O = Object;
}

var addProto = function(proto, name, func) {
	return proto[name] = func;
};

var extendedObjectMethods = [ "isInstance", "equals", "hashCode", "getClass", 
  "clone", "finalize", "notify", "notifyAll", "wait", "to$tring", "toString" ];


{
  var proto = Clazz._O.prototype;

  addProto(proto, "isInstance", function(c) {
    return Clazz.instanceOf(this, c);
  }),

	addProto(proto, "equals", function (obj) {
		return this == obj;
	});

	addProto(proto, "hashCode", function () {
  
    return this._$hashcode || (this._$hashcode = ++hashCode)

/*  
		try {
			return this.toString ().hashCode ();
		} catch (e) {
			var str = ":";
			for (var s in this) {
				str += s + ":"
			}
			return str.hashCode ();
		}
*/
	});

	addProto(proto, "getClass", function () { return Clazz.getClass (this); });

	addProto(proto, "clone", function () { return Clazz.clone(this); });

	// BH allows @j2sNative access without super constructor
	Clazz.clone = function(me) { return appendMap(new me.constructor(), me); }
/*
 * Methods for thread in Object
 */
	addProto(proto, "finalize", function () {});
	addProto(proto, "notify", function () {});
	addProto(proto, "notifyAll", function () {});
	addProto(proto, "wait", function () {});
	addProto(proto, "to$tring", Object.prototype.toString);
	addProto(proto, "toString", function () { return (this.__CLASS_NAME__ ? "[" + this.__CLASS_NAME__ + " object]" : this.to$tring.apply(this, arguments)); });

}


    
var extendJO = function(c, name) {
	if (name)
		c.__CLASS_NAME__ = c.prototype.__CLASS_NAME__ = name;
    
	if (supportsNativeObject) {

    c.isInstance = function(o) { return Clazz.instanceOf(o, c) };

    
		for (var i = 0; i < extendedObjectMethods.length; i++) {
			var p = extendedObjectMethods[i];
			addProto(c.prototype, p, Clazz._O.prototype[p]);
		}
	}
};

var decorateAsType = function (clazzFun, qClazzName, clazzParent, 
		interfacez, parentClazzInstance, inheritClazzFuns, _decorateAsType) {
 	extendJO(clazzFun, qClazzName);
	clazzFun.equals = inF.equals;
	clazzFun.getName = inF.getName;
	if (inheritClazzFuns)
		for (var i = innerNames.length, name; --i >= 0;)
			clazzFun[name = innerNames[i]] = inF[name];
  if (clazzParent)
		inheritClass(clazzFun, clazzParent);
	if (interfacez)
		implementOf(clazzFun, interfacez);
	return clazzFun;
};

var getParamTypes = function (args) {
	// bh: optimization here for very common cases
	var n = args.length;
	switch (n) {
	case 0:
		var params = ["void"];
		params.typeString = "\\void";
		return params;
	case 1:
	  // BH just so common
    switch (typeof args[0]) {
    case "number":
  		var params = ["n"];
			params.typeString = "\\n";
			return params;
    case "boolean":
  		var params = ["b"];
			params.typeString = "\\b";
			return params;
		}
	}
  var pTypes = new Array(n);
	for (var i = 0; i < n; i++)
		pTypes[i] = Clazz.getClassName(args[i]);
	pTypes.typeString = "\\" + pTypes.join ('\\');
	return pTypes;
};

/**
 * replace arguments casted as null with actual null
 *  
 */
var fixNullParams = function(args) {
  var n = args.length;
	var bits = 0;
  for (var i = 0; i < n; i++) {
		if (args[i] instanceof CastedNull)
      bits |= (1 << i);
	}
	if (!bits)
    return args;
	var params = Array(n);
	for (var k = n; --k >= 0;)
		params[k] = (bits & (1 << k) ? null : args[k]);
  return params;
}

var setSignature = function(f$, funBody, sig) {
  var params = sig.substring(1).split("\\");
  var nparams = params.length;
  if (!f$.sigs)
    f$.sigs = {};
  if (!f$.sigs.fparams)
    f$.sigs.fparams = [];
  if (!f$.sigs.fparams[nparams])
    f$.sigs.fparams[nparams] = [];
  delete f$.sigs.sig;
  f$.sigs.fparams[nparams].push([funBody, params]);
  //System.out.println("** " + f$.name + " " + sig);
}

var extractClassName = function(clazzStr) {
	// [object Int32Array]
	var clazzName = clazzStr.substring (1, clazzStr.length - 1);
	return (clazzName.indexOf("Array") >= 0 ? "Array" // BH -- for Float64Array and Int32Array
		: clazzName.indexOf ("object ") >= 0 ? clazzName.substring (7) // IE
		: clazzName);
}

/**
 * A substantially modified search for the appropriate function prototype, 
 * find the method with the same method name and the same parameter signatures
 * or the best-fit parameter section signature.
 *  
 * The only real way to avoid this is to
 * 
 * 1) use @j2sOverrideSuperConstructor, but this is highly illadvised, since
 *    doing that also (I think) precludes field preparation
 * 2) don't overload functions with the same name but different signatures
 *
 * @param claxxRef the current host object's class
 * @param fx the delegate function?  
 * @param fxName the method name
 * @param args the given arguments
 * @param pTypes the array of parameter types from getParamTypes()
 * @return the function to apply,
 * the return maybe void.
 * @throws MethodNotFoundException if no matched method is found
 */
var bindMethod = function (claxxRef, fx, fxName, args, pTypes) {
  var nparams = pTypes.length; // never 0; (void) counts as 1

 //System.out.println("SAEM " + Clazz.saemCount1+ "/" + Clazz.saemCount2 + ":" + claxxRef.__CLASS_NAME__ + "." + fxName + "(" + params.join(",") + ")");
 
	_profile && addProfile(claxxRef, fxName, pTypes);
  
  var f = null;

	var stack = fx.stack || claxxRef.prototype[fxName].stack;

	/*
	 * Search the inheritance stack, starting with the class containing this method
	 */
	for (var pt= -1, i = stack.length; --i >= 0;) {
    // skip stack references higher than this class
		if (claxxRef == null || stack[i] === claxxRef) {
			var clazzFun = stack[i].prototype[fxName];
      var sigs = clazzFun.sigs;
      if (sigs.sig)
        setSignature(clazzFun, clazzFun, sigs.sig);
      var found = sigs.fparams[nparams];  // [[$f, ["string","int","int"]]]
      if (found && (pt = searchMethod(found, pTypes)) >= 0)
        return found[pt][0];
    	// As there are no such methods in current class,  
      // search its super class stack -- stop checking for the class
			claxxRef = null; 
		}
	}  
  return f;
};

/**
 * Search the existed polymorphic methods to get the matched method with
 * the given parameter types.
 *
 * @param existedMethods Array of string which contains method parameters
 * @param paramTypes Array of string that is parameter type.
 * @return string of method parameters seperated by "\\"
 */
/* private */
var searchMethod = function(roundOne, paramTypes, debug) {
// roundOne -  [[f$,["string","int","int"...]...]
// Filter out all the fitted methods for the given parameters
	var roundTwo = [];
	var len = roundOne.length;
	for (var i = 0; i < len; i++) {
		var fittedLevel = [];
		var isFitted = true;
    var params = roundOne[i][1];
		var len2 = params.length;
		for (var j = 0; j < len2; j++) {
			fittedLevel[j] = getInheritedLevel(paramTypes[j], 
					params[j], true, true);
      //if (debug)alert([paramTypes[j],fittedLevel[j],roundOne[i][j]])    
			if (fittedLevel[j] < 0) {
				isFitted = false;
				break;
			}
		}
		if (isFitted) {
			fittedLevel[paramTypes.length] = i; // Keep index for later use
			roundTwo.push(fittedLevel);
		}
	}
	if (roundTwo.length == 0)
		return -1;
	// Find out the best method according to the inheritance.
	var resultTwo = roundTwo;
	var min = resultTwo[0];
	for (var i = 1; i < resultTwo.length; i++) {
		var isVectorLesser = true;
		for (var j = 0; j < paramTypes.length; j++) {
			if (min[j] < resultTwo[i][j]) {
				isVectorLesser = false;;
				break;
			}
		}
		if (isVectorLesser)
			min = resultTwo[i];
	}
	var index = min[paramTypes.length]; // Get the previously stored index
	/*
	 * Return the method parameters' type string as indentifier of the
	 * choosen method.
	 */
	return index;
};

Clazz.saemCount3 = 0 // getInheritedLevels started      
Clazz.saemCount4 = 0 // getInheritedLevels checked

var getInheritedLevel = function (clazzTarget, clazzBase, isTgtStr, isBaseStr) {
	if (clazzTarget === clazzBase)
		return 0;
//	var isTgtStr = (typeof clazzTarget == "string");
	if (isTgtStr && ("void" == clazzTarget || "unknown" == clazzTarget))
		return -1;
//	var isBaseStr = (typeof clazzBase == "string");
	if (isBaseStr && ("void" == clazzBase || "unknown" == clazzBase))
		return -1;
	if (clazzTarget === (isTgtStr ? "NullObject" : NullObject)) {
		switch (clazzBase) {
    case "n":
    case "b":
      return -1;
		case Number:
		case Boolean:
		case NullObject:
			break;
		default:
			return 0;
		}
	}  
  
	if (isTgtStr)
		clazzTarget = evalType(clazzTarget);
	if (isBaseStr)
		clazzBase = evalType(clazzBase);
	if (!clazzBase || !clazzTarget)
		return -1;
  
	var level = 0;
	var zzalc = clazzTarget; // zzalc <--> clazz
	while (zzalc !== clazzBase && level < 10) {
		/* maybe clazzBase is interface */
		if (zzalc.implementz) {
			var impls = zzalc.implementz;
			for (var i = 0; i < impls.length; i++) {
				var implsLevel = equalsOrExtendsLevel (impls[i], clazzBase);
				if (implsLevel >= 0)
					return level + implsLevel + 1 + (clazzBase.$$INT$$ == clazzBase ? -0.2 : 0);
			}
		}
		zzalc = zzalc.superClazz;
		if (!zzalc)
			return (clazzBase === Object || clazzBase === Clazz._O ? 
				// getInheritedLevel(String, CharSequence) == 1
				// getInheritedLevel(String, Object) == 1.5
				// So if both #test(CharSequence) and #test(Object) existed,
				// #test("hello") will correctly call #test(CharSequence)
				// instead of #test(Object).
				level + 1.5 // 1.5! Special!
			: -1);
		level++;
	}
	return level;
};

var evalType = function (typeStr, isQualified) {
	var idx = typeStr.lastIndexOf(".");
	if (idx != -1) {
		var pkgName = typeStr.substring (0, idx);
		var pkg = Clazz.declarePackage (pkgName);
		var clazzName = typeStr.substring (idx + 1);
		return pkg[clazzName];
	} 
	if (isQualified)
		return window[typeStr];
	switch (typeStr) {
	case "string":
		return String;
	case "number":
		return Number;
  case "object":
		return Clazz._O;
	case "boolean":
		return Boolean;
	case "function":
		return Function;
  case "void":
  case "undefined":
  case "unknown":
		return typeStr;
	case "NullObject":
		return NullObject;
	default:
		return window[typeStr];
	}
};

var equalsOrExtendsLevel = function (clazzThis, clazzAncestor) {
	if (clazzThis === clazzAncestor)
		return 0;
	if (clazzThis.implementz) {
		var impls = clazzThis.implementz;
		for (var i = 0; i < impls.length; i++) {
			var level = equalsOrExtendsLevel (impls[i], clazzAncestor);
			if (level >= 0) {
				return level + 1;
        }
		}
	}
	return -1;
};

var checkDuplicate = function(clazzThis, funName, fpName) {
	var proto = clazzThis.prototype;
	var f$ = proto[funName];
  if (f$ && (f$.claxxOwner || f$.claxxRef) === clazzThis) {
    key = clazzThis.__CLASS_NAME__ + "." + funName + fpName;
    var m = Clazz.duplicatedMethods[key];
    if (m) {
      var s = "Warning! Duplicate method found for " + key;
      System.out.println(s);
      Clazz.alert(s);
      Clazz.duplicatedMethods[key] = m + 1; 
    } else {
      Clazz.duplicatedMethods[key] = 1;
    }
  }
}

var findArrayItem = function(arr, item) {
	if (arr && item)
		for (var i = arr.length; --i >= 0;)
			if (arr[i] === item)
				return i;
	return -1;
}

var formatSignature = function (rawSig) {
	return (rawSig ? rawSig.replace (/~([NABSO])/g, 
      function ($0, $1) {
      	switch ($1) {
      	case 'N':
      		return "n";
      	case 'B':
      		return "b";
      	case 'S':
      		return "String";
      	case 'O':
      		return "Object";
      	case 'A':
      		return "Array";
      	}
      	return "Unknown";
      }).replace (/\s+/g, "").replace (/^|,/g, "\\").replace (/\$/g, "org.eclipse.s") : "\\void");
};

/**
 * Implementation of Java's keyword "implements".
 * As in JavaScript there are on "implements" keyword implemented, a property
 * of "implementz" is added to the class to record the interfaces the class
 * is implemented.
 * 
 * @param clazzThis the class to implement
 * @param interfacez Array of interfaces
 */
var implementOf = function (clazzThis, interfacez) {
	if (arguments.length >= 2) {
		if (!clazzThis.implementz)
			clazzThis.implementz = [];
		var impls = clazzThis.implementz;
		if (arguments.length == 2) {
			if (typeof interfacez == "function") {
				impls.push(interfacez);
				copyProperties(clazzThis, interfacez);
			} else if (interfacez instanceof Array) {
				for (var i = 0; i < interfacez.length; i++) {
					impls.push(interfacez[i]);
					copyProperties(clazzThis, interfacez[i]);
				}
			}
		} else {
			for (var i = 1; i < arguments.length; i++) {
				impls.push(arguments[i]);
				copyProperties(clazzThis, arguments[i]);
			}
		}
	}
};

Clazz.extendInterface = implementOf;

/*
 * BH Clazz.getProfile monitors exactly what is being delegated with SAEM,
 * which could be a bottle-neck for function calling.
 * This is critical for performance optimization.
 */ 

var __signatures = ""; 

var addProfile = function(c, f, p, id) {
	var s = c.__CLASS_NAME__ + " " + f + " ";// + JSON.stringify(p);
  if (__signatures.indexOf(s) < 0)
    __signatures += s + "\n";    
	_profile[s] || (_profile[s] = 0);
	_profile[s]++;
}

/////////////////////// inner function support /////////////////////////////////

/**
 * Once there are other methods registered to the Function.prototype, 
 * those method names should be add to the following Array.
 */
/*
 * static final member of interface may be a class, which may
 * be function.
 */

var innerNames = [
	"equals", "hashCode", /*"toString",*/ 
  "getName", "getCanonicalName", "getClassLoader", "getResource", 
  "getResourceAsStream", "defineMethod", "defineStaticMethod",
	"makeConstructor",  
    "getSuperclass", "isAssignableFrom", 
    "getConstructor", 
    "getDeclaredMethod", "getDeclaredMethods",
    "getMethod", "getMethods",   
		"getModifiers", /*"isArray",*/ "newInstance"
];
    
/*
 * Static methods
 */
var inF = {
	/*
	 * Similar to Object#equals
	 */
   
	equals : function (aFun) {
		return this === aFun;
	},

	hashCode : function () {
		return this.getName ().hashCode ();
	},

	toString : function () {
		return "class " + this.getName ();
	},

	/*
	 * Similar to Class#getName
	 */
	getName : function () {
		return Clazz.getClassName (this, true);
	},
	getCanonicalName : function () {
		return this.__CLASS_NAME__;
	},
	getClassLoader : function () {
		var clazzName = this.__CLASS_NAME__;
		var baseFolder = Clazz._Loader.getClasspathFor(clazzName);
		var x = baseFolder.lastIndexOf (clazzName.replace (/\./g, "/"));
		if (x != -1) {
      x = baseFolder.lastIndexOf("/"); // BH FIX
			baseFolder = baseFolder.substring (0, x);
		} else {
			baseFolder = Clazz._Loader.getClasspathFor(clazzName, true);
		}
		var loader = Clazz._Loader.requireLoaderByBase(baseFolder);
		loader.getResourceAsStream = inF.getResourceAsStream;
		loader.getResource = inF.getResource; // BH
		return loader;
	},

	getResource : function(name) {
		var stream = this.getResourceAsStream(name);
    return (stream ? stream.url : null);
	},

	getResourceAsStream : function(name) {
		if (!name)
			return null;
		name = name.replace (/\\/g, '/');
		var baseFolder = null;
    var fname = name;
		var clazzName = this.__CLASS_NAME__;
		if (arguments.length == 2 && name.indexOf ('/') != 0) { // additional argument
			name = "/" + name;
		}
		if (name.indexOf ('/') == 0) {
			//is.url = name.substring (1);
			if (arguments.length == 2) { // additional argument
				baseFolder = arguments[1];
				if (!baseFolder)
					baseFolder = Clazz.binaryFolders[0];
			} else if (Clazz._Loader) {
				baseFolder = Clazz._Loader.getClasspathFor(clazzName, true);
			}
			if (!baseFolder) {
				fname = name.substring (1);
			} else {
				baseFolder = baseFolder.replace (/\\/g, '/');
				var length = baseFolder.length;
				var lastChar = baseFolder.charAt (length - 1);
				if (lastChar != '/') {
					baseFolder += "/";
				}
				fname = baseFolder + name.substring (1);
			}
		} else {
			if (this.base) {
				baseFolder = this.base;
			} else if (Clazz._Loader) {
				baseFolder = Clazz._Loader.getClasspathFor(clazzName);
				var x = baseFolder.lastIndexOf (clazzName.replace (/\./g, "/"));
				if (x != -1) {
					baseFolder = baseFolder.substring (0, x);
				} else {
					//baseFolder = null;
					var y = -1;
					if (baseFolder.indexOf (".z.js") == baseFolder.length - 5
							&& (y = baseFolder.lastIndexOf ("/")) != -1) {
						baseFolder = baseFolder.substring (0, y + 1);
						var pkgs = clazzName.split (/\./);
						for (var k = 1; k < pkgs.length; k++) {
							var pkgURL = "/";
							for (var j = 0; j < k; j++) {
								pkgURL += pkgs[j] + "/";
							}
							if (pkgURL.length > baseFolder.length) {
								break;
							}
							if (baseFolder.indexOf (pkgURL) == baseFolder.length - pkgURL.length) {
								baseFolder = baseFolder.substring (0, baseFolder.length - pkgURL.length + 1);
								break;
							}
						}
					} else {
						baseFolder = Clazz._Loader.getClasspathFor(clazzName, true);
					}
				}
			} else {
				var bins = Clazz.binaryFolders;
				if (bins && bins.length) {
					baseFolder = bins[0];
				}
			}
			if (!baseFolder)
				baseFolder = "j2s/";
			baseFolder = baseFolder.replace (/\\/g, '/');
			var length = baseFolder.length;
			var lastChar = baseFolder.charAt (length - 1);
			if (lastChar != '/') {
				baseFolder += "/";
			}
			if (this.base) {
				fname = baseFolder + name;
			} else {
				var idx = clazzName.lastIndexOf ('.');
				if (idx == -1 || this.base) {
					fname = baseFolder + name;
				} else {
					fname = baseFolder + clazzName.substring (0, idx)
							.replace (/\./g, '/') +  "/" + name;
				}
			}            
		}
    var url = null;
    try {
      if (fname.indexOf(":/") < 0) {
        var d = document.location.href.split("?")[0].split("/");
        d[d.length - 1] = fname;
        fname = d.join("/");
      }
      url = new java.net.URL(fname);
    } catch (e) {
    }
		var data = (url == null ? null : J2S._getFileData(fname.toString()));
    if (!data || data == "error" || data.indexOf("[Exception") == 0)
      return null;
    var bytes = new java.lang.String(data).getBytes();      
    var is = new java.io.BufferedInputStream ( new java.io.ByteArrayInputStream (bytes)); 
    is.url = url;
		return is;
	},
  
  getSuperclass : function() { return this.superClazz; },

  isAssignableFrom : function(clazz) {	return getInheritedLevel (clazz, this) >= 0;	},

  getConstructor : function(paramTypes) { return new java.lang.reflect.Constructor (this, paramTypes || [], [], java.lang.reflect.Modifier.PUBLIC);},
/**
 * TODO: fix bug for polymorphic methods!
 */
  getMethods : function() {
  	var ms = [];
  	var p = this.prototype;
  	for (var attr in p) {
  		if (typeof p[attr] == "function" && !p[attr].__CLASS_NAME__) {
  			/* there are polynormical methods. */
  			ms.push(new java.lang.reflect.Method (this, attr,
  					[], java.lang.Void, [], java.lang.reflect.Modifier.PUBLIC));
  		}
  	}
  	p = this;
  	for (var attr in p) {
  		if (typeof p[attr] == "function" && !p[attr].__CLASS_NAME__) {
  			ms.push(new java.lang.reflect.Method (this, attr,
  					[], java.lang.Void, [], java.lang.reflect.Modifier.PUBLIC
  					| java.lang.reflect.Modifier.STATIC));
  		}
  	}
  	return ms;
  },

  getMethod : function(name, paramTypes) {
  	var p = this.prototype;
  	for (var attr in p) {
  		if (name == attr && typeof p[attr] == "function" 
  				&& !p[attr].__CLASS_NAME__) {
  			/* there are polynormical methods. */
  			return new java.lang.reflect.Method (this, attr,
  					paramTypes, java.lang.Void, [], java.lang.reflect.Modifier.PUBLIC);
  		}
  	}
  	p = this;
  	for (var attr in p) {
  		if (name == attr && typeof p[attr] == "function" 
  				&& !p[attr].__CLASS_NAME__) {
  			return new java.lang.reflect.Method (this, attr,
  					paramTypes, java.lang.Void, [], java.lang.reflect.Modifier.PUBLIC
  					| java.lang.reflect.Modifier.STATIC);
  		}
  	}
  	return null;
  },

  getModifiers : function() { return java.lang.reflect.Modifier.PUBLIC; },

  newInstance : function(a) {
  	var clz = this;
    allowImplicit = false;
    var c = null;
    switch(a == null ? 0 : a.length) {
    case 0:
      c = new clz();
      break;
    case 1:
    	c = new clz(a[0]);
      break;
    case 2:
    	c = new clz(a[0], a[1]);
      break;
    case 3:
      c = new clz(a[0], a[1], a[2]);
      break;
    case 4:
      c = new clz(a[0], a[1], a[2], a[3]);
      break;
    default:
      var x = "new " + clz.__CLASS_NAME__ + "(";
      for (var i = 0; i < a.length; i++)
       x += (i == 0 ? "" : ",") + "a[" + i + "]";
      x += ")";
      c = eval(x);
    }
    allowImplicit = true;
    return c;
  }
};

inF.getDeclaredMethods = inF.getMethods;
inF.getDeclaredMethod = inF.getMethod;
 
for (var i = innerNames.length, name; --i >= 0;)
	Clazz._O[name = innerNames[i]] = Array[name] = inF[name];

/*
 * Copy members of interface
 */
/* private */
var copyProperties = function(clazzThis, clazzSuper) {
	for (var o in clazzSuper)
		if (o != "b$" 
				&& o != "prototype" && o != "superClazz"
				&& o != "__CLASS_NAME__" && o != "implementz"
				&& (typeof clazzSuper[o] != "function" || !checkInnerFunction(clazzSuper, o)))
			clazzThis[o] = clazzThis.prototype[o] = clazzSuper[o];
};

/* private */
var checkInnerFunction = function (hostSuper, funName) {
	for (var k = innerNames.length; --k >= 0;)
		if (funName == innerNames[k] && 
				inF[funName] === hostSuper[funName])
			return true;
	return false;
};

//////////////////////////////// public method execution /////////////////////////

/**
 * API for Java's casting null.
 * @see Clazz.CastedNull
 *
 * @param asClazz given class
 * @return an instance of class Clazz.CastedNull
 */
/* public */
Clazz.castNullAs = function (asClazz) {
	return new CastedNull (asClazz);
};


/**
 * Implements Java's keyword "instanceof" in JavaScript's way.
 * As in JavaScript part of the object inheritance is implemented in only-
 * JavaScript way.
 *
 * @param obj the object to be tested
 * @param clazz the class to be checked
 * @return whether the object is an instance of the class
 */
/* public */
Clazz.instanceOf = function (obj, clazz) {
  if (obj == null)
    return false    
  // allows obj to be a class already, from arrayX.getClass().isInstance(y)
	return (obj != null && clazz && (obj == clazz || obj instanceof clazz || getInheritedLevel(Clazz.getClassName(obj), clazz, true) >= 0));
};

Clazz._superCount0 = 0;
Clazz._superCount1 = 0;

/**
 * Call constructor of the superclass from within a class's constructor. 
 * The same effect as Java's expression: 
 * <code> super (a,b,c) </code>
 */
/* public */
Clazz.superConstructor = function (objThis, clazzThis, args) {
  if (clazzThis == null) {
   // SwingJS insertion
    clazzThis = objThis;
  } else {
    var f = arguments.callee.caller.exMeth;
    if (f) {
      // Note that this function may be null. It is created in superCall.
      f != -1 && f(objThis, args);
      Clazz._superCount0++
    } else {
      Clazz._superCount1++
    	f = Clazz.superCall(objThis, clazzThis, "construct", args, true);
      f && f.apply(objThis, args)
    }
  }
  var p = Clazz._preps[clazzThis.__CLASS_NAME__];
  p && p.apply(objThis, []);
};

/**
 * Call super method of the class. 
 * The same effect as Java's expression:
 * <code> super.* () </code>
 * 
 * @param objThis host object
 * @param clazzThis class of declaring method scope. It's hard to determine 
 * which super class is right class for "super.*()" call when it's in runtime
 * environment. For example,
 * 1. ClasssA has method #run()
 * 2. ClassB extends ClassA overriding method #run() with "super.run()" call
 * 3. ClassC extends ClassB
 * 4. objC is an instance of ClassC
 * Now we have to decide which super #run() method is to be invoked. Without
 * explicit clazzThis parameter, we only know that objC.getClass() is ClassC 
 * and current method scope is #run(). We do not known we are in scope 
 * ClassA#run() or scope of ClassB#run(). if ClassB is given, Clazz can search
 * all super methods that are before ClassB and get the correct super method.
 * This is the reason why there must be an extra clazzThis parameter.
 * @param funName method name to be called
 * @param args Array of method parameters
 */
/* public */
 
Clazz._supercallMsg = "";

Clazz.superCall = function (objThis, clazzThis, funName, args, isConstruct) {
	var fx = null;
	var i = -1;
  
  // this next code block sets both fx and i
      
	var clazzFun = objThis[funName];
	if (clazzFun) {
		if (clazzFun.claxxOwner) { 
			// claxxOwner is a mark for methods that is single.
			if (clazzFun.claxxOwner !== clazzThis) {
				// This is a single method in a superclass, call directly!
				fx = clazzFun;
			} else if (!isConstruct || !allowImplicit) { 
        // The developer or compiler has labeled as "overrideMethod" a method xxx() that utilizes super.xxx().
        // Check the super class to see if a function by this name exists and use it. 
        // Save the found function on a stack to speed processing later.
        var superFuncs = clazzThis.superfuncs || (clazzThis.superfuncs = []);
        if ((fx = superFuncs[funName]) == null) {
          var sc = clazzThis.superClazz; 
          fx = sc && sc.prototype && sc.prototype[funName];
          var msg = "\n!!!! j2sSwingJS Clazz.overrideMethod+superCall() found for " + clazzThis.__CLASS_NAME__ + "." + funName;
          System.out.println(msg); 
          Clazz._supercallMsg += msg;
        } 
        if (fx && fx.stack)
          fx = fx.stack[fx.stack.length - 1].prototype[funName];
        superFuncs[funName] = fx;
      }
		} else if (!clazzFun.stack) { // super.toString
			fx = clazzFun;
		} else { // normal wrapped method
			var stack = clazzFun.stack;
			for (i = stack.length; --i >= 0;) {
				/*
				 * Once super call is computed precisely, there are no need 
				 * to calculate the inherited level but just an equals
				 * comparision
				 */
				if (clazzThis === stack[i]) { // level == 0
					break;
				} else if (getInheritedLevel(clazzThis, stack[i]) > 0) {
          i++;        
					break;
				}
			}
      switch(i) {
      case -1:
        break;
      case 0:
        // called by a class that has a Clazz.superConstructor call but actually
        // no superconstructor. -- sun.SunToolkit, javax.swing.border.EmptyBorder
        // TODO: test with ... extends Integer
				fx = stack[0].prototype[funName];
        fx = (fx.sigs.fparams ? fx.sigs.fparams[0] : null); // unknown or null
        break;
      default:                                              
				fx = stack[--i].prototype[funName];
        break;        
      }                  
		}
	}
	/* there are members which are initialized out of the constructor */
	if (isConstruct && (fx || allowImplicit)) {
    var preps = [];
    if (i == 0) {
      // we must make sure that all fields are prepared for all 
      // abstract superclasses of this class. See javax.swing.DefaultComboBoxModel
      // this is regardless of whether the class itself has a constructor or not.
  		var ss = clazzFun.stack;
      if (ss) {
        var c = ss[0];
        do {
          fp = Clazz._preps[c.__CLASS_NAME__];
          if (fp)
            preps.push(fp);
        } while (c = c.superClazz);
      }
    }
    if (fx == null && preps.length == 0) {
      arguments.callee.caller.caller.exMeth = -1;
      return null;
    }
    arguments.callee.caller.caller.exMeth = function(objThis, args) {
      for (var i = preps.length; --i >= 0;)
        preps[i].apply(objThis, []);
      return (fx ? fx.apply(objThis, args || []) : null);
    };
    for (var i = preps.length; --i >= 0;)
      preps[i].apply(objThis, []);
	} else if (!fx) {
    allowImplicit = true;
    var pTypes = getParamTypes(args).typeString;
		Clazz.alert (["j2sSwingJS","no class found",pTypes])
		newMethodNotFoundException(clazzThis, funName, pTypes);	
  }
	return (isConstruct ? fx : fx ? fx.apply(objThis, args || []) : null);
};


//////////////////////////////// private method execution /////////////////////////

var allowImplicit = true; // set false in Class.newInstance()
/**
 * Class for null with a given class as to be casted.
 * This class will be used as an implementation of Java's casting way.
 * For example,
 * <code> this.call ((String) null); </code>
 */
/* public */
var CastedNull = function (asClazz) {
	if (asClazz) {
		if (asClazz instanceof String) {
			this.clazzName = asClazz;
		} else if (asClazz instanceof Function) {
			this.clazzName = Clazz.getClassName (asClazz, true);
		} else {
			this.clazzName = "" + asClazz;
		}
	} else {
		this.clazzName = "Object";
	}
	this.toString = function () {
		return null;
	};
	this.valueOf = function () {
		return null;
	};
};


/////////////////////////// Exception handling ////////////////////////////

/*
 * Use to mark that the Throwable instance is created or not.
 * 
 * Called from java.lang.Throwable, as defined in JSmolJavaExt.js
 * 
 * The underscore is important - it tells the JSmol ANT task to NOT 
 * turn this into Clazz_initializingException, because coreBottom2.js does 
 * not include that call, and so Google Closure Compiler does not minify it.
 *        
 */
/* public */
Clazz._initializingException = false;

/**
 * BH: used in Throwable
 *  
 */  
/* public */
Clazz._callingStackTraces = [];

/** 
 * MethodException will be used as a signal to notify that the method is
 * not found in the current clazz hierarchy.
 */
/* private */
var MethodException = function () {
	this.toString = function () {
		return "j2s MethodException";
	};
};
/* private */
//var MethodNotFoundException = function () {
//	this.toString = function () {
//		return "j2s MethodNotFoundException";
//	};
//};

  var _isNPEExceptionPredicate;

;(function() { 
  /* sgurin: native exception detection mechanism. Only NullPointerException detected and wrapped to java excepions */
  /** private utility method for creating a general regexp that can be used later  
   * for detecting a certain kind of native exceptions. use with error messages like "blabla IDENTIFIER blabla"
   * @param msg String - the error message
   * @param spliterName String, must be contained once in msg
   * spliterRegex String, a string with the regexp literal for identifying the spitter in exception further error messages.
   */
  // reproduce NullPointerException for knowing how to detect them, and create detector function Clazz._isNPEExceptionPredicate
  var $$o$$ = null;
  
  try {
  	$$o$$.hello();
  } catch (e) {
    var _ex_reg = function(msg, spliterName, spliterRegex) {
    	if(!spliterRegex) 
    		spliterRegex="[^\\s]+";	
    	var idx = msg.indexOf (spliterName), 
    		str = msg.substring (0, idx) + spliterRegex + msg.substring(idx + spliterName.length), 
    		regexp = new RegExp("^"+str+"$");
    	return regexp;
    };
  	if(/Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {// opera throws an exception with fixed messages like "Statement on line 23: Cannot convert undefined or null to Object Backtrace: Line....long text... " 
  		var idx1 = e.message.indexOf(":"), idx2 = e.message.indexOf(":", idx1+2);
  		var _NPEMsgFragment = e.message.substr(idx1+1, idx2-idx1-20);
  		_isNPEExceptionPredicate = function(e) { return e.message.indexOf(_NPEMsgFragment)!=-1; };
  	}	else if(navigator.userAgent.toLowerCase().indexOf("webkit")!=-1) { //webkit, google chrome prints the property name accessed. 
  		var _exceptionNPERegExp = _ex_reg(e.message, "hello");
  		_isNPEExceptionPredicate = function(e) { return _exceptionNPERegExp.test(e.message); };
  	}	else {// ie, firefox and others print the name of the object accessed: 
  		var _exceptionNPERegExp = _ex_reg(e.message, "$$o$$");
  		_isNPEExceptionPredicate = function(e) { return _exceptionNPERegExp.test(e.message); };
  	}		
  };
})();

/**sgurin
 * Implements Java's keyword "instanceof" in JavaScript's way **for exception objects**.
 * 
 * calls Clazz.instanceOf if e is a Java exception. If not, try to detect known native 
 * exceptions, like native NullPointerExceptions and wrap it into a Java exception and 
 * call Clazz.instanceOf again. if the native exception can't be wrapped, false is returned.
 * 
 * @param obj the object to be tested
 * @param clazz the class to be checked
 * @return whether the object is an instance of the class
 * @author: sgurin
 */
Clazz.exceptionOf = function(e, clazz) {
	if(e.__CLASS_NAME__)
		return Clazz.instanceOf(e, clazz);
  if (!e.getMessage) {
    e.getMessage = function() {return "" + this};
  }
  if (!e.printStackTrace) {
    e.printStackTrace = function(){};
    alert(e + " try/catch path:" + Clazz.getStackTrace(-10));
  }
	if(clazz == Error) {
		if (("" + e).indexOf("Error") < 0)
      return false;
		System.out.println (Clazz.getStackTrace());
    return true;
		// everything here is a Java Exception, not a Java Error
	}
	return (clazz == Exception || clazz == Throwable
		|| clazz == NullPointerException && _isNPEExceptionPredicate(e));
};

/**
 * BH need to limit this, as JavaScript call stack may be recursive
 */ 
Clazz.getStackTrace = function(n) {
	n || (n = 25);
  // updateNode and updateParents cause infinite loop here
	var s = "\n";
	var c = arguments.callee;
  var showParams = (n < 0);
  if (showParams)
    n = -n;
	for (var i = 0; i < n; i++) {
		if (!(c = c.caller))
      break;
    var sig = (c.toString ? c.toString().substring(0, c.toString().indexOf("{")) : "<native method>");
		s += i + " " + (c.exName ? (c.claxxOwner ? c.claxxOwner.__CLASS_NAME__ + "."  : "") + c.exName  + sig.replace(/function /,""): sig) + "\n";
		if (c == c.caller) {
      s += "<recursing>\n";
      break;
    }
    if (showParams) {
      var args = c.arguments;
      for (var j = 0; j < args.length; j++) {
        var sa = "" + args[j];
        if (sa.length > 60)
          sa = sa.substring(0, 60) + "...";
        s += " args[" + j + "]=" + sa.replace(/\s+/g," ") + "\n";
      }
    }
	}
	return s;
}

////////////////////////////////// package loading ///////////////////////

/*
 * all root packages. e.g. java.*, org.*, com.*
 */
Clazz.allPackage = {};

/**
 * Will be used to keep value of whether the class is defined or not.
 */
Clazz.allClasses = {};

Clazz.lastPackageName = null;
Clazz.lastPackage = null;

var unloadedClasses = [];

/* public */
Clazz.declarePackage = function (pkgName) {
	if (Clazz.lastPackageName == pkgName || !pkgName || pkgName.length == 0)
		return Clazz.lastPackage;
	var pkgFrags = pkgName.split (/\./);
	var pkg = Clazz.allPackage;
	for (var i = 0; i < pkgFrags.length; i++) {
    var a = pkgFrags[i];
		if (!pkg[a]) {
			pkg[a] = {	__PKG_NAME__ : (pkg.__PKG_NAME__ ? pkg.__PKG_NAME__ + "." + a : a) }
			if (i == 0) {
				// window[a] = ...
				Clazz.setGlobal(a, pkg[a]);
			}
		}
		pkg = pkg[a]
	}
	Clazz.lastPackageName = pkgName;
	return Clazz.lastPackage = pkg;
};

/**
 * Define a class or interface.
 *
 * @param qClazzName String presents the qualified name of the class
 * @param clazzFun Function of the body
 * @param clazzParent Clazz to inherit from, may be null
 * @param interfacez Clazz may implement one or many interfaces
 *   interfacez can be Clazz object or Array of Clazz objects.
 * @return Ruturn the modified Clazz object
 */
/* public */
Clazz.defineType = function (qClazzName, clazzFun, clazzParent, interfacez) {
	if (unloadedClasses[qClazzName])
		clazzFun = unloadedClasses[qClazzName];
	var idx = qClazzName.lastIndexOf (".");
	if (idx != -1) {
		var pkgName = qClazzName.substring (0, idx);
		var pkg = Clazz.declarePackage(pkgName);
		var clazzName = qClazzName.substring (idx + 1);
		if (pkg[clazzName]) {
			// already defined! Should throw exception!
			return pkg[clazzName];
		}
		pkg[clazzName] = clazzFun;
	} else {
		if (window[qClazzName]) {
			// already defined! Should throw exception!
			return window[qClazzName];
		}
		Clazz.setGlobal(qClazzName, clazzFun);
	}
	decorateAsType(clazzFun, qClazzName, clazzParent, interfacez);
	/*# {$no.javascript.support} >>x #*/
	clazzFun.defineMethod = inF.defineMethod;
	clazzFun.defineStaticMethod = inF.defineStaticMethod;
	clazzFun.makeConstructor = inF.makeConstructor;
	/*# x<< #*/
	return clazzFun;
};

var isSafari = (navigator.userAgent.indexOf ("Safari") != -1);
var isSafari4Plus = false;
if (isSafari) {
	var ua = navigator.userAgent;
	var verIdx = ua.indexOf("Version/");
	if (verIdx  != -1) {
		var verStr = ua.substring(verIdx + 8);
		var verNumber = parseFloat(verStr);
		isSafari4Plus = verNumber >= 4.0;
	}
}

/**
 * used specifically for declaring prototypes using 
 *  subclass.prototype = new superclass(Clazz.inheritArgs) 
 * without  running a constructor or doing field preparation.    
 *  
 */ 
Clazz.inheritArgs = new (function(){return {"$J2SNOCREATE$":true}})();


/* public */
Clazz.instantialize = function (objThis, args) {

	if (args && 
  (args.length == 1 && args[0] && args[0].$J2SNOCREATE$
  || args.length == 2 && args[1] && args[1].$J2SNOCREATE$)) {
    // just declaring a class, not creating an instance.
		return;
  }

	if (objThis instanceof Number) {
		objThis.valueOf = function () {
			return this;
		};
	}
	if (isSafari4Plus) { // Fix bug of Safari 4.0+'s over-optimization
		var argsClone = [];
		for (var k = 0; k < args.length; k++) {
			argsClone[k] = args[k];
		}
		args = argsClone;
	}

  var myclass = objThis.getClass();
	var c = objThis.construct;
  if (!allowImplicit) {
    allowImplicit = true;
    if (!c) {
      newMethodNotFoundException(myclass, null, getParamTypes(args).typeString);
    }
  }
  var p = Clazz._preps[myclass.__CLASS_NAME__];
  var pp = null; 
	if (c && p && myclass.superClazz) {
  //System.out.println("instantialize" + myclass.__CLASS_NAME__);
    // when we have a superclass and a prepareFields, 
    // the order must be:
    //  superclass-superclass-superclass-prepareFields
    //  superclass-superclass-superclass-construct
    //  superclass-superclass-prepareFields
    //  superclass-superclass-construct
    //  superclass-prepareFields
    //  superclass-construct
    //  preparefields
    //  construct
    if ((c.claxxOwner && c.claxxOwner === myclass)
				|| (c.stack	&& c.stack[c.length - 1] == myclass)) {
      p = null;
			/*
			 * This #construct is defined by this class itself.
			 * #construct will call Clazz.superConstructor, which will
			 * call #$prepare$ back
			 */
		} else { // constructor is a super constructor
			if (c.claxxOwner && !c.claxxOwner.superClazz) { 
        pp = c.claxxOwner;
			} else if (c.stack && c.stack.length == 1 && !c.stack[0].superClazz) {
				pp = c.stack[0];
      }
		}
	}
  // BH order reversed -- field preparation must come before constructor call
  pp && (pp = Clazz._preps[pp.__CLASS_NAME__]) && pp.apply(objThis, []);
  p && p.apply(objThis, []);  
  c && c.apply (objThis, args);
};


var cStack = [];

/**
 * BH: I would like to be able to remove "self.c$" here, but that is tricky.
 */
  
Clazz.pu$h = function (c) {
  c || (c = self.c$); // old style
	c && cStack.push(c);
};

Clazz.p0p = function () {
	return cStack.pop();
};

/* private */
var decorateFunction = function (clazzFun, prefix, name, _decorateFunction) {
	var qName;
	if (!prefix) {
		// e.g. Clazz.declareInterface (null, "ICorePlugin", org.eclipse.ui.IPlugin);
		qName = name;
		Clazz.setGlobal(name, clazzFun);
	} else if (prefix.__PKG_NAME__) {
		// e.g. Clazz.declareInterface (org.eclipse.ui, "ICorePlugin", org.eclipse.ui.IPlugin);
		qName = prefix.__PKG_NAME__ + "." + name;
		prefix[name] = clazzFun;
		if (prefix === java.lang)
			Clazz.setGlobal(name, clazzFun);
	} else {
		// e.g. Clazz.declareInterface (org.eclipse.ui.Plugin, "ICorePlugin", org.eclipse.ui.IPlugin);
		qName = prefix.__CLASS_NAME__ + "." + name;
		prefix[name] = clazzFun;
	}
	extendJO(clazzFun, qName);
	for (var i = innerNames.length; --i >= 0;) {
		clazzFun[innerNames[i]] = inF[innerNames[i]];
	}

	if (Clazz._Loader) 
    Clazz._Loader.updateNodeForFunctionDecoration(qName);
};

/**
 * Inherit class with "extends" keyword and also copy those static members. 
 * Example, as in Java, if NAME is a static member of ClassA, and ClassB 
 * extends ClassA then ClassB.NAME can be accessed in some ways.
 *
 * @param clazzThis child class to be extended
 * @param clazzSuper super class which is inherited from
 * @param objSuper super class instance
 */
var inheritClass = function (clazzThis, clazzSuper, objSuper) {
	//var thisClassName = Clazz.getClassName (clazzThis);
	for (var o in clazzSuper) {
		if (o != "b$" && o != "prototype" && o != "superClazz"
				&& o != "__CLASS_NAME__" && o != "implementz"
				&& !checkInnerFunction (clazzSuper, o)) {
			clazzThis[o] = clazzSuper[o];
		}
	}
	if (unloadedClasses[Clazz.getClassName(clazzThis, true)]) {
		// Don't change clazzThis.protoype! Keep it!
	} else if (objSuper) {
		// ! Unsafe reference prototype to an instance!
		// Feb 19, 2006 --josson
		// OK for this reference to an instance, as this is anonymous instance,
		// which is not referenced elsewhere.
		// March 13, 2006
		clazzThis.prototype = objSuper; 
	} else if (clazzSuper !== Number) {
		clazzThis.prototype = new clazzSuper (null, Clazz.inheritArgs);
	} else { // Number
		clazzThis.prototype = new Number ();
	}
	clazzThis.superClazz = clazzSuper;
	/*
	 * Is it necessary to reassign the class name?
	 * Mar 10, 2006 --josson
	 */
	//clazzThis.__CLASS_NAME__ = thisClassName;
	clazzThis.prototype.__CLASS_NAME__ = clazzThis.__CLASS_NAME__;
};

////////////////////////// default package declarations ////////////////////////

/* sgurin: preserve Number.prototype.toString */
Number.prototype._numberToString=Number.prototype.toString;


Clazz.declarePackage ("java.io");
//Clazz.declarePackage ("java.lang");
Clazz.declarePackage ("java.lang.annotation"); // java.lang
Clazz.declarePackage ("java.lang.instrument"); // java.lang
Clazz.declarePackage ("java.lang.management"); // java.lang
Clazz.declarePackage ("java.lang.reflect"); // java.lang
Clazz.declarePackage ("java.lang.ref");  // java.lang.ref
java.lang.ref.reflect = java.lang.reflect;
Clazz.declarePackage ("java.util");
//var reflect = Clazz.declarePackage ("java.lang.reflect");
Clazz.declarePackage ("java.security");


/*
 * Consider these interfaces are basic!
 */
Clazz.declareInterface (java.io,"Closeable");
Clazz.declareInterface (java.io,"DataInput");
Clazz.declareInterface (java.io,"DataOutput");
Clazz.declareInterface (java.io,"Externalizable");
Clazz.declareInterface (java.io,"Flushable");
Clazz.declareInterface (java.io,"Serializable");
Clazz.declareInterface (java.lang,"Iterable");
Clazz.declareInterface (java.lang,"CharSequence");
Clazz.declareInterface (java.lang,"Cloneable");
Clazz.declareInterface (java.lang,"Appendable");
Clazz.declareInterface (java.lang,"Comparable");
Clazz.declareInterface (java.lang,"Runnable");
Clazz.declareInterface (java.util,"Comparator");

java.lang.ClassLoader = {
	__CLASS_NAME__ : "ClassLoader"
};

/******************************************************************************
 * Copyright (c) 2007 java2script.org and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Zhou Renjian - initial API and implementation
 *****************************************************************************/
/*******
 * @author zhou renjian
 * @create March 10, 2006
 *******/

/**
 * Once ClassExt.js is part of Class.js.
 * In order to make the Class.js as small as possible, part of its content
 * is moved into this ClassExt.js.
 *
 * See also http://j2s.sourceforge.net/j2sclazz/
 */
 
/**
 * Clazz.MethodNotFoundException is used to notify the developer about calling
 * methods with incorrect parameters.
 */

// Override the Clazz.MethodNotFoundException in Class.js to give details
var newMethodNotFoundException = function (clazz, method, params) {
	var paramStr = "";
	if (params)
		paramStr = params.substring (1).replace(/\\/g, ",");
	var leadingStr = (!method || method == "construct" ? "Constructor": "Method");
	var message = leadingStr + " " + Clazz.getClassName (clazz, true) + (method ? "." 
					+ method : "") + "(" + paramStr + ") was not found";
  System.out.println(message);
  console.log(message);
  throw new java.lang.NoSuchMethodException(message);        
};

//////// (int) conversions //////////

Clazz.floatToInt = function (x) {
	// asm.js-style conversion
	return x|0;
};

Clazz.floatToByte = Clazz.floatToShort = Clazz.floatToLong = Clazz.floatToInt;
Clazz.doubleToByte = Clazz.doubleToShort = Clazz.doubleToLong = Clazz.doubleToInt = Clazz.floatToInt;

Clazz.floatToChar = function (x) {
	return String.fromCharCode (isNaN(x) ? 0 : x < 0 ? Math.ceil(x) : Math.floor(x));
};

Clazz.doubleToChar = Clazz.floatToChar;



///////////////////////////////// Array additions //////////////////////////////
//
// BH: these are necessary for integer processing, especially
//
//

var getArrayType = function(n, nbits) {
		if (!n) n = 0;
    if (typeof n == "object") {
      var b = n;
    } else {
  		var b = new Array(n);
	   	for (var i = 0; i < n; i++)b[i] = 0
    }
    b.BYTES_PER_ELEMENT = nbits >> 3;
    b._fake = true;    
		return b;
} 

var arraySlice = function(istart, iend) {
  // could be Safari or could be fake
  istart || (istart = 0);
  iend || (iend = this.length);
  if (this._fake) {    
    var b = new this.constructor(iend - istart); 
    System.arraycopy(this, istart, b, 0, iend - istart); 
    return b; 
  }
  return new this.constructor(this.buffer.slice(istart * this.BYTES_PER_ELEMENT, iend * this.BYTES_PER_ELEMENT));
};
      
if ((Clazz.haveInt32 = !!(self.Int32Array && self.Int32Array != Array)) == true) {
	if (!Int32Array.prototype.sort)
		Int32Array.prototype.sort = Array.prototype.sort
} else {
	Int32Array = function(n) { return getArrayType(n, 32); };
	Int32Array.prototype.sort = Array.prototype.sort
  Int32Array.prototype.toString = function(){return "[object Int32Array]"};
}
if (!Int32Array.prototype.slice)
  Int32Array.prototype.slice = function() {return arraySlice.apply(this, arguments)};
Int32Array.prototype.clone = function() { var a = this.slice(); a.BYTES_PER_ELEMENT = 4; return a; };
Int32Array.prototype.getClass = function () { return this.constructor; };




if ((Clazz.haveFloat64 = !!(self.Float64Array && self.Float64Array != Array)) == true) {
	if (!Float64Array.prototype.sort)
		Float64Array.prototype.sort = Array.prototype.sort
} else {
	Float64Array = function(n) { return getArrayType(n, 64); };
	Float64Array.prototype.sort = Array.prototype.sort
	Float64Array.prototype.toString = function() {return "[object Float64Array]"};
// Darn! Mozilla makes this a double, not a float. It's 64-bit.
// and Safari 5.1 doesn't have Float64Array 
}
if (!Float64Array.prototype.slice)
  Float64Array.prototype.slice = function() {return arraySlice.apply(this, arguments)};
Float64Array.prototype.clone =  function() { return this.slice(); };
Float64Array.prototype.getClass = function () { return this.constructor; };

/**
 * Make arrays.
 *
 * @return the created Array object
 */
/* public */
Clazz.newArray = function (a, b, c, d) {
  if (a != -1 || arguments.length == 2) { 
    // Clazz.newArray(36,null)
    // Clazz.newArray(3, 0)
    // Clazz.newArray(-1, ["A","B"])
    // Clazz.newArray(3, 5, null)
    return newTypedArray(arguments, 0);
  }
  // truncate array using slice
  // Clazz.newArray(-1, array, ifirst, ilast+1)
  // from JU.AU; slice, ensuring BYTES_PER_ELEMENT is set correctly
  a = b.slice(c, d);
  a.BYTES_PER_ELEMENT = b.BYTES_PER_ELEMENT;
  return a;
};


var newTypedArray = function(args, nBits) {
	var dim = args[0];
	if (typeof dim == "string")
		dim = dim.charCodeAt(0); // char
	var last = args.length - 1;
	var val = args[last];
  if (last > 1) {
     // array of arrays
     // Clazz.newArray(3, 5, null)
    var xargs = new Array(last); // 2 in this case
    for (var i = 0; i < last; i++)
    	xargs[i] = args[i + 1];
    var arr = new Array(dim);
  	for (var i = 0; i < dim; i++)
  		arr[i] = newTypedArray(xargs, nBits); // Call recursively
    return arr;
  }
  // Clazz.newArray(36,null)
  // Clazz.newArray(3, 0)
  // Clazz.newArray(-1, ["A","B"])
  if (nBits > 0 && dim < 0)
    dim = val; // because we can initialize an array using new Int32Array([...])
  switch (nBits) {
  case 8:
  	var arr = new Int8Array(dim);
    arr.BYTES_PER_ELEMENT = 1;
    return arr;
  case 32:
  	var arr = new Int32Array(dim);
    arr.BYTES_PER_ELEMENT = 4;
    return arr;
  case 64:
    var arr = new Float64Array(dim);
    arr.BYTES_PER_ELEMENT = 8;
    return arr;
  default:
  	var arr = (dim < 0 ? val : new Array(dim));
    arr.BYTES_PER_ELEMENT = 0;
    if (dim > 0 && val != null)
    	for (var i = dim; --i >= 0;)
     		arr[i] = val;
    return arr;
  }
}

/**
 * Make arrays.
 *
 * @return the created Array object
 */
/* public */
Clazz.newByteArray  = function () {
	return newTypedArray(arguments, 8);
}

/**
 * Make arrays.
 *
 * @return the created Array object
 */
/* public */
Clazz.newIntArray  = function () {
	return newTypedArray(arguments, 32);
}

/**
 * Make arrays.
 *
 * @return the created Array object
 */
/* public */
Clazz.newFloatArray  = function () {
	return newTypedArray(arguments, 64);
}

Clazz.newDoubleArray = Clazz.newFloatArray;
Clazz.newLongArray = Clazz.newShortArray = Clazz.newIntArray;
Clazz.newCharArray = Clazz.newBooleanArray = Clazz.newArray;
if ((Clazz.haveInt8 = !!self.Int8Array) == true) {
	if (!Int8Array.prototype.sort)
		Int8Array.prototype.sort = Array.prototype.sort
  if (!Int8Array.prototype.slice)
    Int8Array.prototype.slice = function() {return arraySlice.apply(this, arguments)};
 
} else {
  Clazz.newByteArray = Clazz.newIntArray;
}
Int8Array.prototype.clone = function() { var a = this.slice(); a.BYTES_PER_ELEMENT = 1;return a; };
Int8Array.prototype.getClass = function () { return this.constructor; };

Clazz.isAB = function(a) {
	return (a && typeof a == "object" && a.BYTES_PER_ELEMENT == 1);
}
Clazz.isAI = function(a) {
	return (a && typeof a == "object" && a.BYTES_PER_ELEMENT == 4);
}

Clazz.isAF = function(a) {
	return (a && typeof a == "object" && a.BYTES_PER_ELEMENT == 8);
}

Clazz.isAS = function(a) { // just checking first parameter
	return (a && typeof a == "object" && a.constructor == Array && (typeof a[0] == "string" || typeof a[0] == "undefined"));
}

Clazz.isAII = function(a) { // assumes non-null a[0]
	return (a && typeof a == "object" && Clazz.isAI(a[0]));
}

Clazz.isAFF = function(a) { // assumes non-null a[0]
	return (a && typeof a == "object" && Clazz.isAF(a[0]));
}

Clazz.isAFFF = function(a) { // assumes non-null a[0]
	return (a && typeof a == "object" && Clazz.isAFF(a[0]));
}

Clazz.isASS = function(a) {
	return (a && typeof a == "object" && Clazz.isAS(a[0]));
}

Clazz.isAFloat = function(a) { // just checking first parameter
	return (a && typeof a == "object" && a.constructor == Array && Clazz.instanceOf(a[0], Float));
}

Clazz.isAP = function(a) {
	return (a && Clazz.getClassName(a[0]) == "JU.P3");
}


/**
 * Make the RunnableCompatiability instance as a JavaScript function.
 *
 * @param jsr Instance of RunnableCompatiability
 * @return JavaScript function instance represents the method run of jsr.
 */
/* public */
/*
Clazz.makeFunction = function (jsr) {
// never used in SwingJS -- called by Enum, but not accessible to it -- part of SWT
	return function(e) {
		if (!e)
			e = window.event;
		if (jsr.setEvent)
			jsr.setEvent(e);
		jsr.run();
		switch (jsr.returnSet) {
		case 1: 
			return jsr.returnNumber;
		case 2:
			return jsr.returnBoolean;
		case 3:
			return jsr.returnObject;
		}
	};
};
*/

/*
 * Serialize those public or protected fields in class 
 * net.sf.j2s.ajax.SimpleSerializable.
 */
/* protected */
/*
Clazz.registerSerializableFields = function (clazz) {
	var args = arguments;
	var length = args.length;
	var newArr = [];
	if (clazz.declared$Fields) {
		for (var i = 0; i < clazz.declared$Fields.length; i++) {
			newArr[i] = clazz.declared$Fields[i];
		}
	}
	clazz.declared$Fields = newArr;

	if (length > 0 && length % 2 == 1) {
		var fs = clazz.declared$Fields;
		var n = (length - 1) / 2;
		for (var i = 1; i <= n; i++) {
			var o = { name : args[i + i - 1], type : args[i + i] };
			var existed = false;
			for (var j = 0; j < fs.length; j++) {
				if (fs[j].name == o.name) { // reloaded classes
					fs[j].type = o.type; // update type
					existed = true;
					break;
				}
			}
			if (!existed)
				fs.push(o);
		}
	}
};
*/
/*
 * Get the caller method for those methods that are wrapped by 
 * Clazz.searchAndExecuteMethod.
 *
 * @param args caller method's arguments
 * @return caller method, null if there is not wrapped by 
 * Clazz.searchAndExecuteMethod or is called directly.
 */
/* protected */
/*
Clazz.getMixedCallerMethod = function (args) {
	var o = {};
	var argc = args.callee.caller; // tryToSearchAndExecute
	if (argc && argc !== tryToSearchAndExecute) // inherited method's apply
		argc = argc.arguments.callee.caller;
	if (argc !== tryToSearchAndExecute
		|| (argc = argc.arguments.callee.caller) !== Clazz.searchAndExecuteMethod)
		return null;
	o.claxxRef = argc.arguments[1];
	o.fxName = argc.arguments[2];
	o.paramTypes = getParamsType(argc.arguments[3]);	
	argc = argc.arguments.callee.caller // Clazz.generateDelegatingMethod 
					&& argc.arguments.callee.caller; // the private method's caller
	if (!argc)
		return null;
	o.caller = argc;
	return o;
};
*/
/* BH -- The issue here is a subclass calling its private method FOO when
 *       there is also a private method of the same name in its super class.
 *       This can ALWAYS be avoided and, one could argue, is bad 
 *       program design anyway. In Jmol, the presence of this possibility
 *       creates over 8000 references to the global $fx, which was only
 *       checked in a few rare cases. We can then also remove $fz references.
 *         
 */

/*
 * Check and return super private method.
 * In order make private methods be executed correctly, some extra javascript
 * must be inserted into the beggining of the method body of the non-private 
 * methods that with the same method signature as following:
 * <code>
 *			var $private = Clazz.checkPrivateMethod (arguments);
 *			if ($private) {
 *				return $private.apply (this, arguments);
 *			}
 * </code>
 * Be cautious about this. The above codes should be insert by Java2Script
 * compiler or with double checks to make sure things work correctly.
 *
 * @param args caller method's arguments
 * @return private method if there are private method fitted for the current 
 * calling environment
 */
/* public */

Clazz.checkPrivateMethod = function () {
  // get both this one and the one calling it
  me = arguments.callee.caller;
  caller = arguments.callee.caller.caller;
  var stack = me.stack;
  // if their classes are the same, no issue
  var mySig = getParamTypes(arguments[0]).typeString;
  if (!me.privateNote) {
    me.privateNote = "You are seeing this note because the method " 
    + me.exName + mySig + " in class " 
    + me.exClazz.__CLASS_NAME__
    + " has a superclass method by the same name (possibly with the same parameters) that is private and "
    + " therefore might be called improperly from this class. If your "
  + " code does not run properly, or you want to make it run faster, change the name of this method to something else."
  System.out.println(me.privateNote);
  //alert(me.privateNote);
}
/*
alert([me.exClazz.__CLASS_NAME__, me.exName,
  caller.exClazz.__CLASS_NAME__, caller.exName,stack,mySig])
if (stack == null || caller.exClazz == me.exClazz)
  return null;
// I am being called by a different class...

for (var i = stack.length; --i >= 0;) {
  if (stack[i] != caller.claxxRef)
    continue;
  // and it is on MY class stack
//    if (
   
}
*/

/*	var m = Clazz.getMixedCallerMethod (args);
if (m == null) return null;
var callerFx = m.claxxRef.prototype[m.caller.exName];
if (callerFx == null) return null; // may not be in the class hierarchies
var ppFun = null;
if (callerFx.claxxOwner ) {
	ppFun = callerFx.claxxOwner.prototype[m.fxName];
} else {
	var stack = callerFx.stack;
	for (var i = stack.length - 1; i >= 0; i--) {
		var fx = stack[i].prototype[m.caller.exName];
		if (fx === m.caller) {
			ppFun = stack[i].prototype[m.fxName];
		} else if (fx ) {
			for (var fn in fx) {
				if (fn.indexOf ('\\') == 0 && fx[fn] === m.caller) {
					ppFun = stack[i].prototype[m.fxName];
					break;
				}
			}
		}
		if (ppFun) {
			break;
		}
	}
}
if (ppFun && ppFun.claxxOwner == null) {
	ppFun = ppFun["\\" + m.paramTypes];
}
if (ppFun && ppFun.isPrivate && ppFun !== args.callee) {
	return ppFun;
}
*/  
	return null;
};


//$fz = null; // for private method declaration


// /*# {$no.debug.support} >>x #*/
// /*
//  * Option to switch on/off of stack traces.
//  */
// /* protect */
//Clazz.tracingCalling = false;

// /* private */
// Clazz.callingStack = function (caller, owner) {
// 	this.caller = caller;
// 	this.owner = owner;
// };

/*# x<< #*/

/**
 * The first folder is considered as the primary folder.
 * And try to be compatiable with _Loader system.
 */
/* private */


/*** not used in Jmol
 * *
if (window["_Loader"] && _Loader.binaryFolders) {
	Clazz.binaryFolders = _Loader.binaryFolders;
} else {
	Clazz.binaryFolders = ["j2s/", "", "j2slib/"];
}

Clazz.addBinaryFolder = function (bin) {
	if (bin) {
		var bins = Clazz.binaryFolders;
		for (var i = 0; i < bins.length; i++) {
			if (bins[i] == bin) {
				return ;
			}
		}
		bins[bins.length] = bin;
	}
};
Clazz.removeBinaryFolder = function (bin) {
	if (bin) {
		var bins = Clazz.binaryFolders;
		for (var i = 0; i < bins.length; i++) {
			if (bins[i] == bin) {
				for (var j = i; j < bins.length - 1; j++) {
					bins[j] = bins[j + 1];
				}
				bins.length--;
				return bin;
			}
		}
	}
	return null;
};
Clazz.setPrimaryFolder = function (bin) {
	if (bin) {
		Clazz.removeBinaryFolder (bin);
		var bins = Clazz.binaryFolders;
		for (var i = bins.length - 1; i >= 0; i--) {
			bins[i + 1] = bins[i];
		}
		bins[0] = bin;
	}
};

***/


///////////////// special definitions of standard Java class methods ///////////

/**
 * This is a simple implementation for Clazz#load. It just ignore dependencies
 * of the class. This will be fine for jar *.z.js file.
 * It will be overriden by _Loader#load.
 * For more details, see _Loader.js
 */
/* protected */
/*
Clazz.load = function (musts, clazz, optionals, declaration) {
	// not used in Jmol
	if (declaration)
		declaration ();
};
*/

/*
 * Invade the Object prototype!
 * TODO: make sure that invading Object prototype does not affect other
 * existed library, such as Dojo, YUI, Prototype, ...
 */
java.lang.Object = Clazz._O;

Clazz._O.getName = inF.getName;

java.lang.System = System = {
	props : null, //new java.util.Properties (),
	$props : {},
	arraycopy : function (src, srcPos, dest, destPos, length) {  
		if (src !== dest || srcPos > destPos) {
			for (var i = length; --i >= 0;)
				dest[destPos++] = src[srcPos++];
		} else {
      destPos += length;
      srcPos += length;
			for (var i = length; --i >= 0;)
				src[--destPos] = src[--srcPos];
		}
	},
  
  nanoTime: function() {
   return Math.round(window.performance.now() * 1e6)
  },
  
	currentTimeMillis : function () {
		return new Date ().getTime ();
	},
	gc : function() {}, // bh
	getProperties : function () {
		return System.props;
	},
	getProperty : function (key, def) {
		if (System.props)
			return System.props.getProperty (key, def);
		var v = System.$props[key];
    if (typeof v != "undefined")
      return v;
    if (key.indexOf(".") > 0) {
      v = null;    
      switch (key) {
      case "java.class.version":
        v = "50";
        break;
      case "java.version":
        v = "1.6";
        break;
      case "file.separator":
      case "path.separator":
        v = "/";
        break;        
      case "line.separator":
        v = (navigator.userAgent.indexOf("Windows") >= 0 ? "\r\n" : "\n");
        break;
      case "os.name":
      case "os.version":
        v = navigator.userAgent;
        break;
      }
      if (v)
        return System.$props[key] = v;
    }
    return (arguments.length == 1 ? null : def == null ? key : def); // BH
	},
	getSecurityManager : function() { return null },  // bh
	setProperties : function (props) {
		System.props = props;
	},
  lineSeparator : function() { return '\n' }, // bh
	setProperty : function (key, val) {
		if (!System.props)
			return System.$props[key] = val; // BH
		System.props.setProperty (key, val);
	}
};

System.identityHashCode=function(obj){
  if(obj==null)
    return 0;
    
        return obj._$hashcode || (obj._$hashcode = ++hashCode)

/*    
  try{
    return obj.toString().hashCode();
  }catch(e){
    var str=":";
    for(var s in obj){
     str+=s+":"
    }
    return str.hashCode();
  }
*/  
}

System.out = new Clazz._O ();
System.out.__CLASS_NAME__ = "java.io.PrintStream";
System.out.print = function () {};
System.out.printf = function () {};
System.out.println = function () {};
System.out.write = function () {};

System.err = new Clazz._O ();
System.err.__CLASS_NAME__ = "java.io.PrintStream";
System.err.print = function () {};
System.err.printf = function () {};
System.err.println = function () {};
System.err.write = function () {};

Clazz.popup = Clazz.assert = Clazz.log = Clazz.error = window.alert;

Thread = function () {};
Thread.J2S_THREAD = Thread.prototype.J2S_THREAD = new Thread ();
Thread.currentThread = Thread.prototype.currentThread = function () {
	return this.J2S_THREAD;
};


//////////////////////////// hotspot and unloading ////////////////////

// not implemented in SwingJS

//////////////////////////// class loader /////////////////////////////

/******************************************************************************
 * Copyright (c) 2007 java2script.org and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Zhou Renjian - initial API and implementation
 *****************************************************************************/
/*******
 * @author zhou renjian
 * @create July 10, 2006
 *******/

// see notes in j2s/classLoader.txt

//if (window["ClazzNode"] == null) {
/**
 * TODO:
 * Make optimization over class dependency tree.
 */


/**
 * Static class loader class
 */
Clazz._Loader = Clazz.ClazzLoader = function () {};

/**
 * Class dependency tree node
 */
/* private */
var Node = function () {
	this.parents = [];
	this.musts = [];
	this.optionals = [];
	this.declaration = null;
	this.name = null; // id
	this.path = null;
//	this.requires = null;
//	this.requiresMap = null;
	this.onLoaded = null;
	this.status = 0;
	this.random = 0.13412;
};


;(function(Clazz, _Loader) {

_Loader._checkLoad = J2S._checkLoad;
 
_Loader.updateNodeForFunctionDecoration = function(qName) {

	var node = findNode(qName);
	if (node && node.status == Node.STATUS_KNOWN) {
		window.setTimeout((function(nnn) {
			return function() {
				updateNode(nnn);
			};
		})(node), 1);
	}
}

Node.prototype.toString = function() {
	return this.name || this.path || "ClazzNode";
}

Node.STATUS_UNKNOWN = 0;
Node.STATUS_KNOWN = 1;
Node.STATUS_CONTENT_LOADED = 2;
Node.STATUS_MUSTS_LOADED = 3;
Node.STATUS_DECLARED = 4;
Node.STATUS_LOAD_COMPLETE = 5;

						 
var loaders = [];

/* public */
_Loader.requireLoaderByBase = function (base) {
	for (var i = 0; i < loaders.length; i++) {
		if (loaders[i].base == base) {
			return loaders[i];
		}
	}
	var loader = new _Loader ();
	loader.base = base; 
	loaders.push(loader);
	return loader;
};

/**
 * Class dependency tree
 */
var clazzTreeRoot = new Node();

/**
 * Used to keep the status whether a given *.js path is loaded or not.
 */
/* private */
var loadedScripts = {};

/**
 * Multiple threads are used to speed up *.js loading.
 */
/* private */
var inLoadingThreads = 0;

/**
 * Maximum of loading threads
 */
/* private */
var maxLoadingThreads = 6;

var userAgent = navigator.userAgent.toLowerCase ();
var isOpera = (userAgent.indexOf ("opera") != -1);
var isIE = (userAgent.indexOf ("msie") != -1) && !isOpera;
var isGecko = (userAgent.indexOf ("gecko") != -1);

/*
 * Opera has different loading order which will result in performance degrade!
 * So just return to single thread loading in Opera!
 *
 * FIXME: This different loading order also causes bugs in single thread!
 */
if (isOpera) {
	maxLoadingThreads = 1;
	var index = userAgent.indexOf ("opera/");
	if (index != -1) {
		var verNumber = 9.0;
		try {
			verNumber = parseFloat(userAgent.subString (index + 6));
		} catch (e) {}
		if (verNumber >= 9.6) {
			maxLoadingThreads = 6;
		}
	} 
}

/**
 * Try to be compatiable with Clazz system.
 * In original design _Loader and Clazz are independent!
 *  -- zhourenjian @ December 23, 2006
 */
var isClassdefined;
var definedClasses;

if (self.Clazz && Clazz.isClassDefined) {
	isClassDefined = Clazz.isClassDefined;
} else {
	definedClasses = {};
	isClassDefined = function (clazzName) {
		return definedClasses[clazzName] == true;
	};
}

/**
 * Expand the shortened list of class names.
 * For example:
 * JU.Log, $.Display, $.Decorations
 * will be expanded to 
 * JU.Log, JU.Display, JU.Decorations
 * where "$." stands for the previous class name's package.
 *
 * This method will be used to unwrap the required/optional classes list and 
 * the ignored classes list.
 */
/* private */
var unwrapArray = function (arr) {
	if (!arr || arr.length == 0)
		return [];
	var last = null;
	for (var i = 0; i < arr.length; i++) {
		if (!arr[i])
			continue;
		if (arr[i].charAt (0) == '$') {
			if (arr[i].charAt (1) == '.') {
				if (!last)
					continue;
				var idx = last.lastIndexOf (".");
				if (idx != -1) {
					var prefix = last.substring (0, idx);
					arr[i] = prefix + arr[i].substring (1);
				}
			} else {
				arr[i] = "org.eclipse.s" + arr[i].substring (1);
			}
		}
		last = arr[i];
	}
	return arr;
};

/**
 * Used to keep to-be-loaded classes.
 */
/* private */
var classQueue = [];

/* private */
var classpathMap = {};

/* private */
var pkgRefCount = 0;

/* public */
_Loader.loadPackageClasspath = function (pkg, base, isIndex, fSuccess, mode, pt) {
	var map = classpathMap;
	mode || (mode = 0);
	fSuccess || (fSuccess = null);
	pt || (pt = 0);

	/*
	 * In some situation, maybe,
	 * _Loader.packageClasspath ("java", ..., true);
	 * is called after other _Loader#packageClasspath, e.g.
	 * <code>
	 * _Loader.packageClasspath ("org.eclipse.swt", "...", true);
	 * _Loader.packageClasspath ("java", "...", true);
	 * </code>
	 * which is not recommended. But _Loader should try to adjust orders
	 * which requires "java" to be declared before normal _Loader
	 * #packageClasspath call before that line! And later that line
	 * should never initialize "java/package.js" again!
	 */
	var isPkgDeclared = (isIndex && map["@" + pkg]);
	if (mode == 0 && isIndex && !map["@java"] && pkg.indexOf ("java") != 0 && needPackage("java")) {
		_Loader.loadPackage("java", fSuccess ? function(_package){_Loader.loadPackageClasspath(pkg, base, isIndex, fSuccess, 1)} : null);
		if (fSuccess)
			return;
	}
	if (pkg instanceof Array) {
		unwrapArray(pkg);
		if (fSuccess) {
			if (pt < pkg.length)
				_Loader.loadPackageClasspath(pkg[pt], base, isIndex, function(_loadPackageClassPath){_Loader.loadPackageClasspath(pkg, base, isIndex, fSuccess, 1, pt + 1)}, 1);
			else
				fSuccess();
		} else {
			for (var i = 0; i < pkg.length; i++)
				_Loader.loadPackageClasspath(pkg[i], base, isIndex, null);
		}
		return;
	}
	switch (pkg) {
	case "java.*":
		pkg = "java";
		// fall through
	case "java":
		if (base) {
			// support ajax for default
			var key = "@net.sf.j2s.ajax";
			if (!map[key])
				map[key] = base;
			key = "@net.sf.j2s";
			if (!map[key])
				map[key] = base;
		}		
		break;
	case "swt":
		pkg = "org.eclipse.swt";
		break;
	case "ajax":
		pkg = "net.sf.j2s.ajax";
		break;
	case "j2s":
		pkg = "net.sf.j2s";
		break;
	default:
		if (pkg.lastIndexOf(".*") == pkg.length - 2)
			pkg = pkg.substring(0, pkg.length - 2);
		break;
	}
	if (base) // critical for multiple applets
		map["@" + pkg] = base;
	if (isIndex && !isPkgDeclared && !window[pkg + ".registered"]) {
		pkgRefCount++;
		if (pkg == "java")
			pkg = "core" // JSmol -- moves java/package.js to core/package.js
		_Loader.loadClass(pkg + ".package", function () {
					if (--pkgRefCount == 0)
						runtimeLoaded();
					//fSuccess && fSuccess();
				}, true, true, 1);
		return;
	}
	fSuccess && fSuccess();
};

/**
 * BH: allows user/developer to load classes even though wrapping and Google
 * Closure Compiler has not been run on the class.
 *   
 */
Clazz.loadClass = function (name, onLoaded, async) {
  if (!self.Class) {
    Class = Clazz;
    Class.forName = Clazz._4Name;
    JavaObject = Clazz._O;
    // maybe more here
  }
  return (name && _Loader.loadClass(name, onLoaded, true, async, 1));
}

/**
 * Load the given class ant its related classes.
 */
/* public */
_Loader.loadClass = function (name, onLoaded, forced, async, mode) {

  mode || (mode = 0); // BH: not implemented
  (async == null) && (async = false);
  
 	if (typeof onLoaded == "boolean")
		return evalType(name);

  System.out.println("loadClass " + name)

	// Make sure that packageClasspath ("java", base, true); 
	// is called before any _Loader#loadClass is called.

	if (needPackage("java"))
		_Loader.loadPackage("java");
	if (needPackage("core"))
		_Loader.loadPackage("core");	

//	var swtPkg = "org.eclipse.swt";
//	if (name.indexOf (swtPkg) == 0 || name.indexOf ("$wt") == 0) {
//		_Loader.assurePackageClasspath (swtPkg);
//	}
//	if (name.indexOf ("junit") == 0) {
//		_Loader.assurePackageClasspath ("junit");
//	}

	// Any _Loader#loadClass calls will be queued until java.* core classes are loaded.

	_Loader.keepOnLoading = true;
	
	if (!forced && (pkgRefCount && name.lastIndexOf(".package") != name.length - 8
			|| name.indexOf("java.") != 0 && !isClassDefined(runtimeKeyClass)
		 )) {	
		queueBe4KeyClazz.push([name, onLoaded]);
    
    
  System.out.println("loadclass-queuing " + name+ " " + runtimeKeyClass + " "+ isClassDefined(runtimeKeyClass))

		return;    
	}
	var b;
	if ((b = isClassDefined(name)) || isClassExcluded(name)) {
		if (b && onLoaded) {
			var nn = findNode(name);
			if (!nn || nn.status >= Node.STATUS_LOAD_COMPLETE) {
				if (async) {
					window.setTimeout(onLoaded, 25);
				} else {
					onLoaded();
				}
			}
		}
		return;
	}
	var path = _Loader.getClasspathFor(name);
  var existed = loadedScripts[path];
  	var qq = classQueue;
	if (!existed)
		for (var i = qq.length; --i >= 0;)
			if (qq[i].path == path || qq[i].name == name) {
				existed = true;
				break;
			}
	if (existed) {
		if (onLoaded) {
			var n = findNode(name);
			if (n) {
				if (!n.onLoaded) {
					n.onLoaded = onLoaded;
				} else if (onLoaded != n.onLoaded) {
					n.onLoaded = (function (nF, oF) { return function () { nF(); oF() };	}) (n.onLoaded, onLoaded);
				}
			}
		}
		return;
	}

	var n = (unloadedClasses[name] && findNode(name) || new Node());
	n.name = name;
	n.path = path;
	n.isPackage = (path.lastIndexOf("package.js") == path.length - 10);
  if (n.isPackage)
    Clazz._nodeDepth = 0;   
	mappingPathNameNode(path, name, n);
	n.onLoaded = onLoaded;
	n.status = Node.STATUS_KNOWN;
	var needBeingQueued = false;
	for (var i = qq.length; --i >= 0;) {
		if (qq[i].status != Node.STATUS_LOAD_COMPLETE) {
			needBeingQueued = true;
			break;
		}
	}
	
	if (n.isPackage) {//forced
		// push class to queue
		var pt = qq.length;
		for (; --pt >= 0;) {
			if (qq[pt].isPackage) 
				break;
			qq[pt + 1] = qq[pt];
		}
		qq[++pt] = n;
	} else if (needBeingQueued) {
		qq.push(n);
	}
	if (!needBeingQueued) { // can be loaded directly
		var bSave = false;
		if (onLoaded) {	
			bSave = isLoadingEntryClass;
			isLoadingEntryClass = true;
		}
    if (forced)onLoaded = null;
		addChildClassNode(clazzTreeRoot, n, true);
		loadScript(n, n.path, n.requiredBy, false, onLoaded ? function(_loadClass){ isLoadingEntryClass = bSave; onLoaded()}: null);
	}
};

/*
 * Check whether given package's classpath is setup or not.
 * Only "java" and "org.eclipse.swt" are accepted in argument.
 */
/* private */
var needPackage = function(pkg) {
  // note that false != null and true != null
	return (window[pkg + ".registered"] != null && !classpathMap["@" + pkg]);
}

/* private */
_Loader.loadPackage = function(pkg, fSuccess) {
	fSuccess || (fSuccess = null);
	window[pkg + ".registered"] = false;
	_Loader.loadPackageClasspath(pkg, 
		(_Loader.J2SLibBase || (_Loader.J2SLibBase = (_Loader.getJ2SLibBase() || "j2s/"))), 
		true, fSuccess);
};

/**
 * Register classes to a given *.z.js path, so only a single *.z.js is loaded
 * for all those classes.
 */
/* public */
_Loader.jarClasspath = function (jar, clazzes) {
	if (!(clazzes instanceof Array))
		clazzes = [classes];
	unwrapArray(clazzes);
	for (var i = clazzes.length; --i >= 0;)
		classpathMap["#" + clazzes[i]] = jar;
	classpathMap["$" + jar] = clazzes;
};

/**
 * Usually be used in .../package.js. All given packages will be registered
 * to the same classpath of given prefix package.
 */
/* public */
_Loader.registerPackages = function (prefix, pkgs) {
	//_Loader.checkInteractive ();
	var base = _Loader.getClasspathFor (prefix + ".*", true);
	for (var i = 0; i < pkgs.length; i++) {
		if (window["Clazz"]) {
			Clazz.declarePackage (prefix + "." + pkgs[i]);
		}
		_Loader.loadPackageClasspath (prefix + "." + pkgs[i], base);
	}
};

/**
 * Using multiple sites to load *.js in multiple threads. Using multiple
 * sites may avoid 2 HTTP 1.1 connections recommendation limit.
 * Here is a default implementation for http://archive.java2script.org.
 * In site archive.java2script.org, there are 6 sites:
 * 1. http://archive.java2script.org or http://a.java2script.org
 * 2. http://erchive.java2script.org or http://e.java2script.org
 * 3. http://irchive.java2script.org or http://i.java2script.org
 * 4. http://orchive.java2script.org or http://o.java2script.org
 * 5. http://urchive.java2script.org or http://u.java2script.org
 * 6. http://yrchive.java2script.org or http://y.java2script.org
 */
/* protected */
	/*
_Loader.multipleSites = function (path) {
	var deltas = window["j2s.update.delta"];
	if (deltas && deltas instanceof Array && deltas.length >= 3) {
		var lastOldVersion = null;
		var lastNewVersion = null;
		for (var i = 0; i < deltas.length / 3; i++) {
			var oldVersion = deltas[i + i + i];
			if (oldVersion != "$") {
				lastOldVersion = oldVersion;
			}
			var newVersion = deltas[i + i + i + 1];
			if (newVersion != "$") {
				lastNewVersion = newVersion;
			}
			var relativePath = deltas[i + i + i + 2];
			var key = lastOldVersion + "/" + relativePath;
			var idx = path.indexOf (key);
			if (idx != -1 && idx == path.length - key.length) {
				path = path.substring (0, idx) + lastNewVersion + "/" + relativePath;
				break;
			}
		}
	}
	var length = path.length;
	if (maxLoadingThreads > 1 
			&& ((length > 15 && path.substring (0, 15) == "http://archive.")
			|| (length > 9 && path.substring (0, 9) == "http://a."))) {
		var index = path.lastIndexOf("/");
		if (index < length - 3) {
			var arr = ['a', 'e', 'i', 'o', 'u', 'y'];
			var c1 = path.charCodeAt (index + 1);
			var c2 = path.charCodeAt (index + 2);
			var idx = (length - index) * 3 + c1 * 5 + c2 * 7; // Hash
			return path.substring (0, 7) + arr[idx % 6] + path.substring (8);
		}
	}
	return path;
};
	*/

/**
 * Return the *.js path of the given class. Maybe the class is contained
 * in a *.z.js jar file.
 * @param clazz Given class that the path is to be calculated for. May
 * be java.package, or java.lang.String
 * @param forRoot Optional argument, if true, the return path will be root
 * of the given classs' package root path.
 * @param ext Optional argument, if given, it will replace the default ".js"
 * extension.
 */
/* public */
_Loader.getClasspathFor = function (clazz, forRoot, ext) {
	var path = classpathMap["#" + clazz];
	if (!path || forRoot || ext) {
		var base;
		var idx;
		if (path) {
			clazz = clazz.replace(/\./g, "/");	
			if ((idx = path.lastIndexOf(clazz)) >= 0 
				|| (idx = clazz.lastIndexOf("/")) >= 0 
					&& (idx = path.lastIndexOf(clazz.substring(0, idx))) >= 0)
				base = path.substring(0, idx);
		} else {
			idx = clazz.length + 2;
			while ((idx = clazz.lastIndexOf(".", idx - 2)) >= 0)
				if ((base = classpathMap["@" + clazz.substring(0, idx)]))
					break;
			if (!forRoot)
				clazz = clazz.replace (/\./g, "/");	
		}
		if (base == null) {
			var bins = "binaryFolders";
			base = (window["Clazz"] && Clazz[bins] && Clazz[bins].length ? Clazz[bins][0] 
				: _Loader[bins]	&& _Loader[bins].length ? _Loader[bins][0]
				: "j2s");
		}
		path = (base.lastIndexOf("/") == base.length - 1 ? base : base + "/") + (forRoot ? ""
			: clazz.lastIndexOf("/*") == clazz.length - 2 ? clazz.substring(0, idx + 1)
			: clazz + (!ext ? ".js" : ext.charAt(0) != '.' ? "." + ext : ext));
	}		
	return path;//_Loader.multipleSites(path);
};

/**
 * To ignore some classes.
 */
/* public */
_Loader.ignore = function () {
	var clazzes = (arguments.length == 1 && arguments[0] instanceof Array ?
			clazzes = arguments[0] : null);
	var n = (clazzes ? clazzes.length : arguments.length);
	if (!clazzes) {
		clazzes = new Array(n);
		for (var i = 0; i < n; i++)
			clazzes[i] = arguments[i];
	}
	unwrapArray(clazzes);
	for (var i = 0; i < n; i++)
		excludeClassMap["@" + clazzes[i]] = 1;
};

/**
 * The following *.script* can be overriden to indicate the 
 * status of classes loading.
 *
 * TODO: There should be a Java interface with name like INativeLoaderStatus
 */
/* public */
_Loader.onScriptLoading = function (file){};

/* public */
_Loader.onScriptLoaded = function (file, isError){};

/* public */
_Loader.onScriptInitialized = function (file){};

/* public */
_Loader.onScriptCompleted = function (file){};

/* public */
_Loader.onClassUnloaded = function (clazz){};

/**
 * After all the classes are loaded, this method will be called.
 * Should be overriden to run *.main([]).
 */
/* public */
_Loader.onGlobalLoaded = function () {};

/* public */
_Loader.keepOnLoading = true; // never set false in this code


/* private */
var mapPath2ClassNode = {};

/* private */
var isClassExcluded = function (clazz) {
	return excludeClassMap["@" + clazz];
};

/* Used to keep ignored classes */
/* private */
var excludeClassMap = {};

Clazz._lastEvalError = null;

/* private */
var evaluate = function(file, file0, js) {
 		try {
			eval(js + ";//# sourceURL="+file);
		} catch (e) {      
			var s = "[Java2Script] The required class file \n\n" + file + (js.indexOf("data: no") ? 
         "\nwas not found.\n"
        : "\ncould not be loaded. Script error: " + e.message + " \n\ndata:\n\n" + js) + "\n\n" 
        + (e.stack ? e.stack : Clazz.getStackTrace());
      Clazz._lastEvalError = s;    
      if (Clazz._isQuiet) 
        return;
			Clazz.alert(s);
			throw e;
		}
		_Loader.onScriptLoaded(file, false);
		tryToLoadNext(file0);
}

/* private */
var failedHandles = {};

/* private */
var generateRemovingFunction = function (node) {
	return function () {
		if (node.readyState != "interactive") {
			try {
				if (node.parentNode)
					node.parentNode.removeChild (node);
			} catch (e) { }
			node = null;
		}
	};
};

/* private */
var removeScriptNode = function (n) {
	if (window["j2s.script.debugging"]) {
		return;
	}
	// lazily remove script nodes.
	window.setTimeout (generateRemovingFunction (n), 1);
};

/* public */
Clazz._4Name = function(clazzName, applet, state) {
	if (Clazz.isClassDefined(clazzName))
		return evalType(clazzName);
  if (clazzName.indexOf("$") >= 0) {
    // BH we allow Java's java.swing.JTable.$BooleanRenderer as a stand-in for java.swing.JTable.BooleanRenderer
    // when the static nested class is created using declareType  
   var name2 = clazzName.replace(/\$/g,".");
   if (Clazz.isClassDefined(name2))
    return evalType(name2);   
  }
	var f = (J2S._isAsync && applet ? applet._restoreState(clazzName, state) : null);
	if (f == 1)
		return null; // must be already being created
	if (_Loader.setLoadingMode(f ? _Loader.MODE_SCRIPT : "xhr.sync")) {
		_Loader.loadClass(clazzName, f, false, true, 1);
		return null; // this will surely throw an error, but that is OK
	}
	//alert ("Using Java reflection: " + clazzName + " for " + applet._id + " \n"+ Clazz.getStackTrace());
	_Loader.loadClass(clazzName);
	return evalType(clazzName);
};

/**
 * BH: possibly useful for debugging
 */ 
Clazz.currentPath= "";

/**
 * Load *.js by adding script elements into head. Hook the onload event to
 * load the next class in dependency tree.
 */
/* private */
var loadScript = function (node, file, why, ignoreOnload, fSuccess, _loadScript) {

	Clazz.currentPath = file;
	if (ignoreOnload)alert("WHY>>")
//BH removed	// maybe some scripts are to be loaded without needs to know onload event.
//	if (!ignoreOnload && loadedScripts[file]) {
//		_Loader.tryToLoadNext(file);
//		return;
//	}
	loadedScripts[file] = true;
	// also remove from queue
	removeArrayItem(classQueue, file);

    // forces not-found message
    isUsingXMLHttpRequest = true;
    isAsynchronousLoading = false;
  if (_Loader._checkLoad) {
    System.out.println("\t" + file + (why ? "\n -- required by " + why : "") + "  ajax=" + isUsingXMLHttpRequest + " async=" + isAsynchronousLoading)
  }

  var file0 = file;
  if (Clazz._debugging) {
    file = file.replace(/\.z\.js/,".js");
  }

	_Loader.onScriptLoading(file);
	if (isUsingXMLHttpRequest && !isAsynchronousLoading) {
		// alert("\t" + file + (why ? "\n -- required by " + why : "") + "  ajax=" + isUsingXMLHttpRequest + " async=" + isAsynchronousLoading + " " + Clazz.getStackTrace())
		// synchronous loading
		// works in MSIE locally unless a binary file :)
		// from Jmol.api.Interface only
		var data = J2S._getFileData(file);
    try{
		  evaluate(file, file0, data);
    }catch(e) {
      var s = ""+e;
      if (s.indexOf("missing ] after element list")>= 0)
        s = "File not found";
      alert(s + " loading file " + file + ": " + node.name + " - " + Clazz._lastDecorated + (e.stack ? "\n\n" + e.stack : Clazz.getStackTrace()));
    }
    if (fSuccess) {
   
//      System.out.println("firing in loadScript " + file + " " + (fSuccess && fSuccess.toString()))
      fSuccess(); 
    }
		return;
	}
  
  
System.out.println("for file " + file +" fSuccess = " + (fSuccess ? fSuccess.toString() : ""))
	var info = {
		dataType:"script",
		async:true, 
		type:"GET", 
		url:file,
		success:W3CScriptOnCallback(file, false, fSuccess),
		error:W3CScriptOnCallback(file, true, fSuccess)
	};
	inLoadingThreads++;
	J2S.$ajax(info);
};

var removeArrayItem = function(arr, item) {
	var i = findArrayItem(arr, item);
	if (i >= 0) {
		var n = arr.length - 1;
		for (; i < n; i++)
			arr[i] = arr[i + 1];
		arr.length--;
		return true;
	}
}


/* private */
var W3CScriptOnCallback = function (path, forError, fSuccess) {
  var s = Clazz.getStackTrace();
  // if (!fSuccess)alert("why no fSuccess?" + s)
	return function () {
  //System.out.println("returning " + (fSuccess ? fSuccess.toString() : "no function ") + s) 
		if (forError && __debuggingBH)Clazz.alert ("############ forError=" + forError + " path=" + path + " ####" + (forError ? "NOT" : "") + "LOADED###");
		if (isGecko && this.timeoutHandle)
			window.clearTimeout(this.timeoutHandle), this.timeoutHandle = null;
		if (inLoadingThreads > 0)
			inLoadingThreads--;
		//System.out.println("w3ccalback for " + path + " " + inLoadingThreads + " threads")
		this.onload = null;
		this.onerror = null;
		if (forError) 
			alert ("There was a problem loading " + path);
		_Loader.onScriptLoaded(path, true);
		var node = this;			
		var f;
    if (fSuccess)
      f = function(_W3scriptFS){removeScriptNode(node);tryToLoadNext(path, fSuccess); };
    else
      f = function(_W3script){removeScriptNode(node);tryToLoadNext(path)};
		if (loadingTimeLag >= 0)
			window.setTimeout(function() { tryToLoadNext(path, f); }, loadingTimeLag);
		else
			tryToLoadNext(path, f);
	};
};

/* private */
var isLoadingEntryClass = true;

/* private */
var besidesJavaPackage = false;

/**
 * After class is loaded, this method will be executed to check whether there
 * are classes in the dependency tree that need to be loaded.
 */
/* private */
var tryToLoadNext = function (file, fSuccess) {
	var node = mapPath2ClassNode["@" + file];
	if (!node) // maybe class tree root
		return;
	var n;
  // check for content loaded
	var clazzes = classpathMap["$" + file];
	if (clazzes) {
		for (var i = 0; i < clazzes.length; i++) {
			var name = clazzes[i];
			if (name != node.name && (n = findNode(name))) {
				if (n.status < Node.STATUS_CONTENT_LOADED) {
					n.status = Node.STATUS_CONTENT_LOADED;
					updateNode(n);
				}
			} else {
				n = new Node();
				n.name = name;
				var pp = classpathMap["#" + name];
				if (!pp) {
					alert (name + " J2S error in tryToLoadNext");
					error("Java2Script implementation error! Please report this bug!");
				}
				n.path = pp;
				mappingPathNameNode (n.path, name, n);
				n.status = Node.STATUS_CONTENT_LOADED;
        
        
        
				addChildClassNode(clazzTreeRoot, n, false);
        
        
				updateNode(n);
        
			}
		}
	}
	if (node instanceof Array) {
		for (var i = 0; i < node.length; i++) {
			if (node[i].status < Node.STATUS_CONTENT_LOADED) {
				node[i].status = Node.STATUS_CONTENT_LOADED;
				updateNode(node[i]);
			}
		}
	} else if (node.status < Node.STATUS_CONTENT_LOADED) {
		var stillLoading = false;
		var ss = document.getElementsByTagName ("SCRIPT");
		for (var i = 0; i < ss.length; i++) {
			if (isIE) {
				if (ss[i].onreadystatechange && ss[i].onreadystatechange.path == node.path
						&& ss[i].readyState == "interactive") {
					stillLoading = true;
					break;
				}
			} else if (ss[i].onload && ss[i].onload.path == node.path) {
				stillLoading = true;
				break;
			}
		}
		if (!stillLoading) {
			node.status = Node.STATUS_CONTENT_LOADED;
			updateNode(node);
		}
	}
	/*
	 * Maybe in #optinalLoaded inside above _Loader#updateNode calls, 
	 * _Loader.keepOnLoading is set false (Already loaded the wanted
	 * classes), so here check to stop.
	 */
	 
	if (!_Loader.keepOnLoading) // set externally
		return;

 // check for a "must" class that has content and load it
	var cq;
	var working = true;
	if ((n = findNextMustClass(Node.STATUS_KNOWN))) {
		loadClassNode(n);
		while (inLoadingThreads < maxLoadingThreads) {
			if (!(n = findNextMustClass(Node.STATUS_KNOWN)))
				break;
			loadClassNode(n); // will increase inLoadingThreads!
		}
	} else if ((cq = classQueue).length != 0) { 
		/* queue must be loaded in order! */
		n = cq.shift();
		if (!loadedScripts[n.path] 
				|| cq.length != 0 
				|| !isLoadingEntryClass
				|| n.musts.length
				|| n.optionals.length) {
			addChildClassNode(clazzTreeRoot, n, true);
			loadScript(n, n.path, n.requiredBy, false);
		} else if (isLoadingEntryClass) {
			/*
			 * The first time reaching here is the time when ClassLoader
			 * is trying to load entry class. Class with #main method and
			 * is to be executed is called Entry Class.
			 *
			 * Here when loading entry class, ClassLoader should not call
			 * the next following loading script. This is because, those
			 * scripts will try to mark the class as loaded directly and
			 * then continue to call #onLoaded callback method,
			 * which results in an script error!
			 */
			isLoadingEntryClass = false;
		}
	} else if ((n = findNextRequiredClass(Node.STATUS_KNOWN))) {
		loadClassNode(n);
		while (inLoadingThreads < maxLoadingThreads) {
			if (!(n = findNextRequiredClass(Node.STATUS_KNOWN)))
				break;
			loadClassNode(n); // will increase inLoadingThreads!
		}
	} else {
		working = false;
	}
	if (working || inLoadingThreads > 0)
		return;
  // 
  // now check all classes that MUST be loaded prior to initialization 
  // of some other class (static calls, extends, implements)
  // and all classes REQUIRED somewhere in that class, possibly by the constructor
  // (that is, "new xxxx()" called somewhere in code) and update them
  // that have content but are not declared already 
	var f = [findNextMustClass,findNextRequiredClass];
	var lastNode = null;
	for (var i = 0; i < 2; i++) {
    var pt = 0;
		while ((n = f[i](Node.STATUS_CONTENT_LOADED))) {
			if (i == 1 && lastNode === n) // Already existed cycle ?
				n.status = Node.STATUS_LOAD_COMPLETE;
			updateNode(n);
			lastNode = n;
      if (pt++ == 1000) {
        alert("There seems to be a problem loading " + n.name+ ". Check all imports and make sure that those files really exist. This could be a java.xxx vs java.xxx issue.\n"+Clazz._lastEvalError)
        break;
      } 
		}
  }
  // check for load cycles
  
	while (true) {
		tracks = [];
		if (!checkCycle(clazzTreeRoot, file))
			break;
	}
  
  // and update all MUST and REQUIRED classes that are declared already 
  
	for (var i = 0; i < 2; i++) {
		lastNode = null;
		while ((n = f[i](Node.STATUS_DECLARED))) {
			if (lastNode === n) 
				break;
			updateNode(lastNode = n);
		}
	}
	var done = [];
	for (var i = 0; i < 2; i++) 
		while ((n = f[i](Node.STATUS_DECLARED)))
			done.push(n), n.status = Node.STATUS_LOAD_COMPLETE;
	if (done.length) {
		for (var i = 0; i < done.length; i++)
			destroyClassNode(done[i]);
		for (var i = 0; i < done.length; i++)
			if ((f = done[i].onLoaded))
				done[i].onLoaded = null, f();
	}
  
  if (_Loader._checkLoad)  
  System.out.println("classes loaded: " + Clazz._Loader._classCountOK + "; maximum dependency depth: " + Clazz._nodeDepth);

	//System.out.println(node.name + " loaded completely" + _Loader.onGlobalLoaded + "\n\n")
  if (fSuccess) {
    //System.out.println("tryToLoadNext firing " + _Loader._classCountOK + "/" + _Loader._classCountPending + " "   + fSuccess.toString() + " " + Clazz.getStackTrace())
	  fSuccess();
  } else if (_Loader._classCountPending) {
    for (var name in _Loader._classPending) {
      var n = findNode(name);
      System.out.println("class left pending " + name + " " + n);
      if (n) {
        updateNode(n);
        break;
      }
    }
  } else {
    
 // System.out.println("I think I'm done " 
  // + _Loader._classCountOK + "/" + _Loader._classCountPending + " " 
   //+ _Loader.onGlobalLoaded.toString() + " " + Clazz.getStackTrace()
 //  )
    if (_Loader._checkLoad) {
      System.out.println("I think I'm done: " + Clazz.saemCount0 + " methods, " + Clazz.saemCount1 + " overridden, " + Clazz.saemCount2 + " processed");
      Clazz.showDuplicates(true);
    }
  }
	_Loader.onGlobalLoaded();
};


var tracks = [];

/*
 * There are classes reference cycles. Try to detect and break those cycles.
 */
/* private */
var checkCycle = function (node, file) {
	var ts = tracks;
	var len = ts.length;
  // add this node to tracks
	ts.push(node);
	var i = len;
	for (; --i >= 0;)
		if (ts[i] === node && ts[i].status >= Node.STATUS_DECLARED) 
			break;
	if (i >= 0) {
    // this node is already in tracks, and it has been declared already
    // for each node in tracks, set its status to "LOAD_COMPLETE"
    // update all parents, remove all parents, and fire its onLoaded function
    // then clear tracks and return true (keep checking)  
    if (_Loader._checkLoad) {
      var msg = "cycle found loading " + file + " for " + node;
      System.out.println(msg)
    } 
		for (; i < len; i++) {
      var n = ts[i];
			n.status = Node.STATUS_LOAD_COMPLETE;
			destroyClassNode(n); // Same as above
			for (var k = 0; k < n.parents.length; k++)
				updateNode(n.parents[k]);
			n.parents = [];
      var f = n.onLoaded;
      if (_Loader._checkLoad) {
        var msg = "cycle setting status to LOAD_COMPLETE for " + n.name + (f ? " firing " + f.toString() : "");
        System.out.println(msg)
      } 
			if (f)
				n.onLoaded = null, f();
		}
		ts.length = 0;
		return true;
	}
	var a = [node.musts, node.optionals];
	for (var j = 0; j < 2; j++)
		for (var r = a[j], i = r.length; --i >= 0;)
			if (r[i].status == Node.STATUS_DECLARED && checkCycle(r[i], file)) 
				return true;
  // reset _tracks to its original length      
	ts.length = len;
	return false; // done 
};


_Loader._classCountPending = 0;
_Loader._classCountOK = 0;
_Loader._classPending = {};

_Loader.showPending = function() {
  var a = [];
  for (var name in _Loader._classPending) {
    var n = findNode(name);
    if (!n) {
      alert("No node for " + name);
      continue;
    }
    a.push(n);
    System.out.println(showNode("", "", n, "", 0));     
  }  
  return a;
}

var showNode = function(s, names, node, inset, level) {
  names += "--" + node.name;
  s += names + "\n";
  if (level > 5) {
    s += inset + " ...\n";
    return s;
  }
  inset += "\t";
  s += inset + "status: " + node.status + "\n";
  if (node.parents && node.parents.length && node.parents[0] && node.parents[0].name) {
    s += inset + "parents: " + node.parents.length + "\n";
    for (var i = 0; i < node.parents.length; i++) {
      s = showNode(s, names, node.parents[i], inset + "\t", level+1);
    }
    s += "\n";
  }
//  if (node.requiredBy) {
//    s += inset + "requiredBy:\n";
//    s = showNode(s, names, node.requiredBy, inset + "\t", level+1);
//    s += "\n";
//  }
  return s;    
}     

Clazz.nodeDepth = 0;
/**
 * Update the dependency tree nodes recursively.
 */
/* private */
updateNode = function(node, ulev, chain, _updateNode) {
  ulev || (ulev = 0);
  chain || (chain = "");
  ulev++;
  if (ulev > 250) // something is wrong -- we want to see why
    chain += (node == null ? "" : node.name + "\t")
  if (ulev > Clazz._nodeDepth)
    Clazz._nodeDepth = ulev;
  if (ulev % 300 == 0)alert(ulev + " " + chain)
	if (!node.name || node.status >= Node.STATUS_LOAD_COMPLETE) {
		destroyClassNode(node);
		return;
	}
	var ready = true;
  // check for declared and also having MUSTS
	if (node.musts.length && node.declaration) {
		for (var mustLength = node.musts.length, i = mustLength; --i >= 0;) {
			var n = node.musts[i];
			n.requiredBy = node;
			if (n.status < Node.STATUS_DECLARED && isClassDefined (n.name)) {
				var nns = []; // a stack for onLoaded events
				n.status = Node.STATUS_LOAD_COMPLETE;
				destroyClassNode(n); // Same as above
				if (n.declaration	&& n.declaration.clazzList) {
					// For those classes within one *.js file, update them synchronously.
					for (var j = 0, list = n.declaration.clazzList, l = list.length; j < l; j++) {
						var nn = findNode (list[j]);
						if (nn && nn.status != Node.STATUS_LOAD_COMPLETE
								&& nn !== n) {
							nn.status = n.status;
							nn.declaration = null;
							destroyClassNode(nn);
							nn.onLoaded && nns.push(nn);
						}
					}
					n.declaration = null;
				}
        // fire all onLoaded events
				if (n.onLoaded)
					nns.push(n);
				for (var j = 0; j < nns.length; j++) {
					var onLoaded = nns[j].onLoaded;
					if (onLoaded) {
						nns[j].onLoaded = null;
						onLoaded();
					}
				}
			} else {
				(n.status == Node.STATUS_CONTENT_LOADED) && updateNode(n, ulev, chain); // musts may be changed
				if (n.status < Node.STATUS_DECLARED)
					ready = false;
			}
			if (node.musts.length != mustLength) {
				// length changed -- restart!
				i = mustLength = node.musts.length;
				ready = true;
			}
		}
	}
	if (!ready)
		return;
	if (node.status < Node.STATUS_DECLARED) {
		var decl = node.declaration;
		if (decl) {
      var vallow = allowImplicit;
      allowImplicit = true;
			decl(), decl.executed = true;
      allowImplicit = vallow;
    }
    if(_Loader._checkLoad) {
            if (_Loader._classPending[node.name]) {
              delete _Loader._classPending[node.name];
              _Loader._classCountOK;
              _Loader._classCountPending--;
//              System.out.println("OK " + (_Loader._classCountOK) + " FOR " + node.name)
            }
    }
		node.status = Node.STATUS_DECLARED;
		if (definedClasses)
			definedClasses[node.name] = true;
		_Loader.onScriptInitialized(node.path);
		if (node.declaration && node.declaration.clazzList) {
			// For those classes within one *.js file, update them synchronously.
			for (var j = 0, list = node.declaration.clazzList, l = list.length; j < l; j++) {
				var nn = findNode(list[j]);
				if (nn && nn.status != Node.STATUS_DECLARED
						&& nn !== node) {
					nn.status = Node.STATUS_DECLARED;
					if (definedClasses)
						definedClasses[nn.name] = true;
					_Loader.onScriptInitialized(nn.path);
				}
			}
		}
	}
	var level = Node.STATUS_DECLARED;
	if (node.optionals.length == 0 && node.musts.length == 0
			|| node.status > Node.STATUS_KNOWN && !node.declaration
			|| checkStatusIs(node.musts, Node.STATUS_LOAD_COMPLETE)
					&& checkStatusIs(node.optionals, Node.STATUS_LOAD_COMPLETE)) { 
		level = Node.STATUS_LOAD_COMPLETE;
		if (!doneLoading(node, level))
			return false;
			// For those classes within one *.js file, update them synchronously.
		if (node.declaration && node.declaration.clazzList) {
			for (var j = 0, list = node.declaration.clazzList, l = list.length; j < l; j++) {
				var nn = findNode(list[j]);
				if (nn && nn.status != level && nn !== node) {
					nn.declaration = null;
					if (!doneLoading(nn, level))
						return false;
				}
			}
		}
	}
  // _Loader.updateParents = function (node, level, _updateParents)
	if (node.parents && node.parents.length) {
  	for (var i = 0; i < node.parents.length; i++) {
  		var p = node.parents[i];
  		if (p.status < level) 
  			updateNode(p, ulev, chain, p.name);
  	}
  	if (level == Node.STATUS_LOAD_COMPLETE)
  		node.parents = [];
  }
};

/* private */
var checkStatusIs = function(arr, status){
	for (var i = arr.length; --i >= 0;)
		if (arr[i].status < status)
			return false;
	return true;
}
/* private */
var doneLoading = function(node, level, _doneLoading) {
	node.status = level;
	_Loader.onScriptCompleted(node.path);
  
	var onLoaded = node.onLoaded;
	if (onLoaded) {
		node.onLoaded = null;
		onLoaded();
		if (!_Loader.keepOnLoading)
			return false;
	}
  
	destroyClassNode(node);
	return true;
}

/*
 * Be used to record already used random numbers. And next new random
 * number should not be in the property set.
 */
/* private */
var usedRandoms = {
  "r0.13412" : 1
};

/* private */
var getRnd = function() {
	while (true) { // get a unique random number
		var rnd = Math.random();
		var s = "r" + rnd;
		if (!usedRandoms[s])
			return (usedRandoms[s] = 1, clazzTreeRoot.random = rnd);
	}
}

/* protected */
var findNode = function(clazzName) {
	getRnd();
	return findNodeUnderNode(clazzName, clazzTreeRoot);
};

/* private */
var findNextRequiredClass = function(status) {
	getRnd();
	return findNextRequiredNode(clazzTreeRoot, status);
};

/* private */
var findNextMustClass = function(status) {
	return findNextMustNode(clazzTreeRoot, status);
};

/* private */
var findNodeUnderNode = function(clazzName, node) {
	var n;
	// node, then musts then optionals
	return (node.name == clazzName ? node 
		: (n = findNodeWithin(clazzName, node.musts))
		|| (n = findNodeWithin(clazzName, node.optionals)) 
		? n : null);
};

/* private */
var findNodeWithin = function(name, arr) {
	var rnd = clazzTreeRoot.random;
	for (var i = arr.length; --i >= 0;) {
		var n = arr[i];
		if (n.name == name)
			return n;
		if (n.random != rnd) {
			n.random = rnd;
			if ((n = findNodeUnderNode(name, n)))
				return n;
		}
	}
	return null;
}

/* private */
var checkStatus = function(n, status) {
	return (n.status == status 
			&& (status != Node.STATUS_KNOWN || !loadedScripts[n.path])
			&& (status == Node.STATUS_DECLARED	|| !isClassDefined (n.name)));
}

/* private */
var findNextMustNode = function(node, status) {
	for (var i = node.musts.length; --i >= 0;) {
		var n = node.musts[i];
		if (checkStatus(n, status) || (n = findNextMustNode(n, status)))
			return n;	
	}
	return (checkStatus(node, status) ? node : null); 
};

/* private */
var findNextRequiredNode = function (node, status) {
	// search musts first
	// search optionals second
	// search itself last
	var n;
	return ((n = searchClassArray(node.musts, status))
		|| (n = searchClassArray(node.optionals, status))
		|| checkStatus(n = node, status) ? n : null);
};

/* private */
var searchClassArray = function (arr, status) {
	if (arr) {
		var rnd = clazzTreeRoot.random;
		for (var i = 0; i < arr.length; i++) {
			var n = arr[i];
			if (checkStatus(n, status))
				return n;
			if (n.random != rnd) {
				n.random = rnd; // mark as visited!
				if ((n = findNextRequiredNode(n, status)))
					return n;
			}
		}
	}
	return null;
};

/**
 * This map variable is used to mark that *.js is correctly loaded.
 * In IE, _Loader has defects to detect whether a *.js is correctly
 * loaded or not, so inner loading mark is used for detecting.
 */
/* private */
var innerLoadedScripts = {};

/**
 * This method will be called in almost every *.js generated by Java2Script
 * compiler.
 */
/* public */
var load = function (musts, name, optionals, declaration) {
  // called as name.load in Jmol
	if (name instanceof Array) {
		unwrapArray(name);
		for (var i = 0; i < name.length; i++)
			load(musts, name[i], optionals, declaration, name);
		return;
	}	

  if (_Loader._checkLoad) {
    if (_Loader._classPending[name]) {
      //alert("duplicate load for " + name)
    } else {
      _Loader._classPending[name] = 1;
      if (_Loader._classCountPending++ == 0)
        _Loader._classCountOK = 0;
      System.out.println("Loading class " + name);
    }
  }

//	if (clazz.charAt (0) == '$')
//		clazz = "org.eclipse.s" + clazz.substring (1);
	var node = mapPath2ClassNode["#" + name];
	if (!node) { // load called inside *.z.js?
		var n = findNode(name);
		node = (n ? n : new Node());
		node.name = name;
		node.path = classpathMap["#" + name] || "unknown";
		mappingPathNameNode(node.path, name, node);
		node.status = Node.STATUS_KNOWN;
		addChildClassNode(clazzTreeRoot, node, false);
	}
	processRequired(node, musts, true);
	if (arguments.length == 5 && declaration) {
		declaration.status = node.status;
		declaration.clazzList = arguments[4];
	}
	node.declaration = declaration;
	if (declaration) 
		node.status = Node.STATUS_CONTENT_LOADED;
	processRequired(node, optionals, false);
};

/* private */
var processRequired = function(node, arr, isMust) {
	if (arr && arr.length) {
		unwrapArray(arr);
		for (var i = 0; i < arr.length; i++) {
			var name = arr[i];
			if (!name)
				continue;
			if (isClassDefined(name)
					|| isClassExcluded(name))
				continue;
			var n = findNode(name);
			if (!n) {
				n = new Node();
				n.name = name;
				n.status = Node.STATUS_KNOWN;
			}
			n.requiredBy = node;
			addChildClassNode(node, n, isMust);
		}
	}
}

/*
 * Try to be compatiable of Clazz
 */
if (window["Clazz"]) {
	Clazz.load = load;
} else {
  _Loader.load = load;
}  
/**
 * Map different class to the same path! Many classes may be packed into
 * a *.z.js already.
 *
 * @path *.js path
 * @name class name
 * @node Node object
 */
/* private */
var mappingPathNameNode = function (path, name, node) {
	var map = mapPath2ClassNode;
	var keyPath = "@" + path;
	var v = map[keyPath];
	if (v) {
		if (v instanceof Array) {
			var existed = false;
			for (var i = 0; i < v.length; i++) {
				if (v[i].name == name) {
					existed = true;
					break;
				}
			}
			if (!existed)
				v.push(node);
		} else {
			map[keyPath] = [v, node];
		}
	} else {
		map[keyPath] = node;
	}
	map["#" + name] = node;
};

/* protected */
var loadClassNode = function (node) {
	var name = node.name;
	if (!isClassDefined (name) 
			&& !isClassExcluded (name)) {
		var path = _Loader.getClasspathFor (name/*, true*/);
		node.path = path;
		mappingPathNameNode (path, name, node);
		if (!loadedScripts[path]) {
			loadScript(node, path, node.requiredBy, false);
			return true;
		}
	}
	return false;
};


/**
 * Used in package
/* public */
var runtimeKeyClass = _Loader.runtimeKeyClass = "java.lang.String";

/**
 * Queue used to store classes before key class is loaded.
 */
/* private */
var queueBe4KeyClazz = [];

/* private */
var J2sLibBase;

/**
 * Return J2SLib base path from existed SCRIPT src attribute.
 */
/* public */
_Loader.getJ2SLibBase = function () {
	var o = window["j2s.lib"];
	return (o ? o.base + (o.alias == "." ? "" : (o.alias ? o.alias : (o.version ? o.version : "1.0.0")) + "/") : null);
};

/**
 * Indicate whether _Loader is loading script synchronously or 
 * asynchronously.
 */
/* private */
var isAsynchronousLoading = true;

/* private */
var isUsingXMLHttpRequest = false;

/* private */
var loadingTimeLag = -1;

_Loader.MODE_SCRIPT = 4;
_Loader.MODE_XHR = 2;
_Loader.MODE_SYNC = 1;

/**
 * String mode:
 * asynchronous modes:
 * async(...).script, async(...).xhr, async(...).xmlhttprequest,
 * script.async(...), xhr.async(...), xmlhttprequest.async(...),
 * script
 * 
 * synchronous modes:
 * sync(...).xhr, sync(...).xmlhttprequest,
 * xhr.sync(...), xmlhttprequest.sync(...),
 * xmlhttprequest, xhr
 *                                                    
 * Integer mode:
 * Script 4; XHR 2; SYNC bit 1; 
 */
/* public */
_Loader.setLoadingMode = function (mode, timeLag) {
	var async = true;
	var ajax = true;
	if (typeof mode == "string") {
		mode = mode.toLowerCase();
		if (mode.indexOf("script") >= 0)
			ajax = false;
		else
			async = (mode.indexOf("async") >=0);
		async = false; // BH
	} else {
		if (mode & _Loader.MODE_SCRIPT)
			ajax = false;
		else
			async = !(mode & _Loader.MODE_SYNC);
	}
	isUsingXMLHttpRequest = ajax;
	isAsynchronousLoading = async;
	loadingTimeLag = (async && timeLag >= 0 ? timeLag: -1);
	return async;
};

/* private */
var runtimeLoaded = function () {
	if (pkgRefCount	|| !isClassDefined(runtimeKeyClass))
		return;
	var qbs = queueBe4KeyClazz;
	for (var i = 0; i < qbs.length; i++)
		_Loader.loadClass(qbs[i][0], qbs[i][1]);
	queueBe4KeyClazz = [];
};

/*
 * Load those key *.z.js. This *.z.js will be surely loaded before other 
 * queued *.js.
 */
/* public */
_Loader.loadZJar = function (zjarPath, keyClass) {
// used only by package.js for core.z.js
	var f =	null;
	var isArr = (keyClass instanceof Array);
	if (isArr)
		keyClass = keyClass[keyClass.length - 1];
	else
		f = (keyClass == runtimeKeyClass ? runtimeLoaded : null);			
	_Loader.jarClasspath(zjarPath, isArr ? keyClass : [keyClass]);
	// BH note: runtimeKeyClass is java.lang.String	
	_Loader.loadClass(keyClass, f, true);
};

var NodeMap = {};
var _allNodes = [];

/**
 * The method help constructing the multiple-binary class dependency tree.
 */
/* private */
var addChildClassNode = function (parent, child, isMust) {
	var existed = false;
	var arr;
	if (isMust) {
		arr = parent.musts;
		if (!child.requiredBy)
			child.requiredBy = parent;
//		if (!parent.requiresMap){
//			parent.requires = [];
//			parent.requiresMap = {};
//		}
//		if (!parent.requiresMap[child.name]) {
//			parent.requiresMap[child.name] = 1;
//			parent.requires.push[child];
//		}
	} else {
		arr = parent.optionals;
	}
	if (!NodeMap[child.name]) {
		_allNodes.push(child)
		NodeMap[child.name]=child
	}
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].name == child.name) {
			existed = true;
			break;
		}
	}
	if (!existed) {
		arr.push(child);
		if (isLoadingEntryClass 
				&& child.name.indexOf("java") != 0 
				&& child.name.indexOf("net.sf.j2s.ajax") != 0) {
			if (besidesJavaPackage)
				isLoadingEntryClass = false;
			besidesJavaPackage = true;
//		} else if (child.name.indexOf("org.eclipse.swt") == 0 
//				|| child.name.indexOf("$wt") == 0) {
//			window["swt.lazy.loading.callback"] = swtLazyLoading;
//			if (needPackage("org.eclipse.swt"))
//				return _Loader.loadPackage("org.eclipse.swt", function() {addParentClassNode(child, parent)});
		}
	}
	addParentClassNode(child, parent);
};

/* private */
var addParentClassNode = function(child, parent) {
	if (parent.name && parent != clazzTreeRoot && parent != child)
		for (var i = 0; i < child.parents.length; i++)
			if (child.parents[i].name == parent.name)
				return;
	child.parents.push(parent);
}

/* private */
var destroyClassNode = function (node) {
	var parents = node.parents;
	if (parents)
		for (var k = parents.length; --k >= 0;)
			removeArrayItem(parents[k].musts, node) || removeArrayItem(parents[k].optionals, node);
};

var removeArrayItem = function(arr, item) {
	var i = findArrayItem(arr, item);
	if (i >= 0) {
		var n = arr.length - 1;
		for (; i < n; i++)
			arr[i] = arr[i + 1];
		arr.length--;
		return true;
	}
}

/* public */
_Loader.unloadClassExt = function (qClazzName) {
	if (definedClasses)
		definedClasses[qClazzName] = false;
	if (classpathMap["#" + qClazzName]) {
		var pp = classpathMap["#" + qClazzName];
		classpathMap["#" + qClazzName] = null;
		var arr = classpathMap["$" + pp];
		removeArrayItem(arr, qClazzName) && (classpathMap["$" + pp] = arr);
	}
	var n = findNode(qClazzName);
	if (n) {
		n.status = Node.STATUS_KNOWN;
		loadedScripts[n.path] = false;
	}
	var path = _Loader.getClasspathFor (qClazzName);
	loadedScripts[path] = false;
	innerLoadedScripts[path] && (innerLoadedScripts[path] = false);
	_Loader.onClassUnloaded(qClazzName);
};

/* private */
var assureInnerClass = function (clzz, fun) {
	clzz = clzz.__CLASS_NAME__;
	if (unloadedClasses[clzz]) {
		if (clzz.indexOf("$") >= 0)
			return;
		var list = [];
		var key = clzz + "$";
		for (var s in unloadedClasses)
			if (unloadedClasses[s] && s.indexOf(key) == 0)
				list.push(s);
		if (!list.length) 
			return;
		fun = "" + fun;
		var idx1, idx2;
		if ((idx1 = fun.indexOf(key)) < 0 || (idx2 = fun.indexOf("\"", idx1 + key.length)) < 0) 
			return;
		clzz = fun.substring(idx1, idx2);
		if (!unloadedClasses[clzz] || (idx1 = fun.indexOf("{", idx2) + 1) == 0)
			return;
		if ((idx2 = fun.indexOf("(" + clzz + ",", idx1 + 3)) < 0
			|| (idx2 = fun.lastIndexOf("}", idx2 - 1)) < 0)
				return;
		eval(fun.substring(idx1, idx2));
		unloadedClasses[clzz] = null;
	}
};

Clazz.binaryFolders =  _Loader.binaryFolders = [ _Loader.getJ2SLibBase() ];

})(Clazz, Clazz._Loader);

//}
/******************************************************************************
 * Copyright (c) 2007 java2script.org and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Zhou Renjian - initial API and implementation
 *****************************************************************************/
/*******
 * @author zhou renjian
 * @create Jan 11, 2007
 *******/

Clazz._LoaderProgressMonitor = {};

;(function(CLPM, J2S) {

var fadeOutTimer = null;
var fadeAlpha = 0;
var monitorEl = null;
var lastScrollTop = 0;
var bindingParent = null;

CLPM.DEFAULT_OPACITY = (J2S && J2S._j2sLoadMonitorOpacity ? J2S._j2sLoadMonitorOpacity : 55);

/* public */
/*CLPM.initialize = function (parent) {
	bindingParent = parent;
	if (parent && !attached) {
		attached = true;
		//Clazz.addEvent (window, "unload", cleanup);
		// window.attachEvent ("onunload", cleanup);
	}
};
*/

/* public */
CLPM.hideMonitor = function () {
  	monitorEl.style.display = "none";
}

/* public */
CLPM.showStatus = function (msg, fading) {
	if (!monitorEl) {
		createHandle ();
		if (!attached) {
			attached = true;
			//Clazz.addEvent (window, "unload", cleanup);
			// window.attachEvent ("onunload", cleanup);
		}
	}
	clearChildren(monitorEl);
  if (msg == null) {
    if (fading) {
      fadeOut();
    } else {
    	CLPM.hideMonitor();
    }
    return;
  }
  
	monitorEl.appendChild(document.createTextNode ("" + msg));
	if (monitorEl.style.display == "none") {
		monitorEl.style.display = "";
	}
	setAlpha(CLPM.DEFAULT_OPACITY);
	var offTop = getFixedOffsetTop();
	if (lastScrollTop != offTop) {
		lastScrollTop = offTop;
		monitorEl.style.bottom = (lastScrollTop + 4) + "px";
	}
	if (fading) {
		fadeOut();
	}
};

/* private static */ 
var clearChildren = function (el) {
	if (!el)
		return;
	for (var i = el.childNodes.length; --i >= 0;) {
		var child = el.childNodes[i];
		if (!child)
			continue;
		if (child.childNodes && child.childNodes.length)
			clearChildren (child);
		try {
			el.removeChild (child);
		} catch (e) {};
	}
};
/* private */ 
var setAlpha = function (alpha) {
	if (fadeOutTimer && alpha == CLPM.DEFAULT_OPACITY) {
		window.clearTimeout (fadeOutTimer);
		fadeOutTimer = null;
	}
	fadeAlpha = alpha;
	var ua = navigator.userAgent.toLowerCase();
	monitorEl.style.filter = "Alpha(Opacity=" + alpha + ")";
	monitorEl.style.opacity = alpha / 100.0;
};
/* private */ 
var hidingOnMouseOver = function () {
  CLPM.hideMonitor();
};

/* private */ 
var attached = false;
/* private */ 
var cleanup = function () {
	//if (monitorEl) {
	//	monitorEl.onmouseover = null;
	//}
	monitorEl = null;
	bindingParent = null;
	//Clazz.removeEvent (window, "unload", cleanup);
	//window.detachEvent ("onunload", cleanup);
	attached = false;
};
/* private */ 
var createHandle = function () {
	var div = document.createElement ("DIV");
	div.id = "_Loader-status";
	div.style.cssText = "position:absolute;bottom:4px;left:4px;padding:2px 8px;"
			+ "z-index:" + (window["j2s.lib"].monitorZIndex || 10000) + ";background-color:#8e0000;color:yellow;" 
			+ "font-family:Arial, sans-serif;font-size:10pt;white-space:nowrap;";
	div.onmouseover = hidingOnMouseOver;
	monitorEl = div;
	if (bindingParent) {
		bindingParent.appendChild(div);
	} else {
		document.body.appendChild(div);
	}
	return div;
};
/* private */ 

var fadeOut = function () {
	if (monitorEl.style.display == "none") return;
	if (fadeAlpha == CLPM.DEFAULT_OPACITY) {
		fadeOutTimer = window.setTimeout(function () {
					fadeOut();
				}, 750);
		fadeAlpha -= 5;
	} else if (fadeAlpha - 10 >= 0) {
		setAlpha(fadeAlpha - 10);
		fadeOutTimer = window.setTimeout(function () {
					fadeOut();
				}, 40);
	} else {
		monitorEl.style.display = "none";
	}
};
/* private */
var getFixedOffsetTop = function (){
	if (bindingParent) {
		var b = bindingParent;
		return b.scrollTop;
	}
	var dua = navigator.userAgent;
	var b = document.body;
	var p = b.parentNode;
	var pcHeight = p.clientHeight;
	var bcScrollTop = b.scrollTop + b.offsetTop;
	var pcScrollTop = p.scrollTop + p.offsetTop;
	return (dua.indexOf("Opera") < 0 && document.all ? (pcHeight == 0 ? bcScrollTop : pcScrollTop)
		: dua.indexOf("Gecko") < 0 ? (pcHeight == p.offsetHeight 
				&& pcHeight == p.scrollHeight ? bcScrollTop : pcScrollTop) : bcScrollTop);
};

/* not used in Jmol
if (window["ClazzLoader"]) {
	_Loader.onScriptLoading = function(file) {
		CLPM.showStatus("Loading " + file + "...");
	};
	_Loader.onScriptLoaded = function(file, isError) {
		CLPM.showStatus(file + (isError ? " loading failed." : " loaded."), true);
	};
	_Loader.onGlobalLoaded = function(file) {
		CLPM.showStatus("Application loaded.", true);
	};
	_Loader.onClassUnloaded = function(clazz) {
		CLPM.showStatus("Class " + clazz + " is unloaded.", true);
  };
}
*/

})(Clazz._LoaderProgressMonitor, J2S);

//}
/******************************************************************************
 * Copyright (c) 2007 java2script.org and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Zhou Renjian - initial API and implementation
 *****************************************************************************/
/*******
 * @author zhou renjian
 * @create Nov 5, 2005
 *******/

;(function(Con, Sys) {
/**
 * Setting maxTotalLines to -1 will not limit the console result
 */
/* protected */
Con.maxTotalLines =	10000;

/* protected */
Con.setMaxTotalLines = function (lines) {
	Con.maxTotalLines = (lines > 0 ? lines : 999999);
}

/* protected */
Con.maxLatency = 40;

/* protected */
Con.setMaxLatency = function (latency) {
	Con.maxLatency = (latency > 0 ? latency : 40);
};

/* protected */
Con.pinning  = false;

/* protected */
Con.enablePinning = function (enabled) {
	Con.pinning = enabled;
};

/* private */
Con.linesCount = 0;

/* private */
Con.metLineBreak = false;


/*
 * Give an extension point so external script can create and bind the console
 * themself.
 *
 * TODO: provide more template of binding console window to browser.
 */
/* protected */
Con.createConsoleWindow = function (parentEl) {
	var console = document.createElement ("DIV");
	console.style.cssText = "font-family:monospace, Arial, sans-serif;";
	document.body.appendChild (console);
	return console;
};

var c160 = String.fromCharCode(160); //nbsp;
c160 += c160+c160+c160;

/* protected */
Con.consoleOutput = function (s, color) {
	var o = window["j2s.lib"];
	var con = (o && o.console);
  if (!con) {
		return false; // BH this just means we have turned off all console action
  }
  if (con == window.console) {
    if (color == "red")
      con.err(s);
    else
      con.log(s);
    return;
  }
	if (con && typeof con == "string")
		con = document.getElementById(con)
	if (Con.linesCount > Con.maxTotalLines) {
		for (var i = 0; i < Con.linesCount - Con.maxTotalLines; i++) {
			if (con && con.childNodes.length > 0) {
				con.removeChild (con.childNodes[0]);
			}
		}
		Con.linesCount = Con.maxTotalLines;
	}

	var willMeetLineBreak = false;
	s = (typeof s == "undefined" ? "" : s == null ? "null" : "" + s);
	s = s.replace (/\t/g, c160);
	if (s.length > 0)
		switch (s.charAt(s.length - 1)) {
		case '\n':
		case '\r':
			s = (s.length > 1 ? s.substring (0, s.length - (s.charAt (s.length - 2) == '\r' ? 2 : 1)) : "");
			willMeetLineBreak = true;
			break;
		}

	var lines = null;
	s = s.replace (/\t/g, c160);
	lines = s.split(/\r\n|\r|\n/g);
	for (var i = 0, last = lines.length - 1; i <= last; i++) {
		var lastLineEl = null;
		if (Con.metLineBreak || Con.linesCount == 0 
				|| con.childNodes.length < 1) {
			lastLineEl = document.createElement ("DIV");
			con.appendChild (lastLineEl);
			lastLineEl.style.whiteSpace = "nowrap";
			Con.linesCount++;
		} else {
			try {
				lastLineEl = con.childNodes[con.childNodes.length - 1];
			} catch (e) {
				lastLineEl = document.createElement ("DIV");
				con.appendChild (lastLineEl);
				lastLineEl.style.whiteSpace = "nowrap";
				Con.linesCount++;
			}
		}
		var el = document.createElement ("SPAN");
		lastLineEl.appendChild (el);
		el.style.whiteSpace = "nowrap";
		if (color)
			el.style.color = color;
		var l = lines[i]
		if (l.length == 0)
			l = c160;
		el.appendChild(document.createTextNode(l));
		if (!Con.pinning)
			con.scrollTop += 100;
		Con.metLineBreak = (i != last || willMeetLineBreak);
	}

	var cssClazzName = con.parentNode.className;
	if (!Con.pinning && cssClazzName
			&& cssClazzName.indexOf ("composite") != -1) {
		con.parentNode.scrollTop = con.parentNode.scrollHeight;
	}
	Con.lastOutputTime = new Date ().getTime ();
};

/*
 * Clear all contents inside the console.
 */
/* public */
Con.clear = function () {
	try {
		Con.metLineBreak = true;
		var o = window["j2s.lib"];
		var console = o && o.console;
		if (!console || !(console = document.getElementById (console)))
			return;
		var childNodes = console.childNodes;
		for (var i = childNodes.length; --i >= 0;)
			console.removeChild (childNodes[i]);
		Con.linesCount = 0;
	} catch(e){};
};

/* public */
Clazz.alert = function (s) {
	Con.consoleOutput (s + "\r\n");
};


/* public */
Sys.out.print = function (s) { 
	Con.consoleOutput (s);
};
/* public */
Sys.out.println = function(s) {
	if (Clazz._traceOutput && s && ("" + s).indexOf(Clazz._traceOutput) >= 0)
		alert(s + "\n\n" + Clazz.getStackTrace());
	Con.consoleOutput(typeof s == "undefined" ? "\r\n" : s == null ?  s = "null\r\n" : s + "\r\n");
};
Sys.out.write = function (buf, offset, len) {
	Sys.out.print(String.instantialize(buf).substring(offset, offset+len));
};

/* public */
Sys.err.__CLASS_NAME__ = "java.io.PrintStream";

/* public */
Sys.err.print = function (s) { 
	Con.consoleOutput (s, "red");
};

/* public */
Sys.err.println = function (s) {
	Con.consoleOutput (typeof s == "undefined" ? "\r\n" : s == null ?  s = "null\r\n" : s + "\r\n", "red");
};

Sys.err.write = function (buf, offset, len) {
	Sys.err.print(String.instantialize(buf).substring(offset, offset+len));
};

})(Clazz.Console, System);

// J2sJavaExt

;(function(Clazz) {

// moved here from package.js
// these classes will be created as objects prior to any others
// and are then available immediately

	Clazz._Loader.registerPackages("java", [ "io", "lang", "lang.reflect", "util" ]);

  var sJU = "java.util";

  //var sJU = "JU";  
	//Clazz._Loader.registerPackages (sJU, ["regex", "zip"]);
	//var javautil = JU;

  var javautil = java.util;

	Clazz._Loader.ignore([
		"net.sf.j2s.ajax.HttpRequest",
		sJU + ".MapEntry.Type",
		//"java.net.UnknownServiceException", // unnecessary for Jmol
		"java.lang.Runtime",
		"java.security.AccessController",
		"java.security.PrivilegedExceptionAction",
		"java.io.File",
		"java.io.FileInputStream",
		"java.io.FileWriter",
		"java.io.OutputStreamWriter",
//		sJU + ".Calendar", // bypassed in ModelCollection
//		"java.text.SimpleDateFormat", // not used
//		"java.text.DateFormat", // not used
		sJU + ".concurrent.Executors"
	])

java.lang.Math = Math;
Math.rint || (Math.rint = function(a) {
 var b;
 return Math.round(a) + ((b = a % 1) != 0.5 && b != -0.5 ? 0 : (b = Math.round(a % 2)) > 0 ? b - 2 : b);
});

Math.log10||(Math.log10=function(a){return Math.log(a)/Math.E});

Math.hypot||(Math.hypot=function(x,y){return Math.sqrt(Math.pow(x,2)+Math.pow(y,2))});

Math.toDegrees||(Math.toDegrees=function(angrad){return angrad*180.0/Math.PI;});

Math.toRadians||(Math.toRadians=function(angdeg){return angdeg/180.0*Math.PI});

Math.copySign||(Math.copySign=function(mag,sign){return((sign>0?1:-1)*Math.abs(mag))});

//could use Math.sign(), but this was used to preserve cross-brower compatability
Math.signum||(Math.signum=function(d){return(d==0.0||d.isNaN)?d:Math.copySign(1.0,d)});

Math.scalb||(Math.scalb=function(d,scaleFactor){return d*Math.pow(2,scaleFactor)});

//the following Math functions rely on datatypes nonexistant in javascript
Math.nextAfter||(Math.nextAfter=function(start,direction){return 0});
Math.nextUp||(Math.nextUp=function(d){return 0});
Math.ulp||(Math.ulp=function(d){return 0});
Math.getExponent||(Math.getExponent=function(d){return 0});
Math.getIEEEremainder||(Math.getIEEEremainder=function(f1,f2){return 0});
//end datatype reliant math declarations

if(supportsNativeObject){
	// Number and Array are special -- do not override prototype.toString -- "length - 2" here
	for (var i = 0; i < extendedObjectMethods.length - 2; i++) {
		var p = extendedObjectMethods[i];
		Array.prototype[p] = Clazz._O.prototype[p];
		Number.prototype[p] = Clazz._O.prototype[p];
	}
}

java.lang.Number=Number;
Number.__CLASS_NAME__="Number";
implementOf(Number,java.io.Serializable);
Number.equals=inF.equals;
Number.getName=inF.getName;
Number.prototype.compareTo = function(x) { var a = this.value, b = x.value; return (a < b ? -1 : a == b ? 0 : 1) };
Number.compare = function(a,b) { return (a < b ? -1 : a == b ? 0 : 1) };

Clazz.defineMethod(Number,"shortValue",
function(){
var x = Math.round(this)&0xffff;
return (this < 0 && x > 0 ? x - 0x10000 : x);
});

Clazz.defineMethod(Number,"byteValue",
function(){
var x = Math.round(this)&0xff;
return (this < 0 && x > 0 ? x - 0x100 : x);
});

Clazz.defineMethod(Number,"intValue",
function(){
return Math.round(this)&0xffffffff;
});

Clazz.defineMethod(Number,"longValue",
function(){
return Math.round(this);
});

Clazz.defineMethod(Number,"floatValue",
function(){
return this.valueOf();
});
Clazz.defineMethod(Number,"doubleValue",
function(){
return parseFloat(this.valueOf());
});

Clazz.overrideMethod(Number,"hashCode",
function(){
return this.valueOf();
});

java.lang.Integer=Integer=function(){
Clazz.instantialize(this,arguments);
};
decorateAsType(Integer,"Integer",Number,Comparable,true);
Integer.prototype.valueOf=function(){return 0;};
Integer.toString=Integer.prototype.toString=function(){
if(arguments.length!=0){
return""+arguments[0];
} else if(this===Integer){
return"class java.lang.Integer";
}
return""+this.valueOf();
};

Clazz.overrideConstructor(Integer, function(v){
 v == null && (v = 0);
 if (typeof v != "number")
	v = Integer.parseIntRadix(v, 10);
 this.valueOf=function(){return v;};
});

Integer.MIN_VALUE=Integer.prototype.MIN_VALUE=-0x80000000;
Integer.MAX_VALUE=Integer.prototype.MAX_VALUE=0x7fffffff;
Integer.TYPE=Integer.prototype.TYPE=Integer;


Clazz.defineMethod(Integer,"bitCount",
function(i) {
	i = i - ((i >>> 1) & 0x55555555);
	i = (i & 0x33333333) + ((i >>> 2) & 0x33333333);
	i = (i + (i >>> 4)) & 0x0f0f0f0f;
	i = i + (i >>> 8);
	i = i + (i >>> 16);
	return i & 0x3f;
},"Number");
Integer.bitCount=Integer.prototype.bitCount;

Clazz.defineMethod(Integer,"numberOfLeadingZeros",
function(i) {
 if (i == 0) return 32;
 var n = 1;
 if (i >>> 16 == 0) { n += 16; i <<= 16; }
 if (i >>> 24 == 0) { n +=  8; i <<=  8; }
 if (i >>> 28 == 0) { n +=  4; i <<=  4; }
 if (i >>> 30 == 0) { n +=  2; i <<=  2; }
 n -= i >>> 31;
 return n;
},"Number");
Integer.numberOfLeadingZeros=Integer.prototype.numberOfLeadingZeros;

Clazz.defineMethod(Integer,"numberOfTrailingZeros",
function(i) {
	if (i == 0) return 32;
	var n = 31;
	var y = i <<16; if (y != 0) { n = n -16; i = y; }
	y = i << 8; if (y != 0) { n = n - 8; i = y; }
	y = i << 4; if (y != 0) { n = n - 4; i = y; }
	y = i << 2; if (y != 0) { n = n - 2; i = y; }
	return n - ((i << 1) >>> 31);
},"Number");
Integer.numberOfTrailingZeros=Integer.prototype.numberOfTrailingZeros;

Clazz.defineMethod(Integer,"parseIntRadix",
function(s,radix){
if(s==null){
throw new NumberFormatException("null");
}if(radix<2){
throw new NumberFormatException("radix "+radix+" less than Character.MIN_RADIX");
}if(radix>36){
throw new NumberFormatException("radix "+radix+" greater than Character.MAX_RADIX");
}
if (radix == 10) {
	for (var i = s.length; --i >= 0;) {
		var c = s.charCodeAt(i);
		if (c >= 48 && c <= 57) 
      continue;
		if (i > 0 || c != 43 && c != 45)
			throw new NumberFormatException("Not a Number : "+s);
	}
}
var i=parseInt(s,radix);
if(isNaN(i)){
throw new NumberFormatException("Not a Number : "+s);
}
return i;
},"String, Number");
Integer.parseIntRadix=Integer.prototype.parseIntRadix;

Clazz.defineMethod(Integer,"parseInt",
function(s){
return Integer.parseIntRadix(s,10);
},"String");
Integer.parseInt=Integer.prototype.parseInt;

Clazz.overrideMethod(Integer,"$valueOf",
function(s){
return new Integer(s);
});

Integer.$valueOf=Integer.prototype.$valueOf;

Clazz.overrideMethod(Integer,"equals",
function(s){
if(s==null||!Clazz.instanceOf(s,Integer)){
return false;
}
return s.valueOf()==this.valueOf();
},"Object");
Integer.toHexString=Integer.prototype.toHexString=function(d){
if(d.valueOf)d=d.valueOf();
if (d < 0) {
var b = d & 0xFFFFFF;
var c = ((d>>24)&0xFF);
return c._numberToString(16) + (b = "000000" + b._numberToString(16)).substring(b.length - 6);
}
return d._numberToString(16);};
Integer.toOctalString=Integer.prototype.toOctalString=function(d){if(d.valueOf)d=d.valueOf();return d._numberToString(8);};
Integer.toBinaryString=Integer.prototype.toBinaryString=function(d){if(d.valueOf)d=d.valueOf();return d._numberToString(2);};

Integer.decodeRaw=Clazz.defineMethod(Integer,"decodeRaw", function(n){
if (n.indexOf(".") >= 0)n = "";
var i = (n.startsWith("-") ? 1 : 0);
n = n.replace(/\#/, "0x").toLowerCase();
var radix=(n.startsWith("0x", i) ? 16 : n.startsWith("0", i) ? 8 : 10);
// The general problem with parseInt is that is not strict -- ParseInt("10whatever") == 10.
// Number is strict, but Number("055") does not work, though ParseInt("055", 8) does.
// need to make sure negative numbers are negative
n = Number(n) & 0xFFFFFFFF;
return (radix == 8 ? parseInt(n, 8) : n);
},"~S");

Integer.decode=Clazz.defineMethod(Integer,"decode", function(n){
	n = Integer.decodeRaw(n);
	if (isNaN(n) || n < Integer.MIN_VALUE|| n > Integer.MAX_VALUE)
	throw new NumberFormatException("Invalid Integer");
	return new Integer(n);
},"~S");

Clazz.overrideMethod(Integer,"hashCode",
function(){
return this.valueOf();
});

// Note that Long is problematic in JavaScript 

java.lang.Long=Long=function(){
Clazz.instantialize(this,arguments);
};
decorateAsType(Long,"Long",Number,Comparable,true);
Long.prototype.valueOf=function(){return 0;};
Long.toString=Long.prototype.toString=function(){
if(arguments.length!=0){
return""+arguments[0];
}else if(this===Long){
return"class java.lang.Long";
}
return""+this.valueOf();
};

Clazz.overrideConstructor(Long, function(v){
 v == null && (v = 0);
 v = (typeof v == "number" ? Math.round(v) : Integer.parseIntRadix(v, 10));
this.valueOf=function(){return v;};
});

//Long.MIN_VALUE=Long.prototype.MIN_VALUE=-0x8000000000000000;
//Long.MAX_VALUE=Long.prototype.MAX_VALUE=0x7fffffffffffffff;
Long.TYPE=Long.prototype.TYPE=Long;

Clazz.defineMethod(Long,"parseLong",
function(s,radix){
 return Integer.parseInt(s, radix || 10);
});

Long.parseLong=Long.prototype.parseLong;

Clazz.overrideMethod(Long,"$valueOf",
function(s){
return new Long(s);
});

Long.$valueOf=Long.prototype.$valueOf;
Clazz.overrideMethod(Long,"equals",
function(s){
if(s==null||!Clazz.instanceOf(s,Long)){
return false;
}
return s.valueOf()==this.valueOf();
},"Object");
Long.toHexString=Long.prototype.toHexString=function(i){
return i.toString(16);
};
Long.toOctalString=Long.prototype.toOctalString=function(i){
return i.toString(8);
};
Long.toBinaryString=Long.prototype.toBinaryString=function(i){
return i.toString(2);
};


Long.decode=Clazz.defineMethod(Long,"decode",
function(n){
	n = Integer.decodeRaw(n);
	if (isNaN(n))
		throw new NumberFormatException("Invalid Long");
	return new Long(n);
},"~S");

java.lang.Short = Short = function () {
Clazz.instantialize (this, arguments);
};
decorateAsType (Short, "Short", Number, Comparable, true);
Short.prototype.valueOf = function () { return 0; };
Short.toString = Short.prototype.toString = function () {
	if (arguments.length != 0) {
		return "" + arguments[0];
	} else if (this === Short) {
		return "class java.lang.Short"; // Short.class.toString
	}
	return "" + this.valueOf ();
};

Clazz.overrideConstructor(Short,
function (v) {
 v == null && (v = 0);
 if (typeof v != "number")
	v = Integer.parseIntRadix(v, 10);
 v = v.shortValue();
 this.valueOf = function () {return v;};
});


Short.MIN_VALUE = Short.prototype.MIN_VALUE = -32768;
Short.MAX_VALUE = Short.prototype.MAX_VALUE = 32767;
Short.TYPE = Short.prototype.TYPE = Short;

Clazz.defineMethod(Short, "parseShortRadix",
function (s, radix) {
return Integer.parseIntRadix(s, radix).shortValue();
}, "String, Number");
Short.parseShortRadix = Short.prototype.parseShortRadix;

Clazz.defineMethod(Short, "parseShort",
function (s) {
return Short.parseShortRadix (s, 10);
}, "String");

Short.parseShort = Short.prototype.parseShort;

Clazz.overrideMethod(Short, "$valueOf",
function (s) {
return new Short(s);
});

Short.$valueOf = Short.prototype.$valueOf;
Clazz.overrideMethod(Short, "equals",
function (s) {
if(s == null || !Clazz.instanceOf(s, Short) ){
	return false;
}
return s.valueOf()  == this.valueOf();
}, "Object");
Short.toHexString = Short.prototype.toHexString = function (i) {
	return i.toString (16);
};
Short.toOctalString = Short.prototype.toOctalString = function (i) {
	return i.toString (8);
};
Short.toBinaryString = Short.prototype.toBinaryString = function (i) {
	return i.toString (2);
};
Short.decode = Clazz.defineMethod(Short, "decode",
function(n){
	n = Integer.decodeRaw(n);
	if (isNaN(n) || n < -32768|| n > 32767)
		throw new NumberFormatException("Invalid Short");
	return new Short(n);
}, "~S");

java.lang.Byte=Byte=function(){
Clazz.instantialize(this,arguments);
};
decorateAsType(Byte,"Byte",Number,Comparable,true);
Byte.prototype.valueOf=function(){return 0;};
Byte.toString=Byte.prototype.toString=function(){
if(arguments.length!=0){
return""+arguments[0];
}else if(this===Byte){
return"class java.lang.Byte";
}
return""+this.valueOf();
};
Clazz.makeConstructor(Byte,
function(v){
 if (typeof v != "number")
	 v = Integer.parseIntRadix(v, 10);
 v = v.byteValue();
this.valueOf=function(){
return v;
};
});

Byte.serialVersionUID=Byte.prototype.serialVersionUID=-7183698231559129828;
Byte.MIN_VALUE=Byte.prototype.MIN_VALUE=-128;
Byte.MAX_VALUE=Byte.prototype.MAX_VALUE=127;
Byte.SIZE=Byte.prototype.SIZE=8;
Byte.TYPE=Byte.prototype.TYPE=Byte;

Clazz.defineMethod(Byte,"parseByteRadix",
function(s,radix){
 return Integer.parseIntRadix(s, radix).byteValue();
},"String, Number");
Byte.parseByteRadix=Byte.prototype.parseByteRadix;

Clazz.defineMethod(Byte,"parseByte",
function(s){
return Byte.parseByte(s,10);
},"String");

Byte.parseByte=Byte.prototype.parseByte;

Clazz.overrideMethod(Byte, "$valueOf",
function (s) {
return new Byte(s);
});

Byte.$valueOf=Byte.prototype.$valueOf;
Clazz.overrideMethod(Byte,"equals",
function(s){
if(s==null||!Clazz.instanceOf(s,Byte)){
return false;
}
return s.valueOf()==this.valueOf();
},"Object");
Byte.toHexString=Byte.prototype.toHexString=function(i){
return i.toString(16);
};
Byte.toOctalString=Byte.prototype.toOctalString=function(i){
return i.toString(8);
};
Byte.toBinaryString=Byte.prototype.toBinaryString=function(i){
return i.toString(2);
};
Byte.decode=Clazz.defineMethod(Byte,"decode",
function(n){
	n = Integer.decodeRaw(n);
	if (isNaN(n) || n < -128|| n > 127)
		throw new NumberFormatException("Invalid Byte");
return new Byte(n);
},"~S");

Clazz._floatToString = function(f) {
 var s = ""+f
 if (s.indexOf(".") < 0 && s.indexOf("e") < 0)
 	 s += ".0";
 return s;
}

java.lang.Float=Float=function(){
Clazz.instantialize(this,arguments);
};
decorateAsType(Float,"Float",Number,Comparable,true);
Float.prototype.valueOf=function(){return 0;};
Float.toString=Float.prototype.toString=function(){
if(arguments.length!=0){
return Clazz._floatToString(arguments[0]);
}else if(this===Float){
return"class java.lang.Float";
}
return Clazz._floatToString(this.valueOf());
};

Clazz.overrideConstructor(Float, function(v){
 v == null && (v = 0);
 if (typeof v != "number") 
	v = Number(v);
 this.valueOf=function(){return v;}
});

Float.serialVersionUID=Float.prototype.serialVersionUID=-2671257302660747028;
Float.MIN_VALUE=Float.prototype.MIN_VALUE=3.4028235e+38;
Float.MAX_VALUE=Float.prototype.MAX_VALUE=1.4e-45;
Float.NEGATIVE_INFINITY=Number.NEGATIVE_INFINITY;
Float.POSITIVE_INFINITY=Number.POSITIVE_INFINITY;
Float.NaN=Number.NaN;
Float.TYPE=Float.prototype.TYPE=Float;

Clazz.defineMethod(Float,"parseFloat",
function(s){
if(s==null){
throw new NumberFormatException("null");
}
if (typeof s == "number")return s;  // important -- typeof NaN is "number" and is OK here
var floatVal=Number(s);
if(isNaN(floatVal)){
throw new NumberFormatException("Not a Number : "+s);
}
return floatVal;
},"String");
Float.parseFloat=Float.prototype.parseFloat;

Clazz.overrideMethod(Float,"$valueOf",
function(s){
return new Float(s);
});

Float.$valueOf=Float.prototype.$valueOf;

Clazz.defineMethod(Float,"isNaN",
function(num){
return isNaN(arguments.length == 1 ? num : this.valueOf());
},"Number");
Float.isNaN=Float.prototype.isNaN;
Clazz.defineMethod(Float,"isInfinite",
function(num){
return !Number.isFinite(arguments.length == 1 ? num : this.valueOf());
},"Number");
Float.isInfinite=Float.prototype.isInfinite;

Clazz.overrideMethod(Float,"equals",
function(s){
if(s==null||!Clazz.instanceOf(s,Float)){
return false;
}
return s.valueOf()==this.valueOf();
},"Object");

java.lang.Double=Double=function(){
Clazz.instantialize(this,arguments);
};

decorateAsType(Double,"Double",Number,Comparable,true);

Double.prototype.valueOf=function(){return 0;};
Double.toString=Double.prototype.toString=function(){
if(arguments.length!=0){
return Clazz._floatToString(arguments[0]);
}else if(this===Double){
return"class java.lang.Double";
}
return Clazz._floatToString(this.valueOf());
};

Clazz.overrideConstructor(Double, function(v){
 v == null && (v = 0);
 if (typeof v != "number") 
	v = Double.parseDouble(v);
 this.valueOf=function(){return v;};
}); // BH

Double.serialVersionUID=Double.prototype.serialVersionUID=-9172774392245257468;
Double.MIN_VALUE=Double.prototype.MIN_VALUE=4.9e-324;
Double.MAX_VALUE=Double.prototype.MAX_VALUE=1.7976931348623157e+308;
Double.NEGATIVE_INFINITY=Number.NEGATIVE_INFINITY;
Double.POSITIVE_INFINITY=Number.POSITIVE_INFINITY;
Double.NaN=Number.NaN;
Double.TYPE=Double.prototype.TYPE=Double;

Clazz.defineMethod(Double,"isNaN",
function(num){
return isNaN(arguments.length == 1 ? num : this.valueOf());
},"Number");
Double.isNaN=Double.prototype.isNaN;
Clazz.defineMethod(Double,"isInfinite",
function(num){
return!Number.isFinite(arguments.length == 1 ? num : this.valueOf());
},"Number");
Double.isInfinite=Double.prototype.isInfinite;

Clazz.defineMethod(Double,"parseDouble",
function(s){
if(s==null){
throw new NumberFormatException("null");
}
if (typeof s == "number")return s;  // important -- typeof NaN is "number" and is OK here
var doubleVal=Number(s);
if(isNaN(doubleVal)){
throw new NumberFormatException("Not a Number : "+s);
}
return doubleVal;
},"String");
Double.parseDouble=Double.prototype.parseDouble;

Clazz.defineMethod(Double,"$valueOf",
function(v){
return new Double(v);
},"Number");

Double.$valueOf=Double.prototype.$valueOf;

Clazz.overrideMethod(Double,"equals",
function(s){
if(s==null||!Clazz.instanceOf(s,Double)){
return false;
}
return s.valueOf()==this.valueOf();
},"Object");


//java.lang.B00lean = Boolean; ?? BH why this?


Boolean = java.lang.Boolean = Boolean || function () {Clazz.instantialize (this, arguments);};
if (supportsNativeObject) {
	for (var i = 0; i < extendedObjectMethods.length; i++) {
		var p = extendedObjectMethods[i];
		Boolean.prototype[p] = Clazz._O.prototype[p];
	}
}
Boolean.__CLASS_NAME__="Boolean";
implementOf(Boolean,[java.io.Serializable,java.lang.Comparable]);
Boolean.equals=inF.equals;
Boolean.getName=inF.getName;
Boolean.serialVersionUID=Boolean.prototype.serialVersionUID=-3665804199014368530;

Clazz.overrideConstructor(Boolean,
function(s){
	var b = ((typeof s == "string" ? Boolean.toBoolean(s) : s) ? true : false);
	this.valueOf=function(){return b;};
},"~O");

Boolean.parseBoolean=Clazz.defineMethod(Boolean,"parseBoolean",
function(s){
return Boolean.toBoolean(s);
},"~S");
Clazz.defineMethod(Boolean,"booleanValue",
function(){
return this.valueOf();
});
Boolean.$valueOf=Clazz.overrideMethod(Boolean,"$valueOf",
function(b){
return((typeof b == "string"? "true".equalsIgnoreCase(b) : b)?Boolean.TRUE:Boolean.FALSE);
});

Clazz.overrideMethod(Boolean,"toString",
function(){
return this.valueOf()?"true":"false";
});
Clazz.overrideMethod(Boolean,"hashCode",
function(){
return this.valueOf()?1231:1237;
});
Clazz.overrideMethod(Boolean,"equals",
function(obj){
if(Clazz.instanceOf(obj,Boolean)){
return this.booleanValue()==obj.booleanValue();
}return false;
},"~O");
Boolean.getBoolean=Clazz.defineMethod(Boolean,"getBoolean",
function(name){
var result=false;
try{
result=Boolean.toBoolean(System.getProperty(name));
}catch(e){
if(Clazz.instanceOf(e,IllegalArgumentException)){
}else if(Clazz.instanceOf(e,NullPointerException)){
}else{
throw e;
}
}
return result;
},"~S");
Clazz.overrideMethod(Boolean,"compareTo",
function(b){
return(b.value==this.value?0:(this.value?1:-1));
},"Boolean");
Boolean.toBoolean=Clazz.defineMethod(Boolean,"toBoolean",
($fz=function(name){
return(typeof name == "string" ? name.equalsIgnoreCase("true") : !!name);
},$fz.isPrivate=true,$fz),"~S");

// the need is to have new Boolean(string), but that won't work with native Boolean
// so instead we have to do a lexical switch from "new Boolean" to "Boolean.from"
Boolean.from=Clazz.defineMethod(Boolean,"from",
($fz=function(name){
return new Boolean(typeof name == "string" ? name.equalsIgnoreCase("true") : !!name);
},$fz.isPrivate=true,$fz),"~S");

Boolean.TRUE=Boolean.prototype.TRUE=new Boolean(true);
Boolean.FALSE=Boolean.prototype.FALSE=new Boolean(false);
Boolean.TYPE=Boolean.prototype.TYPE=Boolean;


Clazz._Encoding=new Object();

(function(Encoding) {

Encoding.UTF8="utf-8";
Encoding.UTF16="utf-16";
Encoding.ASCII="ascii";


Encoding.guessEncoding=function(str){
if(str.charCodeAt(0)==0xEF&&str.charCodeAt(1)==0xBB&&str.charCodeAt(2)==0xBF){
return Encoding.UTF8;
}else if(str.charCodeAt(0)==0xFF&&str.charCodeAt(1)==0xFE){
return Encoding.UTF16;
}else{
return Encoding.ASCII;
}
};

Encoding.readUTF8=function(str){
var encoding=this.guessEncoding(str);
var startIdx=0;
if(encoding==Encoding.UTF8){
startIdx=3;
}else if(encoding==Encoding.UTF16){
startIdx=2;
}
var arrs=new Array();
for(var i=startIdx;i<str.length;i++){
var charCode=str.charCodeAt(i);
if(charCode<0x80){
arrs[arrs.length]=str.charAt(i);
}else if(charCode>0xc0&&charCode<0xe0){
var c1=charCode&0x1f;
i++;
var c2=str.charCodeAt(i)&0x3f;
var c=(c1<<6)+c2;
arrs[arrs.length]=String.fromCharCode(c);
}else if(charCode>=0xe0){
var c1=charCode&0x0f;
i++;
var c2=str.charCodeAt(i)&0x3f;
i++;
var c3=str.charCodeAt(i)&0x3f;
var c=(c1<<12)+(c2<<6)+c3;
arrs[arrs.length]=String.fromCharCode(c);
}
}
return arrs.join('');
};

Encoding.convert2UTF8=function(str){
var encoding=this.guessEncoding(str);
var startIdx=0;
if(encoding==Encoding.UTF8){
return str;
}else if(encoding==Encoding.UTF16){
startIdx=2;
}

var offset=0;
var arrs=new Array(offset+str.length-startIdx);

for(var i=startIdx;i<str.length;i++){
var charCode=str.charCodeAt(i);
if(charCode<0x80){
arrs[offset+i-startIdx]=str.charAt(i);
}else if(charCode<=0x07ff){
var c1=0xc0+((charCode&0x07c0)>>6);
var c2=0x80+(charCode&0x003f);
arrs[offset+i-startIdx]=String.fromCharCode(c1)+String.fromCharCode(c2);
}else{
var c1=0xe0+((charCode&0xf000)>>12);
var c2=0x80+((charCode&0x0fc0)>>6);
var c3=0x80+(charCode&0x003f);
arrs[offset+i-startIdx]=String.fromCharCode(c1)+String.fromCharCode(c2)+String.fromCharCode(c3);
}
}
return arrs.join('');
};
Encoding.base64Chars=new Array(
'A','B','C','D','E','F','G','H',
'I','J','K','L','M','N','O','P',
'Q','R','S','T','U','V','W','X',
'Y','Z','a','b','c','d','e','f',
'g','h','i','j','k','l','m','n',
'o','p','q','r','s','t','u','v',
'w','x','y','z','0','1','2','3',
'4','5','6','7','8','9','+','/'
);
Encoding.encodeBase64=function(str){
if(str==null||str.length==0)return str;
var b64=Encoding.base64Chars;
var length=str.length;
var index=0;
var buf=[];
var c0,c1,c2;
while(index<length){
c0=str.charCodeAt(index++);
buf[buf.length]=b64[c0>>2];
if(index<length){
c1=str.charCodeAt(index++);
buf[buf.length]=b64[((c0<<4)&0x30)|(c1>>4)];
if(index<length){
c2=str.charCodeAt(index++);
buf[buf.length]=b64[((c1<<2)&0x3c)|(c2>>6)];
buf[buf.length]=b64[c2&0x3F];
}else{
buf[buf.length]=b64[((c1<<2)&0x3c)];
buf[buf.length]='=';
}
}else{
buf[buf.length]=b64[(c0<<4)&0x30];
buf[buf.length]='=';
buf[buf.length]='=';
}
}
return buf.join('');
};
Encoding.decodeBase64=function(str){
if(str==null||str.length==0)return str;
var b64=Encoding.base64Chars;
var xb64=Encoding.xBase64Chars;
if(Encoding.xBase64Chars==null){
xb64=new Object();
for(var i=0;i<b64.length;i++){
xb64[b64[i]]=i;
}
Encoding.xBase64Chars=xb64;
}
var length=str.length;
var index=0;
var buf=[];
var c0,c1,c2,c3;
var c=0;
while(index<length&&c++<60000){
c0=xb64[str.charAt(index++)];
c1=xb64[str.charAt(index++)];
c2=xb64[str.charAt(index++)];
c3=xb64[str.charAt(index++)];
buf[buf.length]=String.fromCharCode(((c0<<2)&0xff)|c1>>4);
if(c2!=null){
buf[buf.length]=String.fromCharCode(((c1<<4)&0xff)|c2>>2);
if(c3!=null){
buf[buf.length]=String.fromCharCode(((c2<<6)&0xff)|c3);
}
}
}
return buf.join('');
};

if(String.prototype.$replace==null){
java.lang.String=String;
if(supportsNativeObject){
for(var i = 0; i < extendedObjectMethods.length; i++) {
var p = extendedObjectMethods[i];
if("to$tring"==p||"toString"==p||"equals"==p||"hashCode"==p){
continue;
}
String.prototype[p]=Clazz._O.prototype[p];
}
}

// Actually, String does not implement CharSequence because it does not
// implement getSubsequence() or length(). Any use of CharSequence that
// utilizes either of these methods must explicitly check for typeof x.length
// or existance of x.subSequence.  
// classes affected include:
//   java.io.CharArrayWriter,StringWriter,Writer
//   java.lang.AbstractStringBuilder
//   java.util.regex.Matcher,Pattern
 
implementOf(String,[java.io.Serializable,CharSequence,Comparable]);

String.getName=inF.getName;

String.serialVersionUID=String.prototype.serialVersionUID=-6849794470754667710;

var formatterClass;

if (!String.format)
 String.format = function() {
  if (!formatterClass)
    formatterClass = Class.forName("java.util.Formatter");
  var f = formatterClass.newInstance();
  return f.format.apply(f,arguments).toString();
 }

;(function(sp) {

sp.$replace=function(c1,c2){
	if (c1 == c2 || this.indexOf (c1) < 0) return "" + this;
	if (c1.length == 1) {
		if ("\\$.*+|?^{}()[]".indexOf(c1) >= 0) 	c1 = "\\" + c1;
	} else {    
		c1=c1.replace(/([\\\$\.\*\+\|\?\^\{\}\(\)\[\]])/g,function($0,$1){return"\\"+$1;});
	}
	return this.replace(new RegExp(c1,"gm"),c2);
};
sp.$generateExpFunction=function(str){
var arr=[];
var orders=[];
var idx=0;
arr[0]="";
var i=0;
for(;i<str.length;i++){
var ch=str.charAt(i);
if(i!=str.length-1&&ch=='\\'){
i++;
var c=str.charAt(i);
if(c=='\\'){
arr[idx]+='\\';
}
arr[idx]+=c;
}else if(i!=str.length-1&&ch=='$'){
i++;
orders[idx]=parseInt(str.charAt(i));
idx++;
arr[idx]="";
}else if(ch=='\r'){
arr[idx]+="\\r";
}else if(ch=='\n'){
arr[idx]+="\\n";
}else if(ch=='\t'){
arr[idx]+="\\t";
}else if(ch=='\"'){
arr[idx]+="\\\"";
}else{
arr[idx]+=ch;
}
}
var funStr="f = function (";
var max=Math.max.apply({},orders);
for(i=0;i<=max;i++){
funStr+="$"+i;
if(i!=max){
funStr+=", ";
}
}
funStr+=") { return ";
for(i=0;i<arr.length-1;i++){
funStr+="\""+arr[i]+"\" + $"+orders[i]+" + ";
}
funStr+="\""+arr[i]+"\"; }";
var f=null;
eval(funStr)
return f;
};

sp.replaceAll=function(exp,str){
var regExp=new RegExp(exp,"gm");
return this.replace(regExp,this.$generateExpFunction(str));
};
sp.replaceFirst=function(exp,str){
var regExp=new RegExp(exp,"m");
return this.replace(regExp,this.$generateExpFunction(str));
};
sp.matches=function(exp){
if(exp!=null){
exp="^("+exp+")$";
}
var regExp=new RegExp(exp,"gm");
var m=this.match(regExp);
return m!=null&&m.length!=0;
};
sp.regionMatches=function(ignoreCase,toffset,
other,ooffset,len){

if(typeof ignoreCase=="number"
||(ignoreCase!=true&&ignoreCase!=false)){
len=ooffset;
ooffset=other;
other=toffset;
toffset=ignoreCase;
ignoreCase=false;
}
var to=toffset;
var po=ooffset;

if((ooffset<0)||(toffset<0)||(toffset>this.length-len)||
(ooffset>other.length-len)){
return false;
}
var s1=this.substring(toffset,toffset+len);
var s2=other.substring(ooffset,ooffset+len);
if(ignoreCase){
s1=s1.toLowerCase();
s2=s2.toLowerCase();
}
return s1==s2;
};



sp.$plit=function(regex,limit){
if (!limit && regex == " ")
	return this.split(regex);

if(limit!=null&&limit>0){
if(limit==1){
return this;
}
var regExp=new RegExp("("+regex+")","gm");
var count=1;
var s=this.replace(regExp,function($0,$1){
count++;
if(count==limit){
return"@@_@@";
}else if(count>limit){
return $0;
}else{
return $0;
}
});
regExp=new RegExp(regex,"gm");
var arr=this.split(regExp);
if(arr.length>limit){
arr[limit-1]=s.substring(s.indexOf("@@_@@")+5);
arr.length=limit;
}
return arr;
}else{
var regExp=new RegExp(regex,"gm");
return this.split(regExp);
}
};

if (!sp.trim)
sp.trim=function(){
return this.replace(/^\s+/g,'').replace(/\s+$/g,'');
};

if (!sp.startsWith || !sp.endsWith) {
var sn=function(s, prefix,toffset){
var to=toffset;
var po=0;
var pc=prefix.length;

if((toffset<0)||(toffset>s.length-pc)){
return false;
}
while(--pc>=0){
if(s.charAt(to++)!=prefix.charAt(po++)){
return false;
}
}
return true;
};

sp.startsWith=function(prefix){
if(arguments.length==1){
return sn(this,arguments[0],0);
}else if(arguments.length==2){
return sn(this,arguments[0],arguments[1]);
}else{
return false;
}
};

sp.endsWith=function(suffix){
return sn(this, suffix,this.length-suffix.length);
};

}

sp.equals=function(anObject){
return this.valueOf()==anObject;
};

sp.equalsIgnoreCase=function(anotherString){
return(anotherString==null)?false:(this==anotherString
||this.toLowerCase()==anotherString.toLowerCase());
};


sp.hash=0;

sp.hashCode=function(){
var h=this.hash;
if(h==0){
var off=0;
var len=this.length;
for(var i=0;i<len;i++){
h=31*h+this.charCodeAt(off++);
h&=0xffffffff;
}
this.hash=h;
}
return h;
};

sp.getBytes=function(){
if(arguments.length==4){
return this.getChars(arguments[0],arguments[1],arguments[2],arguments[3]);
}
var s=this;
if(arguments.length==1){
var cs=arguments[0].toString().toLowerCase();
var charset=[
"utf-8","UTF8","us-ascii","iso-8859-1","8859_1","gb2312","gb18030","gbk"
];
var existed=false;
for(var i=0;i<charset.length;i++){
if(charset[i]==cs){
existed=true;
break;
}
}
if(!existed){
throw new java.io.UnsupportedEncodingException();
}
if(cs=="utf-8"||cs=="utf8"){
s=Encoding.convert2UTF8(this);
}
}
var arrs=new Array(s.length);
var c=0,ii=0;
for(var i=0;i<s.length;i++){
c=s.charCodeAt(i);
if(c>255){
arrs[ii]=0x1a;
arrs[ii+1]=c&0xff;
arrs[ii+2]=(c&0xff00)>>8;
ii+=2;
}else{
arrs[ii]=c;
}
ii++;
}
return arrs;
};

sp.contains = function(a) {return this.indexOf(a) >= 0}  // bh added
sp.compareTo = function(a){return this > a ? 1 : this < a ? -1 : 0} // bh added



sp.toCharArray=function(){
var result=new Array(this.length);
for(var i=0;i<this.length;i++){
result[i]=this.charAt(i);
}
return result;
};
String.value0f=String.valueOf;
String.valueOf=function(o){
if(o=="undefined"){
return String.value0f();
}
if(o instanceof Array){
if(arguments.length==1){
return o.join('');
}else{
var off=arguments[1];
var len=arguments[2];
var oo=new Array(len);
for(var i=0;i<len;i++){
oo[i]=o[off+i];
}
return oo.join('');
}
}
return""+o;
};

sp.subSequence=function(beginIndex,endIndex){
return this.substring(beginIndex,endIndex);
};

sp.compareToIgnoreCase=function(str){
if(str==null){
throw new NullPointerException();
}
var s1=this.toUpperCase();
var s2=str.toUpperCase();
if(s1==s2){
return 0;
}else{
var s1=this.toLowerCase();
var s2=str.toLowerCase();
if(s1==s2){
return 0;
}else if(s1>s2){
return 1;
}else{
return-1;
}
}
};

sp.contentEquals=function(sb){
if(this.length!=sb.length()){
return false;
}
var v=sb.getValue();
var i=0;
var j=0;
var n=this.length;
while(n--!=0){
if(this.charCodeAt(i++)!=v[j++]){
return false;
}
}
return true;
};

sp.getChars=function(srcBegin,srcEnd,dst,dstBegin){
if(srcBegin<0){
throw new StringIndexOutOfBoundsException(srcBegin);
}
if(srcEnd>this.length){
throw new StringIndexOutOfBoundsException(srcEnd);
}
if(srcBegin>srcEnd){
throw new StringIndexOutOfBoundsException(srcEnd-srcBegin);
}
if(dst==null){
throw new NullPointerException();
}
for(var i=0;i<srcEnd-srcBegin;i++){
dst[dstBegin+i]=this.charAt(srcBegin+i);
}
};
sp.$concat=sp.concat;
sp.concat=function(s){
if(s==null){
throw new NullPointerException();
}
return this.$concat(s);
};

sp.$lastIndexOf=sp.lastIndexOf;
sp.lastIndexOf=function(s,last){
if(last!=null&&last+this.length<=0){
return-1;
}
if(last!=null){
return this.$lastIndexOf(s,last);
}else{
return this.$lastIndexOf(s);
}
};

sp.intern=function(){
return this.valueOf();
};
String.copyValueOf=sp.copyValueOf=function(){
if(arguments.length==1){
return String.instantialize(arguments[0]);
}else{
return String.instantialize(arguments[0],arguments[1],arguments[2]);
}
};

sp.codePointAt || (sp.codePointAt = sp.charCodeAt); // Firefox only


})(String.prototype);

String.instantialize=function(){
switch (arguments.length) {
case 0:
	return new String();
case 1:
	var x=arguments[0];
  if (x.BYTES_PER_ELEMENT || x instanceof Array){
		return (x.length == 0 ? "" : typeof x[0]=="number" ? Encoding.readUTF8(String.fromCharCode.apply(null, x)) : x.join(''));
  }
	if(typeof x=="string"||x instanceof String){
		return new String(x);
	}
	if(x.__CLASS_NAME__=="StringBuffer"||x.__CLASS_NAME__=="java.lang.StringBuffer"){
		var value=x.shareValue();
		var length=x.length();
		var valueCopy=new Array(length);
		for(var i=0;i<length;i++){
			valueCopy[i]=value[i];
		}
		return valueCopy.join('')
	}
	return""+x;
case 2:	
	var x=arguments[0];
	var hibyte=arguments[1];
	if(typeof hibyte=="string"){
		return String.instantialize(x,0,x.length,hibyte);
	}
	return String.instantialize(x,hibyte,0,x.length);
case 3:
	var bytes=arguments[0];
	var offset=arguments[1];
	var length=arguments[2];
	if(arguments[2]instanceof Array){
		bytes=arguments[2];
		offset=arguments[0];
		length=arguments[1];
	}
	var arr=new Array(length);
	if(offset<0||length+offset>bytes.length){
		throw new IndexOutOfBoundsException();
	}
	if(length>0){
		var isChar=(bytes[offset].length!=null);
		if(isChar){
			for(var i=0;i<length;i++){
				arr[i]=bytes[offset+i];
			}
		}else{
			for(var i=0;i<length;i++){
				arr[i]=String.fromCharCode(bytes[offset+i]);
			}
		}
	}
	return arr.join('');
case 4:
	var bytes=arguments[0];
	var y=arguments[3];
	if(typeof y=="string"||y instanceof String){
		var offset=arguments[1];
		var length=arguments[2];
		var arr=new Array(length);
		for(var i=0;i<length;i++){
			arr[i]=bytes[offset+i];
			if(typeof arr[i]=="number"){
				arr[i]=String.fromCharCode(arr[i]&0xff);
			}
		}
		var cs=y.toLowerCase();
		if(cs=="utf-8"||cs=="utf8"){
			return Encoding.readUTF8(arr.join(''));
		}
		return arr.join('');
	}
	var count=arguments[3];
	var offset=arguments[2];
	var hibyte=arguments[1];
	var value=new Array(count);
	if(hibyte==0){
		for(var i=count;i-->0;){
			value[i]=String.fromCharCode(bytes[i+offset]&0xff);
		}
	}else{
		hibyte<<=8;
		for(var i=count;i-->0;){
			value[i]=String.fromCharCode(hibyte|(bytes[i+offset]&0xff));
		}
	}
	return value.join('');
default:
	var s="";
	for(var i=0;i<arguments.length;i++){
		s+=arguments[i];
	}
	return s;
}
};

if(navigator.userAgent.toLowerCase().indexOf("chrome")!=-1){
	String.prototype.toString=function(){return this.valueOf();};
}

}

})(Clazz._Encoding);



c$=Clazz.decorateAsClass(function(){
this.value=0;
Clazz.instantialize(this,arguments);
},java.lang,"Character",null,[java.io.Serializable,Comparable]);
Clazz.makeConstructor(c$,
function(value){
this.value=value;
},"~N");

Clazz.defineMethod(c$,"charValue",
function(){
return this.value;
});
Clazz.overrideMethod(c$,"hashCode",
function(){
return(this.value).charCodeAt(0);
});
Clazz.overrideMethod(c$,"equals",
function(obj){
if(Clazz.instanceOf(obj,Character)){
return(this.value).charCodeAt(0)==((obj).charValue()).charCodeAt(0);
}return false;
},"~O");
Clazz.overrideMethod(c$,"compareTo",
function(c){
return(this.value).charCodeAt(0)-(c.value).charCodeAt(0);
},"Character");
c$.toLowerCase=Clazz.defineMethod(c$,"toLowerCase",
function(c){
return(""+c).toLowerCase().charAt(0);
},"~N");
c$.toUpperCase=Clazz.defineMethod(c$,"toUpperCase",
function(c){
return(""+c).toUpperCase().charAt(0);
},"~N");
c$.isDigit=Clazz.defineMethod(c$,"isDigit",
function(c){
c = c.charCodeAt(0);
return (48 <= c && c <= 57);
},"~N");
c$.isUpperCase=Clazz.defineMethod(c$,"isUpperCase",
function(c){
c = c.charCodeAt(0);
return (65 <= c && c <= 90);
},"~N");
c$.isLowerCase=Clazz.defineMethod(c$,"isLowerCase",
function(c){
c = c.charCodeAt(0);
return (97 <= c && c <= 122);
},"~N");
c$.isWhitespace=Clazz.defineMethod(c$,"isWhitespace",
function(c){
c = (c).charCodeAt(0);
return (c >= 0x1c && c <= 0x20 || c >= 0x9 && c <= 0xd || c == 0x1680
	|| c >= 0x2000 && c != 0x2007 && (c <= 0x200b || c == 0x2028 || c == 0x2029 || c == 0x3000));
},"~N");
c$.isLetter=Clazz.defineMethod(c$,"isLetter",
function(c){
c = c.charCodeAt(0);
return (65 <= c && c <= 90 || 97 <= c && c <= 122);
},"~N");
c$.isLetterOrDigit=Clazz.defineMethod(c$,"isLetterOrDigit",
function(c){
c = c.charCodeAt(0);
return (65 <= c && c <= 90 || 97 <= c && c <= 122 || 48 <= c && c <= 57);
},"~N");
c$.isSpaceChar=Clazz.defineMethod(c$,"isSpaceChar",
function(c){
 var i = c.charCodeAt(0);
if(i==0x20||i==0xa0||i==0x1680)return true;
if(i<0x2000)return false;
return i<=0x200b||i==0x2028||i==0x2029||i==0x202f||i==0x3000;
},"~N");
c$.digit=Clazz.defineMethod(c$,"digit",
function(c,radix){
var i = c.charCodeAt(0);
if(radix >= 2 && radix <= 36){
	if(i < 128){
		var result = -1;
		if(48 <= i && i <= 57){
		result = i - 48;
		}else if(97 <= i && i <= 122){
		result = i - 87;
		}else if(65 <= i && i <= 90){
		result=i-(55);
		}
		return (result < radix ? result : -1);
	}
}
return -1;
},"~N,~N");
Clazz.overrideMethod(c$,"toString",
function(){
var buf=[this.value];
return String.valueOf(buf);
});
c$.toString=Clazz.overrideMethod(c$,"toString",
function(c){
{
if(this===Character){
return"class java.lang.Character";
}
}return String.valueOf(c);
},"~N");
Clazz.defineStatics(c$,
"MIN_VALUE",'\u0000',
"MAX_VALUE",'\uffff',
"MIN_RADIX",2,
"MAX_RADIX",36,
"TYPE",null);

java.lang.Character.TYPE=java.lang.Character.prototype.TYPE=java.lang.Character;
java.lang.Character.charCount = java.lang.Character.prototype.charCount = function(codePoint){return codePoint >= 0x010000 ? 2 : 1;};

Clazz._ArrayWrapper = function(a, type) {
 return {
   a: a,
   __CLASS_NAME__:"Array",
   superClazz: Array,
   getComponentType: function() {return type},
   instanceOf: function(o) { return  Clazz.instanceOf(type, o) },
   getName: function() { return this.__CLASS_NAME__ }
 };
}
c$=Clazz.declareType(java.lang.reflect,"Array");
c$.newInstance=Clazz.defineMethod(c$,"newInstance",
function(componentType,size){
var a = Clazz.newArray(size);
 a.getClass = function() { return new Clazz._ArrayWrapper(this, componentType);};
return a;
},"Class,~N");

javautil.Date=Date;
Date.TYPE="javautil.Date";
Date.__CLASS_NAME__="Date";
implementOf(Date,[java.io.Serializable,java.lang.Comparable]);

Clazz.defineMethod(javautil.Date,"clone",
function(){
return new Date(this.getTime());
});

Clazz.defineMethod(javautil.Date,"before",
function(when){
return this.getTime()<when.getTime();
},"javautil.Date");
Clazz.defineMethod(javautil.Date,"after",
function(when){
return this.getTime()>when.getTime();
},"javautil.Date");
Clazz.defineMethod(javautil.Date,"equals",
function(obj){
return Clazz.instanceOf(obj,javautil.Date)&&this.getTime()==(obj).getTime();
},"Object");
Clazz.defineMethod(javautil.Date,"compareTo",
function(anotherDate){
var thisTime=this.getTime();
var anotherTime=anotherDate.getTime();
return(thisTime<anotherTime?-1:(thisTime==anotherTime?0:1));
},"javautil.Date");
Clazz.defineMethod(javautil.Date,"compareTo",
function(o){
return this.compareTo(o);
},"Object");
Clazz.overrideMethod(javautil.Date,"hashCode",
function(){
var ht=this.getTime();
return parseInt(ht)^parseInt((ht>>32));
});

c$=Clazz.decorateAsClass(function(){
this.source=null;
Clazz.instantialize(this,arguments);
},javautil,"EventObject",null,java.io.Serializable);
Clazz.makeConstructor(c$,
function(source){
if(source!=null)this.source=source;
else throw new IllegalArgumentException();
},"~O");
Clazz.defineMethod(c$,"getSource",
function(){
return this.source;
});
Clazz.overrideMethod(c$,"toString",
function(){
return this.getClass().getName()+"[source="+String.valueOf(this.source)+']';
});
Clazz.declareInterface(javautil,"EventListener");

c$=Clazz.decorateAsClass(function(){
this.listener=null;
Clazz.instantialize(this,arguments);
},javautil,"EventListenerProxy",null,javautil.EventListener);
Clazz.makeConstructor(c$,
function(listener){
this.listener=listener;
},"javautil.EventListener");
Clazz.defineMethod(c$,"getListener",
function(){
return this.listener;
});
Clazz.declareInterface(javautil,"Iterator");

Clazz.declareInterface(javautil,"ListIterator",javautil.Iterator);
Clazz.declareInterface(javautil,"Enumeration");
Clazz.declareInterface(javautil,"Collection",Iterable);

Clazz.declareInterface(javautil,"Set",javautil.Collection);
Clazz.declareInterface(javautil,"Map");
Clazz.declareInterface(javautil.Map,"Entry");

Clazz.declareInterface(javautil,"List",javautil.Collection);

Clazz.declareInterface(javautil,"Queue",javautil.Collection);
Clazz.declareInterface(javautil,"RandomAccess");
c$=Clazz.decorateAsClass(function(){
this.detailMessage=null;
this.cause=null;
this.stackTrace=null;
Clazz.instantialize(this,arguments);
},java.lang,"Throwable",null,java.io.Serializable);
Clazz.prepareFields(c$,function(){
this.cause=this;
//alert("e0 "+ arguments.callee.caller.caller.caller.caller.caller)
});
Clazz.makeConstructor(c$,
function(){
this.fillInStackTrace();
});
Clazz.makeConstructor(c$,
function(message){
this.fillInStackTrace();
this.detailMessage=message;
},"~S");
Clazz.makeConstructor(c$,
function(message,cause){
this.fillInStackTrace();
this.detailMessage=message;
this.cause=cause;
},"~S,Throwable");
Clazz.makeConstructor(c$,
function(cause){
this.fillInStackTrace();
this.detailMessage=(cause==null?null:cause.toString());
this.cause=cause;
},"Throwable");
Clazz.defineMethod(c$,"getMessage",
function(){
return (this.message || this.detailMessage || this.toString());
});
Clazz.defineMethod(c$,"getLocalizedMessage",
function(){
return this.getMessage();
});
Clazz.defineMethod(c$,"getCause",
function(){
return(this.cause===this?null:this.cause);
});
Clazz.defineMethod(c$,"initCause",
function(cause){
if(this.cause!==this)throw new IllegalStateException("Can't overwrite cause");
if(cause===this)throw new IllegalArgumentException("Self-causation not permitted");
this.cause=cause;
return this;
},"Throwable");
Clazz.overrideMethod(c$,"toString",
function(){
var s=this.getClass().getName();
var message=this.message || this.detailMessage;
return(message ? s+": "+message : s);
});
Clazz.defineMethod(c$,"printStackTrace",
function(){
System.err.println(this.getStackTrace ? this.getStackTrace() : this.message + " " + Clazz.getStackTrace());
});

Clazz.defineMethod(c$,"getStackTrace",
function(){
var s = "" + this + "\n";
for(var i=0;i<this.stackTrace.length;i++){
 var t=this.stackTrace[i];
	var x=t.methodName.indexOf("(");
	var n=t.methodName.substring(0,x).replace(/\s+/g,"");
	if(n!="construct"||t.nativeClazz==null
		 || getInheritedLevel(t.nativeClazz,Throwable)<0){
				s += t + "\n";
	}
}
return s;
});


Clazz.defineMethod(c$,"printStackTrace",
function(s){
this.printStackTrace();
},"java.io.PrintStream");
Clazz.defineMethod(c$,"printStackTrace",
function(s){
this.printStackTrace();
},"java.io.PrintWriter");
Clazz.defineMethod(c$,"fillInStackTrace",
function(){
this.stackTrace=new Array();
var caller=arguments.callee.caller;
var superCaller=null;
var callerList=new Array();
var index=Clazz._callingStackTraces.length-1;
var noLooping=true;
while(index>-1||caller!=null){
var clazzName=null;
var nativeClass=null;
if(!noLooping||caller==Clazz.tryToSearchAndExecute||caller==Clazz.superCall||caller==null){
if(index<0){
break;
}
noLooping=true;
superCaller=Clazz._callingStackTraces[index].caller;
nativeClass=Clazz._callingStackTraces[index].owner;
index--;
}else{
superCaller=caller;
if(superCaller.claxxOwner!=null){
nativeClass=superCaller.claxxOwner;
}else if(superCaller.exClazz!=null){
nativeClass=superCaller.exClazz;
}
}
var st=new StackTraceElement(
((nativeClass!=null&&nativeClass.__CLASS_NAME__.length!=0)?
nativeClass.__CLASS_NAME__:"anonymous"),
((superCaller.exName==null)?"anonymous":superCaller.exName)
+" ("+getParamTypes(superCaller.arguments).typeString+")",
null,-1);
st.nativeClazz=nativeClass;
this.stackTrace[this.stackTrace.length]=st;
for(var i=0;i<callerList.length;i++){
if(callerList[i]==superCaller){

var st=new StackTraceElement("lost","missing",null,-3);
st.nativeClazz=null;
this.stackTrace[this.stackTrace.length]=st;
noLooping=false;

}
}
if(superCaller!=null){
callerList[callerList.length]=superCaller;
}
caller=superCaller.arguments.callee.caller;
}
Clazz._initializingException=false;
return this;
});
Clazz.defineMethod(c$,"setStackTrace",
function(stackTrace){
var defensiveCopy=stackTrace.clone();
for(var i=0;i<defensiveCopy.length;i++)if(defensiveCopy[i]==null)throw new NullPointerException("stackTrace["+i+"]");

this.stackTrace=defensiveCopy;
},"~A");

c$=Clazz.decorateAsClass(function(){
this.declaringClass=null;
this.methodName=null;
this.fileName=null;
this.lineNumber=0;
Clazz.instantialize(this,arguments);
},java.lang,"StackTraceElement",null,java.io.Serializable);
Clazz.makeConstructor(c$,
function(cls,method,file,line){
if(cls==null||method==null){
throw new NullPointerException();
}this.declaringClass=cls;
this.methodName=method;
this.fileName=file;
this.lineNumber=line;
},"~S,~S,~S,~N");
Clazz.overrideMethod(c$,"equals",
function(obj){
if(!(Clazz.instanceOf(obj,StackTraceElement))){
return false;
}var castObj=obj;
if((this.methodName==null)||(castObj.methodName==null)){
return false;
}if(!this.getMethodName().equals(castObj.getMethodName())){
return false;
}if(!this.getClassName().equals(castObj.getClassName())){
return false;
}var localFileName=this.getFileName();
if(localFileName==null){
if(castObj.getFileName()!=null){
return false;
}}else{
if(!localFileName.equals(castObj.getFileName())){
return false;
}}if(this.getLineNumber()!=castObj.getLineNumber()){
return false;
}return true;
},"~O");
Clazz.defineMethod(c$,"getClassName",
function(){
return(this.declaringClass==null)?"<unknown class>":this.declaringClass;
});
Clazz.defineMethod(c$,"getFileName",
function(){
return this.fileName;
});
Clazz.defineMethod(c$,"getLineNumber",
function(){
return this.lineNumber;
});
Clazz.defineMethod(c$,"getMethodName",
function(){
return(this.methodName==null)?"<unknown method>":this.methodName;
});
Clazz.overrideMethod(c$,"hashCode",
function(){
if(this.methodName==null){
return 0;
}return this.methodName.hashCode()^this.declaringClass.hashCode();
});
Clazz.defineMethod(c$,"isNativeMethod",
function(){
return this.lineNumber==-2;
});
Clazz.overrideMethod(c$,"toString",
function(){
var buf=new StringBuilder(80);
buf.append(this.getClassName());
buf.append('.');
buf.append(this.getMethodName());
if(this.isNativeMethod()){
buf.append("(Native Method)");
}else{
var fName=this.getFileName();
if(fName==null){
buf.append("(Unknown Source)");
}else{
var lineNum=this.getLineNumber();
buf.append('(');
buf.append(fName);
if(lineNum>=0){
buf.append(':');
buf.append(lineNum);
}buf.append(')');
}}return buf.toString();
});
TypeError.prototype.getMessage || (TypeError.prototype.getMessage = function(){ return (this.message || this.toString()) + (this.getStackTrace ? this.getStackTrace() : Clazz.getStackTrace())});


Clazz.Error = Error;

Clazz.declareTypeError = function (prefix, name, clazzParent, interfacez, 
		parentClazzInstance, _declareType) {
	var f = function () {
		Clazz.instantialize (this, arguments);
    return Clazz.Error();
	};
	return Clazz.decorateAsClass (f, prefix, name, clazzParent, interfacez, 
			parentClazzInstance);
};

// at least allow Error() by itself to work as before
Clazz._Error || (Clazz._Error = Error);
Clazz.decorateAsClass (function (){Clazz.instantialize(this, arguments);return Clazz._Error();}, java.lang, "Error", Throwable);

//c$=Clazz.declareTypeError(java.lang,"Error",Throwable);


c$=Clazz.declareType(java.lang,"LinkageError",Error);

c$=Clazz.declareType(java.lang,"IncompatibleClassChangeError",LinkageError);

c$=Clazz.declareType(java.lang,"AbstractMethodError",IncompatibleClassChangeError);

c$=Clazz.declareType(java.lang,"AssertionError",Error);
Clazz.makeConstructor(c$,
function(detailMessage){
Clazz.superConstructor(this,AssertionError,[String.valueOf(detailMessage),(Clazz.instanceOf(detailMessage,Throwable)?detailMessage:null)]);
},"~O");
Clazz.makeConstructor(c$,
function(detailMessage){
this.construct("" + detailMessage);
},"~B");
Clazz.makeConstructor(c$,
function(detailMessage){
this.construct("" + detailMessage);
},"~N");

c$=Clazz.declareType(java.lang,"ClassCircularityError",LinkageError);

c$=Clazz.declareType(java.lang,"ClassFormatError",LinkageError);

c$=Clazz.decorateAsClass(function(){
this.exception=null;
Clazz.instantialize(this,arguments);
},java.lang,"ExceptionInInitializerError",LinkageError);
Clazz.makeConstructor(c$,
function(){
Clazz.superConstructor(this,ExceptionInInitializerError);
this.initCause(null);
});
Clazz.makeConstructor(c$,
function(detailMessage){
Clazz.superConstructor(this,ExceptionInInitializerError,[detailMessage]);
this.initCause(null);
},"~S");
Clazz.makeConstructor(c$,
function(exception){
Clazz.superConstructor(this,ExceptionInInitializerError);
this.exception=exception;
this.initCause(exception);
},"Throwable");
Clazz.defineMethod(c$,"getException",
function(){
return this.exception;
});
Clazz.overrideMethod(c$,"getCause",
function(){
return this.exception;
});

c$=Clazz.declareType(java.lang,"IllegalAccessError",IncompatibleClassChangeError);

c$=Clazz.declareType(java.lang,"InstantiationError",IncompatibleClassChangeError);

c$=Clazz.declareType(java.lang,"VirtualMachineError",Error);

c$=Clazz.declareType(java.lang,"InternalError",VirtualMachineError);

c$=Clazz.declareType(java.lang,"NoClassDefFoundError",LinkageError);

c$=Clazz.declareType(java.lang,"NoSuchFieldError",IncompatibleClassChangeError);

c$=Clazz.declareType(java.lang,"NoSuchMethodError",IncompatibleClassChangeError);

c$=Clazz.declareType(java.lang,"OutOfMemoryError",VirtualMachineError);

c$=Clazz.declareType(java.lang,"StackOverflowError",VirtualMachineError);

c$=Clazz.declareType(java.lang,"UnknownError",VirtualMachineError);

c$=Clazz.declareType(java.lang,"UnsatisfiedLinkError",LinkageError);

c$=Clazz.declareType(java.lang,"UnsupportedClassVersionError",ClassFormatError);

c$=Clazz.declareType(java.lang,"VerifyError",LinkageError);

c$=Clazz.declareType(java.lang,"ThreadDeath",Error);
Clazz.makeConstructor(c$,
function(){
Clazz.superConstructor(this,ThreadDeath,[]);
});

c$=Clazz.declareType(java.lang,"Exception",Throwable);

c$=Clazz.declareType(java.lang,"RuntimeException",Exception);

c$=Clazz.declareType(java.lang,"ArithmeticException",RuntimeException);

c$=Clazz.declareType(java.lang,"IndexOutOfBoundsException",RuntimeException);

c$=Clazz.declareType(java.lang,"ArrayIndexOutOfBoundsException",IndexOutOfBoundsException);
Clazz.makeConstructor(c$,
function(index){
Clazz.superConstructor(this,ArrayIndexOutOfBoundsException,["Array index out of range: "+index]);
},"~N");

c$=Clazz.declareType(java.lang,"ArrayStoreException",RuntimeException);

c$=Clazz.declareType(java.lang,"ClassCastException",RuntimeException);

c$=Clazz.decorateAsClass(function(){
this.ex=null;
Clazz.instantialize(this,arguments);
},java.lang,"ClassNotFoundException",Exception);
Clazz.makeConstructor(c$,
function(){
Clazz.superConstructor(this,ClassNotFoundException,[Clazz.castNullAs("Throwable")]);
});
Clazz.makeConstructor(c$,
function(detailMessage){
Clazz.superConstructor(this,ClassNotFoundException,[detailMessage,null]);
},"~S");
Clazz.makeConstructor(c$,
function(detailMessage,exception){
Clazz.superConstructor(this,ClassNotFoundException,[detailMessage]);
this.ex=exception;
},"~S,Throwable");
Clazz.defineMethod(c$,"getException",
function(){
return this.ex;
});
Clazz.overrideMethod(c$,"getCause",
function(){
return this.ex;
});

c$=Clazz.declareType(java.lang,"CloneNotSupportedException",Exception);

c$=Clazz.declareType(java.lang,"IllegalAccessException",Exception);

c$=Clazz.declareType(java.lang,"IllegalArgumentException",RuntimeException);
Clazz.makeConstructor(c$,
function(cause){
Clazz.superConstructor(this,IllegalArgumentException,[(cause==null?null:cause.toString()),cause]);
},"Throwable");

c$=Clazz.declareType(java.lang,"IllegalMonitorStateException",RuntimeException);

c$=Clazz.declareType(java.lang,"IllegalStateException",RuntimeException);
Clazz.makeConstructor(c$,
function(cause){
Clazz.superConstructor(this,IllegalStateException,[(cause==null?null:cause.toString()),cause]);
},"Throwable");

c$=Clazz.declareType(java.lang,"IllegalThreadStateException",IllegalArgumentException);

c$=Clazz.declareType(java.lang,"InstantiationException",Exception);

c$=Clazz.declareType(java.lang,"InterruptedException",Exception);

c$=Clazz.declareType(java.lang,"NegativeArraySizeException",RuntimeException);

c$=Clazz.declareType(java.lang,"NoSuchFieldException",Exception);

c$=Clazz.declareType(java.lang,"NoSuchMethodException",Exception);

c$=Clazz.declareType(java.lang,"NullPointerException",RuntimeException);

c$=Clazz.declareType(java.lang,"NumberFormatException",IllegalArgumentException);

c$=Clazz.declareType(java.lang,"SecurityException",RuntimeException);
Clazz.makeConstructor(c$,
function(cause){
Clazz.superConstructor(this,SecurityException,[(cause==null?null:cause.toString()),cause]);
},"Throwable");

c$=Clazz.declareType(java.lang,"StringIndexOutOfBoundsException",IndexOutOfBoundsException);
Clazz.makeConstructor(c$,
function(index){
Clazz.superConstructor(this,StringIndexOutOfBoundsException,["String index out of range: "+index]);
},"~N");

c$=Clazz.declareType(java.lang,"UnsupportedOperationException",RuntimeException);
Clazz.makeConstructor(c$,
function(){
Clazz.superConstructor(this,UnsupportedOperationException,[]);
});
Clazz.makeConstructor(c$,
function(cause){
Clazz.superConstructor(this,UnsupportedOperationException,[(cause==null?null:cause.toString()),cause]);
},"Throwable");

c$=Clazz.decorateAsClass(function(){
this.target=null;
Clazz.instantialize(this,arguments);
},java.lang.reflect,"InvocationTargetException",Exception);
Clazz.makeConstructor(c$,
function(){
Clazz.superConstructor(this,java.lang.reflect.InvocationTargetException,[Clazz.castNullAs("Throwable")]);
});
Clazz.makeConstructor(c$,
function(exception){
Clazz.superConstructor(this,java.lang.reflect.InvocationTargetException,[null,exception]);
this.target=exception;
},"Throwable");
Clazz.makeConstructor(c$,
function(exception,detailMessage){
Clazz.superConstructor(this,java.lang.reflect.InvocationTargetException,[detailMessage,exception]);
this.target=exception;
},"Throwable,~S");
Clazz.defineMethod(c$,"getTargetException",
function(){
return this.target;
});
Clazz.overrideMethod(c$,"getCause",
function(){
return this.target;
});

c$=Clazz.decorateAsClass(function(){
this.undeclaredThrowable=null;
Clazz.instantialize(this,arguments);
},java.lang.reflect,"UndeclaredThrowableException",RuntimeException);
Clazz.makeConstructor(c$,
function(exception){
Clazz.superConstructor(this,java.lang.reflect.UndeclaredThrowableException);
this.undeclaredThrowable=exception;
this.initCause(exception);
},"Throwable");
Clazz.makeConstructor(c$,
function(exception,detailMessage){
Clazz.superConstructor(this,java.lang.reflect.UndeclaredThrowableException,[detailMessage]);
this.undeclaredThrowable=exception;
this.initCause(exception);
},"Throwable,~S");
Clazz.defineMethod(c$,"getUndeclaredThrowable",
function(){
return this.undeclaredThrowable;
});
Clazz.overrideMethod(c$,"getCause",
function(){
return this.undeclaredThrowable;
});

c$=Clazz.declareType(java.io,"IOException",Exception);


c$=Clazz.declareType(java.io,"CharConversionException",java.io.IOException);

c$=Clazz.declareType(java.io,"EOFException",java.io.IOException);

c$=Clazz.declareType(java.io,"FileNotFoundException",java.io.IOException);

c$=Clazz.decorateAsClass(function(){
this.bytesTransferred=0;
Clazz.instantialize(this,arguments);
},java.io,"InterruptedIOException",java.io.IOException);

c$=Clazz.declareType(java.io,"ObjectStreamException",java.io.IOException);

c$=Clazz.decorateAsClass(function(){
this.classname=null;
Clazz.instantialize(this,arguments);
},java.io,"InvalidClassException",java.io.ObjectStreamException);
Clazz.makeConstructor(c$,
function(className,detailMessage){
Clazz.superConstructor(this,java.io.InvalidClassException,[detailMessage]);
this.classname=className;
},"~S,~S");
Clazz.defineMethod(c$,"getMessage",
function(){
var msg=Clazz.superCall(this,java.io.InvalidClassException,"getMessage",[]);
if(this.classname!=null){
msg=this.classname+';' + ' '+msg;
}return msg;
});

c$=Clazz.declareType(java.io,"InvalidObjectException",java.io.ObjectStreamException);

c$=Clazz.declareType(java.io,"NotActiveException",java.io.ObjectStreamException);

c$=Clazz.declareType(java.io,"NotSerializableException",java.io.ObjectStreamException);

c$=Clazz.decorateAsClass(function(){
this.eof=false;
this.length=0;
Clazz.instantialize(this,arguments);
},java.io,"OptionalDataException",java.io.ObjectStreamException);

c$=Clazz.declareType(java.io,"StreamCorruptedException",java.io.ObjectStreamException);

c$=Clazz.declareType(java.io,"SyncFailedException",java.io.IOException);

c$=Clazz.declareType(java.io,"UnsupportedEncodingException",java.io.IOException);

c$=Clazz.declareType(java.io,"UTFDataFormatException",java.io.IOException);

c$=Clazz.decorateAsClass(function(){
this.detail=null;
Clazz.instantialize(this,arguments);
},java.io,"WriteAbortedException",java.io.ObjectStreamException);
Clazz.makeConstructor(c$,
function(detailMessage,rootCause){
Clazz.superConstructor(this,java.io.WriteAbortedException,[detailMessage]);
this.detail=rootCause;
this.initCause(rootCause);
},"~S,Exception");
Clazz.defineMethod(c$,"getMessage",
function(){
var msg=Clazz.superCall(this,java.io.WriteAbortedException,"getMessage",[]);
return (this.detail ? msg + "; "+this.detail.toString() : msg);
});
Clazz.overrideMethod(c$,"getCause",
function(){
return this.detail;
});

c$=Clazz.declareType(javautil,"ConcurrentModificationException",RuntimeException);
Clazz.makeConstructor(c$,
function(){
Clazz.superConstructor(this,javautil.ConcurrentModificationException,[]);
});

c$=Clazz.declareType(javautil,"EmptyStackException",RuntimeException);

c$=Clazz.decorateAsClass(function(){
this.className=null;
this.key=null;
Clazz.instantialize(this,arguments);
},javautil,"MissingResourceException",RuntimeException);
Clazz.makeConstructor(c$,
function(detailMessage,className,resourceName){
Clazz.superConstructor(this,javautil.ResourceException,[detailMessage]);
this.className=className;
this.key=resourceName;
},"~S,~S,~S");
Clazz.defineMethod(c$,"getClassName",
function(){
return this.className;
});
Clazz.defineMethod(c$,"getKey",
function(){
return this.key;
});

c$=Clazz.declareType(javautil,"NoSuchElementException",RuntimeException);

c$=Clazz.declareType(javautil,"TooManyListenersException",Exception);

c$=Clazz.declareType(java.lang,"Void");
Clazz.defineStatics(c$,
"TYPE",null);
{
java.lang.Void.TYPE=java.lang.Void;
}Clazz.declareInterface(java.lang.reflect,"GenericDeclaration");
Clazz.declareInterface(java.lang.reflect,"AnnotatedElement");

c$=Clazz.declareType(java.lang.reflect,"AccessibleObject",null,java.lang.reflect.AnnotatedElement);
Clazz.makeConstructor(c$,
function(){
});
Clazz.defineMethod(c$,"isAccessible",
function(){
return false;
});
c$.setAccessible=Clazz.defineMethod(c$,"setAccessible",
function(objects,flag){
return;
},"~A,~B");
Clazz.defineMethod(c$,"setAccessible",
function(flag){
return;
},"~B");
Clazz.overrideMethod(c$,"isAnnotationPresent",
function(annotationType){
return false;
},"Class");
Clazz.overrideMethod(c$,"getDeclaredAnnotations",
function(){
return new Array(0);
});
Clazz.overrideMethod(c$,"getAnnotations",
function(){
return new Array(0);
});
Clazz.overrideMethod(c$,"getAnnotation",
function(annotationType){
return null;
},"Class");
c$.marshallArguments=Clazz.defineMethod(c$,"marshallArguments",
function(parameterTypes,args){
return null;
},"~A,~A");
Clazz.defineMethod(c$,"invokeV",
function(receiver,args){
return;
},"~O,~A");
Clazz.defineMethod(c$,"invokeL",
function(receiver,args){
return null;
},"~O,~A");
Clazz.defineMethod(c$,"invokeI",
function(receiver,args){
return 0;
},"~O,~A");
Clazz.defineMethod(c$,"invokeJ",
function(receiver,args){
return 0;
},"~O,~A");
Clazz.defineMethod(c$,"invokeF",
function(receiver,args){
return 0.0;
},"~O,~A");
Clazz.defineMethod(c$,"invokeD",
function(receiver,args){
return 0.0;
},"~O,~A");
c$.emptyArgs=c$.prototype.emptyArgs=new Array(0);
Clazz.declareInterface(java.lang.reflect,"InvocationHandler");
c$=Clazz.declareInterface(java.lang.reflect,"Member");
Clazz.defineStatics(c$,
"PUBLIC",0,
"DECLARED",1);

c$=Clazz.declareType(java.lang.reflect,"Modifier");
Clazz.makeConstructor(c$,
function(){
});
c$.isAbstract=Clazz.defineMethod(c$,"isAbstract",
function(modifiers){
return((modifiers&1024)!=0);
},"~N");
c$.isFinal=Clazz.defineMethod(c$,"isFinal",
function(modifiers){
return((modifiers&16)!=0);
},"~N");
c$.isInterface=Clazz.defineMethod(c$,"isInterface",
function(modifiers){
return((modifiers&512)!=0);
},"~N");
c$.isNative=Clazz.defineMethod(c$,"isNative",
function(modifiers){
return((modifiers&256)!=0);
},"~N");
c$.isPrivate=Clazz.defineMethod(c$,"isPrivate",
function(modifiers){
return((modifiers&2)!=0);
},"~N");
c$.isProtected=Clazz.defineMethod(c$,"isProtected",
function(modifiers){
return((modifiers&4)!=0);
},"~N");
c$.isPublic=Clazz.defineMethod(c$,"isPublic",
function(modifiers){
return((modifiers&1)!=0);
},"~N");
c$.isStatic=Clazz.defineMethod(c$,"isStatic",
function(modifiers){
return((modifiers&8)!=0);
},"~N");
c$.isStrict=Clazz.defineMethod(c$,"isStrict",
function(modifiers){
return((modifiers&2048)!=0);
},"~N");
c$.isSynchronized=Clazz.defineMethod(c$,"isSynchronized",
function(modifiers){
return((modifiers&32)!=0);
},"~N");
c$.isTransient=Clazz.defineMethod(c$,"isTransient",
function(modifiers){
return((modifiers&128)!=0);
},"~N");
c$.isVolatile=Clazz.defineMethod(c$,"isVolatile",
function(modifiers){
return((modifiers&64)!=0);
},"~N");
c$.toString=Clazz.defineMethod(c$,"toString",
function(modifiers){
var sb=new Array(0);
if(java.lang.reflect.Modifier.isPublic(modifiers))sb[sb.length]="public";
if(java.lang.reflect.Modifier.isProtected(modifiers))sb[sb.length]="protected";
if(java.lang.reflect.Modifier.isPrivate(modifiers))sb[sb.length]="private";
if(java.lang.reflect.Modifier.isAbstract(modifiers))sb[sb.length]="abstract";
if(java.lang.reflect.Modifier.isStatic(modifiers))sb[sb.length]="static";
if(java.lang.reflect.Modifier.isFinal(modifiers))sb[sb.length]="final";
if(java.lang.reflect.Modifier.isTransient(modifiers))sb[sb.length]="transient";
if(java.lang.reflect.Modifier.isVolatile(modifiers))sb[sb.length]="volatile";
if(java.lang.reflect.Modifier.isSynchronized(modifiers))sb[sb.length]="synchronized";
if(java.lang.reflect.Modifier.isNative(modifiers))sb[sb.length]="native";
if(java.lang.reflect.Modifier.isStrict(modifiers))sb[sb.length]="strictfp";
if(java.lang.reflect.Modifier.isInterface(modifiers))sb[sb.length]="interface";
if(sb.length>0){
return sb.join(" ");
}return"";
},"~N");
Clazz.defineStatics(c$,
"PUBLIC",0x1,
"PRIVATE",0x2,
"PROTECTED",0x4,
"STATIC",0x8,
"FINAL",0x10,
"SYNCHRONIZED",0x20,
"VOLATILE",0x40,
"TRANSIENT",0x80,
"NATIVE",0x100,
"INTERFACE",0x200,
"ABSTRACT",0x400,
"STRICT",0x800,
"BRIDGE",0x40,
"VARARGS",0x80,
"SYNTHETIC",0x1000,
"ANNOTATION",0x2000,
"ENUM",0x4000);

c$=Clazz.decorateAsClass(function(){
this.clazz=null;
this.parameterTypes=null;
this.exceptionTypes=null;
this.modifiers=0;
Clazz.instantialize(this,arguments);
},java.lang.reflect,"Constructor",java.lang.reflect.AccessibleObject,[java.lang.reflect.GenericDeclaration,java.lang.reflect.Member]);
Clazz.makeConstructor(c$,
function(declaringClass,parameterTypes,checkedExceptions,modifiers){
Clazz.superConstructor(this,java.lang.reflect.Constructor,[]);
this.clazz=declaringClass;
this.parameterTypes=parameterTypes;
this.exceptionTypes=checkedExceptions;
this.modifiers=modifiers;
},"Class,~A,~A,~N");
Clazz.overrideMethod(c$,"getTypeParameters",
function(){
return null;
});
Clazz.defineMethod(c$,"toGenericString",
function(){
return null;
});
Clazz.defineMethod(c$,"getGenericParameterTypes",
function(){
return null;
});
Clazz.defineMethod(c$,"getGenericExceptionTypes",
function(){
return null;
});
Clazz.defineMethod(c$,"getParameterAnnotations",
function(){
return null;
});
Clazz.defineMethod(c$,"isVarArgs",
function(){
return false;
});
Clazz.overrideMethod(c$,"isSynthetic",
function(){
return false;
});
Clazz.overrideMethod(c$,"equals",
function(object){
if(object!=null&&Clazz.instanceOf(object,java.lang.reflect.Constructor)){
var other=object;
if(this.getDeclaringClass()===other.getDeclaringClass()){
var params1=this.parameterTypes;
var params2=other.parameterTypes;
if(params1.length==params2.length){
for(var i=0;i<params1.length;i++){
if(params1[i]!==params2[i])return false;
}
return true;
}}}return false;
},"~O");
Clazz.overrideMethod(c$,"getDeclaringClass",
function(){
return this.clazz;
});
Clazz.defineMethod(c$,"getExceptionTypes",
function(){
return this.exceptionTypes;
});
Clazz.overrideMethod(c$,"getModifiers",
function(){
return this.modifiers;
});
Clazz.overrideMethod(c$,"getName",
function(){
return this.getDeclaringClass().getName();
});
Clazz.defineMethod(c$,"getParameterTypes",
function(){
return this.parameterTypes;
});
Clazz.overrideMethod(c$,"hashCode",
function(){
return this.getDeclaringClass().getName().hashCode();
});
Clazz.defineMethod(c$,"newInstance",
function(args){
// must fix [Number,Number...]
var a = (args ? new Array(args.length) : null);
if (args) {
  for (var i = args.length; --i >= 0;) {
    a[i] = (this.parameterTypes[i] == Number ? args[i].valueOf() : args[i]);
  }
}
var instance=new this.clazz(null, Clazz.inheritArgs);
if (instance == null)
	newMethodNotFoundException(this.clazz, "construct", getParamTypes(a).typeString);	
Clazz.instantialize(instance,a);
return instance;
},"~A");
Clazz.overrideMethod(c$,"toString",
function(){
return null;
});

c$=Clazz.declareType(java.lang.reflect,"Field",java.lang.reflect.AccessibleObject,java.lang.reflect.Member);
Clazz.overrideMethod(c$,"isSynthetic",
function(){
return false;
});
Clazz.defineMethod(c$,"toGenericString",
function(){
return null;
});
Clazz.defineMethod(c$,"isEnumConstant",
function(){
return false;
});
Clazz.defineMethod(c$,"getGenericType",
function(){
return null;
});
Clazz.overrideMethod(c$,"equals",
function(object){
return false;
},"~O");
Clazz.overrideMethod(c$,"getDeclaringClass",
function(){
return null;
});
Clazz.overrideMethod(c$,"getName",
function(){
return null;
});
Clazz.defineMethod(c$,"getType",
function(){
return null;
});
Clazz.overrideMethod(c$,"hashCode",
function(){
return 0;
});
Clazz.overrideMethod(c$,"toString",
function(){
return null;
});

c$=Clazz.decorateAsClass(function(){
this.clazz=null;
this.name=null;
this.returnType=null;
this.parameterTypes=null;
this.exceptionTypes=null;
this.modifiers=0;
Clazz.instantialize(this,arguments);
},java.lang.reflect,"Method",java.lang.reflect.AccessibleObject,[java.lang.reflect.GenericDeclaration,java.lang.reflect.Member]);
Clazz.makeConstructor(c$,
function(declaringClass,name,parameterTypes,returnType,checkedExceptions,modifiers){
Clazz.superConstructor(this,java.lang.reflect.Method,[]);
this.clazz=declaringClass;
this.name=name;
this.parameterTypes=parameterTypes;
this.returnType=returnType;
this.exceptionTypes=checkedExceptions;
this.modifiers=modifiers;
},"Class,~S,~A,Class,~A,~N");
Clazz.overrideMethod(c$,"getTypeParameters",
function(){
return null;
});
Clazz.defineMethod(c$,"toGenericString",
function(){
return null;
});
Clazz.defineMethod(c$,"getGenericParameterTypes",
function(){
return null;
});
Clazz.defineMethod(c$,"getGenericExceptionTypes",
function(){
return null;
});
Clazz.defineMethod(c$,"getGenericReturnType",
function(){
return null;
});
Clazz.defineMethod(c$,"getParameterAnnotations",
function(){
return null;
});
Clazz.defineMethod(c$,"isVarArgs",
function(){
return false;
});
Clazz.defineMethod(c$,"isBridge",
function(){
return false;
});
Clazz.overrideMethod(c$,"isSynthetic",
function(){
return false;
});
Clazz.defineMethod(c$,"getDefaultValue",
function(){
return null;
});
Clazz.overrideMethod(c$,"equals",
function(object){
if(object!=null&&Clazz.instanceOf(object,java.lang.reflect.Method)){
var other=object;
if((this.getDeclaringClass()===other.getDeclaringClass())&&(this.getName()===other.getName())){
var params1=this.parameterTypes;
var params2=other.parameterTypes;
if(params1.length==params2.length){
for(var i=0;i<params1.length;i++){
if(params1[i]!==params2[i])return false;
}
return true;
}}}return false;
},"~O");
Clazz.overrideMethod(c$,"getDeclaringClass",
function(){
return this.clazz;
});
Clazz.defineMethod(c$,"getExceptionTypes",
function(){
return this.exceptionTypes;
});
Clazz.overrideMethod(c$,"getModifiers",
function(){
return this.modifiers;
});
Clazz.overrideMethod(c$,"getName",
function(){
return this.name;
});
Clazz.defineMethod(c$,"getParameterTypes",
function(){
return this.parameterTypes; 
});
Clazz.defineMethod(c$,"getReturnType",
function(){
return this.returnType;
});
Clazz.overrideMethod(c$,"hashCode",
function(){
return this.getDeclaringClass().getName().hashCode()^this.getName().hashCode();
});
Clazz.defineMethod(c$,"invoke",
function(receiver,args){
var name = this.getName();
var m=this.clazz.prototype[name] || this.clazz[name];
// note we are not checking for method signature here, only name.
if (m == null)
	newMethodNotFoundException(this.clazz, name, getParamTypes(args).typeString);
  // must fix [Number,Number...]
var a = (args ? new Array(args.length) : null);
if (args) {
  for (var i = args.length; --i >= 0;) {
    a[i] = (this.parameterTypes[i] == Number ? args[i].valueOf() : args[i]);
  }
}	
return m.apply(receiver,a);
},"~O,~A");
Clazz.overrideMethod(c$,"toString",
function(){
return null;
});

})(Clazz);


})(Clazz, J2S); // requires JSmolCore.js

if (!window["java.registered"])
 window["java.registered"] = false;

(function (ClazzLoader) {

	if (window["java.packaged"]) return;
	window["java.packaged"] = true;

	//if (!J2S._isAsync) {
		for (var i = 0; i < J2S._coreFiles.length; i++)
		  ClazzLoader.loadZJar(J2S._coreFiles[i], ClazzLoader.runtimeKeyClass);
	//}
		
ClazzLoader.jarClasspath (ClazzLoader.getJ2SLibBase() + "java/awt/geom/Point2D.js", [
  "java.awt.geom.Point2D", 
  "java.awt.geom.Point2D.Double", 
  "java.awt.geom.Point2D.Float"  
	]);

ClazzLoader.jarClasspath (ClazzLoader.getJ2SLibBase() + "sun/awt/SunHints.js", [
  "sun.awt.SunHints", 
  "sun.awt.SunHints.Value", 
  "sun.awt.SunHints.Key", 
  "sun.awt.SunHints.LCDContrastKey",
  "sun.awt.SunHints.SunKey" 
	]);

ClazzLoader.jarClasspath (ClazzLoader.getJ2SLibBase() + "javax/swing/text/AbstractDocument.js", [
  "javax.swing.text.AbstractDocument", 
  "javax.swing.text.AbstractDocument.UndoRedoDocumentEvent" 
	]);

ClazzLoader.jarClasspath (ClazzLoader.getJ2SLibBase() + "javax/swing/UIDefaults.js", [
  "javax.swing.UIDefaults",
  "javax.swing.UIDefaults.ActiveValue",
  "javax.swing.UIDefaults.LazyValue"
	]);

ClazzLoader.jarClasspath (ClazzLoader.getJ2SLibBase() + "javax/swing/Popup.js", [
  "javax.swing.Popup", 
  "javax.swing.Popup.DefaultFrame",
  "javax.swing.Popup.HeavyWeightWindow" 
	]);

ClazzLoader.jarClasspath (ClazzLoader.getJ2SLibBase() + "javax/swing/text/LayeredHighlighter.js", [
  "javax.swing.text.LayeredHighlighter", 
  "javax.swing.text.LayeredHighlighter.LayerPainter" 
	]);

ClazzLoader.jarClasspath (ClazzLoader.getJ2SLibBase() + "javax/swing/JComponent.js", [
  "javax.swing.JComponent", 
  "javax.swing.JComponent.KeyboardState", 
  "javax.swing.JComponent.ActionStandin", 
  "javax.swing.JComponent.IntVector" 
	]);

ClazzLoader.jarClasspath (ClazzLoader.getJ2SLibBase() + "sun/util/resources/LocaleData.js", [
  "sun.util.resources.LocaleData", 
  "sun.util.resources.LocaleDataResourceBundleControl"
	]);

ClazzLoader.jarClasspath (ClazzLoader.getJ2SLibBase() + "java/text/DateFormat.js", [
  "java.text.DateFormat", 
  "java.text.DateFormat.Field"
	]);

ClazzLoader.jarClasspath (ClazzLoader.getJ2SLibBase() + "javax/sound/sampled/Line.js", [
  "java.text.Line.Info"
	]);

ClazzLoader.jarClasspath (ClazzLoader.getJ2SLibBase() + "javax/sound/sampled/DataLine.js", [
  "java.text.DataLine.Info"
	]);


}) (Clazz._Loader);
window["java.registered"] = true;
};

LoadClazz2 = function() {
  
Clazz._Loader.loadZJar(Clazz._Loader.getJ2SLibBase() + "core/coreswingjs.z.js", "swingjs.JSToolkit");


}; // called by external application 

//J2S._debugCode = false;
