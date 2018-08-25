export var button = {
    props: {
        onclick: {
            default: ()=>{},
            type: Function,
        },
        style_class: {
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
        background_image: {
            type: String,
            default: null,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    template: `<button type='button' v-bind:class='style_class' v-bind:style='get_style_obj' v-on:click='onclick' v-bind:disabled='disabled'><slot></slot></button>`,
    computed: {
        get_style_obj: function() {
            var to_ret = {};
            if (this.width !== null)
                to_ret['width'] = this.width;
            if (this.height !== null)
                to_ret['height'] = this.height;
            var box_sizing = 'border-box';
            if (this.box_sizing !== null)
                box_sizing = this.box_sizing;
            to_ret['box-sizing'] = box_sizing;
            if (this.background_image !== null) {
                to_ret['background-image'] = 'url(' + this.background_image + ')';
                to_ret['background-size'] = '100% 100%';
            }
            to_ret['padding'] = 0;
            to_ret['flex-shrink'] = 0;
            return to_ret;
        }
    },
};
