export var text_input = {
    props: {
        control_text: {
            type: String,
            default: '',
        },
        onedit: {
            type: Function,
            default: (value)=>{},
        },
        locale_reg: {
            type: String,
            default: '',
        },
        width: {
            type: String,
            default: null,
        },
        height: {
            type: String,
            default: null,
        },
        box_sizing: {
            type: String,
            default: null,
        },
        input_text_style_class: {
            type: String,
            default: '',
        },
        input_save_style_class: {
            type: String,
            default: '',
        },
        input_save_text: {
            type: String,
            default: 'set',
        },
        btn_style_class: {
            type: String,
            default: '',
        },
    },
    template: `
<div v-bind:style='get_style_obj'>
    <form v-if='is_edit_mode' v-on:submit.prevent.stop='end_set_value' style='position:relative;display:flex;overflow:hidden;height:100%;'>
    <input type='text' v-bind:class='input_text_style_class' v-model.lazy.trim='value' v-on:keypress='validate($event)' v-bind:style='{height: height, width:"calc(100%-"+height+")","box-sizing":"border-box","padding-left":"0.5rem","min-width":height}'></input><input type='submit' v-bind:class='input_save_style_class' v-bind:value='input_save_text' v-bind:style='{width:height,height:height,padding:0,"flex-shrink":0}'></input>
    </form>
    <button v-bind:class='btn_style_class' v-bind:style='{height:height,"text-align":"left","padding-left":"0.5rem","padding-right":0,"box-sizing":"border-box","display":"block"}' v-on:click='start_set_value' v-else>{{ value }}</button>
</div>
    `,
    data: function() {
        return {
            value: '',
            is_edit_mode: false,
            _old_value: null,
        };
    },
    computed: {
        get_style_obj: function() {
            var to_ret = {};
            if (this.width !== null)
                to_ret['width'] = this.width;
            if (this.height !== null) {
                to_ret['height'] = this.height;
                to_ret['min-width'] = "calc(2*"+this.height+")";
            }
            var box_sizing = 'border-box';
            if (this.box_sizing !== null)
                box_sizing = this.box_sizing;
            to_ret['box-sizing'] = box_sizing;
            to_ret['padding'] = 0;
            return to_ret;
        },
    },
    mounted: function() {
        if (this.value === '' && this.$slots.default[0].text)
            this.value = this.$slots.default[0].text;
    },
    methods: {
        end_set_value: function() {
            this.is_edit_mode = false;
            if (this.value != this._old_value) {
                this.onedit(this.value);
            }
        },
        start_set_value: function() {
            this.is_edit_mode = true;
            this._old_value = this.value;
            this.$nextTick(
                ()=>{this.$el.getElementsByTagName("input")[0].focus();}
            );
        },
        validate: function(e) {
            // Special keys
            if (e.key.length > 1)
                return;
            var regexp = new RegExp('[^a-zA-Z0-9_!@#\\$%\\^&()\\-=\\+\\[\\]\\{\\};\',\\.~` ' + this.locale_reg + ']', 'g');
            if (e.key.match(regexp) != null) {
                e.preventDefault();
            }
        },
    },
    watch: {
        control_text: function(nval) {
            this.value = nval;
        },
    },
};
