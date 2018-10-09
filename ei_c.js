// Object that contains functions to import/export data in C-lang
// Each EI (export/import) object recieves the raw data
// of the bitmap (boolean array), reordered according to the start point
// The bitmap for 'export' additionally contains 'width'&'heigth'
// properties to make coding simplier
// (top-right, bottom-left... are already reordered on export and will be reordered at import automaically)
export var ei_c = {
    // The name of the module
    name: 'C',
    extention: 'c',// (whynot .h: no include guards required)
    additional_extentions: ['h'],
    // The exporter boolean options and their defaults
    options: {
        // the C-array will be 1-dimention( [] ), not 2d( [][] )
        // The text string in English 
        // must be provided at 'option_help_strings'
        plain_array: {
            // default value is required
            default: true,
        },
        tabs_to_4_spaces: {
            default: true,
        },
        use_hex: {
            default: true,
            // The option can be inactive
            // The validator returns error text string
            // or the default value (overriding 'default')
            // In case of error the new default can be set
            is_possible: function(bitmap) {
                if (bitmap.width % 8 != 0) {
                    // Attention! 'this' is the 'use_hex' object!
                    return {
                        error: 'The bitmap width must be divisible by 8, but ' + bitmap.width + ' % 8 = ' + bitmap.width % 8,
                        new_default: false
                    };
                }
                return true;
            },
        },
    },
    // Returns text file
    export: function(bitmap, options) {
        //console.log('###');
        //for (var k in options)
        //    console.log(k);
        var str = '';
        var tab_str = options.tabs_to_4_spaces ? '    ' : '\t';
        //console.log('bitmap[0][0] == ' + bitmap[0][0]);
        //console.log('hi' + tab_str + '-');
        var exp_width = options.use_hex ? bitmap.width / 8 : bitmap.width;
        var exp_height = bitmap.height;
        str += '#include <stdint.h>\n\n';
        str += 'const size_t width  = ' + exp_width + ';\n';
        str += 'const size_t height = ' + exp_height + ';\n';
        var size_str = options.plain_array 
                ? '[' + exp_width*exp_height + ']' 
                : '[' + exp_height + '][' + exp_width + ']';
        str += 'uint8_t bitmap' + size_str 
                + ' = {\n' + tab_str;
        if (!options.plain_array)
            str += '{ ';
        var value = 0;
        var to_add_str = '';
        var process_next = (w,h)=>{
            if (w != bitmap.width - 1)
                to_add_str += ', ';
            else if (h != bitmap.height - 1) {
                if (options.plain_array)
                    to_add_str += ',\n' + tab_str;
                else
                    to_add_str += ' },\n' + tab_str + '{ ';
            }
        };
        var val_to_hex = (v)=>{
            if (v >= 10)
                return String.fromCharCode('A'.charCodeAt(0) + v - 10);
            else
                return String(v);
        };
        var process_hex = (w,h) => {
            value = value*2 + (bitmap[h][w] ? 1 : 0);
            if ((w + 1) % 8 == 0) {
                //console.log('Enter! value = ' + value + ', w = ' + w);
                //to_add_str = value.toString(16).toUpperCase();
                to_add_str = '0x' + val_to_hex(value >> 4);
                to_add_str += val_to_hex(value % 16);

                process_next(w, h);
                str += to_add_str;
                value = 0;
            }
        };
        var process_bool = (w,h) => {
            value = bitmap[h][w] ? 1 : 0;
            to_add_str = String(value);

            process_next(w, h);
            str += to_add_str;
        };
        var process = options.use_hex ? process_hex : process_bool;
        for (var h = 0; h < bitmap.height; h++) {
            for (var w = 0; w < bitmap.width; w++) {
                //console.log('v = ' + value + ', b[h][w] = ' + bitmap[h][w]);
                process(w,h);
            }
        }
        if (!options.plain_array)
            str += ' }';
        str += '\n};\n';
        return str;
    },
    // Returns error string or null (on success)
    get_import_errors: function(text, error_strings) {
        // remove spaces
        var source = text.replace(/\s/g, '');
        // search for [...]={..}
        var reg1 = /(\[[1-9]\d*\]){1,2}=\{(((0x(\d|[a-fA-F]){2})|[01]),?)+\}/g
        var array_str = source.match(reg1);
        if (array_str === null)
            return error_strings['not_found'];
        else if (array_str.length != 1)
            return error_strings['found_many'];
        array_str = array_str[0];
        var [width, height] = [null, null];
        var sizes = array_str.match(/\[[1-9]\d*\]/g);
        if (sizes.length == 2) {
            // [123] -> 123
            height = Number(sizes[0].slice(1,-1));
            width = Number(sizes[1].slice(1,-1));
        }
        else {
            // look for 'width=N,height=N'
            sizes = source.match(/(width|height)=[1-9]\d*/g);
            //console.log(sizes);
            if (sizes == null || sizes.length < 1)
                return error_strings['width_height_not_found'];
            else if (sizes.length > 2)
                return error_strings['width_height_too_many'];
            else {
                if (sizes[0].slice(0,5) == 'width')
                    width = Number(sizes[0].slice(6));
                else if (sizes[0].slice(0,6) == 'height')
                    height = Number(sizes[0].slice(7));
                if (sizes[1].slice(0,5) == 'width')
                    width = Number(sizes[1].slice(6));
                else if (sizes[1].slice(0,6) == 'height')
                    height = Number(sizes[1].slice(7));
                if (width == null)
                    return error_strings['width_not_found'];
                else if (height == null)
                    return error_strings['height_not_found'];
            }
        }
        var array_elements = array_str.match(/\{.*\}/g)[0].slice(1,-1);
        var type = '';
        var reg_hex = /0x(\d|[a-fA-F]){2}/g;
        var reg_bin = /(^|,)[01]($|,)/g;
        //console.log(array_elements);
        // Check same format
        if (array_elements[1] == 'x') {
            type = 'hex';
            // if not hex only
            //console.log(array_elements.search(reg_bin));
            if (array_elements.search(reg_bin) != -1)
                return error_strings['non_equal_format'];
        }
        else {
            type = 'bin';
            // if not bin only
            if (array_elements.search(reg_hex) != -1)
                return error_strings['non_equal_format'];
        }
        // check the number of elements
        //console.log('width = ' + width + '\nheight = ' + height);
        var num_elements = 0;
        switch (type) {
            case 'hex':
                num_elements = array_str.match(reg_hex).length;
                //console.log(num_elements);
                if (num_elements != width * height)
                    return error_strings['number_not_match'];
                break;
            default:
                num_elements = array_elements.match(reg_bin).length;
                if (num_elements != width * height)
                    return error_strings['number_not_match'];
                break;
        }
        return null;
    },
    // Returns bitmap[height][width]
    // Remember that before import() the get_import_errors() will be run
    import: function(text) {
        // All checks must be already done using get_import_errors()
        var source = text.replace(/\s/g, '');
        var reg1 = /(\[[1-9]\d*\]){1,2}=\{(((0x(\d|[a-fA-F]){2})|[01]),?)+\}/g
        var array_str = source.match(reg1)[0];
        var [width, height] = [null, null];
        var sizes = array_str.match(/\[[1-9]\d*\]/g);
        if (sizes.length == 2) {
            // [123] -> 123
            height = Number(sizes[0].slice(1,-1));
            width = Number(sizes[1].slice(1,-1));
        }
        else {
            // look for 'width=N,height=N'
            sizes = source.match(/(width|height)=[1-9]\d*/g);
            if (sizes[0].slice(0,5) == 'width')
                width = Number(sizes[0].slice(6));
            else if (sizes[0].slice(0,6) == 'height')
                height = Number(sizes[0].slice(7));
            if (sizes[1].slice(0,5) == 'width')
                width = Number(sizes[1].slice(6));
            else if (sizes[1].slice(0,6) == 'height')
                height = Number(sizes[1].slice(7));
        }
        var array_elements = array_str.match(/\{.*\}/g)[0].slice(1,-1);
        var reg_hex = /0x(\d|[a-fA-F]){2}/g;
        var reg_bin = /[01]/g;
        var bitmap = Array(height);
        for (var i = 0; i < bitmap.length; i++)
            bitmap[i] = Array(width).fill(0);
        // fill bitmap!
        if (array_elements[1] == 'x') {
            // hex
            array_elements = array_elements.match(reg_hex);
            for (var h = 0; h < height; h++)
                for (var w = 0; w < width; w++) {
                    var pos = h*width + w;
                    var num = parseInt(array_elements[pos].slice(2), 16);
                    for (var i = 0; i < 8; i++) {
                        bitmap[h][w*8 + i] = num & (1 << (7 - i));
                    }
                }
        }
        else {
            // bin
            array_elements = array_elements.match(reg_bin);
            for (var h = 0; h < height; h++)
                for (var w = 0; w < width; w++) 
                    bitmap[h][w] = Number(array_elements[pos]);
        }
        return bitmap;
    },
    // option helps for different locales
    option_help_strings: {
        'en': {
            'plain_array': 'Plain array',
            'tabs_to_4_spaces': 'Tabs to 4 spaces',
            'use_hex': 'Use %02X style',
        },
        'ru': {
            'plain_array': 'Сплошной массив',
            'tabs_to_4_spaces': '4 пробела вместо табуляции',
            'use_hex': 'Hex-стиль',
        },
    },
    // errors for different locales
    error_strings: {
        'en': {
            'not_found': 'No valid C-array found!',
            'found_many': 'More than 1 array found!',
            'width_height_not_found': 'For plain arrays \'width\' and \'height\' integers additionally required!',
            'width_height_too_many': 'Too many \'width\'/\'height\' mentioned!',
            'width_not_found': 'Width variable not found!',
            'height_not_found': 'Height variable not found!',
            'non_equal_format': 'All elements in array must have the same format!',
            'number_not_match': 'The number of elements doesn`t match width*height!',
        },
        'ru': {
            'not_found': 'Корректный массив не найден!',
            'found_many': 'Найдено более 1 массива!',
            'width_height_not_found': 'Для сплошных массивов целые \'width\' и \'height\' необходимо указать!',
            'width_height_too_many': 'Слишком много указанных \'width\' и \'height\'!',
            'width_not_found': 'Ширина не найдена!',
            'height_not_found': 'Высота не найдена!',
            'non_equal_format': 'Все элементы массива должны быть одного формата!',
            'number_not_match': 'Количество элементов не равно width*height!',
        },
    },
};
