import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd-old';
import ItemTypes from './ItemTypes';

const style = {
  border: '1px dashed gray',
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  backgroundColor: 'white',
  cursor: 'pointer',
};

const cardSource = {
  beginDrag(props) {
    return {
      itemType: ItemTypes.CARD,
      id: props.id,
      index: props.index,
    };
  },
};

const cardTarget = {
  drop(props, monitor, component) {
    if (!component) {
      return;
    }

    const item = monitor.getItem();
    const hoverIndex = props.index;
    const dragIndex = item.index;

    if ((props.data && props.data.isContainer) || item.itemType === ItemTypes.CARD) {
      return;
    }
    if (item.data && typeof item.setAsChild === 'function') {
      if (dragIndex === -1) {
        props.insertCard(item, hoverIndex, item.id);
      }
    }
  },
  hover(props, monitor, component) {
    const item = monitor.getItem();

    if (item.itemType === ItemTypes.BOX && item.index === -1) return;

    if (props.data?.isContainer && !item.data?.isContainer) return;

    const dragIndex = item.index;
    const hoverIndex = props.index;

    if (dragIndex === hoverIndex) {
      return;
    }

    if (dragIndex === -1) {
      if (props.data && props.data.isContainer) {
        return;
      }
      item.index = hoverIndex;
      props.insertCard(item.onCreate(item.data), hoverIndex);
    }

    const hoverBoundingRect = component.ref.current.getBoundingClientRect();
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
    const clientOffset = monitor.getClientOffset();
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    props.moveCard(dragIndex, hoverIndex);
    item.index = hoverIndex;
  },
};

export default function (ComposedComponent) {
  class Card extends Component {
    constructor(props) {
      super(props);
      this.ref = createRef();
    }

    static propTypes = {
      connectDragSource: PropTypes.func,
      connectDragPreview: PropTypes.func,
      connectDropTarget: PropTypes.func,
      index: PropTypes.number.isRequired,
      isDragging: PropTypes.bool,
      id: PropTypes.any.isRequired,
      moveCard: PropTypes.func.isRequired,
      seq: PropTypes.number,
    }

    static defaultProps = {
      seq: -1,
    };

    render() {
      const {
        isDragging,
        connectDragPreview,
        connectDropTarget,
      } = this.props;
      const opacity = isDragging ? 0 : 1;

      return connectDragPreview(
        connectDropTarget(
          <div ref={this.ref}>
            <ComposedComponent {...this.props} style={{ ...style, opacity }} />
          </div>
        )
      );
    }
  }

  const dropTarget = DropTarget([ItemTypes.CARD, ItemTypes.BOX], cardTarget, connect => ({
    connectDropTarget: connect.dropTarget(),
  }))(Card);

  return DragSource(ItemTypes.CARD, cardSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
  }))(dropTarget);
}
