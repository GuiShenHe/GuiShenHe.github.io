export const clamp = (v, min, max) => {
  return Math.min(max, Math.max(min, v));
};

const tColumnToRow = (size, { midHeight, maxHeight }) => {
  return (
    1.0 - clamp((size.height - midHeight) / (maxHeight - midHeight), 0.0, 1.0)
  );
};
const tCollapsed = (size, { midHeight, minHeight }) => {
  return (
    1.0 - clamp((size.height - minHeight) / (midHeight - minHeight), 0.0, 1.0)
  );
};
export const selectedIndexDelta = (index, selectedIndex) => {
  return clamp(Math.abs(index - selectedIndex), 0, 1);
};
export const getOffset = (dx, dy) => ({ dx, dy });
export const lerpDouble = (a, b, t) => {
  if (a === null && b === null) {
    return null;
  }
  if (a === null) {
    a = 0.0;
  }
  if (b === null) {
    b = 0.0;
  }
  return a + (b - a) * t;
};
export class Rect {
  constructor(value = [0, 0, 0, 0]) {
    this._value = value;

    this.left = this._value[0];
    this.top = this._value[1];
    this.right = this._value[2];
    this.bottom = this._value[3];

    this.height = this._value[3] - this._value[1];
    this.width = this._value[2] - this._value[0];
    // this.size = { width: this.width, height: this.height };
  }
  get size() {
    return {
      width: this.width,
      height: this.height,
    };
  }
  get centerLeft() {
    return {
      dx: this.left,
      dy: this.top + this.height / 2.0,
    };
  }
  get centerRight() {
    return getOffset(this.right, this.top + this.height / 2.0);
  }
  get center() {
    return getOffset(
      this.left + this.width / 2.0,
      this.top + this.height / 2.0,
    );
  }
  get topLeft() {
    return getOffset(this.left, this.top);
  }
  get topRight() {
    return getOffset(this.right, this.top);
  }
  get bottomRight() {
    return getOffset(this.right, this.bottom);
  }
  get bottomCenter() {
    return getOffset(this.left + this.width / 2.0, this.bottom);
  }
  get props() {
    return {
      top: this.top,
      right: this.right,
      left: this.left,
      bottom: this.bottom,
      width: this.width,
      height: this.height,
    };
  }
  fromLTRB(left, top, right, bottom) {
    return new Rect([left, top, right, bottom]);
  }
  fromLTWH(left, top, width, height) {
    return new Rect([left, top, left + width, top + height]);
  }
  fromPoints(a, b) {
    return new Rect([
      Math.min(a.dx, b.dx),
      Math.min(a.dy, b.dy),
      Math.max(a.dx, b.dx),
      Math.max(a.dy, b.dy),
    ]);
  }
  shift(offset) {
    return this.fromLTRB(
      this.left + offset.dx,
      this.top + offset.dy,
      this.right + offset.dx,
      this.bottom + offset.dy,
    );
  }
  translate(translateX, translateY) {
    return this.fromLTRB(
      this.left + translateX,
      this.top + translateY,
      this.right + translateX,
      this.bottom + translateY,
    );
  }
  lerp(a, b, t) {
    if (a === null && b === null) {
      return null;
    }
    if (a === null) {
      return this.fromLTRB(b.left * t, b.top * t, b.right * t, b.bottom * t);
    }
    if (b === null) {
      let k = 1.0 - t;
      return this.fromLTRB(a.left * k, a.top * k, a.right * k, a.bottom * k);
    }

    return this.fromLTRB(
      lerpDouble(a.left, b.left, t),
      lerpDouble(a.top, b.top, t),
      lerpDouble(a.right, b.right, t),
      lerpDouble(a.bottom, b.bottom, t),
    );
  }
  // set shape(values) {
  //   this._value = values;
  // }
  // get left() {
  //   return this._value[0];
  // }
  // get top() {
  //   return this._value[1];
  // }
  // get right() {
  //   return this._value[2];
  // }
  // get bottom () {
  //   return this._value[3];
  // }
  // get height() {
  //   return this.bottom - this.top;
  // }
  // get width() {
  //   return this.right - this.left;
  // }
  get centerLeft() {
    return getOffset(this.left, this.top + this.height / 2.0);
  }
}
// const setupLTWH = (left, top, width, height) => {
//   return [left, top, left + width, top + height];
// }
// function Rect(value = [0,0,0,0]) {
//   this._value = value;
//   this.left = this._value[0];
//   this.top = this._value[1];
//   this.right = this._value[2];
//   this.bottom = this._value[3];

//   this.height = this._value[3] - this._value[1];
//   this.width = this._value[2] - this._value[0];

//   this.centerLeft = getOffset(this.left, this.top + this.height / 2.0);
//   this.centerRight = getOffset(this.right, this.top + this.height / 2.0);
//   this.center = getOffset(this.left + this.width / 2.0, this.top + this.height / 2.0);
//   this.topLeft = getOffset(this.left, this.top);
//   this.topRight = getOffset(this.right, this.top);
// };
// Rect.prototype.init = function() {
// };
// Rect.prototype.fromLTRB = function(left, top, right, bottom) {
//   return new Rect([left, top, right, bottom])
// };
// Rect.prototype.fromLTWH = function(left, top, width, height) {
//   return new Rect([left, top, left + width, top + height]);
// };
// Rect.prototype.shift = function(offset) {
//   return new Rect([this.left + offset.dx, this.top + offset.dy, this.top + offset.dy, this.right + offset.dx, this.bottom + offset.dy])
// };
// Rect.prototype.lerp = function(a,b,t) {
//   if (a === null && b === null) {
//     return null;
//   }
//   if (a === null) {
//     return new Rect([b.left * t, b.top * t, b.right * t, b.bottom * t]);
//   }
//   if (b === null) {
//     let k = 1.0 - t;
//     return new Rect([a.left * k, a.top * k, a.right * k, a.bottom * k]);
//   }

//   return new Rect([
//     lerpDouble(a.left, b.left, t),
//     lerpDouble(a.top, b.top, t),
//     lerpDouble(a.right, b.right, t),
//     lerpDouble(a.bottom, b.bottom, t)
//   ]);
// };
// const BoxConstraints = (minWidth = 0, maxWidth, minHeight = 0, maxHeight) => {
//   return {
//     minWidth,
//     maxWidth,
//     minHeight,
//     maxHeight,
//   }
// };

// translation = Alignment((selectedIndex.value - sectionIndex) * 2.0 - 1.0, -1.0);
export function Alignment(x, y) {
  this.x = x;
  this.y = y;
  this.alongSize = (other) => {
    const centerX = other.width / 2.0;
    const centerY = other.height / 2.0;
    return getOffset(centerX + this.x * centerX, centerY + this.y * centerY);
  };
}

export const offsetLerp = (a, b, t) => {
  if (a === null && b === null) {
    return null;
  }
  if (a === null) {
    return b * t;
  }
  if (b === null) {
    return a * (1.0 - t);
  }

  return getOffset(lerpDouble(a.dx, b.dx, t), lerpDouble(a.dy, b.dy, t));
};

export const alongSize = (other, rect) => {
  let centerX = other.width / 2;
  let centerY = other.height / 2;
  return {
    dx: centerX + rect.dx * centerX,
    dy: centerY + rect.dy * centerY,
  };
};

// export const createBallisticsSimulation = (position, velocity) => {
//   if (Math.abs(velocity) >= toler)
// }
