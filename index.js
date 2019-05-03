/* global cc, VerticalScrollMap, TileLayer,
  AdventureMapLayer: true
 */

AdventureMapLayer = cc.Layer.extend({
  path: 'src/Modules/AdventureMap/data/',
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
      max_levels = 1080, // should come from config
      max_cycle = max_levels / 120,
      i;

    this.scrollableMap.setMapVariables(tile_config, max_cycle);
    for (i = 0; i < max_cycle; i++) {
      tile_config.forEach(function (tileData) {
        this.createMapWithTile(tileData.tile_id, tileData.repeat, undefined,
          i === max_cycle - 1);
      }.bind(this));
    }
    this.scrollableMap.setAdventureMapSize();
    this.addChild(this.scrollableMap);
  },

  createMapWithTile: function (tile, repeat, index, visible) {
    'use strict';

    var i, verLayout, mapData;

    for (i = 0; i < repeat; i++) {
      if (typeof index === 'undefined') {
        verLayout = new TileLayer();
        verLayout.tile_map = tile;
        verLayout.map_idx = i;
        verLayout.setVisible(visible);
        this.scrollableMap.addChild(verLayout);
      } else {
        verLayout = this.scrollableMap.getChildren()[index];
        verLayout.setVisible(visible);
      }
      tile = tile || verLayout.tile_map;
      mapData = cc.loader.getRes(this.path + tile + '.json');
      verLayout.initTilesInLayer(mapData, this.scrollableMap);
    }
  }
});
