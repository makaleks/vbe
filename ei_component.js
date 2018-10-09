export var ei_component = {
    props: {
        locale: {
            type: String,
            default: 'en',
        },
        settings_obj: {
            type: Object,
            required: true,
            default: {},
        },
        ei_obj: {
            type: Object,
            required: true,
        },
        onupdate: {
            type: Function,
            required: true,
        },
        bitmap: {
            required: true,
        },
        width: {
            type: String,
            default: null,
        },
        height: {
            type: String,
            default: null,
        },
    },
    template: `
        <form v-bind:style='get_style_obj'>
            <div v-for='(val, key) in values'>
            <label style='user-select:none'>
                <input type='checkbox' v-model='val.value' v-bind:disabled='!val.enabled' v-on:change='call_update()'> {{ gethelp(key) }}
            </label>
            </div>
        </form>
    `,
    data: function() { return {
        values: this.settings_obj,
    }},
    computed: {
        get_style_obj: function() {
            var to_ret = {};
            if (this.width !== null)
                to_ret['width'] = this.width;
            if (this.height !== null) {
                to_ret['height'] = this.height;
            }
            to_ret['padding'] = 0;
            to_ret['font-size'] = '1rem';
            to_ret['overflow'] = 'auto';
            return to_ret;
        },
        get_values: function() {
            var to_ret = {};
            for (var i = 0; i < this.values.length; i++)
                to_ret[this.values[i].name] = this.values[i].value;
            return to_ret;
        },
    },
    methods: {
        gethelp: function(key) {
            if (this.ei_obj.option_help_strings[this.locale]
                    && this.ei_obj.option_help_strings[this.locale][key])
                return this.ei_obj.option_help_strings[this.locale][key];
            else
                return this.ei_obj.option_help_strings['en'][key];
        },
        reinit_data: function() {
            var to_ret = {};
            var obj = this.ei_obj.options;
            for (var k in obj) {
                var enabled = true;
                var value = false;
                if (obj[k].is_possible) {
                    // The validator returns error text string
                    // or the default value
                    enabled = obj[k].is_possible(this.bitmap);
                    if (typeof(enabled) != 'boolean') {
                        console.log(k + ' DISABLED: ' + enabled.error);
                        if (enabled.new_default)
                            value = enabled.new_default;
                        enabled = false;
                    }
                }
                var help = k;
                if (obj[k].help)
                    help = obj[k].help;
                // In case of error the fixed value may differ from 'default'
                if (obj[k].default && enabled)
                    value = obj[k].default;
                to_ret[k] = {value: value, help: help, enabled: enabled};
            }
            this.values = to_ret;
            this.call_update();
        },
        call_update: function() {
            var to_ret = {};
            for (var k in this.values)
                to_ret[k] = this.values[k].value;
            this.onupdate(to_ret);
        },
    },
    watch: {
        // returns [{value, help, enabled}]
        ei_obj: function() {
            this.reinit_data();
        },
    },
    mounted: function() {
        this.reinit_data();
    },
};
