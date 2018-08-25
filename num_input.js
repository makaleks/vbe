export var num_input = {
    props: {
        default_val: {
            type: Number,
            default: 1,
        },
        min_val: {
            type: Number,
            default: null,
        },
        max_val: {
            type: Number,
            default: null,
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
        btn_plus_text: {
            type: String,
            default: 'set',
        },
        btn_plus_style_class: {
            type: String,
            default: '',
        },
        btn_minus_text: {
            type: String,
            default: 'set',
        },
        btn_minus_style_class: {
            type: String,
            default: '',
        },
        style_class: {
            type: String,
            default: '',
        },
    },
    data: function() {
        return { value: this.default_val };
    },
    template: `
<form v-on:submit.prevent.stop='call_onedit' type='submit' v-bind:class='style_class' v-bind:style='get_style_obj'>
    <button type='button' v-bind:class='btn_minus_style_class' v-on:click='onclick_minus()' v-bind:style='{"min-width":height,"box-sizing":"border-box",padding:0}'>{{ btn_minus_text }}</button>
    <input type='text' v-model='value' v-bind:style='{"min-width":height,"box-sizing":"border-box","text-align":"center"}' v-on:keypress='validate($event)' onfocus='this.setSelectionRange(0, this.value.length)'></input>
    <button type='button' v-bind:class='btn_plus_style_class' v-on:click='onclick_plus()' v-bind:style='{"min-width":height,"box-sizing":"border-box",padding:0}'>{{ btn_plus_text }}</button>
</form>
    `,
    computed: {
        get_style_obj: function() {
            var to_ret = {};
            if (this.width !== null)
                to_ret['width'] = this.width;
            if (this.height !== null) {
                to_ret['height'] = this.height;
                to_ret['min-height'] = this.height;
                to_ret['min-width'] = "calc(3*"+this.height+")";
            }
            return to_ret;
        },
    },
    methods: {
        onclick_plus: function() {
            if (this.max_val == null
                    || this.max_val > this.value)
                this.value += 1;
            this.call_onedit();
        },
        onclick_minus: function() {
            if (this.min_val == null
                    || this.min_val < this.value)
                this.value -= 1;
            this.call_onedit();
        },
        call_onedit: function() {
            if (this.value == '') {
                this.value = this.default_val;
            }
            this.onedit(this.value);
        },
        validate: function(e) {
            // Special keys
            if (e.key.length > 1 || e.ctrlKey)
                return;
            var regexp = new RegExp('[^0-9\\-]', 'g');
            if (e.key.match(regexp) != null) {
                e.preventDefault();
            }
            else if (this.min_val >= 0 && e.key == '-')
                e.preventDefault();
        },
    },
    watch: {
        value: function(val, oldval) {
            if (val == '' || val == '-') {
                return;
            }
            var n_val = parseInt(val);
            //console.log('watch parseInt ' + n_val);
            if (isNaN(n_val))
                this.value = oldval;
            else if (this.min_val != null && this.min_val > n_val
                    || this.max_val != null && this.max_val < n_val)
                this.value = oldval;
            else
                this.value = n_val;
        },
    },
};
