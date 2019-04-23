export var canvas_bitmap = {
    // Non-reactive property, accessed via this.$options.some_prop
    is_drawing: false,
    last_point: [null, null],
    last_scroll_center: [null, null],
    props: {
        set_msg: {
            type:Function,
            default:(m)=>{},
        },
        scale: {
            type: Number,
            default: 1,
            validator: function(value) {
                return value > 0;
            },
        },
        width_height: {
            type: Array,
            default: function() {
                return [16, 16];
            },
            validator: function(value) {
                return Array.isArray(value)
                        && value.length == 2
                        && value[0] > 0
                        && value[1] > 0
                        && Number.isInteger(value[0])
                        && Number.isInteger(value[1]);
            },
        },
        try_save_pos: {
            default: null,
            validator: function(value) {
                return [
                    null, 
                    'bottom_left', 
                    'bottom_right',
                    'top_left',
                    'top_right'
                ].indexOf(value) !== -1;
            },
        },
        style_background_color: {
            type: String,
            default: '#ffffff00',
        },
        style_canvas_color: {
            type: String,
            default: 'white',
        },
        style_fill_color: {
            type: String,
            default: 'black',
        },
        style_class: {
            type: String,
            default: '',
        },
    },
    template: `
<div v-on:scroll='onscroll' v-bind:class='style_class' v-bind:style='{"position":"relative","width":"100%","height":"100%",overflow:overflow}'>
<iframe style='z-index:-1;position:absolute;width:100%;height:100%;' frameborder=0></iframe>
<div name='container-center' v-bind:style='{width:"100%",height:"100%","background-color":style_background_color}'>
    <canvas v-bind:width='canvas_width' v-bind:height='canvas_height' v-on:pointerdown.prevent.stop='start_drawing' v-on:touchstart.prevent.stop='start_drawing' v-on:touchend.prevent.stop='end_drawing' v-on:touchcancel.prevent.stop='end_drawing' v-on:touchmove.prevent.stop='draw' v-on:pointerup.prevent.stop='end_drawing' v-on:pointerleave.prevent.stop='end_drawing' v-on:pointermove.prevent.stop='draw' style='touch-action:none;position:absolute;display:block;left:0;right:0;top:0;bottom:0;z-index:0;'></canvas>
</div>
</div>
    `,
    data: function () {
        return {
            bitmap: [],
            canvas_width_height: [0, 0],
            overflow: 'hidden',
            cursor_pos: ['', ''],
        }
    },
    methods: {
        send_cursor_pos: function () {
            this.$emit('cursor_moved', this.cursor_pos);
        },
        // returns
        // { nwidth_nheight: [], is_width_less, is_equal }
        get_default_nwidth_nheight: function() {
            var win = this.$el.getElementsByTagName('iframe')[0].contentWindow;
            var [win_width, win_height] = [win.innerWidth, win.innerHeight];
            var [b_w, b_h] = [this.width, this.height];

            var result = {};
            result.is_hw_equal = (win_height == win_width/(b_w/b_h));
            result.is_width_less = (win_height > win_width/(b_w/b_h));
            // width < height
            if (result.is_width_less) {
                result.nwidth_nheight = [win_width, win_width/(b_w/b_h)];
            }
            // width > height
            else {
                result.nwidth_nheight = [win_height*(b_w/b_h), win_height];
            }
            return result;
        },
        onresize: function (e) {
            var canvas = this.$el.getElementsByTagName('canvas')[0];
            var container = canvas.parentNode;

            var default_scale_data = this.get_default_nwidth_nheight();
            var is_hw_equal = default_scale_data.is_hw_equal;
            var is_width_less = default_scale_data.is_width_less;
            var [n_width, n_height] = default_scale_data.nwidth_nheight;
            [n_width, n_height] = [n_width*this.scale, n_height*this.scale];

            if (is_width_less) {
                canvas.style.margin = 'auto 0';
                canvas.style['border-top'] 
                    = canvas.style['border-bottom'] 
                    = '1px solid black';
                canvas.style['border-left'] 
                    = canvas.style['border-right'] 
                    = '';
            }
            else if (!is_hw_equal){
                canvas.style.margin = '0 auto';
                canvas.style['border-left'] 
                    = canvas.style['border-right'] 
                    = '1px solid black';
                canvas.style['border-top'] 
                    = canvas.style['border-bottom'] 
                    = '';
            }
            else
                canvas.style.border = '';
            this.process_scrollbar();
            this.canvas_width_height = [n_width, n_height];
        },
        clear: function() {
            var bitmap = Array(this.height);
            for (var i = 0; i < bitmap.length; i++)
                bitmap[i] = Array(this.width).fill(0);
            this.bitmap = bitmap;
        },
        process_touch: function(ev, f) {
            if (ev.touches == undefined)
                return false;
            for (var i = 0; i < ev.changedTouches.length; i++) {
                f(ev.changedTouches[i]);
            }
            return true;
        },
        start_drawing: function(e) {
            if (this.process_touch(e, this.draw)) {
                return;
            }
            // left mouse button
            else if (e.button == 0) {
                this.$options.is_drawing = true;
                this.draw(e);
            }
            // Stop if other button was pressed when drawing
            else
                this.end_drawing()
        },
        end_drawing: function() {
            if (this.$options.is_drawing) {
                this.$options.is_drawing = false;
                this.$options.last_point = [null, null];
            }
            // Feature: indicate draw finish
            this.cursor_pos = ['', ''];
            this.send_cursor_pos();
        },
        draw: function(e) {
            if (this.process_touch(e, this.draw))
                return;
            this.set_msg('sizes: ' + e.clientX + ':' + e.clientY);
            var canvas = this.$el.getElementsByTagName('canvas')[0];
            var cell_width = this.canvas_width / this.width;
            var cell_height = this.canvas_height / this.height;
            var canvas_coords = canvas.getBoundingClientRect();
            var x = (e.clientX - canvas_coords.left) / cell_width;
            var y = (e.clientY - canvas_coords.top) / cell_height;
            x = Math.floor(x);
            y = Math.floor(y);
            var cursor_pos = [x, y];
            switch (this.try_save_pos) {
                case 'bottom_left':
                    cursor_pos[1] = this.height - cursor_pos[1] - 1;
                    break;
                case 'bottom_right':
                    cursor_pos[0] = this.width - cursor_pos[0] - 1;
                    cursor_pos[1] = this.height - cursor_pos[1] - 1;
                    break;
                case 'top_right':
                    cursor_pos[0] = this.width - cursor_pos[0] - 1;
                    break;
            }
            this.cursor_pos = cursor_pos;
            this.send_cursor_pos();
            if (this.$options.is_drawing) {
                //console.log([x, y]);
                var last = this.$options.last_point;
                if (last[0] != x || last[1] != y) {
                    this.swap_bitmap_point([x, y]);
                    this.$options.last_point = [x, y];
                }
            }
        },
        render: function() {
            var canvas = this.$el.getElementsByTagName('canvas')[0];
            var context = canvas.getContext('2d');
            context.fillStyle = this.style_canvas_color;
            context.fillRect(0, 0, canvas.width, canvas.height);
            // in canvas the coordinates are on grid!
            // 0---1---2---3
            // |   |   |   |
            // 1---+---+---+
            // |   |   |   |
            // 2---+---+---+
            //
            //      NOT THESE:
            //      +---+---+---+
            //      |0,0|1,0|2,0|
            //      +---+---+---+
            //      |1,0|1,1|1,2|
            //      +---+---+---+

            // border
            /*context.lineWidth = 1;
            context.strokeStyle = this.style_fill_color;
            context.beginPath();
            context.moveTo(0.5, 0.5);
            context.lineTo(0.5, this.canvas_height - 0.5);
            context.lineTo(this.canvas_width - 0.5, this.canvas_height - 0.5);
            context.lineTo(this.canvas_width - 0.5, 0.5);
            context.lineTo(0.5, 0.5);
            context.stroke();*/
            for (var i = 1; i < this.width; i++) {
                var x = 0.5 + Math.floor((this.canvas_width - 1) * i / this.width);
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, this.canvas_height);
                context.stroke();
            }
            for (var i = 1; i < this.height; i++) {
                var y = 0.5 + Math.floor((this.canvas_height - 1) * i / this.height);
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(this.canvas_width, y);
                context.stroke();
            }
            // cursor coordinates are from top-left
            // ceil() is used because floor()
            //  leaves 1px space at some zoom
            var cell_width = Math.ceil(this.canvas_width / this.width);
            var cell_height = Math.ceil(this.canvas_height / this.height);
            context.fillStyle = this.style_fill_color;
            for (var y = 0; y < this.height; y++)
                for (var x = 0; x < this.width; x++) {
                    if (this.bitmap[y][x]) {
                        context.fillRect(
                            Math.floor((this.canvas_width*x)/this.width), 
                            Math.floor((this.canvas_height*y)/this.height), 
                            cell_width, cell_height);
                    }
                }
        },
        swap_bitmap_point(xy_array) {
            var x = Math.floor(xy_array[0]);
            var y = Math.floor(xy_array[1]);
            var val = Number(!this.bitmap[y][x]);
            this.bitmap[y].splice(x, 1, val);
        },
        onscroll() {
            if (this.scale != 1)
                this.$options.last_scroll_center = [
                        (this.$el.scrollLeft + this.$el.clientWidth/2)
                                / this.$el.scrollWidth,
                        (this.$el.scrollTop + this.$el.clientHeight/2)
                                / this.$el.scrollHeight
                    ];
            //else
            //    this.$options.last_scroll_center = [null, null];
        },
        process_scrollbar () {
            if (this.scale == 1)
                return;
            var [goto_hor, goto_vert] = [0, 0];
            var last_scroll = this.$options.last_scroll_center;
            // last was scale = 1
            if (last_scroll[0] == null && last_scroll[1] == null) {
                goto_hor = 0.5;
                goto_vert = 0.5;
            }
            else
                [goto_hor, goto_vert] = last_scroll;
            this.$options.last_scroll_center = [goto_hor, goto_vert];
            this.$nextTick(()=>{
                this.$el.scrollLeft = this.$el.scrollWidth*goto_hor - this.$el.clientWidth/2;
                this.$el.scrollTop = this.$el.scrollHeight*goto_vert - this.$el.clientHeight/2;
            });
        },
    },
    computed: {
        canvas_width: function() {
            return this.canvas_width_height[0];
        },
        canvas_height: function() {
            return this.canvas_width_height[1];
        },
        width: function() {
            return this.width_height[0];
        },
        height: function() {
            return this.width_height[1];
        },
    },
    mounted: function() {
        var iframe = this.$el.getElementsByTagName('iframe')[0];
        iframe.contentWindow.onresize = this.onresize;
        this.onresize({'target': iframe.contentWindow});
    },
    created: function() {
        this.clear();
    },
    // onresize was reset after v-if even with <keep-alive>
    activated: function() {
        var w = this.$el.getElementsByTagName('iframe')[0].contentWindow;
        w.onresize = this.onresize;
    },
    watch: {
        bitmap: function(val, old_val) {
            this.render();
        },
        canvas_width_height: function(val, old_val) {
            // called after the entire view is updated
            this.$nextTick(this.render);
        },
        width_height: function(val, old_val){
            var [n_width, n_height] = val;
            var [width, height] = old_val;
            if (Number.isInteger(n_width) && Number.isInteger(n_height)
                    && n_width > 0 && n_height > 0) {
                if (n_width == width && n_height == height)
                    return;
                var bitmap = Array(n_height);
                for (var i = 0; i < n_height; i++) {
                    bitmap[i] = Array(n_width).fill(0);
                }
                //console.log(this.try_save_pos);
                if (this.try_save_pos != null) {
                    var max_i = height < n_height ? height : n_height;
                    var max_j = width < n_width ? width : n_width;
                    var of_src = [0, 0];
                    var of_dest = [0, 0];
                    // canvas coords start from top-left
                    switch (this.try_save_pos) {
                        case 'bottom_left':
                            if (height < n_height) {
                                of_src[1] = 0;
                                of_dest[1] = n_height - height;
                            }
                            else {
                                of_src[1] = height - n_height;
                                of_dest[1] = 0;
                            }
                            break;
                        case 'bottom_right':
                            if (width < n_width) {
                                of_src[0] = 0;
                                of_dest[0] = n_width - width;
                            }
                            else {
                                of_src[0] = width - n_width;
                                of_dest[0] = 0;
                            }
                            if (height < n_height) {
                                of_src[1] = 0;
                                of_dest[1] = n_height - height;
                            }
                            else {
                                of_src[1] = height - n_height;
                                of_dest[1] = 0;
                            }
                            break;
                        case 'top_left':
                            break;
                        case 'top_right':
                            if (width < n_width) {
                                of_src[0] = 0;
                                of_dest[0] = n_width - width;
                            }
                            else {
                                of_src[0] = width - n_width;
                                of_dest[0] = 0;
                            }
                            break;
                        default:
                            console.log('Error canvas resize (watch)!!');
                    }
                    for (var i = 0; i < max_i; i++)
                        for (var j = 0; j < max_j; j++)
                            bitmap[i + of_dest[1]][j + of_dest[0]]
                                = this.bitmap[i + of_src[1]][j + of_src[0]];
                }
                this.bitmap = bitmap;
                var iframe = this.$el.getElementsByTagName('iframe')[0];
                this.onresize({'target': iframe.contentWindow});
            }
        },
        scale: function (scale, old_scale) {
            var canvas = this.$el.getElementsByTagName('canvas')[0];
            if (scale == 1) {
                this.$options.last_scroll_center = [null, null];
                this.overflow = 'hidden';
                this.onresize({target: this.$el.getElementsByTagName('iframe')[0].contentWindow});
            }
            // Change scroll position to the same
            else {
                this.overflow = 'scroll';
                canvas.style.border = '';

                var default_scale_data = this.get_default_nwidth_nheight();
                var [n_width, n_height] = default_scale_data.nwidth_nheight;
                [n_width, n_height] = [n_width*scale, n_height*scale];
                this.process_scrollbar ();
                this.canvas_width_height = [n_width, n_height];
            }
        }
    },
};
