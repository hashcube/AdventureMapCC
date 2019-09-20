/* global cc, ccui, adv_map: true
*/

adv_map.layers.TileLayer = ccui.Widget.extend({
  ms_number: 0,
  map_idx: -1,
  row_idx: -1,
  prev_map_max_range: -1,
  tile_map: '',
  chapter: -1,
  hor_size: null,
  map_data: null,
  node_settings: null,
  scrollable_map: null,
  node_position: null,
  ctor: function (map_data) {
    'use strict';

    var hor_layout_width = map_data.tileWidth * map_data.rowLength,
      hor_layout_height = map_data.tileHeight;

    this._super();
    this.extra_data = {};
    this.hor_size = cc.size(hor_layout_width, hor_layout_height);
    this.map_data = map_data;
    return true;
  },

  build: function (map_data, map, node_settings) {
    'use strict';

    var hor_size = this.hor_size;

    this.scrollable_map = map;
    this.node_settings = node_settings;
    this.setContentSize(hor_size);
    this.generateTileLayer(map_data);
  },

  generateTileLayer: function (map_data) {
    'use strict';

    var j, tile_added, prev_tiles_added, data;

    prev_tiles_added = this.row_idx * map_data.rowLength;
    for (j = 0; j < map_data.rowLength; j++) {
      tile_added = prev_tiles_added + j;
      data = this.checkInArray(map_data.nodes, tile_added);
      if (data) {
        this.setMilestone(data, map_data);
        if (this.ms_number === map_data.ms) {
          this.scrollable_map.setFocusChild(this);
        }
      }
    }
  },

  reCreateTileLayer: function (map_data) {
    'use strict';

    var tile, url, i, container, tile_added, prev_tiles_added,
      tile_layer, tile_map, row_idx;

    tile_layer = cc.pool.getFromPool(adv_map.layers.TileLayer);
    container = tile_layer.getChildByTag(adv_map.constants.tags.container);

    if (container) {
      prev_tiles_added = this.row_idx * map_data.rowLength;
      tile_map = this.tile_map;
      row_idx = this.row_idx;
      for (i = 0; i < container.getChildrenCount(); i++) {
        tile = container.getChildren()[i];
        tile_added = prev_tiles_added + i;
        url = tile_map + '_' + row_idx + '_' + i + '.png';
        tile.loadTexture(url, ccui.Widget.PLIST_TEXTURE);
      }

      container.retain();
      container.removeFromParent();
      this.addChild(container, adv_map.constants.z_index.container);
      this.addChapters();
    } else {
      this.map_data = map_data;
      this.createTileLayer();
    }
  },

  createTileLayer: function () {
    'use strict';

    var tile, j, url, container, tile_added, prev_tiles_added, map_data,
      tile_map, row_idx;

    map_data = this.map_data;
    container = new ccui.Layout();
    container.setLayoutType(ccui.Layout.LINEAR_HORIZONTAL);
    container.setContentSize(this.hor_size);
    this.addChild(container, adv_map.constants.z_index.container);
    container.setTag(adv_map.constants.tags.container);
    prev_tiles_added = this.row_idx * map_data.rowLength;
    tile_map = this.tile_map;
    row_idx = this.row_idx;
    for (j = 0; j < map_data.rowLength; j++) {
      url = tile_map + '_' + row_idx + '_' + j + '.png';
      tile_added = prev_tiles_added + j;
      tile = new ccui.ImageView(url, ccui.Widget.PLIST_TEXTURE);
      container.addChild(tile);
    }
    this.addChapters();
  },

  addChapters: function () {
    'use strict';

    var chapter,
      col_length = this.map_data.colLength,
      chapter_settings = this.node_settings.chapter_settings;

    if (chapter_settings && this.tile_map.indexOf('bridge') !== -1 &&
      this.row_idx === col_length - 1) {
      chapter = new adv_map.layers.ChapterLayer({
        settings: chapter_settings,
        size: this.hor_size,
        chapter: this.chapter
      });
      this.addChild(chapter, adv_map.constants.z_index.chapter);
    }
  },

  addTagById: function (id) {
    'use strict';

    var extra, old_extra;

    if (this.node_position) {
      extra = new this.node_settings.extras[id]({
        ms: this.ms_number,
        node_pos: this.node_position,
        size: cc.size(105, 109)
      });
      extra.setName(id);
      if (extra.unique) {
        old_extra = this.getChildByName(id);
        if (old_extra) {
          this.removeChild(old_extra);
        }
      }
      this.addChild(extra);
      extra.setTouchEnabled(true);
      extra.addTouchEventListener(function (target, type) {
        if (type === ccui.Widget.TOUCH_ENDED) {
          cc.eventManager.dispatchCustomEvent('tag_selected', {
            tag: extra.node_tag,
            ms: extra.getParent().ms_number
          });
        }
      }, extra);
    }
  },

  setMilestone: function (data, map_data) {
    'use strict';

    var ms_in_map, ms, ms_number;

    ms_in_map = map_data.nodes.length * map_data.repeat;
    ms = data.node + map_data.nodes.length * this.map_idx;
    ms_number = this.prev_map_max_range + ms;
    this.ms_number = ms_number;
    this.node_position = cc.p(data.x, data.y);
  },

  checkInArray: function (array, condition) {
    'use strict';

    return _.find(array, function (obj) {
      return obj.map === condition;
    });
  },

  hasContainer: function () {
    'use strict';

    return !!this.getChildByTag(adv_map.constants.tags.container);
  },

  unuse: function () {
    'use strict';

    this.setVisible(false);
  }
});
