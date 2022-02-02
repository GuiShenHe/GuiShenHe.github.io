import React, { useEffect, useRef, useState } from "react";
import { animate, snap } from "popmotion";
import { clamp } from "../../utils/utils";
import SectionCard from "../SectionCard/SectionCard";
import "./Gallery.css";

const kMaxFlingVelocity = 8000;
const kTouchSlop = 18.0;
const DEFAULT_SPRING = {
  mass: 0.5,
  stiffness: 500.0,
  ratio: 1.1,
};

const getDirection = (x, y, dx, dy) => {
  if (Math.abs(x) > Math.abs(y)) {
    if (dx > 0) {
      return "RIGHT";
    }
    return "LEFT";
  } else if (dy > 0) {
    return "DOWN";
  }
  return "UP";
};

const springWithDampingRatio = (mass, stiffness, ratio = 1.0) => {
  return {
    mass,
    stiffness,
    damping: ratio * 2.0 * Math.sqrt(mass * stiffness),
    type: "spring",
  };
};

const defaultSpring = {
  ...springWithDampingRatio(
    DEFAULT_SPRING.mass,
    DEFAULT_SPRING.stiffness,
    DEFAULT_SPRING.ratio,
  ),
};
const kMinFlingVelocity = 50;

export default function Gallery(props) {
  const cardCount = props.sections?.length || 0;
  const midScrollOffset = props.maxHeight - props.midHeight;
  const stickyRef = useRef();
  const headerRef = useRef();
  const backgroundRef = useRef();
  const stickyContainerRef = useRef();
  const rearLayerRef = useRef();
  const frontLayerRef = useRef();
  let threshold = (1 / (0.05 * window.devicePixelRatio)) * 2;
  const [currentView, setCurrentView] = useState("max");
  const [gallery, setGallery] = useState({
    tCollapsed: 0,
    tColumnToRow: 0,
    headerHeight: 0,
    translateX: 0,
    selectedIndex: 0,
    startIndex: 0,
    currentView: "max",
    centerX: 0,
    size: {
      width: 0,
      height: 0,
    },
  });
  const [page, setPage] = useState({
    isPressed: false,
    pageX: 0,
    pageY: 0,
    velocity: 0,
  });
  const snapTo = snap([props.minHeight, props.midHeight, props.maxHeight]);

  const performLayout = (height, selectedIndex = 0) => {
    const { minHeight, midHeight, maxHeight } = props;
    let nextHeight = clamp(height, minHeight, maxHeight);
    const tColumnToRow =
      1.0 - clamp((nextHeight - midHeight) / (maxHeight - midHeight), 0.0, 1.0);
    const tCollapsed =
      1.0 - clamp((nextHeight - minHeight) / (midHeight - minHeight), 0.0, 1.0);

    setGallery({
      ...gallery,
      tCollapsed,
      tColumnToRow,
      headerHeight: nextHeight,
      translateX: selectedIndex * stickyContainerRef.current.offsetWidth,
      selectedIndex,
      size: {
        width: stickyContainerRef.current.offsetWidth,
        height: nextHeight,
      },
    });
  };

  const handleMouseDown = (evt) => {
    // evt.persist();
    const { pageX, pageY, timeStamp } = evt;
    setPage({
      ...page,
      isPressed: true,
      pageX,
      pageY,

      timeStamp,
    });
    setGallery({
      ...gallery,
      startIndex: gallery.selectedIndex,
    });
  };
  const handleMouseUp = ({ pageX, pageY, timeStamp }) => {
    if (!page.isPressed) return;
    const { startIndex, selectedIndex, headerHeight } = gallery;
    let centerX = stickyContainerRef.current.offsetWidth / 2;

    let sIndex = startIndex;
    const dt = timeStamp - page.timeStamp;
    const dx = pageX - page.pageX;
    const dy = pageY - page.pageY;
    let velocityX = Math.round(dx / dt);
    let velocityY = Math.round(dy / dt);
    setPage({
      ...page,
      isPressed: false,
    });
    if (dx === 0 && dy === 0) return;

    if (Math.abs(dx) >= centerX && currentView !== "max") {
      if (dx < 0) {
        sIndex = Math.ceil(selectedIndex);
      } else {
        sIndex = Math.floor(selectedIndex);
      }
    } else if (Math.abs(velocityX) >= threshold) {
      if (velocityX > 0) {
        sIndex = Math.floor(selectedIndex);
      } else {
        sIndex = Math.ceil(selectedIndex);
      }
    }
    // }
    sIndex = clamp(sIndex, 0, cardCount - 1);

    if (Math.abs(velocityX) > Math.abs(velocityY)) {
      animate({
        from: selectedIndex,
        to: Math.round(sIndex),
        onUpdate: (latest) => performLayout(snapTo(headerHeight), latest),
      });
    } else if (Math.abs(velocityX) <= Math.abs(velocityY)) {
      let view = currentView;
      let h = headerHeight;
      // dy > 0 draging down
      if (dy > 0) {
        if (currentView === "max") {
          h = props.midHeight;
          view = "mid";
        } else if (currentView === "mid") {
          h = props.minHeight;
          view = "min";
        }
      } else {
        if (currentView === "mid") {
          h = props.maxHeight;
          view = "max";
        } else if (currentView === "min") {
          h = props.midHeight;
          view = "mid";
        }
      }
      setCurrentView(view);
      animate({
        from: snapTo(headerHeight),
        to: h,
        onUpdate: (latest) => performLayout(latest, Math.round(selectedIndex)),
        ...defaultSpring,
      });
      // }
    }

    // }
  };
  const handleMouseMove = (evt) => {
    const { pageX, pageY, movementX, movementY } = evt;

    if (page.isPressed) {
      setPage({
        ...page,
        screenX: evt.screenX,
        screenY: evt.screenY,
        timeStamp: evt.timeStamp,
      });
      let pageDeltaY = page.pageY - pageY;
      let pageDeltaX = page.pageX - pageX;
      let progress = pageDeltaX / stickyContainerRef.current.offsetWidth;

      if (Math.abs(movementX) > Math.abs(movementY)) {
        performLayout(gallery.headerHeight, gallery.startIndex + progress);
      } else if (Math.abs(movementY) > Math.abs(movementX)) {
        performLayout(gallery.headerHeight + pageDeltaY, gallery.selectedIndex);
      }
    }
  };
  const handleCardSelect = (index) => {
    setGallery({
      ...gallery,
      selectedIndex: index,
    });
  };

  useEffect(() => {
    performLayout(
      stickyContainerRef.current.offsetWidth,
      gallery.selectedIndex,
    );
  }, []);

  return (
    <div
      className="gallery"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <div className="gallery__header" ref={headerRef}>
        <div className="gallery__header__background" ref={backgroundRef}>
          <div className="gallery__header__rear-layer" ref={rearLayerRef} />
          <div className="gallery__header__front-layer" ref={frontLayerRef} />
        </div>
        <div
          className="gallery__header__content-container"
          ref={stickyContainerRef}
        >
          <div
            className="gallery__sticky"
            ref={stickyRef}
            style={{
              height: `${gallery.headerHeight}px`,
              transform: `translate3d(-${gallery.translateX}px, 0, 0)`,
            }}
          >
            {props.sections?.map((section, i) => (
              <SectionCard
                key={section.title}
                index={i}
                backgroundAsset={section.backgroundAsset}
                leftColor={section.leftColor}
                rightColor={section.rightColor}
                cardCount={cardCount}
                selectedIndex={gallery.selectedIndex}
                title={section.title}
                {...gallery}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
