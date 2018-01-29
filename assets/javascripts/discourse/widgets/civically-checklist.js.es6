import { createWidget } from 'discourse/widgets/widget';
import RawHtml from 'discourse/widgets/raw-html';
import DiscourseURL from 'discourse/lib/url';
import { iconNode } from 'discourse-common/lib/icon-library';
import { emojiUnescape } from 'discourse/lib/text';
import { ajax } from 'discourse/lib/ajax';
import { h } from 'virtual-dom';

createWidget('checklist-item', {
  tagName: 'li',
  buildKey: (attrs) => `${attrs.item.id}-checklist-item`,

  buildClasses(attrs) {
    let classes = 'checklist-item';
    if (attrs.next) {
      classes += ' next';
    }
    if (!attrs.item.active) {
      classes += ' inactive';
    }
    if (attrs.item.checked) {
      classes += ' checked';
    }
    return classes;
  },

  defaultState(attrs) {
    return {
      showDetail: false,
      checked: attrs.item.checked,
      checkable: attrs.item.checkable,
      active: attrs.item.active,
    };
  },

  html(attrs, state) {
    const icon = state.checked ? 'check-circle' : 'circle-o';
    let className = 'check-toggle';
    let contents = [];

    if (state.checkable) {
      className += ' checkable';
      contents.push(this.attach('button', {
        icon,
        className,
        action: 'toggleCheck',
      }));
    } else {
      contents.push(h('div.check-toggle', iconNode(icon, { className })));
    }

    let rightContents = [
      this.attach('button', {
        className: 'check-title',
        contents: h('span', attrs.item.title),
        action: 'showDetail'
      })
    ];

    if (state.showDetail) {
      rightContents.push(h('div.check-detail',
        new RawHtml({ html: `<span>${emojiUnescape(attrs.item.detail)}</span>` })
      ));
    }

    contents.push(h('div.right-contents', rightContents));

    return contents;
  },

  showDetail() {
    if (!this.attrs.item.active) return;
    this.state.showDetail = !this.state.showDetail;
    this.scheduleRerender();
  }
});

createWidget('bookmark-item', {
  tagName: 'li',

  html(attrs) {
    const title = attrs.topic.get('fancyTitle');
    return h('span', title);
  },

  click() {
    const url = this.attrs.topic.get('url');
    DiscourseURL.routeTo(url);
  }
});

export default createWidget('civically-checklist', {
  tagName: 'div.civically-checklist.widget-container',
  buildKey: () => 'civically-checklist',

  defaultState() {
    return {
      currentType: 'checklist',
      checklist: [],
      bookmarks: [],
      loading: true
    };
  },

  getChecklist() {
    const username = this.currentUser.username;
    ajax(`/checklist/${username}`).then((items) => {
      this.state.checklist = items || [];
      this.state.loading = false;
      this.scheduleRerender();
    });
  },

  getBookmarks() {
    this.store.findFiltered('topicList', {
      filter: 'bookmarks'
    }).then((result) => {
      this.state.bookmarks = result.topics || [];
      this.state.loading = false;
      this.scheduleRerender();
    });
  },

  buildChecklist() {
    let next = false;
    return this.state.checklist.map((item) => {
      let itemAttrs = { item };
      if (!item.checked && next === false) {
        next = true;
        itemAttrs['next'] = next;
      }
      return this.attach('checklist-item', itemAttrs);
    });
  },

  buildBookmarks() {
    const bookmarks = this.state.bookmarks;
    let list = [ h('div.no-items', I18n.t('civically.list.none')) ];

    if (bookmarks.length > 0) {
      list = bookmarks.map((topic) => {
        return this.attach('bookmark-item', { topic });
      });
    }

    return list;
  },

  buildTitle(type) {
    const currentType = this.state.currentType;
    const active = currentType === type;

    let classes = 'list-title';
    if (active) classes += ' active';

    let attrs = {
      action: 'showList',
      actionParam: type,
      title: `user.${type}.help`,
      label: `user.${type}.title`,
      className: classes
    };

    return this.attach('link', attrs);
  },

  html(attrs, state) {
    const user = this.currentUser;

    let contents = [
      h('div.widget-label', user.username),
      h('div.widget-multi-title', [
        this.buildTitle('checklist'),
        this.buildTitle('bookmarks')
      ])
    ];

    let listContents = [];

    if (state.loading) {
      if (state.currentType === 'checklist') {
        this.getChecklist();
      } else {
        this.getBookmarks();
      }
      listContents.push(h('div.spinner.small'));
    } else {
      if (state.currentType === 'checklist') {
        listContents.push(this.buildChecklist());
      } else {
        listContents.push(this.buildBookmarks());
      }
    }

    let classes = 'widget-list';

    if (state.currentType === 'checklist') {
      classes += '.no-borders';
    }

    contents.push(h(`div.${classes}`, h('ul', listContents)));

    return contents;
  },

  showList(currentType) {
    this.state.loading = true;
    this.state.currentType = currentType;
    this.scheduleRerender();
  }
});
