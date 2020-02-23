"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es.array.iterator");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const INDEX = require("../constants/context-index.js");

const IdioError = require("../api/idio-error.js");

function injectGraphQLArgs({
  graphQLArgs,
  injections
}) {
  const args = [...graphQLArgs];

  if (injections && args.length) {
    if (!args[INDEX]) {
      args[INDEX] = {};
    }

    if (!args[INDEX].injections) {
      args[INDEX].injections = {};
    }

    if (!(typeof args[INDEX].injections === "object")) {
      throw new IdioError(`injections must be an object`);
    }

    args[INDEX].injections = _objectSpread({}, args[INDEX].injections, {}, injections);
  }

  return args;
}

module.exports = injectGraphQLArgs;