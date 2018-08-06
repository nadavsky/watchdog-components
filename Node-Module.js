// todo: freeze modules/components models and make _meta_ not configurable property
var Module = {
    create : function(url, model) {
        return new BaseModule(url, model);
    },

    wrapWithProxy : function(comp) {
        var handler = new ComponentProxyHandler(comp);
        var proxy = new Proxy(function() {}, handler);
        handler._proxy = proxy;

        return proxy;
    },

    inheritBase : function(obj, sub) {
        Utils.extend(obj, sub && sub.actions);
        Utils.extend(obj, sub && sub.getters);
        Utils.extend(obj, sub && sub.utils);
        Utils.extend(obj, sub && sub.actionUtils);
    }
};

function BaseModule(url, subModuleModel) {
    var newModule = { _meta_ : { model : baseModuleModel, url : url, components : {} } };
    newModule._meta_.module = newModule;
    Module.inheritBase(newModule, baseModuleModel.instance);
    Module.inheritBase(newModule, baseComponentModel.instance);
    Utils.extend(newModule, { get wrappedComponent() { return this; } });

    newModule.registerComponent(baseComponentModel);
    newModule.registerComponent(baseModuleModel);
    if (subModuleModel) {
        newModule.registerComponent(subModuleModel, baseModuleModel);
        Module.inheritBase(newModule, subModuleModel.instance);
        newModule._meta_.name = subModuleModel.name;
        newModule._meta_.actionProps = Utils.extend({}, subModuleModel.actionProps);
    }

    return newModule;
}

function ComponentProxyHandler(comp) {
    this.comp = comp;
    this.compModel = comp._meta_.model;
    this.compModule = comp._meta_.module;
}

ComponentProxyHandler.prototype = {
    set : function() { throw "setters calls are not allowed"; },

    get : function(target, prop) {
        Logger.trace("get prop '" + prop + "' from:" + this.compModel.id + " elem:" + this.comp.element);
        var propHandler = this._getPropHandler(prop);
        if (propHandler.isGet) return propHandler.handle(propHandler);

        this._lastPropHandler = propHandler;
        this._lastCmdObj = null;

        return this._proxy;
    },

    apply : function(target, thisArg, args) {
        return this._lastPropHandler.handle(this._lastPropHandler, args);
    },

    _getPropHandler : function(prop) {
        var res = {}, compModel = this.compModel, handlerProp;
        proxyPropHandlerKeys.some((curHandlerProp, i) => {
            var curPropHandler = ProxyPropHandlers[curHandlerProp], _compModel;
            if (curPropHandler.model) _compModel = this._getModelWithProp(compModel, prop, curHandlerProp);
            else if (curHandlerProp === prop || i == proxyPropHandlerKeys.length - 1) _compModel = compModel;

            if (_compModel) {
                compModel = _compModel;
                handlerProp = curHandlerProp;
                return true;
            }
        });

        Utils.extend(res, ProxyPropHandlers[handlerProp]);
        return Utils.extend(res, { handle : res.handle.bind(this), compModel : compModel, prop : prop, lastCmdObj : this._lastCmdObj });
    },

    _getModelWithProp : function(compModel, prop, type, skipSubComps) {
        if (compModel.instance && compModel.instance[type] && compModel.instance[type].hasOwnProperty(prop)) return compModel;

        var compModelWithProp;
        if (!skipSubComps) {
            var subComps = this.compModule.getSubComponents(compModel.id);
            if (subComps) subComps.some(function(subCompModel) { return compModelWithProp = this._getModelWithProp(subCompModel, prop, type); }, this);
            if (compModelWithProp) return compModelWithProp;
        }

        var baseCompModel = this.compModule.getBaseComponent(compModel.id);
        if (baseCompModel) compModelWithProp = this._getModelWithProp(baseCompModel, prop, type, true);

        return compModelWithProp;
    },

    _createNewLastCmd : function(compModel, methodName, args, skipFind) {
        var scriptCmd = ComponentScriptCommand.create(this.comp, methodName,
            Utils.extend(args ? this._convertArgs(compModel, methodName, args) : {}, { cmdConfig : this._cmdConfig }), skipFind);
        this._lastPropHandler = this._getPropHandler("no-op");
        return (this._lastCmdObj = cmd(scriptCmd));
    },

    _convertArgs : function(compModel, methodName, args) {
        function getArgsMap(argsCompModel, compModule, methodName) {
            var argsMap = argsCompModel.argsMap && argsCompModel.argsMap[methodName], subComps = compModule.getSubComponents(argsCompModel.id);
            if (!argsMap && subComps) subComps.some(subCompModel => argsMap = getArgsMap(subCompModel, compModule, methodName));
            return argsMap || [];
        }

        if (args.length == 1 && typeof args[0] == "object" && !Array.isArray(args[0]) && !(args[0] instanceof Set) && !(typeof args[0].getMonth === "function")) return args[0];

        var newArgs = {}, argsMap = getArgsMap(compModel, this.compModule, methodName);
        args.forEach(function(arg, index) { newArgs[argsMap[index] || index] = arg; });
        return newArgs;
    }
};

var ProxyPropHandlers = {
    "element"			: {
        isGet	: true,
        handle	: function() {
            var resElem = this.comp.element;
            if (!resElem) {
                var boundComp = this.comp.findAndBind().boundComp;
                if (boundComp) resElem = boundComp.element;
            }
            return resElem;
        }
    },

    "wrappedComponent"	: {
        isGet	: true,
        handle	: function() { return this.comp; }
    },

    "cmdConfig"			: {
        handle	: function(handler, args) {
            this._cmdConfig = args[0];
            return this._proxy;
        }
    },

    "then"				: {
        handle	: function(handler, args) {
            var $this = this;
            (handler.lastCmdObj || this._createNewLastCmd()).then(
                args[0] && (function() { args[0].apply(Module.wrapWithProxy($this.comp.boundComp || $this.comp), arguments); }),
                args[1] && (function() { args[1].apply(Module.wrapWithProxy($this.comp.boundComp || $this.comp), arguments); })
            );
            this._lastCmdObj = null;

            return this._proxy;
        }
    },

    "catch"				: {
        handle	: function(handler, args) {
            var $this = this;
            (handler.lastCmdObj || this._createNewLastCmd()).catch(
                args[0] && (function() { args[0].apply(Module.wrapWithProxy($this.comp.boundComp || $this.comp), arguments); })
            );
            this._lastCmdObj = null;

            return this._proxy;
        }
    },

    "no-op"				: {
        handle	: function(handler) {
            this._lastCmdObj = handler.lastCmdObj;
            return this._proxy;
        }
    },

    "utils"				: {
        isGet	: true,
        model	: true,
        handle	: function(handler) {
            var desc = Object.getOwnPropertyDescriptor(handler.compModel.instance["utils"], handler.prop);
            return	!desc.hasOwnProperty("value")	? desc.get.call(Module.wrapWithProxy(this.comp)) :
                typeof desc.value !== "function"? desc.value : desc.value.bind(Module.wrapWithProxy(this.comp));
        }
    },

    "getters"			: {
        isGet	: true,
        model	: true,
        handle	: function(handler) {
            var desc = Object.getOwnPropertyDescriptor(handler.compModel.instance["getters"], handler.prop), hasValue = desc.hasOwnProperty("value");
            if (hasValue && typeof desc.value !== "function") return desc.value;

            var boundComp = this.comp;
            if (!boundComp.element) boundComp = this.comp.findAndBind().boundComp;
            if (!boundComp) {
                Logger.error("failed to find and bind component:" + handler.compModel.id + " before getter call");
                throw new Error("FIND_FAILED");
            }

            var newProxy = Module.wrapWithProxy(boundComp);
            return hasValue ? desc.value.bind(newProxy) : desc.get.call(newProxy);
        }
    },

    "actions"			: {
        model	: true,
        handle	: function(handler, args) {
            Logger.trace("doing action '" + handler.prop + "' on:" + this.compModel.id);
            this._createNewLastCmd(handler.compModel, handler.prop, args);
            return this._proxy;
        }
    },

    "actionUtils"		: {
        model	: true,
        handle	: function(handler, args) {
            Logger.trace("doing action util '" + handler.prop + "' on:" + this.compModel.id);
            this._createNewLastCmd(handler.compModel, handler.prop, args, true);
            return this._proxy;
        }
    },

    "component"			: {
        handle	: function(handler, args) {
            var newComp = this.compModule.createComponent(handler.prop);
            newComp._dispName = handler.prop;
            newComp.resolvingData = { fd : this._convertArgs(newComp._meta_.model, "find", args), rawArgs : args, contextComponent : this.comp };
            var modelDelegates = newComp._meta_.model.delegates;
            if (modelDelegates) {
                var delegatesModuleComp = modelDelegates.wrappedComponent;
                if (!delegatesModuleComp) delegatesModuleComp = modelDelegates(args.length && args[0]).wrappedComponent;

                var delegatesComp = Utils.extend({}, delegatesModuleComp);
                delegatesComp._dispName = newComp._dispName;
                delegatesComp.resolvingData = { fd : {}, rawArgs : [], contextComponent : newComp };
                newComp = delegatesComp;
            }

            return Module.wrapWithProxy(newComp);
        }
    }
};

var proxyPropHandlerKeys = Object.keys(ProxyPropHandlers);

var ComponentScriptCommand = {
    create : function(baseComp, methodName, args, skipFind) {
        var scriptCommand = Utils.extend({
            cmd : function(action) {
                if (cmdConfig.immediateFind) action.timeout = 10;
                if	(cmdConfig.findTimeout) action.timeout = cmdConfig.findTimeout;
                action.findTarget(
                    function() {
                        if (skipFind) return [{}];

                        var findAndBindRes = baseComp.findAndBind(), boundComp = findAndBindRes.boundComp;
                        Logger.info("command find ended - found component:" + (boundComp && boundComp._meta_.model.id) + " elem:" + (boundComp && boundComp.element));

                        var targetRes = boundComp ? [boundComp.element] : [];
                        for (; !findAndBindRes.findRes && findAndBindRes.ctxBindRes; findAndBindRes = findAndBindRes.ctxBindRes) ;

                        if (findAndBindRes && findAndBindRes.findRes) {
                            targetRes.flags = findAndBindRes.findRes.flags;
                            if (!boundComp) targetRes.errorMsg = findAndBindRes.findRes.error;
                        }

                        return targetRes;
                    },
                    function(elem) {
                        function script() {
                            action.args = args;
                            action.context = elem;
                            if (methodName) actionComp[methodName].call(Module.wrapWithProxy(actionComp), action);
                        }

                        var actionComp = skipFind ? baseComp : baseComp.boundComp;
                        Logger.info("command action starts for:" + (actionComp && actionComp._meta_.model.id) + " with action:" + (methodName || "find") + " baseComp:" + baseComp._meta_.model.id);
                        runScript(script, action);
                    }
                );
            },
            delay : 100
        }, baseComp._meta_.module._meta_.actionProps);

        ComponentScriptCommand._addDescription(scriptCommand, baseComp, methodName, args);

        var cmdConfig = args.cmdConfig || {};
        delete args.cmdConfig;

        return scriptCommand;
    },


    _addDescription : function(scriptCommand, baseComp, methodName, args) {
        function stringify(obj) { try { return JSON.stringify(obj); } catch(ex) { return "[ex]"; } }
        function createArgsDesc(obj) {
            var descArgs = Object.keys(obj).map(function(prop) { return (Array.isArray(obj[prop]) || obj[prop] instanceof Set)? "[".concat(Array.from(obj[prop]), "]") : stringify(obj[prop]); });
            if (descArgs.length == 0) descArgs = undefined;
            else if (descArgs.length == 1) descArgs = descArgs[0];

            return descArgs;
        }

        var moduleName = baseComp._meta_.module._meta_.name;
        scriptCommand.cmd.toString = function() { return moduleName.toLowerCase() + "/"; };

        for (var caller = arguments.callee.caller, i = 0; caller && i < 3; ++i) caller = caller.caller;
        scriptCommand.source = caller && `${caller.filename}:${Utils.getCallerLinerNumber(7)}`;

        var argsDesc = createArgsDesc(args);
        if(!methodName){
            console.log("ok")
        }
        var desc = methodName ? `${methodName}(${argsDesc || ""})` : scriptCommand.toString();
        for (var comp = baseComp; comp && comp.resolvingData; comp = comp.resolvingData.contextComponent)
            if (!comp.resolvingData.contextComponent || !comp.resolvingData.contextComponent._meta_.model.delegates)
                desc = `${comp._dispName || comp._meta_.model.name}${stringify(comp.resolvingData.rawArgs)}.${desc}`;

        //scriptCommand.desc = `${moduleName}: ${desc} :${caller && caller.lineNumber}`;
        scriptCommand.desc = `${moduleName}: ${desc} :${caller && Utils.getCallerLinerNumber(7)}`;
        scriptCommand.moduleName = moduleName;
        scriptCommand.lineNumber = caller.lineNumber;
        this.CovarageReport && this.CovarageReport.docMode() && this.CovarageReport.loadedCommands.push(`${moduleName.toLowerCase()}.${desc}`,`${moduleName.toLowerCase()}`);
        return scriptCommand;
    }
};

var baseModuleModel = {
    id			: "baseModule",
    name		: "Base Module",
    instance	: {
        utils : {
            get components() {
                return this.wrappedComponent._meta_.module._meta_.components;
            },

            get baseUrl() {
                return this.wrappedComponent._meta_.module._meta_.url;
            },

            registerComponents : function(compModels) {
                compModels.forEach(compModel => this.registerComponent(compModel));
                compModels[this.wrappedComponent._meta_.name || "module"] = this;
            },

            registerComponent : function(compModel, baseCompModel) {
                var compMeta = this.wrappedComponent._meta_;
                if (!compModel) {
                    Logger.error("failed to register component:" + compModel + " to module:" + compMeta.model.id);
                    return;
                }

                if (typeof compModel == "string") compModel = require(URL(compModel + ".js", this.baseUrl).href);

                if (Array.isArray(compModel)) {
                    this.registerComponents(compModel);
                    return;
                }

                Logger.trace("Registering component:" + (compModel && compModel.id) + " to module:" + compMeta.model.id);

                if (this.components[compModel.id]) {
                    Logger.error("a component with the same id was already registered, id:" + compModel.id + " module:" + compMeta.model.id);
                    return;
                }

                var compEntry = { module : compMeta.module, compModel : compModel };
                if (compModel != baseComponentModel) {
                    var index = compModel.id.lastIndexOf("/"), baseCompStr = (index > -1 && compModel.id.slice(0, index)) || (baseCompModel && baseCompModel.id) || "baseComponent";
                    var baseCompModelEntry = this.components[baseCompStr];
                    if (!baseCompModelEntry) {
                        Logger.error("missing base component, base:" + baseCompStr + " id:" + compModel.id + " module:" + compMeta.model.id);
                        return;
                    }

                    compEntry.baseCompEntry = baseCompModelEntry;
                    baseCompModelEntry.subComponents = baseCompModelEntry.subComponents || [];
                    baseCompModelEntry.subComponents.push(compModel);
                }

                this.components[compModel.id] = compEntry;
                if (compModel.aliases) compModel.aliases.forEach(alias => this.components[alias] = compEntry);
            },

            createComponent : function(compId) {
                var compMeta = this.wrappedComponent._meta_;

                Logger.trace("creating component:" + compId + " on module:" + compMeta.model.id);

                var compEntry = this.components[compId], compModel = compEntry && compEntry.compModel;
                if (!compModel) {
                    Logger.error("failed to create component, id:" + compId + " module:" + compMeta.model.id);
                    var caller =  {};
                    debugger;
                    throw new Error("Unknown property: " + compId);
                }

                var baseComponents = [compModel];
                for (var baseCompEntry = compEntry.baseCompEntry; baseCompEntry; baseCompEntry = baseCompEntry.baseCompEntry)
                    baseComponents.unshift(baseCompEntry.compModel);

                var compInstance = { _meta_ : { model : compModel, module : compMeta.module } };
                baseComponents.forEach(comp => Module.inheritBase(compInstance, comp.instance));

                return compInstance;
            },

            getSubComponents : function(compId) {
                var comps = this.components;
                if (!compId || !comps || !comps[compId]) {
                    Logger.error("failed to get sub components for:" + compId + " on module:" + this.wrappedComponent._meta_.model.id + " components:" + (comps && Object.keys(comps)));
                    return;
                }

                return comps[compId].subComponents || [];
            },

            getBaseComponent : function(compId) {
                var comps = this.components;
                if (!compId || !comps || !comps[compId]) {
                    Logger.error("failed to get sub components for:" + compId + " on module:" + this.wrappedComponent._meta_.model.id + " components:" + (comps && Object.keys(comps)));
                    return;
                }

                return comps[compId].baseCompEntry && comps[compId].baseCompEntry.compModel;
            }
        }
    }
};

var baseComponentModel = {
    id			: "baseComponent",
    name		: "Base Component",
    instance	: {
        utils : {
            findAndBind : function() {
                function callFind(compModel, fd, compInst, isSubComp) {
                    var findErrorPrefix = `failed to find component '${compModel.id}' in module '${compModule._meta_.model.id}':\n`;
                    if (compModel.find) {
                        try { var elems = compModel.find(fd), findError; elems && elems.toString; } catch(ex) { elems = null; Logger.exception(ex, `Find threw exception for component: ${compModel.id}`); }
                        if (!elems) elems = [];
                        else if (elems.nodeType) elems = [ elems ];

                        if (fd && fd.filter && !elems.error && elems.length > 0) {
                            elems.splice(0, elems.length, ...elems.filter(fd.filter));
                            if (elems.length == 0) findError = findErrorPrefix + "elements were filtered out";
                        }

                        if (elems.length == 1) return { elem : elems[0], comp : compInst || compModule.createComponent(compModel.id), flags : elems.flags };

                        if (elems.length > 1 || elems.error) {
                            findError = findErrorPrefix;
                            if (elems.length > 1) findError += "more than one element returned, total:" + elems.length + "\n";
                            if (elems.error) findError += elems.error;
                        }

                        if (elems.flags || findError) return { flags : elems.flags, error : findError };
                    }

                    var subComps = compModule.getSubComponents(compModel.id), res;
                    if (subComps) subComps.some(function(subCompModel) { return res = callFind(subCompModel, fd, undefined, true); });

                    return res || (!isSubComp && { error : findErrorPrefix });
                }

                var wrappedComp = this.wrappedComponent || this;
                var compMeta = wrappedComp._meta_;
                Logger.trace("start find component: " + compMeta.model.id + " name:" + compMeta.name);

                var findRes, bindRes;
                var resolvingData = wrappedComp.resolvingData || {}, compModel = compMeta.model, compModule = compMeta.module, fd = resolvingData.fd || {};

                if (resolvingData.contextComponent) {
                    bindRes = resolvingData.contextComponent.findAndBind();
                    if (bindRes.boundComp) {
                        fd.context = bindRes.boundComp.element;
                        findRes = callFind(compModel, fd, wrappedComp);
                        if (findRes && findRes.comp) findRes.comp.resolvingData = resolvingData;
                    }
                } else {
                    findRes = callFind(compModule._meta_.model);
                }

                // bind
                wrappedComp.boundComp = findRes && findRes.comp;
                if (wrappedComp.boundComp) wrappedComp.boundComp.element = findRes.elem;

                Logger.trace("end find component: " + compMeta.model.id + " boundComp:" + (wrappedComp.boundComp && wrappedComp.boundComp._meta_.model.id) + " this.boundComp:" + this.boundComp);

                return { boundComp : wrappedComp.boundComp, findRes : findRes, ctxBindRes : bindRes };
            }
        },

        getters : {
            get contextComponent() {
                return Module.wrapWithProxy((this.wrappedComponent.resolvingData || {}).contextComponent);
            },

            get contextModule() {
                for (var comp = this; comp && !(comp.wrappedComponent || comp).baseUrl; comp = comp.contextComponent) ;
                return comp;
            }
        }
    }
};



module.exports = function(url, model) {
    var module = Module.create(url, model);
    return (module.proxy = Module.wrapWithProxy(module));
};
