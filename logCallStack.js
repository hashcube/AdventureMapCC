
/* global console, process, require */

var fs = require('fs'),
  _ = require('underscore'),
  exec = require('child_process').exec,
  child,
  files,
  replaceables= {},
  writeFiles = function (replaceables) {
cc.log(" {call-stack} :: ./logCallStack.js :: writeFiles ");
    _.each(replaceables, function (data, path) {
      file = fs.readFileSync(path, 'utf8');
      file = file.split('\n');
      lines = "";

      _.each(file, function (line, number) {

        matched = _.findWhere(data, {
          line_number: number
        });
        
        lines = lines + "\n" + line;
        if(matched) {
          lines = lines + "\n" + matched.new_line;
        }
      });
      
      console.log(lines);

      file_writable = fs.createWriteStream('./' + path);
      file_writable.write(lines);
      file_writable.end();
      file = undefined;
      lines = "";
    });
  };
  logCallStack = function (files) {
cc.log(" {call-stack} :: ./logCallStack.js :: logCallStack ");
    _.each(files, function (path) {
      var file = fs.readFileSync(path, 'utf8');
      path_stripped = path,
      file = file.split('\n'),
      match = undefined;

      _.each(file, function (line, line_number) {
        match = line.match(/(\S*)(:|\s{1}=)\s{1}(function{1})/);

        if(match) {
          log_str = '" {call-stack} :: ' + path_stripped + ' :: ' + match[1] + ' "';
          new_line_str = "cc.log(" + log_str + ");";


          console.log(new_line_str);

          if(replaceables[path]) {
            replaceables[path].push({
              line_number: line_number,
              new_line: new_line_str
            });
          } else {
            replaceables[path] = [{
              line_number: line_number,
              new_line: new_line_str
            }];
          }

          
        }
        match = undefined;
      });
    });

    // console.log(replaceables);
    writeFiles(replaceables);
  };
  
  child = exec('find . -follow',
    function (error, stdout, stderr) {
      files = stdout;

      files = files.split('\n');
      files = _.filter(files, function (file_path) {
        if (file_path.search('.js') > 0) {
          return true;
        }
      });

      logCallStack(files);
    });