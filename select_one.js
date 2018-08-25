export var select_one = {
    props: {
        all_values: {
            type: Array,
            default: ()=>{return[{none:'None'}];},
            validator: function (value) {
                if (value.length == 0)
                    return false;
                for (var i = 0; i < value.lengh; i++) {
                    var keys = Object.getOwnPropertyNames(value[i]);
                    if (keys.length != 1) {
                        console.log('Error: array object has more that 1 property');
                        console.log(value[i]);
                        return false;
                    }
                }
                return true;
            },
        },
        default_value: {
            type: String,
            default: null
        },
        onedit: {
            type: Function,
            default: (value)=>{},
        },
        width: {
            type: String,
            default: null,
        },
        height: {
            type: String,
            default: null,
        },
        style_class: {
            type: String,
            default: '',
        },
        new_value: {
            default: null,
        },
    },
    data: function() {
        return { value: '' };
    },
    created: function() {
        if (this.default_value != null)
            this.value = this.default_value;
        else
            this.value = this.get_keyval(this.all_values[0]).key;
    },
    template: `
<select v-model='value' v-on:change='call_onedit' v-bind:class='style_class' v-bind:style='get_style_obj'>
    <option v-for='v in all_values' :value='get_keyval(v).key'>{{ get_keyval(v).value }}</option>
</select>
    `,
    computed: {
        get_style_obj: function() {
            var to_ret = {};
            if (this.width !== null)
                to_ret['width'] = this.width;
                to_ret['min-width'] = this.width;
            if (this.height !== null) {
                to_ret['height'] = this.height;
                to_ret['min-height'] = this.height;
            }
            to_ret['text-align'] = 'center';
            return to_ret;
        },
    },
    methods: {
        get_keyval: function(obj) {
            var k = Object.getOwnPropertyNames(obj)[0];
            return {key: k, value: obj[k]};
        },
        call_onedit: function() {
            this.onedit(this.value);
        },
    },
    watch: {
        new_value: function(nval) {
            this.value = nval;
        },
    },
};
