(function(g, $) {

	function keys(hash) {
		return $.map(hash, function(value, key) {
			return key;
		});
	}

	function someKey(hash) {
		for (var key in hash) {
			return key;
		}
	}

	function singletonHash(key, value) {
		var hash = {};
		hash[key] = value;
		return hash;
	}

	function createIndex(array, keyExtractor) {
		var hash = {};
		keyExtractor = keyExtractor || function(a) { return a; };
		for (var i = 0; i < array.length; ++i) {
			hash[keyExtractor(array[i])] = array[i];
		}
		return hash;
	}

	function removeFromArray(array, ele) {
		var prevLength = array.length;
		for (var i = 0; i < array.length; ) {
			if (array[i] == ele) {
				array.splice(i, 1);
			}
			else {
				++i;
			}
		}
		return prevLength - array.length;;
	}

	$.cutils = {
		keys: keys,
		someKey: someKey,
		createIndex: createIndex,
		singletonHash: singletonHash,
		removeFromArray: removeFromArray
	};

})(window, jQuery);

(function(g, $) {

	var EMPTY_FUNCTION = function(){};

	//
	// Component class lookup.
	//
	var cClasses = {};

	//
	// Create and register a component subclass.
	//
	// Parameters:
	//
	// cname is the name by which the class is identified through the API.
	//
	// builder is a function that takes three arguments:
	//  - a jQuery wrapper containing the component shell div, presumed to be empty
	//  - a hash of options
	//  - a hash of component methods
	// and populates the shell div.  It may also extend the interface hash.
	//
	function addClass(cname, builder) {

		// A function that creates a function that clients may use to instantiate
		// components.  It's more a factory method than a constructor, because it 
		// returns the jQuery-wrapped DOM element.
		function cons() {

			// The argument to the factory method must be one of the following:
			// - A hash of options to pass to the builder for this component class, OR
			// - A function that fetches the hash of options and passes it to a callback
			return function(arg) {

				// Create the shell div.
				var $shell = $("<div>")
					.attr("CC", cname)
					.addClass("c" + cname)
					// Part of the mechanism for attaching the interface hash to the DOM node:
					.on("CC:getHandle", function(evt, receptacle) {
						receptacle.handle = cinterface;
						return false;
					});

				// Default component interface
				var cinterface = {
					evaluate: EMPTY_FUNCTION
				};

				if (typeof arg === "function") {
					// Support load and show.
					$shell.append(CC.Label({ text: "Loading..." }));
					arg(function(options) {
						$shell.empty();
						builder($shell, options, cinterface);
						setTimeout(function() { $shell.trigger("Component:built"); }, 1);
						return $shell;
					});
				}
				else {
					builder($shell, arg, cinterface);
				}

				return $shell;
			};
		}

		// Register the class.
		cClasses[cname] = {
			name: cname,
			builder: builder,
			cons: cons
		};
	}

	function evaluateComposite($comp, doCollapse) {
		var result = [];
		$comp.children().each(function(ix, ele) {
			var thisValue = $(ele).asCC().evaluate();
			if (thisValue !== undefined) {
				result.push(thisValue);
			}
		});
		if (doCollapse) {
			result = result.length == 0 ? null : (result.length == 1 ? result[0] : result);
		}
		return result;
	}

	function defaultTextFieldValidator(type) {
		if (type == "number") {
			return function(text) {
				return text.match(/(^[0-9]+(\.[0-9]*)?$)|(^\.[0-9]+$)/);
			};
		}
		return function() { return 1; };
	}

	//
	// Button
	//
	addClass("Button", function($shell, options) {
		options = $.extend({
			label: "",
			clickEventName: "Button:click"
		}, options);
		$shell
			.append($("<button>")
				.text(options.label)
				.on("click", function() {
					$(this).trigger(options.clickEventName);
				}));
	});

	//
	// Box.  Just an empty div.
	//
	addClass("Box", function($shell, options, cinterface) {

		cinterface.evaluate = function() {
			return evaluateComposite($shell, true);
		}
	});

	//
	// ComboBox (sort of)
	//
	addClass("ComboBox", function($shell, options, cinterface) {
		options = $.extend({
			textInputPrompt: "-literal-",
			choices: []
		}, options);

		function getMenuChoices() {
			var choices = options.choices.slice(0);
			choices.unshift(options.textInputPrompt);
			return choices;
		}

		function flattenValue(value) {
			if (value && (typeof value == "object")) {
				value = value[$.cutils.someKey(value)];
			}
			return value;
		}

		function getChoice(flatValue) {
			var choices = options.choices;
			for (var i = 0; i < choices.length; ++i) {
				var thisChoice = choices[i];
				var thisValue = typeof thisChoice == "string" ? thisChoice : thisChoice.value;
				if (thisValue == flatValue) {
					return thisChoice;
				}
			}
		}

		function getMenuSelection() {
			var flatValue = flattenValue(options.value);
			if (getChoice(flatValue)) {
				return flatValue;
			}
		}

		function getInitialText() {
			switch (typeof options.value) {
			case "number": case "string":
				return String(currentValue);
			}
			return "";
		}

		var currentValue = options.value;

		cinterface.evaluate = function() { return currentValue; };

		$shell
			.append(CC.Dropdown({
				choices: getMenuChoices(),
				selection: getMenuSelection()
			}))
			.append(CC.TextField({
				value: getInitialText(),
				validate: options.validate,
				type: options.textType,
				changeEventName: options.changeEventName
			})[getMenuSelection() ? "hide" : "show"]()
			)
			.on("Dropdown:change", function(evt, newValue) {
				var $textField = $(this).find(".cTextField");
				if (newValue == options.textInputPrompt) {
					$textField.show();
					newValue = $textField.asCC().evaluate();
				}
				else {
					$textField.hide();
					var choice = getChoice(newValue);
					if (choice.qualifier) {
						newValue = $.cutils.singletonHash(choice.qualifier, newValue);
					}
				}
				currentValue = newValue;
				$(this).trigger(options.changeEventName, newValue);
			});
	});

	//
	// ConfirmButton
	//
	addClass("ConfirmButton", function($shell, options) {
		options = $.extend({
			label: "",
			confirmLabel: "Confirm",
			clickEventName: "Button:click"
		}, options);

		var state = 0;

		var $button = $("<button>")
			.text(options.label)
			.on("click", function() {
				$button.text(state ? options.label : options.confirmLabel);
				state = !state;
				if (!state) {
					$(this).trigger(options.clickEventName);
				}
			});

		$shell.append($button);
	});

	//
	// Dropdown menu
	//
	addClass("Dropdown", function($shell, options, cinterface) {
		options = $.extend({
			choices: [],
			changeEventName: "Dropdown:change"
		}, options);

		var $items;
		for (var i = 0; i < options.choices.length; ++i) {
			var choice = options.choices[i];
			var value = typeof choice == "string" ? choice : choice.value;
			var label = typeof choice == "string" ? choice : (choice.label || choice.value);
			var clazz = typeof choice == "string" ? null : choice["class"];
			var $option = $("<option>").text(label).val(value);
			if (clazz) {
				$option.addClass(clazz);
			}
			$items = $items ?  $items.add($option) : $option;
		}

		var $select = $("<select>")
			.append($items)
			.val(options.selection)
			.on("change", function() {
				$(this).trigger(options.changeEventName, $(this).val());
			});

		cinterface.evaluate = function() { return $select.val(); };

		$shell.append($select);
	});

	//
	// Hyperlink
	//
	addClass("Hyperlink", function($shell, options) {
		options = $.extend({
			href: "#",
			text: ""
		}, options);
		$shell
			.append($("<a>")
				.text(options.text)
				.attr("href", options.href)
				.attr("target", options.target));
	});

	//
	// Label
	//
	addClass("Label", function($shell, options, cinterface) {
		options = $.extend({ text: "" }, options);
		$shell.append($("<span>").text(options.text));
		cinterface.evaluate = function() { return $shell.find("span").text(); };
	});

	//
	// LinkButton
	//
	addClass("LinkButton", function($shell, options) {
		options = $.extend({
			text: "",
			clickEventName: "LinkButton:click"
		}, options);
		$shell
			.append($("<a>")
				.attr("href", "#")
				.text(options.text)
				.click(function() {
					$(this).trigger(options.clickEventName);
				}));
	});

	//
	// List
	//
	addClass("List", function($shell, options, cinterface) {
		options = $.extend({
			items: [],
			renderer: EMPTY_FUNCTION
		}, options);

	  $.extend(cinterface, {
			evaluate: function() {
				var values = [];
				$shell.children().each(function(ix, ele) {
					var thisValue = $(ele).asCC().evaluate();
					if (thisValue !== undefined) {
						values.push(thisValue);
					}
				});
				return values;
			},
			sort: function(comparator) {
				var children = $shell.children();
				children.sort(comparator);
				children.detach().appendTo($shell);
			},
			addItems: function(items) {
				if (items) {
					for (var i = 0; i < items.length; ++i) {
						$shell.append(options.renderer(items[i]));
					}
				}
			},
			addItem: function(item) {
				$shell.append(options.renderer(item));
			},
			empty: function() {
				$shell.empty();
			}
		});

		cinterface.addItems(options.items);
	});

	//
	// MultiView - show one of several views depending on state.
	//
	addClass("MultiView", function($shell, options, cinterface) {
		options = $.extend({ views: [] }, options);
		
		var state;

		$.extend(cinterface, {
			evaluate: function() {
				return $s.children().CC().evaluate();
			},
			updateView: function(newState) {
				var oldState = state;
				state = newState;
				if (newState != oldState) {
					$shell.empty();
					var render = options.views[newState];
					if (render) {
						$shell.append(render());
					}
				}
			}
		});

		cinterface.updateView(options.state);
	});

	//
	// TextField
	//
	addClass("TextField", function($shell, options, cinterface) {
		options = $.extend({
			value: "",
			type: "text",
			validate: defaultTextFieldValidator(options && options.type),
			changeEventName: "TextField:valueChange"
		}, options);

		var currentValue = options.value || options.text;

		function onChange() {
			var newValue = $shell.find("input").val();
			if (!options.validate(newValue)) {
				$shell.addClass("invalid");
				return;
			}
			$shell.removeClass("invalid");
			if (options.type == "number") {
				newValue = parseFloat(newValue);
			}
			if (currentValue != newValue) {
				currentValue = newValue;
				$shell.trigger(options.changeEventName, newValue);
			}
		}

		cinterface.evaluate = function() { return currentValue; };

		$shell
			.append($("<input>")
			.val(currentValue)
			.attr("type", options.password ? "password" : "text")
			.on("change", onChange));
	});

	$.fn.asCC = function() {
		var receptacle = {};
		this.trigger("CC:getHandle", [ receptacle ]);
		return receptacle.handle;
	};

	var CC = $.CC = {};
	for (var cn in cClasses) {
		CC[cn] = cClasses[cn].cons();
	}
	
})(window, jQuery);

(function(g, $) {

	var Box = $.CC.Box;
	var Button = $.CC.Button;
	var Label = $.CC.Label;
	var LinkButton = $.CC.LinkButton;
	var TextField = $.CC.TextField;

	var login;

	function initLogin() {
		var cookies = g.document.cookie;
		var match = /\bsession=([^;]+)/.exec(cookies);
		if (match) {
			login = match[1];
		}
	}

	function buildUi() {

		var $loginStatus;
		var $body;

		function renderNotLoggedIn() {
			return Box()
				.addClass("loginIndicator")
				.append(Label({
					text: "Not logged in"
				}));
		}

		function renderLoggedIn() {
			return Box()
				.addClass("loginIndicator")
				.append(Label({ text: login }))
				.append(LinkButton({ text: "log out", clickEventName: "Login:logout" }));
		}

		function renderAccountInfo() {
			var $companionList = new Box()
				.append(Label({ text: "Your companions" }))
				.append(Box()
					.addClass("subbody")
					.append(Label({ text: "You have no companions currently." })));

			var $addCompanionControl = new Box()
				.append(Label({ text: "Add companion" }))
				.append(Box()
					.addClass("subbody")
					.append(Label({ text: "Email" }))
					.append(TextField())
					.append(Button({ label: "Send request" })));

			return Box()
				.addClass("sAccountInfo")
				.append($companionList)
				.append($addCompanionControl);
		}

		function renderLoginForm() {
			var $userNameField = TextField();
			var $passwordField = TextField({ password: true });
			return Box()
				.append(Label({ text: "Username:" }))
				.append($userNameField)
				.append(Label({ text: "Password:" }))
				.append($passwordField)
				.append(Button({ label: "Submit" }))
				.on("Button:click", function() {
					$(this).trigger("Login:submit", [
						$userNameField.asCC().evaluate(),
						$passwordField.asCC().evaluate()
					]);
				});
		}

		function renderLoginStatus() {
			return login ? renderLoggedIn() : renderNotLoggedIn();
		}

		function renderBody() {
			return login ? renderAccountInfo() : renderLoginForm();
		}

		function refreshAll() {
			var newLoginStatus = renderLoginStatus();
			$loginStatus.replaceWith(newLoginStatus);
			$loginStatus = newLoginStatus;
			var newBody = renderBody();
			$body.replaceWith(newBody);
			$body = newBody;
		}

		function logout() {
			login = null;
			g.document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
			refreshAll();
		}

		function submitLogin(userName, password) {
			login = userName;
			g.document.cookie = "session=" + userName;
			refreshAll();
		}

		$loginStatus = renderLoginStatus();
		$body = renderBody();
		
		return Box()
			.append(Box()
				.addClass("mainHeader")
				.append($("<h1>")
					.text("e-Companion Home Network"))
				.append($loginStatus))
			.append($body)
			.on("Login:logout", logout)
			.on("Login:submit", function(evt, userName, password) {
				submitLogin(userName, password);
			});
	}

	$.fn.HangFireUI = function() {
		this.empty().append(buildUi());
		return this;
	};

	initLogin();

})(window, jQuery);
