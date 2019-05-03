/* global cc, ccui, res,
  TileLayer: true, TEXT_TAG: true
 */

TEXT_TAG = 0;

TileLayer = ccui.Widget.extend({
  map_idx: -1,
  tile_map: '',
  ctor: function () {
    'use strict';

    this._super();
    return true;
  },

  initTilesInLayer: function (mapData, map) {
    'use strict';

    var verLayoutWidth = mapData.tileWidth * mapData.rowLength,
      verLayoutHeight = mapData.colLength * mapData.tileHeight,
      horLayoutWidth = mapData.tileWidth * mapData.rowLength,
      horLayoutHeight = mapData.tileHeight,
      horSize = cc.size(horLayoutWidth, horLayoutHeight),
      verSize = cc.size(verLayoutWidth, verLayoutHeight),
      tile_layer;

    this.map = map;
    this.setContentSize(verSize);

    if (this.visible) {
      cc.spriteFrameCache.addSpriteFrames(res[this.tile_map]);
      tile_layer = cc.pool.getFromPool(TileLayer);
      if (tile_layer) {
        this.reCreateTileLayer(mapData, horSize, verSize, tile_layer);
      } else {
        this.createTileLayer(mapData, horSize, verSize);
      }
      cc.spriteFrameCache.removeSpriteFramesFromFile(res[this.tile_map]);
    }
  },

  reCreateTileLayer: function (mapData, horSize, verSize, tile_layer) {
    'use strict';

    var verLayout, horLayout, tile, i, j,
      tile_added = 0;

    verLayout = tile_layer.getChildren()[0];
    verLayout.setContentSize(verSize);
    verLayout.retain();
    verLayout.removeFromParent();
    this.addChild(verLayout);
    for (i = 0; i < verLayout.getChildrenCount(); i++) {
      horLayout = verLayout.getChildren()[i];
      for (j = 0; j < horLayout.getChildrenCount(); j++) {
        tile = horLayout.getChildren()[j];
        tile.loadTexture(i + '_' + j + '.png',
          ccui.Widget.PLIST_TEXTURE);
        this.setNode(mapData, tile_added, tile);
        tile_added += 1;
      }
    }
  },

  createTileLayer: function (mapData, horSize, verSize) {
    'use strict';

    var verLayout, horLayout, tile, i, j,
      tile_added = 0;

    verLayout = new ccui.Layout();
    verLayout.setLayoutType(ccui.Layout.LINEAR_VERTICAL);
    verLayout.setContentSize(verSize);

    for (i = 0; i < mapData.colLength; i++) {
      horLayout = new ccui.Layout();

      horLayout.setLayoutType(ccui.Layout.LINEAR_HORIZONTAL);
      horLayout.setContentSize(horSize);
      for (j = 0; j < mapData.rowLength; j++) {
        tile = new ccui.ImageView(i + '_' + j + '.png',
          ccui.Widget.PLIST_TEXTURE);
        this.setNode(mapData, tile_added, tile);
        horLayout.addChild(tile);
        tile_added += 1;
      }
      verLayout.addChild(horLayout);
    }
    this.addChild(verLayout);
  },

  setNode: function (mapData, tile_number, parent) {
    'use strict';

    var node, data, ms_number, node_posx, node_posy,
      ms, ms_mpx, tile_idx, ms_number_text, listener,
      ms_in_map, map;

    parent.removeAllChildren();
    data = _.find(mapData.nodes, function (obj) {
      return obj.map === tile_number;
    });
    if (data) {
      node = new cc.Sprite(res.msicon);
      map = this.map;
      node.attr({
        x: data.x,
        y: data.y
      });

      tile_idx = Number(this.tile_map.split('_')[1]);
      ms_in_map = mapData.nodes.length * mapData.repeat;
      ms = data.node + mapData.nodes.length *
        (mapData.repeat - this.map_idx - 1);
      ms = tile_idx === 1 ? ms : ms_in_map + ms;
      ms_mpx = map.max_cycle -
        Math.floor(map.getChildIndex(this) / map.cycle_length);
      ms_number = (ms_mpx - 1) * (2 * ms_in_map) + ms;

      ms_number_text = new cc.LabelTTF(ms_number,
        cc._mGetCustomFontName(res.Sansita_Bold));
      ms_number_text.setTag(TEXT_TAG);
      node_posx = node.getContentSize().width / 2;
      node_posy = node.getContentSize().height / 4;
      ms_number_text.setPosition(cc.p(node_posx, node_posy));
      node.addChild(ms_number_text);
      listener = cc.EventListener.create({
        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        onTouchBegan: this.onMilestoneSelected
      });
      cc.eventManager.addListener(listener, node);
      parent.addChild(node);
    }
  },

  onMilestoneSelected: function (touch, event) {
    'use strict';

    var target = event.getCurrentTarget(),
      point = touch.getLocation(),
      locationInNode = target.convertToNodeSpace(point),
      targetSize = target.getContentSize(),
      rect = cc.rect(0, 0, targetSize.width, targetSize.height),
      ms_number;

    if (cc.rectContainsPoint(rect, locationInNode)) {
      ms_number = target.getChildByTag(TEXT_TAG).getString();
      cc.eventManager.dispatchCustomEvent('ms_selected', {ms: ms_number});
    }
    return true;
  },

  unuse: function () {
    'use strict';

    this.setVisible(false);
  }
});
