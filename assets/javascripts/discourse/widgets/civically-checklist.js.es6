import { createWidget } from 'discourse/widgets/widget';
import RawHtml from 'discourse/widgets/raw-html';
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

export default createWidget('civically-checklist', {
  tagName: 'div.civically-checklist.widget-container',
  buildKey: () => 'civically-checklist',

  defaultState() {
    return {
      items: [],
      loading: true
    };
  },

  getItems() {
    const username = this.currentUser.username;
    ajax(`/checklist/${username}`).then((items) => {
      this.state.items = items;
      this.state.loading = false;
      this.scheduleRerender();
    });
  },

  html(attrs, state) {
    let contents = [
      h('div.widget-title', I18n.t('civically_checklist.title'))
    ];

    if (state.loading) {
      this.getItems();
      contents.push(h('div.spinner.small'));
    } else {
      let next = false;
      contents.push(h('ul', state.items.map((item) => {
        let itemAttrs = { item };
        if (!item.checked && next === false) {
          next = true;
          itemAttrs['next'] = next;
        }
        return this.attach('checklist-item', itemAttrs);
      })));
    }

    return contents;
  }
});
