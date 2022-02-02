import React, { useEffect, useState, useRef } from "react";
import {
  Rect as RectClass,
  alongSize,
  offsetLerp,
  getOffset,
  selectedIndexDelta,
} from "../../utils/utils";
import "./SectionCard.css";

const Rect = new RectClass();

const kSectionIndicatorWidth = 32;

export default function SectionCard(props) {
  const [section, setSection] = useState({
    card: {
      width: 0,
      height: 0,
      dx: 0,
      dy: 0,
    },
    title: {
      dx: 0,
      dy: 0,
      scale: 1,
      opacity: 1,
    },
    indicator: {
      dx: 0,
      dy: 0,
      opacity: 1,
    },
  });

  const titleRef = useRef();
  const indicatorRef = useRef();

  const performLayout = () => {
    const { size, tCollapsed, tColumnToRow, index, selectedIndex, cardCount } =
      props;

    // Calculate dimensions and position of card based on the dimensions of header
    const columnCardX = size.width / 5.0;
    const columnCardWidth = size.width - columnCardX;
    const columnCardHeight = size.height / cardCount;
    const rowCardWidth = size.width;
    const alignment = { dx: selectedIndex * 2.0 - 1.0, dy: -1.0 };
    const offset = alongSize(size, alignment);

    const columnCardY = index * columnCardHeight;
    const rowCardX = -(selectedIndex * rowCardWidth) + index * rowCardWidth;

    // When tCollapsed > 0 spread titles based on their index
    const columnTitleX = size.width / 10;
    const rowTitleWidth = size.width * ((1 + tCollapsed) / 2.25);
    const rowTitleX =
      (size.width - rowTitleWidth) / 2 -
      selectedIndex * rowTitleWidth +
      index * rowTitleWidth;

    // When tCollapsed > 0 move indicators closer
    const paddedSectionIndicatorWidth = kSectionIndicatorWidth + 8;
    const rowIndicatorWidth =
      paddedSectionIndicatorWidth +
      (1.0 - tCollapsed) * (rowTitleWidth - paddedSectionIndicatorWidth);
    // Position indicators based on header width
    const rowIndicatorX =
      (size.width - rowIndicatorWidth) / 2 -
      selectedIndex * rowIndicatorWidth +
      rowIndicatorWidth * index;

    // Create a rectangles based on the card's left & top edges and its height & width
    const columnCardRect = Rect.fromLTWH(
      columnCardX,
      columnCardY,
      columnCardWidth,
      columnCardHeight,
    );
    const rowCardRect = Rect.fromLTWH(rowCardX, 0, rowCardWidth, size.height);
    // Linearly interpolate the card's row and column forms
    const cardRect = Rect.lerp(columnCardRect, rowCardRect, tColumnToRow).shift(
      offset,
    );

    // Linearly interpolate the title and indicator's row and column form
    const titleSize = titleRef.current.getBoundingClientRect();
    const columnTitleY = columnCardRect.centerLeft.dy - titleSize.height / 2;
    const rowTitleY = rowCardRect.centerLeft.dy - titleSize.height / 2;
    const centeredRowTitleX = rowTitleX + (rowTitleWidth - titleSize.width) / 2;
    const columnTitleOrigin = getOffset(columnTitleX, columnTitleY);
    const rowTitleOrigin = getOffset(centeredRowTitleX, rowTitleY);
    const titleOrigin = offsetLerp(
      columnTitleOrigin,
      rowTitleOrigin,
      tColumnToRow,
    );
    const indicatorSize = indicatorRef.current.getBoundingClientRect();
    const columnIndicatorX = cardRect.centerRight.dx - indicatorSize.width - 16;
    const columnIndicatorY =
      cardRect.bottomRight.dy - indicatorSize.height - 16;
    const columnIndicatorOrigin = getOffset(columnIndicatorX, columnIndicatorY);
    const columnTitleRect = Rect.fromLTWH(
      columnTitleX,
      columnTitleY,
      titleSize.width,
      titleSize.height,
    );
    const rowTitleRect = Rect.fromLTWH(
      rowTitleX,
      rowTitleY,
      titleSize.width,
      titleSize.height,
    );
    const titleRect = Rect.lerp(columnTitleRect, rowTitleRect, tColumnToRow);
    const centeredRowIndicatorX =
      rowIndicatorX + (rowIndicatorWidth - indicatorSize.width) / 2;
    const rowIndicatorY = titleRect.bottomCenter.dy + 16;
    const rowIndicatorOrigin = getOffset(
      centeredRowIndicatorX + offset.dx,
      rowIndicatorY + offset.dy,
    );
    const indicatorOrigin = offsetLerp(
      columnIndicatorOrigin,
      rowIndicatorOrigin,
      tColumnToRow,
    );

    setSection({
      card: {
        width: cardRect.width,
        height: cardRect.height,
        dx: cardRect.left,
        dy: cardRect.top,
      },
      title: {
        dx: titleOrigin.dx + offset.dx,
        dy: titleOrigin.dy + offset.dy,
        // scale:
        //   1.0 - selectedIndexDelta(index, selectedIndex) * tColumnToRow * 0.15,
        opacity:
          1.0 - selectedIndexDelta(index, selectedIndex) * tColumnToRow * 0.5,
      },
      indicator: {
        dx: indicatorOrigin.dx,
        dy: indicatorOrigin.dy,
        opacity: 1.0 - selectedIndexDelta(index, selectedIndex) * 0.5,
      },
    });
  };

  const {
    tColumnToRow,
    cardCount,
    selectedIndex,
    size: { height },
  } = props;

  // Trigger updates when certain props change
  useEffect(() => {
    performLayout();
  }, [tColumnToRow, cardCount, selectedIndex, height]);
  return (
    <>
      <div
        className="section-card"
        style={{
          width: `${section.card.width}px`,
          height: `${section.card.height}px`,
          transform: `translate3d(${section.card.dx}px, ${section.card.dy}px, 0)`,
          background: `linear-gradient(90deg,${props.leftColor}, ${props.rightColor}), url(/${props.backgroundAsset}) center/cover no-repeat`,
        }}
        onClick={props.onClick}
      >
        <div
          className="section-card__container"
          style={{
            background: `linear-gradient(90deg,${props.leftColor}, ${props.rightColor})`,
          }}
        />
      </div>
      <div
        className="section-card__title"
        ref={titleRef}
        style={{
          transform: `translate3d(${section.title.dx}px, ${section.title.dy}px, 0)`,
          opacity: `${section.title.opacity}`,
        }}
      >
        {props.title}
      </div>
      <div
        className="section-card__indicator"
        ref={indicatorRef}
        style={{
          opacity: `${section.indicator.opacity}`,
          transform: `translate3d(${section.indicator.dx}px,${section.indicator.dy}px,0px)`,
        }}
      />
    </>
  );
}
