/* global require */

var fs = require('fs'),
  _ = require('underscore'),
  readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  }),
  mapRepeats = [],
  noOfMaps, maxLevels,
  getNoOfMaps = function () {
    readline.question(`No of maps: `, function (number) {
      noOfMaps = number;
      getMapRepeats(0);
    });
  },
  getMapRepeats = function (name_index) {
    readline.question(`Enter repeat for map_${name_index + 1}: `,
      function (number) {
      mapRepeats.push(number);
      if (name_index === noOfMaps - 1) {
        getMaxLevels();
      } else {
        getMapRepeats(name_index + 1);
      }
    });
  },
  getMaxLevels = function () {
    readline.question(`Enter maximum levels: `, function (number) {
      maxLevels = number;
      console.log(`\n\nGenerating...\n`);
      readline.close();
      generateTileConfig();
    });
  },
  generateTileConfig = function () {
    var coming_soon = {
        tile_id: 'coming_soon',
        repeat: 1
      },
      ms_in_each_cycle = 0,
      ms_in_each_map = 0,
      map_data = [],
      map_id = 0,
      tile_config = [],
      i, j, data, perfect_fit, remaining, temp_data;

    for (i = 0; i < noOfMaps; i++) {
      data = {};
      ms_in_each_cycle += LEVELS_IN_MAP * mapRepeats[i];

      data = {
        tile_id: 'map_' + (i + 1),
        repeat: parseInt(mapRepeats[i])
      };
      map_data.push(data);

      data = {
        tile_id: 'bridge_' + (i + 1),
        repeat: 1
      };
      map_data.push(data);
    }

    perfect_fit = Math.floor(maxLevels / ms_in_each_cycle);
    remaining = maxLevels % ms_in_each_cycle;

    for (i = 0; i < perfect_fit; i++) {
      for (j = 0; j < map_data.length; j++) {
        temp_data = _.extend({}, map_data[j]);
        ms_in_each_map = LEVELS_IN_MAP * map_data[j].repeat;
        if (j % 2 === 0) {
          map_id += 1;
          temp_data.map_id = map_id;
          temp_data.range = {};
          temp_data.range.max = map_id * ms_in_each_map;
          temp_data.range.min = temp_data.range.max - (ms_in_each_map) + 1;
        }
        if (remaining !== 0 || j !== map_data.length - 1 ||
          i !== perfect_fit - 1) {
          tile_config.push(temp_data);
        }
      }
    }

    j = 0;
    while (remaining && j < map_data.length) {
      temp_data = _.extend({}, map_data[j]);
      ms_in_each_map = LEVELS_IN_MAP * map_data[j].repeat;
      if (j % 2 === 0) {
        map_id += 1;
        temp_data.map_id = map_id;
        temp_data.range = {};
        temp_data.range.max = map_id * ms_in_each_map;
        temp_data.range.min = temp_data.range.max - (ms_in_each_map) + 1;
        remaining -= ms_in_each_map;
      }
      tile_config.push(temp_data);
      j += 1;
    }

    tile_config.push(coming_soon);
    fs.writeFile('tile_config.json',
      JSON.stringify(tile_config.reverse(), null, 2), function (err) {
      if (err) {
        return console.log(err);
      }
      console.log('The file is saved in project folder as tile_config.json.');
    });
  },

  runScript = function () {
    getNoOfMaps();
  };

const LEVELS_IN_MAP = 10;

runScript();
