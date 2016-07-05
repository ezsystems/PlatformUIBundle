/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-processable', function (Y) {
    "use strict";
    /**
     * The processable extension
     *
     * @module ez-processable
     */
    Y.namespace('eZ');

    /**
     * View extension providing the concept of processor. The processors are
     * run after the event indicated by the `_processEvent` property.
     *
     * @namespace eZ
     * @class Processable
     * @extensionfor Y.View
     */
    Y.eZ.Processable = Y.Base.create('processableExtension', Y.View, [], {
        initializer: function () {
            /**
             * Holds the event(s) after which the processing should be triggered.
             *
             * @property _processEvent
             * @type {String|Array}
             * @required
             */
            this.after(this._processEvent, this._process);
        },

        /**
         * Adds a processor to the list with the given priority. A processor is
         * an object that should have a `process` method. When run, the
         * processor will receive the view being processed.
         *
         * @method addProcessor
         * @param {Object} processor
         * @param {Number} priority
         */
        addProcessor: function (processor, priority) {
            var processors = this.get('processors');

            if ( typeof processor.process !== 'function' ) {
                throw new Error("Processor must have a process method");
            }
            processors.push({
                processor: processor,
                priority: priority,
            });
            processors.sort(function (a, b) {
                return (b.priority - a.priority);
            });
        },

        /**
         * Removes one or several processors matching the given `matchingFn`
         * function.
         *
         * @method removeProcessor
         * @param {Function} matchingFn it receives the processor and if it
         * returns a truthy value, the corresponding processor is excluded from
         * the list.
         */
        removeProcessor: function (matchingFn) {
            var processors = this.get('processors');

            this._set('processors', processors.filter(function () {
                return !matchingFn.apply(this, arguments);
            }, this));
        },

        /**
         * Loops through the processors to run them on the view.
         *
         * @method _process
         * @protected
         * @param {EventFacade} [event] the event parameters of the event
         * triggering the process (if any)
         */
        _process: function (event) {
            this.get('processors').forEach(function (info) {
                info.processor.process(this, event);
            }, this);
        },
    }, {
        ATTRS: {
            /**
             * Holds the processors. Each entry is an object containing 2
             * properties:
             * - `processor` the processor
             * - `priority` its priority
             *
             * @attribute priority
             * @type {Array}
             * @readOnly
             */
            processors: {
                writeOnce: 'initOnly',
                value: [],
            },
        },
    });
});
