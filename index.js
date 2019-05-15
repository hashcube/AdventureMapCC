/* global cc, VerticalScrollMap, TileLayer,
  AdventureMapLayer: true, res
 */

AdventureMapLayer = cc.Layer.extend({
  path: 'src/data/adventuremap/',
  ctor: function () {
    'use strict';

    this._super();
    this.scrollableMap = new VerticalScrollMap();

    return true;
  },

  build: function () {
    'use strict';

    var tile_config = cc.loader.getRes(this.path + 'tile_config.json'),
      map = this.scrollableMap,
      max_ms_no = 58;//user.get('max_ms_no');

    this.initializeMap(tile_config, max_ms_no);
    map.setAdventureMapSize();
    this.addChild(map);
  },

  initializeMap: function (tile_config, max_ms_no) {
    'use strict';

    var i, j, k, tileData, tile, repeat, visible_data,
      mapData, horLayout, visible, map, colLength, range;

    visible_data = this.getCycleAndRepeat(max_ms_no, tile_config);
    for (k = 0; k < tile_config.length; k++) {
      tileData = tile_config[k];
      tile = tileData.tile_id;
      repeat = tileData.repeat;
      range = tileData.range;
      map = this.scrollableMap;

      mapData = cc.loader.getRes(this.path + tile + '.json');
      mapData.max_ms_no = max_ms_no;
      cc.spriteFrameCache.addSpriteFrames(res[tile], res[tile + '_img']);
      colLength = mapData.colLength;

      for (i = repeat; i > 0; i--) {
        for (j = 0; j < colLength; j++) {
          horLayout = new TileLayer(mapData);
          horLayout.tile_map = tile;
          horLayout.map_idx = i - 1;
          horLayout.row_idx = j;
          horLayout.prev_max_ms = (range) ? range.min - 1 : 0;
          visible = this.getMapVisibility(k, i, repeat, visible_data);
          horLayout.setVisible(visible);
          horLayout.initTilesInLayer(mapData, map);
          map.addChild(horLayout);
        }
      }
    }
  },

  getCycleAndRepeat: function (max_ms_no, tile_config) {
    var tile_data, ms_in_map, repeat_id, buffer_ms, repeat,
      data = {};

    tile_data = _.find(tile_config, function (obj) {
      var range = obj.range;
      if (range) {
        return range.min <= max_ms_no && range.max >= max_ms_no;
      }
    });
    if (tile_data) {
      ms_in_map = Math.floor((tile_data.range.max - tile_data.range.min + 1) / tile_data.repeat);
      buffer_ms = max_ms_no - tile_data.range.min;
      repeat_id = Math.floor(buffer_ms / ms_in_map) + 1;
      repeat = tile_data.repeat;
      data.cycle = tile_config.indexOf(tile_data);
      data.max_repeat = repeat_id + 1;
      data.min_repeat = repeat_id - 1;
      if (data.max_repeat > repeat) {
        data.extra_cycle = data.cycle - 1;
      } else if (data.min_repeat <= 0) {
        data.extra_cycle = data.cycle + 1;
      }
      if (data.extra_cycle >= tile_config.length) {
        data.extra_cycle = undefined;
        data.min_repeat -= 1;
      } else if (data.extra_cycle <= 0) {
        data.extra_cycle = 2;
        data.max_repeat += 1;
      }
      data.repeat_id = repeat_id;
    }
    return data;
  },

  getMapVisibility: function (cycle, repeat, max_repeat, visible_data) {
    'use strict';

    var visible_cycle = visible_data.cycle,
      extra_cycle = visible_data.extra_cycle,
      visible_repeat_max = visible_data.max_repeat,
      visible_repeat_min = visible_data.min_repeat,
      isInRange, isVisible, isInCycle;

    isInCycle = cycle === visible_cycle;
    if (extra_cycle && isInCycle) {
      isInRange = repeat < visible_repeat_max && repeat > visible_repeat_min;
    } else if (isInCycle && repeat <= max_repeat / 2) {
      isInRange = repeat < visible_repeat_max && repeat >= visible_repeat_min;
    } else if (isInCycle && repeat > max_repeat / 2) {
      isInRange = repeat <= visible_repeat_max && repeat > visible_repeat_min;
    }
    isVisible = isInCycle && isInRange;

    if (!isVisible && extra_cycle) {
      if (extra_cycle < visible_cycle) {
        isInCycle = (cycle < visible_cycle) && (cycle >= visible_cycle - 2);
        isInRange = repeat === 1;
      } else {
        isInCycle = (cycle > visible_cycle) && (cycle <= visible_cycle + 2);
        isInRange = repeat === max_repeat;
      }
      isVisible = isInCycle && isInRange;
    }
    return isVisible;
  },

  createMapWithTile: function (index) {
    'use strict';

    var horLayout, mapData,
      self = this,
      map = self.scrollableMap;

    horLayout = map.map_children[index];
    horLayout.setVisible(true);
    mapData = cc.loader.getRes(self.path + horLayout.tile_map + '.json');
    horLayout.initTilesInLayer(mapData, map);
  }
});
