import React, { Component } from 'react';

export class EffectList extends Component {
  handleClick(item) {
    this.props.onItemClick(item);
  }

  render() {
    let activeId = this.props.selectedItem && this.props.selectedItem.id;
    const items = this.props.items.map((item, i) => {
      return (
        <li key={item.id} className={item.id == activeId ? 'active' : ''} onClick={() => this.handleClick(item)}>
          <div className="number">{item.id}</div>
          <div className="title">{item.title}</div>
        </li>
      );
    });
    return (
      <ul className="EffectList">
        {items}
      </ul>
    );
  }
};
