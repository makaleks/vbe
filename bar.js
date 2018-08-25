export var bar = {
    inline_styles: ['width', 'height', 'min_width', 'min_height',
        'background_color', 'text_color',
        'font', 'border_color', 'border_width', 'overflow',
        'content_direction',
        'content_main_align', 'content_cross_align',
        'self_main_align', 'self_cross_align'],
    props : {
        width: {
            default: null,
        },
        height: {
            default: null,
        },
        min_width: {
            default: null,
        },
        min_height: {
            default: null,
        },
        background_color: {
            type: String,
            default: null,
        },
        text_color: {
            type: String,
            default: null,
        },
        font: {
            type: String,
            default: null,
        },
        border_color: {
            type: String,
            default: null,
        },
        border_width: {
            type: String,
            default: null,
        },
        overflow: {
            type: String,
            default: null,
        },
        // sets the 'main' axis direction
        content_direction: {
            default: null,
            validator: function(v) {
                return ['row','row-reverse','column','column-reverse'].indexOf(v) !== -1;
            },
        },
        content_main_align: {
            default: null,
            validator: function(v) {
                return ['start', 'end', 'center', 'most-far', 'space-around'].indexOf(v) !== -1;
            },
        },
        content_cross_align: {
            default: null,
            validator: function(v) {
                return ['start', 'end', 'center', 'stretch'].indexOf(v) !== -1;
            },
        },
        self_main_align: {
            default: null,
            validator: function(v) {
                return ['auto', 'start', 'end', 'center', 'most-far', 'space-around'].indexOf(v) !== -1;
            },
        },
        self_cross_align: {
            default: null,
            validator: function(v) {
                return ['auto', 'start', 'end', 'center', 'stretch'].indexOf(v) !== -1;
            },
        },
        style_class: {
            type: String,
            default: null,
        },
        disable_all_styles: {
            type: Boolean,
            default: false,
        },
    },
    // <slot /> disables innerHTML ignoring
    template: `
<div v-bind:class='get_style_class' v-bind:style='get_style_obj' data-isbar='true'>
    <slot></slot>
</div>
    `,
    computed: {
        is_bar: function() {
            return true;
        },
        is_all_default: function() {
            for (var k in this.$options.inline_styles)
                if (this[k] !== null)
                    return false;
            return true;
        },
        get_style_class: function() {
            return this.style_class !== null ? this.style_class : '';
        },
        get_style_obj: function() {
            if (this.disable_all_styles)
                return {}
            var names = this.$options.inline_styles;
            // base style
            var to_ret = {
                'display': 'flex',
                'position': 'relative',
                //'overflow': 'auto',
                
            };
            if (this.style_class !== null)  {
                for (var i = 0; i < names.length; i++)
                    if (this[names[i]] !== null) {
                        var css_val = this.prop_to_css(names[i]);
                        Object.assign(to_ret, {[css_val.css]: css_val.value});
                    }
                return to_ret;
            }
            else {
                for (var i = 0; i < names.length; i++) {
                    var css_val = this.prop_to_css(names[i]);
                    Object.assign(to_ret, {[css_val.css]: css_val.value});
                }
                //console.log(to_ret);
                return to_ret;
            }
        },
    },
    methods: {
        // returns {'css', 'value'}
        prop_to_css(prop_name, ignore_default = false) {
            var map = {
                background_color: {
                    css: 'background-color', 
                    default: '#ffffff00',
                },
                text_color: {
                    css: 'color', 
                    default: 'black',
                },
                font: {
                    css: 'font', 
                    default: 'inherit',
                },
                border_color: {
                    css: 'border-color',
                    default: 'black',
                },
                border_width: {
                    css: 'border-width',
                    default: '1px',
                },
                overflow: {
                    css: 'overflow',
                    default: 'visible',
                },
                width: {
                    css: 'width', 
                    default: '100%',
                },
                height: {
                    css: 'height', 
                    default: '100%',
                },
                min_width: {
                    css: 'min-width',
                    default: null,
                },
                min_height: {
                    css: 'min-height',
                    default: null,
                },
                content_direction: {
                    css: 'flex-direction', 
                    default: 'row',
                },
                content_main_align: {
                    css: 'justify-content', 
                    default: 'start', 
                    values: {
                        'start': 'flex-start',
                        'end': 'flex-end',
                        'most-far': 'space-between',
                    },
                },
                content_cross_align: {
                    css: 'align-items', 
                    default: 'center',
                    values: {
                        'start': 'flex-start',
                        'end': 'flex-end',
                    },
                },
                self_main_align: {
                    css: 'justify-self', 
                    default: 'auto',
                    values: {
                        'start': 'flex-start',
                        'end': 'flex-end',
                        'most-far': 'space-between',
                    },
                },
                self_cross_align: {
                    css: 'align-self',
                    default: 'auto',
                    values: {
                        'start': 'flex-start',
                        'end': 'flex-end',
                    },
                },
            };
            var value = ignore_default ? this[prop_name]
                        : (this[prop_name] === null 
                            ? map[prop_name].default
                            : this[prop_name]);
            var value = '';
            if (ignore_default)
                value = this[prop_name];
            else {
                if (this[prop_name] === null)
                    value = map[prop_name].default;
                else
                    value = this[prop_name];
            }
            // If component redefined the style
            if (Object.getOwnPropertyNames(map[prop_name]).indexOf('values') !== -1
                    && Object.getOwnPropertyNames(map[prop_name].values).indexOf(value) !== -1)
                value = map[prop_name].values[value];
            var result = {
                css: map[prop_name].css,
                value: value,
            };
            //console.log(result);
            return result;
        },
        update_borders: function() {
            if (this.disable_all_styles)
                return;
            parent = this.$el.parentNode;
            var tel = this.$el;
            var bnames = {
                top: 'border-top-style',
                right: 'border-right-style',
                bottom: 'border-bottom-style',
                left: 'border-left-style',
            };
            tel.style[bnames.top]
                = tel.style[bnames.right]
                = tel.style[bnames.bottom]
                = tel.style[bnames.left]
                = 'none';
            if (parent.getAttribute('data-isbar') === 'true') {
                parent = this.$parent;
                var k = '';
                // used if not a 'bar' before this element
                var additional_k = '';
                var is_at_the_end = false;
                var arr = Array.from(parent.$el.children);
                var pos = arr.indexOf(tel);
                var is_before_not_bar = () => {
                    if (pos != 0
                        && arr[pos - 1].getAttribute(
                            'data-isbar') !== 'true')
                        return true;
                    else return false;
                };
                switch (parent.prop_to_css('content_direction').value) {
                    case 'row':
                        k = bnames.right;
                        is_at_the_end = (
                            tel.offsetLeft
                            + tel.offsetWidth 
                                >= parent.$el.offsetWidth
                            );
                        if (is_before_not_bar())
                            additional_k = bnames.left;
                        break;
                    case 'row-reverse':
                        k = bnames.left;
                        is_at_the_end = (
                            tel.offsetLeft <= 0
                            );
                        if (is_before_not_bar())
                            additional_k = bnames.right;
                        break;
                    case 'column':
                        k = bnames.bottom;
                        is_at_the_end = (
                            tel.offsetTop
                            + tel.offsetHeight 
                                >= parent.$el.offsetHeight
                            );
                        if (is_before_not_bar())
                            additional_k = bnames.top;
                        break;
                    default:
                        // column-reverse:
                        k = bnames.top;
                        is_at_the_end = (
                            tel.offsetTop <= 0
                            );
                        if (is_before_not_bar())
                            additional_k = bnames.bottom;
                        break;
                }
                //console.log(is_at_the_end);
                //console.log(k);
                if (!is_at_the_end) {
                    this.$el.style[k] = 'solid';
                }
                if (additional_k)
                    this.$el.style[additional_k] = 'solid';
            }
        },
    },
    mounted: function() {
        this.$nextTick(this.update_borders);
    },
    updated: function() {
        this.update_borders();
    },
};
