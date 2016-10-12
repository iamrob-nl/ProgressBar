/*global logger, Snap, html, domStyle */
/*
    RoundProgressBar
    ========================

    @file      : RoundProgressBar.js
    @version   : 1.0.0
    @author    : Rob Duits
    @date      : 10/11/2016
    @copyright : Incentro 2016
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
  "dojo/_base/declare",
  "mxui/widget/_WidgetBase",
  "dijit/_TemplatedMixin",

  "mxui/dom",
  "dojo/dom",
  "dojo/dom-prop",
  "dojo/dom-geometry",
  "dojo/dom-class",
  "dojo/dom-style",
  "dojo/dom-construct",
  "dojo/_base/array",
  "dojo/_base/lang",
  "dojo/text",
  "dojo/html",
  "dojo/_base/event",

  "ProgressBar/lib/jquery-1.11.2",
  "dojo/text!ProgressBar/widget/template/RoundProgressBar.html",

  "ProgressBar/lib/velocity"
], function(declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoText, dojoHtml, dojoEvent, _jQuery, widgetTemplate) {
  "use strict";
  var $ = _jQuery.noConflict(true);

  // Declare widget's prototype.
  return declare("ProgressBar.widget.RoundProgressBar", [ _WidgetBase, _TemplatedMixin ], {
    // _TemplatedMixin will create our dom node using this HTML template.
    templateString: widgetTemplate,

    // DOM elements
    _i: 0,

    // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
    _handles: null,
    _contextObj: null,
    _alertDiv: null,

    // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
    constructor: function() {
      // Uncomment the following line to enable debug messages
      logger.level(logger.DEBUG);
      logger.debug(this.id + ".constructor");
      this._handles = [];
    },

    // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
    postCreate: function() {
      logger.debug(this.id + ".postCreate");
      //this._updateRendering();
      this._setupEvents();
    },

    // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
    update: function(obj, callback) {
      logger.debug(this.id + ".update");
      this._contextObj = obj;
      this._resetSubscriptions();
      this._updateRendering();
      if (typeof callback !== "undefined") {
        callback();
      }
    },

    // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
    enable: function() {
      logger.debug(this.id + ".enable");
    },

    // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
    disable: function() {
      logger.debug(this.id + ".disable");
    },

    // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
    resize: function(box) {
      logger.debug(this.id + ".resize");
    },

    // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
    uninitialize: function() {
      logger.debug(this.id + ".uninitialize");
      // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
      logger.debug("need to redraw SVG");
      this._resetSVG();
    },

    // Attach events to HTML dom elements
    _setupEvents: function() {
      logger.debug(this.id + "._setupEvents");
    },

    _customColor: function(svgCircle) {
      logger.debug(this.id + "._customColor");
      var color = this._contextObj ? this._contextObj.get(this.ColorPrimaryAttr) : "";
      $(svgCircle).attr({
        "stroke": color
      });
    },

    _strokeWidth: function(svgCircle, svgArch) {
      logger.debug(this.id + "._customStrokeWidth");
      var strokeWidth = this._contextObj ? Number(this._contextObj.get(this.strokeWidthAttr)) : 10;
      if (strokeWidth >= 10) strokeWidth = 10;
      if (strokeWidth <= 0) strokeWidth = 10;
      $(svgArch).attr({
        "style": "stroke-width: "+strokeWidth+"; fill:none; stroke:#E0E4E6;"
      });
      $(svgCircle).attr({
        "style": "stroke-width: "+strokeWidth+"; fill:none; stroke-linecap:round; stroke-linejoin:round;"
      });
    },

    _showVariable: function(value, widgetId) {
      if(this.showValueAttr === true){
        var valueTxt = widgetId + " #" + this.valueTxt.id;
        $(valueTxt).text(value + "%");
      }
    },

    _showSecondLine: function(secondLine, widgetId) {
      if(this.showSecondLineAttr === true){
        var secondLineTxt = widgetId + " #" + this.secondLine.id;
        $(secondLineTxt).text(secondLine);
      }
    },

    // The main function for drawing the SVG
    _drawSVG: function() {
      logger.debug(this.id + "._drawSVG");
      // Widget configured variables
      var value = this._contextObj ? Number(this._contextObj.get(this.valueAttr)) : 0;
      var secondLine = this._contextObj ? String(this._contextObj.get(this.secondLineAttr)) : "";

      // Variable SVG elements
      var widgetId = "#" + this.id;
      var svgCircle = widgetId + " #" + this.svgCircle.id;
      var svgArch = widgetId + " #" + this.arch.id;

      if (value <= 0) value = 0;
      if (value >= 100) value = 100;
      var percentage = value;

      var maxAngle = parseInt(2 * Math.PI * 133);
      var currentProgress = parseInt((maxAngle / 100) * percentage);
      var time = parseInt(300 / currentProgress); // 0.3 sec.

      // Show the percentage and second line texts
      this._showVariable(value, widgetId);
      this._showSecondLine(secondLine, widgetId);

      // Customize the arch color
      this._customColor(svgCircle);

      // Customize stroke-width
      this._strokeWidth(svgCircle, svgArch);

      // animate the progressbar
      $(svgCircle).velocity({
        "stroke-dashoffset": maxAngle,
        "stroke-dasharray": maxAngle
      }, 0).velocity({
        "stroke-dashoffset": maxAngle - currentProgress
      }, {duration: 1800, delay: 400});

      // Increase this value to make every SVG use unique ID's
      this.counter.innerHTML = ++this._i;
    },

    _resetSVG: function () {
      logger.debug(this.id + "._resetSVG");
    },

    // Rerender the interface.
    _updateRendering: function() {
      logger.debug(this.id + "._updateRendering");
      // Draw or reload.
      if (this._contextObj !== null) {
        this._drawSVG();
      } else {
        // Hide widget dom node.
        dojoStyle.set(this.domNode, "display", "none");
      }
      // Important to clear all validations!
      this._clearValidations();
    },

    // Handle validations.
    _handleValidation: function (_validations) {
      this._clearValidations();
      var _validation = _validations[0];
      var _message = _validation.getReasonByAttribute(this.jsonDataSource);
      if (this.readOnly) {
        _validation.removeAttribute(this.jsonDataSource);
      } else {
        if (_message) {
          this._addValidation(_message);
          _validation.removeAttribute(this.jsonDataSource);
        }
      }
    },

    // Clear validations.
    _clearValidations: function () {
      dojoConstruct.destroy(this._alertdiv);
      this._alertdiv = null;
    },

    // Show an error message.
    _showError: function (message) {
      console.log("[" + this.id + "] ERROR " + message);
      if (this._alertDiv !== null) {
        html.set(this._alertDiv, message);
        return true;
      }
      this._alertDiv = dojoConstruct.create("div", {
        "class": "alert alert-danger",
        "innerHTML": message
      });
      dojoConstruct.place(this.domNode, this._alertdiv);
    },

    // Add a validation.
    _addValidation: function (message) {
      this._showError(message);
    },

    // Reset subscriptions.
    _resetSubscriptions: function () {
      logger.debug(this.id + "._resetSubscriptions");
      var _objectHandle = null;
      var _attrHandle = null;
      var _validationHandle = null;
      // Release handles on previous object, if any.
      if (this._handles) {
        dojoArray.forEach(this._handles, function (handle, i) {
          mx.data.unsubscribe(handle);
        });
        this._handles = [];
      }
      // When a mendix object exists create subscribtions.
      if (this._contextObj) {
        _objectHandle = this.subscribe({
          guid: this._contextObj.getGuid(),
          callback: dojoLang.hitch(this, function (guid) {
            this._updateRendering();
          })
        });

        _validationHandle = this.subscribe({
          guid: this._contextObj.getGuid(),
          val: true,
          callback: dojoLang.hitch(this, this._handleValidation)
        });

        this._handles = [_objectHandle, _attrHandle, _validationHandle];
      }
    }
  });
});

require(["ProgressBar/widget/RoundProgressBar"], function() {
  "use strict";
});
