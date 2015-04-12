var JSB = function(element, data)
{
	this.nextid	= 1;

	this.element	= element;
	this.data		= data;
	this.iddata		= {};
};

JSB.prototype.setSchema = function(schema, loadSchemaCB)
{
	this.schema		= this.fixupSchema(schema);
	this.schemaCB	= loadSchemaCB;
};

JSB.prototype.uniqueName = function()
{
	return('jsb_' + (++this.nextid));
};

JSB.prototype.hasClass = function(el, name)
{
	return new RegExp('(\\s|^)'+name+'(\\s|$)').test(el.className);
};

JSB.prototype.addClass = function(el, name)
{
	if (!this.hasClass(el, name)) {
		el.className += (el.className ? ' ' : '') +name;
	}
};

JSB.prototype.removeClass = function(el, name)
{
	if (this.hasClass(el, name)) {
		el.className = el.className.replace(new RegExp('(\\s|^)'+name+'(\\s|$)'),' ').replace(/^\s+|\s+$/g, '');
	}
};

JSB.prototype.mergeSchema = function(a, b)
{
	for (var p in b) {
		try {
			if (b[p].constructor == Object) {
				a[p] = this.mergeSchema(a[p], b[p]);
			} else {
				a[p] = b[p];
			}
		} catch(e) {
			a[p] = b[p];
		}
	}

	return(a);
};

JSB.prototype.fixupSchema = function(schema)
{
	if (!this.schemaCB) {
		/* We can't do much if we can't load more schema */
		return(schema);
	}

	if (!schema.type) {
		if (schema.items) {
			schema.type = 'array';
		} else if (schema.properties) {
			schema.type = 'object';
		}
	}

	if (schema && schema['$ref']) {
		schema = this.schemaCB(schema['$ref']);
	}

	/* Clone the object so we don't mess with the original */
	schema = JSON.parse(JSON.stringify(schema));

	var extendlist	= [];

	switch (typeof schema['extends']) {
		case 'string':
			extendlist = [ schema['extends'] ];
			break;

		case 'object':
			extendlist = schema['extends'];
			break;
	}
	delete schema['extends'];

	for (var i = 0, e; e = extendlist[i]; i++) {
		var supero;
		var nschema	= {};

		if (!(supero = this.schemaCB(e))) {
			continue;
		}

		schema = this.mergeSchema(schema, supero);
	}

	return(schema);
};

JSB.prototype.renderHTML = function(schema, name, data, options)
{
	var id = this.uniqueName();

	schema = this.fixupSchema(schema);

	this.iddata[id] = {
		schema:		schema,
		name:		name
	};

	options	= options || {};

	var html	= '';
	var value;
	var title	= schema.title || name;
	var type;

	switch (typeof schema.type) {
		case 'string':
			type = schema.type;
			break;

		case 'undefined':
			type = 'object';
			break;

		case 'object':
			/*
				If multiple types are allowed attempt to use array, since it is
				the most complex one that we support.

				For example:
					[ 'string', 'array' ]
			*/
			if (-1 != schema.type.indexOf('array')) {
				type = 'array';
			} else {
				type = schema.type[0];
			}
			break;
	}
	this.iddata[id].type = type;


	if (title && title.length > 0 && !schema.hidden) {
    html += "<div class='control-group'>";
		html += '<label class="control-label';
		if (schema.advanced ) html += ' advanced"';
    html += '" ';
		if (schema.description) {
			html += ' title="';
      var label = htmlEncode(schema.description);
      html += label.charAt(0).toUpperCase() + label.slice(1);
			html += '"';
		}

		html += '>';
		html += htmlEncode(title);
		html += '</label>';
	}

	if (schema['enum'] && !schema.hidden) {
		html += '<select name="' + id +'"';
		if (schema.advanced ) html += ' class="advanced"';
    if( schema.invalid ) html += ' data-invalid="'+htmlEncode(schema.invalid)+'" ';
    html += '>\n';

		if (!schema.required) {
			/* Insert a blank item; this field isn't required */
			html += '<option></option>';
		}

		for (var i = 0, e; e = schema['enum'][i]; i++) {
			html += '<option';

			if (data && data === e) {
				html += ' selected';
			}

			html += '>' + e + '</option>';
		}

		html += '</select>';
    html += '<br'+ (schema.advanced ? ' class="advanced"' : '') +'/>\n';
	} else {
		var classname = type;

		if (schema.advanced) classname += ' advanced';
		if (schema.readonly) {
			classname += ' readonly';
		}

		switch (type) {
			case 'string':
				if (schema.large && !schema.hidden) {
					/*
						This is a non-standard option, used to indicate that we
						should render this field using a textarea instead of a
						simple input.
					*/
					html += '<textarea name="' + id +
								'" class="' + classname + '"';

          if( schema.invalid     ) html += ' data-invalid="'+htmlEncode(schema.invalid)+'" ';
					if (schema.readonly) {
						html += ' readonly';
					}
					html += '>';
					if (data) {
						html += htmlEncode(data.toString());
					}else if( schema.placeholder ) html += htmlEncode( schema.placeholder );
					html += '</textarea>';
          html += '<br'+ (schema.advanced ? ' class="advanced"' : '') +'/>\n';
					break;
				}

				/* fallthrough */

			case 'number':
			case 'integer':
			case 'boolean':
				var inputtype	= 'text';

				// TODO	Add support for html5 form types, possibly use range for
				//		numbers with a min and max?

				if (type == 'boolean') {
					inputtype = 'checkbox';
				}

				if (schema.hidden) {
					inputtype = 'hidden';
				}

				html += '<input name="' + id + '" type="' + inputtype +
								'" class="' + classname + '"';
        if( schema.placeholder ) html += ' placeholder="'+schema.placeholder+'" ';
        if( schema.invalid     ) html += ' data-invalid="'+htmlEncode(schema.invalid)+'" ';
				if (type == 'boolean' && data ) {
          html += ' checked="checked"';
				} else if (data) {
					html += ' value="' + htmlEncode(data.toString()) + '"';
				}
				if (schema.readonly) {
					html += ' readonly';
				}

				html += '/>\n';

				if (!schema.hidden) {
          html += '<br'+ (schema.advanced ? ' class="advanced"' : '') +'/>\n';
				}
				break;

			case 'array':
				var item;

				if ((item = schema.items)) {
					this.iddata[id].action	= 'add';
					this.iddata[id].item	= item;
					if (!schema.readonly) {
						html += '<button class="add_button btn btn-primary" name="' + id + '" onclick="return false">Add</button>';
					}

					html += '<span class="' + id + ' ' + classname + '">';

					switch (Object.prototype.toString.call(data)) {
						case '[object Array]':
						case '[object Undefined]':
						case '[object Null]':
							/* Leave alone */
							break;

						default:
							/*
								Assume that this is intended to be an array of this
								item, which is possible if the item has multiple
								allowed types.

								Let validation sort it out later. Just try to render
								it now.
							*/
							data = [ data ];
							break;
					}

					if (data) {
						var was = item.readonly || false;

						if (schema.preserveItems) {
							item.readonly = true;
						}

						html += '<fieldset class="img-rounded">';
						for (var i = 0; i < data.length; i++) {
							html += '<span>';
							html += this.insertArrayItem(item, data[i], options, schema.readonly || schema.preserveItems);
							html += '</span>';
						}
						html += '</fieldset>';

						if (schema.preserveItems) {
							item.readonly = was;
						}
					}
					html += '</span>';
          html += '<br'+ (schema.advanced ? ' class="advanced"' : '') +'/>\n';
				}
				break;

			case 'object':
				if (schema.properties) {
					/* A normal object */
					var properties	= Object.keys(schema.properties);

          html += '<fieldset name="' + id + '" class="' + classname + '">\n';
					for (var i = 0, p; p = schema.properties[properties[i]]; i++) {
						html += this.renderHTML(p, properties[i], (data || {})[properties[i]], options);
					}
					html += '</fieldset>\n';
				} if ((item = schema.patternProperties)) {
					// TODO	Write me
					html = '';
				}
				break;
		}
	}
  if ( title && title.length > 0 && !schema.hidden )
    html += "</div> ";

	return(html);
};

JSB.prototype.insertArrayItem = function(item, data, options, readonly)
{
	var id		= this.uniqueName();
  var html  = '';
	
  if (!readonly) {
		html += '<button class="del_button btn-danger" name="' + id + '">X</button>';
	}

	html += this.renderHTML(item, null, data, options);

	this.iddata[id] = {
		schema:		item,
		data:		null,
		action:		'del'
	};

	return(html);
};

JSB.prototype.render = function(options)
{
	var html = this.renderHTML(this.schema, null, this.data, options || {});

	// console.log(html);

  if( options.append ) this.element.innerHTML = this.element.innerHTML + html;
  else this.element.innerHTML = html;
	this.element.addEventListener('click', function(e) {
		var detail;
		var target	= null;

		if (e) {
			target = e.toElement || e.target;
		}

		if (!target || !(detail = this.getDetail(target))) {
			return;
		}

		switch (detail.action) {
			case 'add':
				var container;
				var item;

				if ((container = target.parentNode) &&
					(container = container.getElementsByTagName('fieldset'))
				) {
					container = container[0];
				}

				if (!container && (container = document.createElement('fieldset'))) {
					if (target.nextSibling) {
						target.parentNode.insertBefore(container, target.nextSibling);
					} else {
						target.parentNode.appendChild(container);
					}
				}

				if (container) {
					var span	= document.createElement('span');
					var br = document.createElement('br');

					span.innerHTML = this.insertArrayItem(detail.item, detail.data, options);
          span.appendChild(br);
          span.appendChild(br);
					container.appendChild(span);
				}

				this.validate();
				break;

			case 'del':
				var container;
				var p;

				if (detail && target && (container = target.parentNode)) {
					p = container.parentNode;

					p.removeChild(container);

					if (!p.firstChild) {
						p.parentNode.removeChild(p);
					}
				}

				this.validate();
				break;
		}
	}.bind(this));

	this.element.addEventListener('change', function(e) {
		this.validate();
	}.bind(this));

	this.validate();
	this.addClass(this.element, 'jsb');
};

JSB.prototype.getDetail = function(el)
{
	if (!el) {
		return(null);
	}

	if (el.name) {
		return(this.iddata[el.name]);
	}

	if (el.className) {
		var classes = el.className.split(' ');

		for (var i = 0, c; c = classes[i]; i++) {
			if (0 == c.indexOf('jsb_')) {
				return(this.iddata[c]);
			}
		}
	}

	return(null);
};

JSB.prototype.getValue = function(element)
{
	var value	= undefined;
	var detail	= null;
  console.dir(element);

	switch (element.nodeName.toLowerCase()) {
		case 'button':
			return(null);
	}

	detail = this.getDetail(element);

	if (detail && detail.schema) {
		switch (detail.type) {
			case 'object':
				value = {};
				for (var i = 0, n; n = element.childNodes[i]; i++) {
					var v;
					var d;

					if (!(d = this.getDetail(n)) || !d.name) {
						continue;
					}

					if ((v = this.getValue(n))) {
						value[d.name] = v;
					}
				}
				return(value);

			case 'array':
				var fieldset = null;

				if (!isNaN(detail.schema.minItems) &&
					detail.schema.minItems > 0
				) {
					/* Always include an array that requires items */
					value = [];
				}

				for (var i = 0, n; n = element.childNodes[i]; i++) {
					if (n.nodeName.toLowerCase() == 'fieldset') {
						fieldset = n;
						break;
					}
				}

				if (fieldset) {
					for (var i = 0, n; n = fieldset.childNodes[i]; i++) {
						var v;

						if ((v = this.getValue(n))) {
							if (!value) {
								value = [];
							}

							value.push(v);
						}
					}
				}

				return(value);
		}
	}
	switch (element.nodeName.toLowerCase()) {
		default:
			/* Get the first child's value */
			for (var i = 0, n; n = element.childNodes[i]; i++) {
				if ((value = this.getValue(n))) {
					break;
				}
			}
			break;

		case 'textarea':
		case 'input':
			if (!detail) break;

			switch (detail.type) {
				case 'string':
					if (element.value && element.value.length > 0) {
						value = element.value;
					}
					break;

				case 'number':
				case 'integer':
					value = parseInt(element.value);

					if (isNaN(value)) {
						value = undefined;
					}
					break;

				case 'boolean':
					value = element.checked;
					break;
			}
			break;

		case 'select':
			if (!detail) break;

			if (detail.schema.required || element.selectedIndex > 0) {
				value = element.options[element.selectedIndex].value;
			}
			break;
	}

	return(value);
};

JSB.prototype.validate = function(el)
{
	var detail;
	var valid	= true;
	var value;

	if (!(el = el || this.element)) {
		return(true);
	}
	switch (el.nodeName.toLowerCase()) {
		case 'label':
		case 'button':
			/* Ignore add and remove buttons */
			break;

		default:
			this.removeClass(el, 'invalid');
			try {
				el.removeAttribute('title');
			} catch (e) {
			}

			if ((detail = this.getDetail(el))) {
				if (detail.schema.required) {
					/* Very simple built in validation */
					if (!el.value || el.value.length == 0) {
						this.addClass(el, 'invalid');
						valid = false;
					}
				}
			}
			break;
	}

	for (var i = 0, n; n = el.childNodes[i]; i++) {
		if (!this.validate(n)) {
			valid = false;
		}
	}

	return(valid);
};

JSB.prototype.toJSON = function()
{
	return(this.getValue(this.element));
};

