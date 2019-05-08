/* global cc, VerticalScrollMap, TileLayer,
  AdventureMapLayer: true, Config, res
 */

AdventureMapLayer = cc.Layer.extend({
  path: 'src/data/adventuremap/',
  ctor: function () {
    'use strict';

    this._super();
    cc.log('Adventure Map initialized!!');
    this.scrollableMap = new VerticalScrollMap();

    return true;
  },

  build: function () {
    'use strict';

    var tile_config = cc.loader.getRes(this.path + 'tile_config.json'),
      max_levels = Config.max_levels,
      max_cycle = max_levels / 120;

    this.scrollableMap.setMapVariables(tile_config, max_cycle);
    this.initializeMap(tile_config, max_cycle);
    this.scrollableMap.setAdventureMapSize();
    this.addChild(this.scrollableMap);
  },

  initializeMap: function (tile_config, max_cycle) {
    'use strict';

    var i, j, k, l, tileData, tile, repeat,
      mapData, horLayout, visible;

    for (k = max_cycle; k > 0; k--) {
      for (l = 0; l < tile_config.length; l++) {
        tileData = tile_config[l];
        tile = tileData.tile_id;
        repeat = tileData.repeat;

        mapData = cc.loader.getRes(this.path + tile + '.json');
        cc.spriteFrameCache.addSpriteFrames(res[tile], res[tile + '_img']);

        for (i = 0; i < repeat; i++) {
          for (j = 0; j < mapData.colLength; j++) {
            horLayout = new TileLayer();
            horLayout.tile_map = tile;
            horLayout.map_idx = i;
            horLayout.row_idx = j;
            horLayout.map_mpx = k;
            visible = this.getMapVisibility(k, max_cycle, tile, i, repeat);
            horLayout.setVisible(visible);
            horLayout.initTilesInLayer(mapData, this.scrollableMap);
            this.scrollableMap.addChild(horLayout);
          }
        }
      }
    }
  },

  getMapVisibility: function (k, max_cycle, tile, i, repeat) {
    'use strict';

    return k === 1 && tile === 'map_1' && i > repeat - 3;
  },

  createMapWithTile: function (index) {
    'use strict';

    var horLayout, mapData,
      self = this;

    horLayout = self.scrollableMap.getChildren()[index];
    horLayout.setVisible(true);
    mapData = cc.loader.getRes(self.path + horLayout.tile_map + '.json');
    horLayout.initTilesInLayer(mapData, self.scrollableMap);
  }
});
