/* global console, process, require */

var fs = require('fs'),
  data, retval, file,
  get_imports = function (file) {
    'use strict';

    var out, out_len, line, out_str, remaining, i,
     import_arr = [],
     import_processed = false;

    out_str = fs.readFileSync(file, 'utf8');
    out = out_str.split('\n');
    out_len = out.length;
    i = 0;

    while (i++ < out_len - 1) {
      line = out[i];
      if (line.search('import') !== -1) {
        import_processed = true;
        line = line.replace(';', '');
        if (line.search(' as ') !== -1) {
          import_arr.push(line.split(' as ')[1].trim());
        } else {
          import_arr.push(line.split(' ')[1].trim());
        }
      } else if (import_processed && line !== '') {
        remaining = out.slice(i, out.length);
        break;
      }
    }
    return {remaining: remaining,
            import_arr: import_arr};
  },
  process_imports = function (data, file) {
    'use strict';

    var remaining,
      ret = 0;

    remaining = data.remaining.join('\n');
    data.import_arr.forEach(function (import_module) {
      if (remaining.search(import_module) === -1) {
        console.log('Unused import ' + import_module + ' in file ' + file);
        ret++;
      }
    });
    return ret;
  };

file = process.argv[2];
if (file.search('src/') !== -1) {
  data = get_imports(file);
  if (data.import_arr.length > 0) {
    retval = process_imports(data, file);
  }
}
process.exit(retval);
