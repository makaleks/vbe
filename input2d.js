export var input2d = {
    props: {
        default_left: {
            type: Number,
            default: null,
        },
        default_right: {
            type: Number,
            default: null,
        },
        include_zero: {
            type: Boolean,
            default: false,
        },
        onedit: {
            type: Function,
            default: (left, right)=>{},
        },
        width: {
            type: String,
            default: null,
        },
        height: {
            type: String,
            default: null,
        },
        btn_save_text: {
            type: String,
            default: 'set',
        },
        btn_save_style_class: {
            type: String,
            default: '',
        },
        style_class: {
            type: String,
            default: '',
        },
    },
    data: function() {
        var val = this.include_zero ? 0 : 1;
        var to_ret = { left: val, right: val };
        if (this.default_left != null)
            to_ret.left = this.default_left;
        if (this.default_right != null)
            to_ret.right = this.default_right;
        return to_ret;
    },
    template: `
<form v-on:submit.prevent.stop='call_onedit' v-bind:class='style_class' v-bind:style='get_style_obj'>
    <input type='text' v-model='left' v-bind:style='{"min-width":height,"box-sizing":"border-box","text-align":"center"}' v-on:keypress='validate($event, "left")' onfocus='this.setSelectionRange(0, this.value.length)'></input>
    <button v-bind:class='btn_save_style_class' type='submit' v-bind:style='{"min-width":height,"box-sizing":"border-box",padding:0}'>{{ btn_save_text }}</button>
    <input type='text' v-model='right' v-bind:style='{"min-width":height,"box-sizing":"border-box","text-align":"center"}' v-on:keypress='validate($event, "right")' onfocus='this.setSelectionRange(0, this.value.length)'></input>
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
        call_onedit: function(){
            if (this.left == '') {
                if (this.default_left != null)
                    this.left = this.default_left;
                else
                    this.left = this.include_zero ? 0 : 1;
            }
            if (this.right == '') {
                if (this.default_right != null)
                    this.right = this.default_right;
                else
                    this.right = this.include_zero ? 0 : 1;
            }
            this.onedit(this.left, this.right);
        },
        lr_by_str: function(str) {
            if (str == 'left')
                return this.left;
            else if (str == 'right')
                return this.right;
            else return null;
        },
        validate: function(e, pos) {
            // Special keys
            if (e.key.length > 1 || e.ctrlKey)
                return;
            var regexp = new RegExp('[^0-9]', 'g');
            if (e.key.match(regexp) != null) {
                e.preventDefault();
            }
            else if (e.key == '0') {
                if ((this.lr_by_str(pos) == ''
                                && !this.include_zero)
                        || (this.lr_by_str(pos) == '0')) {
                    e.preventDefault();
                }
            }
        },
    },
    watch: {
        left: function(val, oldval) {
            if (val == '')
                return;
            var n_val = parseInt(val);
            if (n_val == NaN || n_val < 0)
                this.left = oldval;
            else if (!this.include_zero && n_val == 0)
                this.left = oldval;
            else
                this.left = n_val;
        },
        right: function(val, oldval) {
            if (val == '')
                return;
            var n_val = parseInt(val);
            if (n_val == NaN || n_val < 0)
                this.right = oldval;
            else if (!this.include_zero && n_val == 0)
                this.right = oldval;
            else
                this.right = n_val;
        },
    },
};
