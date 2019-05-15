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

  build: function (opts) {
    'use strict';

    var tile_config = cc.loader.getRes(this.path + 'tile_config.json'),
      map = this.scrollableMap,
      max_ms_no = opts.ms;

    this.initializeMap(tile_config, max_ms_no);
    map.setAdventureMapSize();
    this.addChild(map);
  },

  initializeMap: function (tile_config, max_ms_no) {
    'use strict';

    var i, j, k, tileData, tile, repeat, mapData,
      horLayout, map, colLength, range;

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
          horLayout.prev_max_ms = range ? range.min - 1 : 0;
          horLayout.setVisible(false);
          horLayout.build(mapData, map);
          map.addChild(horLayout);
        }
      }
    }
  },

  createMapWithTile: function (index) {
    'use strict';

    var horLayout, mapData,
      self = this,
      map = self.scrollableMap;

    horLayout = map.map_children[index];
    horLayout.setVisible(true);
    mapData = cc.loader.getRes(self.path + horLayout.tile_map + '.json');
    horLayout.reCreateTileLayer(mapData);
  }
});
