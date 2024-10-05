
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

	/** @returns {void} */
	function add_location(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
		};
	}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	/** @returns {void} */
	function validate_store(store, name) {
		if (store != null && typeof store.subscribe !== 'function') {
			throw new Error(`'${name}' is not a store with a 'subscribe' method`);
		}
	}

	function subscribe(store, ...callbacks) {
		if (store == null) {
			for (const callback of callbacks) {
				callback(undefined);
			}
			return noop;
		}
		const unsub = store.subscribe(...callbacks);
		return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
	}

	/** @returns {void} */
	function component_subscribe(component, store, callback) {
		component.$$.on_destroy.push(subscribe(store, callback));
	}

	/** @type {typeof globalThis} */
	const globals =
		typeof window !== 'undefined'
			? window
			: typeof globalThis !== 'undefined'
			? globalThis
			: // @ts-ignore Node typings have this
			  global;

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @returns {void} */
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @param {EventTarget} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @returns {() => void}
	 */
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	/**
	 * @returns {(event: any) => any} */
	function prevent_default(fn) {
		return function (event) {
			event.preventDefault();
			// @ts-ignore
			return fn.call(this, event);
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @returns {void} */
	function set_input_value(input, value) {
		input.value = value == null ? '' : value;
	}

	/**
	 * @returns {void} */
	function toggle_class(element, name, toggle) {
		// The `!!` is required because an `undefined` flag means flipping the current state.
		element.classList.toggle(name, !!toggle);
	}

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @param {{ bubbles?: boolean, cancelable?: boolean }} [options]
	 * @returns {CustomEvent<T>}
	 */
	function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
		return new CustomEvent(type, { detail, bubbles, cancelable });
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	function get_current_component() {
		if (!current_component) throw new Error('Function called outside component initialization');
		return current_component;
	}

	/**
	 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
	 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
	 * it can be called from an external module).
	 *
	 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
	 *
	 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
	 *
	 * https://svelte.dev/docs/svelte#onmount
	 * @template T
	 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
	 * @returns {void}
	 */
	function onMount(fn) {
		get_current_component().$$.on_mount.push(fn);
	}

	/**
	 * Creates an event dispatcher that can be used to dispatch [component events](https://svelte.dev/docs#template-syntax-component-directives-on-eventname).
	 * Event dispatchers are functions that can take two arguments: `name` and `detail`.
	 *
	 * Component events created with `createEventDispatcher` create a
	 * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
	 * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
	 * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
	 * property and can contain any type of data.
	 *
	 * The event dispatcher can be typed to narrow the allowed event names and the type of the `detail` argument:
	 * ```ts
	 * const dispatch = createEventDispatcher<{
	 *  loaded: never; // does not take a detail argument
	 *  change: string; // takes a detail argument of type string, which is required
	 *  optional: number | null; // takes an optional detail argument of type number
	 * }>();
	 * ```
	 *
	 * https://svelte.dev/docs/svelte#createeventdispatcher
	 * @template {Record<string, any>} [EventMap=any]
	 * @returns {import('./public.js').EventDispatcher<EventMap>}
	 */
	function createEventDispatcher() {
		const component = get_current_component();
		return (type, detail, { cancelable = false } = {}) => {
			const callbacks = component.$$.callbacks[type];
			if (callbacks) {
				// TODO are there situations where events could be dispatched
				// in a server (non-DOM) environment?
				const event = custom_event(/** @type {string} */ (type), detail, { cancelable });
				callbacks.slice().forEach((fn) => {
					fn.call(component, event);
				});
				return !event.defaultPrevented;
			}
			return true;
		};
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	const outroing = new Set();

	/**
	 * @type {Outro}
	 */
	let outros;

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} local
	 * @param {0 | 1} [detach]
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		} else if (callback) {
			callback();
		}
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	// general each functions:

	function ensure_array_like(array_like_or_iterator) {
		return array_like_or_iterator?.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}

	/** @returns {void} */
	function create_component(block) {
		block && block.c();
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	// TODO: Document the other params
	/**
	 * @param {SvelteComponent} component
	 * @param {import('./public.js').ComponentConstructorOptions} options
	 *
	 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
	 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
	 * This will be the `add_css` function from the compiled component.
	 *
	 * @returns {void}
	 */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles = null,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				// TODO: what is the correct type here?
				// @ts-expect-error
				const nodes = children(options.target);
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify

	/**
	 * The current version, as set in package.json.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-version
	 * @type {string}
	 */
	const VERSION = '4.2.19';
	const PUBLIC_VERSION = '4';

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @returns {void}
	 */
	function dispatch_dev(type, detail) {
		document.dispatchEvent(custom_event(type, { version: VERSION, ...detail }, { bubbles: true }));
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append_dev(target, node) {
		dispatch_dev('SvelteDOMInsert', { target, node });
		append(target, node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert_dev(target, node, anchor) {
		dispatch_dev('SvelteDOMInsert', { target, node, anchor });
		insert(target, node, anchor);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach_dev(node) {
		dispatch_dev('SvelteDOMRemove', { node });
		detach(node);
	}

	/**
	 * @param {Node} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @param {boolean} [has_prevent_default]
	 * @param {boolean} [has_stop_propagation]
	 * @param {boolean} [has_stop_immediate_propagation]
	 * @returns {() => void}
	 */
	function listen_dev(
		node,
		event,
		handler,
		options,
		has_prevent_default,
		has_stop_propagation,
		has_stop_immediate_propagation
	) {
		const modifiers =
			options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
		if (has_prevent_default) modifiers.push('preventDefault');
		if (has_stop_propagation) modifiers.push('stopPropagation');
		if (has_stop_immediate_propagation) modifiers.push('stopImmediatePropagation');
		dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
		const dispose = listen(node, event, handler, options);
		return () => {
			dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
			dispose();
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr_dev(node, attribute, value) {
		attr(node, attribute, value);
		if (value == null) dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
		else dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
	}

	/**
	 * @param {Text} text
	 * @param {unknown} data
	 * @returns {void}
	 */
	function set_data_dev(text, data) {
		data = '' + data;
		if (text.data === data) return;
		dispatch_dev('SvelteDOMSetData', { node: text, data });
		text.data = /** @type {string} */ (data);
	}

	function ensure_array_like_dev(arg) {
		if (
			typeof arg !== 'string' &&
			!(arg && typeof arg === 'object' && 'length' in arg) &&
			!(typeof Symbol === 'function' && arg && Symbol.iterator in arg)
		) {
			throw new Error('{#each} only works with iterable values.');
		}
		return ensure_array_like(arg);
	}

	/**
	 * @returns {void} */
	function validate_slots(name, slot, keys) {
		for (const slot_key of Object.keys(slot)) {
			if (!~keys.indexOf(slot_key)) {
				console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
			}
		}
	}

	/**
	 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
	 *
	 * Can be used to create strongly typed Svelte components.
	 *
	 * #### Example:
	 *
	 * You have component library on npm called `component-library`, from which
	 * you export a component called `MyComponent`. For Svelte+TypeScript users,
	 * you want to provide typings. Therefore you create a `index.d.ts`:
	 * ```ts
	 * import { SvelteComponent } from "svelte";
	 * export class MyComponent extends SvelteComponent<{foo: string}> {}
	 * ```
	 * Typing this makes it possible for IDEs like VS Code with the Svelte extension
	 * to provide intellisense and to use the component like this in a Svelte file
	 * with TypeScript:
	 * ```svelte
	 * <script lang="ts">
	 * 	import { MyComponent } from "component-library";
	 * </script>
	 * <MyComponent foo={'bar'} />
	 * ```
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 * @template {Record<string, any>} [Slots=any]
	 * @extends {SvelteComponent<Props, Events>}
	 */
	class SvelteComponentDev extends SvelteComponent {
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Props}
		 */
		$$prop_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Events}
		 */
		$$events_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Slots}
		 */
		$$slot_def;

		/** @param {import('./public.js').ComponentConstructorOptions<Props>} options */
		constructor(options) {
			if (!options || (!options.target && !options.$$inline)) {
				throw new Error("'target' is a required option");
			}
			super();
		}

		/** @returns {void} */
		$destroy() {
			super.$destroy();
			this.$destroy = () => {
				console.warn('Component was already destroyed'); // eslint-disable-line no-console
			};
		}

		/** @returns {void} */
		$capture_state() {}

		/** @returns {void} */
		$inject_state() {}
	}

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	const subscriber_queue = [];

	/**
	 * Create a `Writable` store that allows both updating and reading by subscription.
	 *
	 * https://svelte.dev/docs/svelte-store#writable
	 * @template T
	 * @param {T} [value] initial value
	 * @param {import('./public.js').StartStopNotifier<T>} [start]
	 * @returns {import('./public.js').Writable<T>}
	 */
	function writable(value, start = noop) {
		/** @type {import('./public.js').Unsubscriber} */
		let stop;
		/** @type {Set<import('./private.js').SubscribeInvalidateTuple<T>>} */
		const subscribers = new Set();
		/** @param {T} new_value
		 * @returns {void}
		 */
		function set(new_value) {
			if (safe_not_equal(value, new_value)) {
				value = new_value;
				if (stop) {
					// store is ready
					const run_queue = !subscriber_queue.length;
					for (const subscriber of subscribers) {
						subscriber[1]();
						subscriber_queue.push(subscriber, value);
					}
					if (run_queue) {
						for (let i = 0; i < subscriber_queue.length; i += 2) {
							subscriber_queue[i][0](subscriber_queue[i + 1]);
						}
						subscriber_queue.length = 0;
					}
				}
			}
		}

		/**
		 * @param {import('./public.js').Updater<T>} fn
		 * @returns {void}
		 */
		function update(fn) {
			set(fn(value));
		}

		/**
		 * @param {import('./public.js').Subscriber<T>} run
		 * @param {import('./private.js').Invalidator<T>} [invalidate]
		 * @returns {import('./public.js').Unsubscriber}
		 */
		function subscribe(run, invalidate = noop) {
			/** @type {import('./private.js').SubscribeInvalidateTuple<T>} */
			const subscriber = [run, invalidate];
			subscribers.add(subscriber);
			if (subscribers.size === 1) {
				stop = start(set, update) || noop;
			}
			run(value);
			return () => {
				subscribers.delete(subscriber);
				if (subscribers.size === 0 && stop) {
					stop();
					stop = null;
				}
			};
		}
		return { set, update, subscribe };
	}

	/* src/lib/RecipeEditor.svelte generated by Svelte v4.2.19 */

	const { console: console_1$1 } = globals;
	const file$1 = "src/lib/RecipeEditor.svelte";

	function get_each_context$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[18] = list[i];
		child_ctx[20] = i;
		return child_ctx;
	}

	function get_each_context_1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[21] = list[i];
		child_ctx[20] = i;
		return child_ctx;
	}

	// (82:6) {#each $recipes as recipe, index}
	function create_each_block_1(ctx) {
		let li;
		let t0_value = /*recipe*/ ctx[21].name + "";
		let t0;
		let t1;
		let button0;
		let t3;
		let button1;
		let t5;
		let mounted;
		let dispose;

		function click_handler() {
			return /*click_handler*/ ctx[11](/*index*/ ctx[20]);
		}

		function click_handler_1() {
			return /*click_handler_1*/ ctx[12](/*recipe*/ ctx[21]);
		}

		const block = {
			c: function create() {
				li = element("li");
				t0 = text(t0_value);
				t1 = space();
				button0 = element("button");
				button0.textContent = "Remove";
				t3 = space();
				button1 = element("button");
				button1.textContent = "Add";
				t5 = space();
				add_location(button0, file$1, 87, 10, 2061);
				add_location(button1, file$1, 88, 10, 2132);
				attr_dev(li, "class", "svelte-wyg0tf");
				toggle_class(li, "selected", /*selectedRecipe*/ ctx[0] === /*recipe*/ ctx[21]);
				add_location(li, file$1, 82, 8, 1912);
			},
			m: function mount(target, anchor) {
				insert_dev(target, li, anchor);
				append_dev(li, t0);
				append_dev(li, t1);
				append_dev(li, button0);
				append_dev(li, t3);
				append_dev(li, button1);
				append_dev(li, t5);

				if (!mounted) {
					dispose = [
						listen_dev(button0, "click", click_handler, false, false, false, false),
						listen_dev(
							button1,
							"click",
							function () {
								if (is_function(/*addToShoppingList*/ ctx[5](/*recipe*/ ctx[21]))) /*addToShoppingList*/ ctx[5](/*recipe*/ ctx[21]).apply(this, arguments);
							},
							false,
							false,
							false,
							false
						),
						listen_dev(li, "click", click_handler_1, false, false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				if (dirty & /*$recipes*/ 8 && t0_value !== (t0_value = /*recipe*/ ctx[21].name + "")) set_data_dev(t0, t0_value);

				if (dirty & /*selectedRecipe, $recipes*/ 9) {
					toggle_class(li, "selected", /*selectedRecipe*/ ctx[0] === /*recipe*/ ctx[21]);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(li);
				}

				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_1.name,
			type: "each",
			source: "(82:6) {#each $recipes as recipe, index}",
			ctx
		});

		return block;
	}

	// (99:2) {#if selectedRecipe}
	function create_if_block(ctx) {
		let div1;
		let h2;
		let t0_value = /*selectedRecipe*/ ctx[0].name + "";
		let t0;
		let t1;
		let ul;
		let t2;
		let div0;
		let input;
		let t3;
		let button;
		let mounted;
		let dispose;
		let each_value = ensure_array_like_dev(/*selectedRecipe*/ ctx[0].ingredients);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
		}

		const block = {
			c: function create() {
				div1 = element("div");
				h2 = element("h2");
				t0 = text(t0_value);
				t1 = space();
				ul = element("ul");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t2 = space();
				div0 = element("div");
				input = element("input");
				t3 = space();
				button = element("button");
				button.textContent = "Add";
				add_location(h2, file$1, 100, 6, 2471);
				attr_dev(ul, "class", "svelte-wyg0tf");
				add_location(ul, file$1, 101, 6, 2508);
				attr_dev(input, "placeholder", "New ingredient");
				attr_dev(input, "class", "svelte-wyg0tf");
				add_location(input, file$1, 110, 8, 2781);
				add_location(button, file$1, 111, 8, 2855);
				attr_dev(div0, "class", "add-ingredient svelte-wyg0tf");
				add_location(div0, file$1, 109, 6, 2744);
				attr_dev(div1, "class", "recipe-details svelte-wyg0tf");
				add_location(div1, file$1, 99, 4, 2436);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				append_dev(div1, h2);
				append_dev(h2, t0);
				append_dev(div1, t1);
				append_dev(div1, ul);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(ul, null);
					}
				}

				append_dev(div1, t2);
				append_dev(div1, div0);
				append_dev(div0, input);
				set_input_value(input, /*newIngredient*/ ctx[1]);
				append_dev(div0, t3);
				append_dev(div0, button);

				if (!mounted) {
					dispose = [
						listen_dev(input, "input", /*input_input_handler_1*/ ctx[15]),
						listen_dev(button, "click", /*addIngredient*/ ctx[8], false, false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (dirty & /*selectedRecipe*/ 1 && t0_value !== (t0_value = /*selectedRecipe*/ ctx[0].name + "")) set_data_dev(t0, t0_value);

				if (dirty & /*removeIngredient, selectedRecipe*/ 129) {
					each_value = ensure_array_like_dev(/*selectedRecipe*/ ctx[0].ingredients);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block$1(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}

				if (dirty & /*newIngredient*/ 2 && input.value !== /*newIngredient*/ ctx[1]) {
					set_input_value(input, /*newIngredient*/ ctx[1]);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div1);
				}

				destroy_each(each_blocks, detaching);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block.name,
			type: "if",
			source: "(99:2) {#if selectedRecipe}",
			ctx
		});

		return block;
	}

	// (103:8) {#each selectedRecipe.ingredients as ingredient, index}
	function create_each_block$1(ctx) {
		let li;
		let t0_value = /*ingredient*/ ctx[18] + "";
		let t0;
		let t1;
		let button;
		let t3;
		let mounted;
		let dispose;

		function click_handler_2() {
			return /*click_handler_2*/ ctx[14](/*index*/ ctx[20]);
		}

		const block = {
			c: function create() {
				li = element("li");
				t0 = text(t0_value);
				t1 = space();
				button = element("button");
				button.textContent = "Remove";
				t3 = space();
				add_location(button, file$1, 105, 12, 2629);
				attr_dev(li, "class", "svelte-wyg0tf");
				add_location(li, file$1, 103, 10, 2587);
			},
			m: function mount(target, anchor) {
				insert_dev(target, li, anchor);
				append_dev(li, t0);
				append_dev(li, t1);
				append_dev(li, button);
				append_dev(li, t3);

				if (!mounted) {
					dispose = listen_dev(button, "click", click_handler_2, false, false, false, false);
					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				if (dirty & /*selectedRecipe*/ 1 && t0_value !== (t0_value = /*ingredient*/ ctx[18] + "")) set_data_dev(t0, t0_value);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(li);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$1.name,
			type: "each",
			source: "(103:8) {#each selectedRecipe.ingredients as ingredient, index}",
			ctx
		});

		return block;
	}

	function create_fragment$1(ctx) {
		let div2;
		let div1;
		let h2;
		let t1;
		let ul;
		let t2;
		let div0;
		let input;
		let t3;
		let button;
		let t5;
		let mounted;
		let dispose;
		let each_value_1 = ensure_array_like_dev(/*$recipes*/ ctx[3]);
		let each_blocks = [];

		for (let i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
		}

		let if_block = /*selectedRecipe*/ ctx[0] && create_if_block(ctx);

		const block = {
			c: function create() {
				div2 = element("div");
				div1 = element("div");
				h2 = element("h2");
				h2.textContent = "Recipes";
				t1 = space();
				ul = element("ul");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t2 = space();
				div0 = element("div");
				input = element("input");
				t3 = space();
				button = element("button");
				button.textContent = "Add New Recipe";
				t5 = space();
				if (if_block) if_block.c();
				add_location(h2, file$1, 79, 4, 1838);
				attr_dev(ul, "class", "svelte-wyg0tf");
				add_location(ul, file$1, 80, 4, 1859);
				attr_dev(input, "placeholder", "New recipe name");
				attr_dev(input, "class", "svelte-wyg0tf");
				add_location(input, file$1, 93, 6, 2263);
				add_location(button, file$1, 94, 6, 2332);
				attr_dev(div0, "class", "new-recipe svelte-wyg0tf");
				add_location(div0, file$1, 92, 4, 2232);
				attr_dev(div1, "class", "recipe-list svelte-wyg0tf");
				add_location(div1, file$1, 78, 2, 1808);
				attr_dev(div2, "class", "recipe-editor svelte-wyg0tf");
				add_location(div2, file$1, 77, 0, 1778);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div2, anchor);
				append_dev(div2, div1);
				append_dev(div1, h2);
				append_dev(div1, t1);
				append_dev(div1, ul);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(ul, null);
					}
				}

				append_dev(div1, t2);
				append_dev(div1, div0);
				append_dev(div0, input);
				set_input_value(input, /*newRecipe*/ ctx[2]);
				append_dev(div0, t3);
				append_dev(div0, button);
				append_dev(div2, t5);
				if (if_block) if_block.m(div2, null);

				if (!mounted) {
					dispose = [
						listen_dev(input, "input", /*input_input_handler*/ ctx[13]),
						listen_dev(button, "click", /*addNewRecipe*/ ctx[9], false, false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*selectedRecipe, $recipes, selectRecipe, addToShoppingList, removeRecipe*/ 1129) {
					each_value_1 = ensure_array_like_dev(/*$recipes*/ ctx[3]);
					let i;

					for (i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block_1(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value_1.length;
				}

				if (dirty & /*newRecipe*/ 4 && input.value !== /*newRecipe*/ ctx[2]) {
					set_input_value(input, /*newRecipe*/ ctx[2]);
				}

				if (/*selectedRecipe*/ ctx[0]) {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block(ctx);
						if_block.c();
						if_block.m(div2, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div2);
				}

				destroy_each(each_blocks, detaching);
				if (if_block) if_block.d();
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$1.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$1($$self, $$props, $$invalidate) {
		let $recipes;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('RecipeEditor', slots, []);
		const dispatch = createEventDispatcher();
		let recipes = writable([]);
		validate_store(recipes, 'recipes');
		component_subscribe($$self, recipes, value => $$invalidate(3, $recipes = value));
		let selectedRecipe = null;
		let newIngredient = "";
		let newRecipe = "";

		onMount(async () => {
			try {
				const response = await fetch("/recipes.json");
				recipes.set(await response.json());
			} catch(error) {
				console.error("Error loading recipes:", error);
			}
		});

		function addToShoppingList(recipe) {
			dispatch("addToShoppingList", { detail: recipe.ingredients });
		}

		function selectRecipe(recipe) {
			$$invalidate(0, selectedRecipe = recipe);
		}

		function removeIngredient(index) {
			selectedRecipe.ingredients.splice(index, 1);
			$$invalidate(0, selectedRecipe);
			saveRecipes();
		}

		function addIngredient() {
			if (newIngredient.trim()) {
				selectedRecipe.ingredients.push(newIngredient.trim());
				$$invalidate(0, selectedRecipe);
				$$invalidate(1, newIngredient = "");
			}

			saveRecipes();
		}

		function addNewRecipe() {
			if (newRecipe.trim() !== "") {
				recipes.update(currentRecipes => [...currentRecipes, { name: newRecipe.trim(), ingredients: [] }]);
				$$invalidate(2, newRecipe = "");
			}

			saveRecipes();
		}

		function removeRecipe(index) {
			recipes.update(currentRecipes => currentRecipes.filter((_, i) => i !== index));
			saveRecipes();
		}

		async function saveRecipes() {
			try {
				await fetch("/save-recipes", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify($recipes)
				});
			} catch(error) {
				console.error("Error saving recipe list:", error);
			}
		}

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<RecipeEditor> was created with unknown prop '${key}'`);
		});

		const click_handler = index => removeRecipe(index);
		const click_handler_1 = recipe => selectRecipe(recipe);

		function input_input_handler() {
			newRecipe = this.value;
			$$invalidate(2, newRecipe);
		}

		const click_handler_2 = index => removeIngredient(index);

		function input_input_handler_1() {
			newIngredient = this.value;
			$$invalidate(1, newIngredient);
		}

		$$self.$capture_state = () => ({
			onMount,
			writable,
			createEventDispatcher,
			dispatch,
			recipes,
			selectedRecipe,
			newIngredient,
			newRecipe,
			addToShoppingList,
			selectRecipe,
			removeIngredient,
			addIngredient,
			addNewRecipe,
			removeRecipe,
			saveRecipes,
			$recipes
		});

		$$self.$inject_state = $$props => {
			if ('recipes' in $$props) $$invalidate(4, recipes = $$props.recipes);
			if ('selectedRecipe' in $$props) $$invalidate(0, selectedRecipe = $$props.selectedRecipe);
			if ('newIngredient' in $$props) $$invalidate(1, newIngredient = $$props.newIngredient);
			if ('newRecipe' in $$props) $$invalidate(2, newRecipe = $$props.newRecipe);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			selectedRecipe,
			newIngredient,
			newRecipe,
			$recipes,
			recipes,
			addToShoppingList,
			selectRecipe,
			removeIngredient,
			addIngredient,
			addNewRecipe,
			removeRecipe,
			click_handler,
			click_handler_1,
			input_input_handler,
			click_handler_2,
			input_input_handler_1
		];
	}

	class RecipeEditor extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "RecipeEditor",
				options,
				id: create_fragment$1.name
			});
		}
	}

	/* src/App.svelte generated by Svelte v4.2.19 */

	const { console: console_1 } = globals;
	const file = "src/App.svelte";

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[9] = list[i];
		child_ctx[11] = i;
		return child_ctx;
	}

	// (59:4) {#each $shoppingList as item, index}
	function create_each_block(ctx) {
		let li;
		let t0_value = /*item*/ ctx[9] + "";
		let t0;
		let t1;
		let button;
		let t3;
		let mounted;
		let dispose;

		function click_handler() {
			return /*click_handler*/ ctx[7](/*index*/ ctx[11]);
		}

		const block = {
			c: function create() {
				li = element("li");
				t0 = text(t0_value);
				t1 = space();
				button = element("button");
				button.textContent = "Remove";
				t3 = space();
				add_location(button, file, 61, 8, 1479);
				attr_dev(li, "class", "svelte-1i2abjr");
				add_location(li, file, 59, 6, 1451);
			},
			m: function mount(target, anchor) {
				insert_dev(target, li, anchor);
				append_dev(li, t0);
				append_dev(li, t1);
				append_dev(li, button);
				append_dev(li, t3);

				if (!mounted) {
					dispose = listen_dev(button, "click", click_handler, false, false, false, false);
					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				if (dirty & /*$shoppingList*/ 2 && t0_value !== (t0_value = /*item*/ ctx[9] + "")) set_data_dev(t0, t0_value);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(li);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block.name,
			type: "each",
			source: "(59:4) {#each $shoppingList as item, index}",
			ctx
		});

		return block;
	}

	function create_fragment(ctx) {
		let main;
		let h1;
		let t1;
		let form;
		let input;
		let t2;
		let button;
		let t4;
		let ul;
		let t5;
		let recipeeditor;
		let current;
		let mounted;
		let dispose;
		let each_value = ensure_array_like_dev(/*$shoppingList*/ ctx[1]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		recipeeditor = new RecipeEditor({ $$inline: true });
		recipeeditor.$on("addToShoppingList", /*handleAddToShoppingList*/ ctx[5]);

		const block = {
			c: function create() {
				main = element("main");
				h1 = element("h1");
				h1.textContent = "Shopping List";
				t1 = space();
				form = element("form");
				input = element("input");
				t2 = space();
				button = element("button");
				button.textContent = "Add";
				t4 = space();
				ul = element("ul");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t5 = space();
				create_component(recipeeditor.$$.fragment);
				add_location(h1, file, 50, 2, 1217);
				attr_dev(input, "placeholder", "Add new item");
				attr_dev(input, "class", "svelte-1i2abjr");
				add_location(input, file, 53, 4, 1289);
				attr_dev(button, "type", "submit");
				add_location(button, file, 54, 4, 1351);
				add_location(form, file, 52, 2, 1243);
				attr_dev(ul, "class", "svelte-1i2abjr");
				add_location(ul, file, 57, 2, 1399);
				attr_dev(main, "class", "svelte-1i2abjr");
				add_location(main, file, 49, 0, 1208);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, main, anchor);
				append_dev(main, h1);
				append_dev(main, t1);
				append_dev(main, form);
				append_dev(form, input);
				set_input_value(input, /*newItem*/ ctx[0]);
				append_dev(form, t2);
				append_dev(form, button);
				append_dev(main, t4);
				append_dev(main, ul);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(ul, null);
					}
				}

				append_dev(main, t5);
				mount_component(recipeeditor, main, null);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
						listen_dev(form, "submit", prevent_default(/*addItem*/ ctx[3]), false, true, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*newItem*/ 1 && input.value !== /*newItem*/ ctx[0]) {
					set_input_value(input, /*newItem*/ ctx[0]);
				}

				if (dirty & /*removeItem, $shoppingList*/ 18) {
					each_value = ensure_array_like_dev(/*$shoppingList*/ ctx[1]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(recipeeditor.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(recipeeditor.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(main);
				}

				destroy_each(each_blocks, detaching);
				destroy_component(recipeeditor);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance($$self, $$props, $$invalidate) {
		let $shoppingList;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('App', slots, []);
		let shoppingList = writable([]);
		validate_store(shoppingList, 'shoppingList');
		component_subscribe($$self, shoppingList, value => $$invalidate(1, $shoppingList = value));
		let newItem = "";

		onMount(async () => {
			try {
				const response = await fetch("/shopping-list.json");
				const data = await response.json();
				shoppingList.set(data);
			} catch(error) {
				console.error("Error loading shopping list:", error);
			}
		});

		function addItem() {
			if (newItem.trim()) {
				shoppingList.update(items => [...items, newItem.trim()]);
				$$invalidate(0, newItem = "");
				saveList();
			}
		}

		function removeItem(index) {
			shoppingList.update(items => items.filter((_, i) => i !== index));
			saveList();
		}

		async function saveList() {
			try {
				await fetch("/save-shopping-list", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify($shoppingList)
				});
			} catch(error) {
				console.error("Error saving shopping list:", error);
			}
		}

		function handleAddToShoppingList(event) {
			shoppingList.update(items => [...items, ...event.detail.detail]);
			saveList();
		}

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
		});

		function input_input_handler() {
			newItem = this.value;
			$$invalidate(0, newItem);
		}

		const click_handler = index => removeItem(index);

		$$self.$capture_state = () => ({
			RecipeEditor,
			onMount,
			writable,
			shoppingList,
			newItem,
			addItem,
			removeItem,
			saveList,
			handleAddToShoppingList,
			$shoppingList
		});

		$$self.$inject_state = $$props => {
			if ('shoppingList' in $$props) $$invalidate(2, shoppingList = $$props.shoppingList);
			if ('newItem' in $$props) $$invalidate(0, newItem = $$props.newItem);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			newItem,
			$shoppingList,
			shoppingList,
			addItem,
			removeItem,
			handleAddToShoppingList,
			input_input_handler,
			click_handler
		];
	}

	class App extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "App",
				options,
				id: create_fragment.name
			});
		}
	}

	const app = new App({
		target: document.body,
		props: {
			// you can pass props here if needed
		}
	});

	return app;

})();
//# sourceMappingURL=bundle.js.map
