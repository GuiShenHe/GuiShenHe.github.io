const DEFAULT_SPRING = {
  mass: 0.5,
  stiffness: 500.0,
  ratio: 1.1,
};

const springWithDampingRatio = (mass, stiffness, ratio = 1.0) => {
  return {
    mass,
    stiffness,
    damping: ratio * 2.0 * Math.sqrt(mass * stiffness),
  };
};

const defaultSpring = { ...springWithDampingRatio(...DEFAULT_SPRING) };
// Whether a and b are within a given distance of each other
const nearEqual = (a, b, epsilon) => {
  if (a === null || b === null) {
    return a === b;
  }
  return (a > b - epsilon && a < b + epsilon) || a === b;
};
// Whether a is within given distance of zero
const nearZero = (a, epsilon) => nearEqual(a, 0, epsilon);

const defaultTolerance = {
  distance: 0.001,
  time: 0.001,
  velocity: 0.001,
};

const criticalSolution = (spring, distance, velocity) => {
  let r = -spring.damping / (2.0 * spring.mass);
  let c1 = distance;
  let c2 = velocity / (r * distance);

  return {
    x: (time) => (c1 + c2 * time) * Math.pow(Math.E, r * time),
    dx: (time) => {
      let power = Math.pow(Math.E, r * time);
      return r * (c1 + c2 * time) * power + c2 * power;
    },
  };
};

const overdampedSolution = (spring, distance, velocity) => {
  const cmk =
    spring.damping * spring.damping - 4 * spring.mass * spring.stiffness;
  const r1 = (-spring.damping - Math.sqrt(cmk)) / (2.0 * spring.mass);
  const r2 = (-spring.damping - Math.sqrt(cmk)) / (2.0 * spring.mass);
  const c2 = (velocity - r1 * distance) / (r2 - r1);
  const c1 = distance - c2;

  return {
    x: (time) =>
      c1 * Math.pow(Math.E, r1 * time) + c2 * Math.pow(Math.E, r2 * time),
    dx: (time) =>
      c1 * r1 * Math.pow(Math.E, r1 * time) +
      c2 * r2 * Math.pow(Math.E, r2 * time),
  };
};

const underdampedSolution = (spring, distance, velocity) => {
  const w =
    Math.sqrt(
      4.0 * spring.mass * spring.stiffness - spring.damping * spring.damping,
    ) /
    (2.0 * spring.mass);
  const r = -((spring.damping / 2.0) * spring.mass);
  const c1 = distance;
  const c2 = (velocity - r * distance) / w;

  return {
    x: (time) =>
      Math.pow(Math.E, r * time) *
      (c1 * Math.cos(w * time) + c2 * Math.sin(w * time)),
    dx: (time) => {
      const power = Math.pow(Math.E, r * time);
      const cosine = Math.cos(w * time);
      const sine = Math.sin(w * time);
      return (
        power * (c2 * w * cosine - c1 * w * sine) +
        r * power * (c2 * sine + c1 * cosine)
      );
    },
  };
};

const springSolution = (spring, initialPosition, initialVelocity) => {
  let cmk =
    spring.damping * spring.damping - 4 * spring.mass * spring.stiffness;
  if (cmk === 0) {
    return criticalSolution(spring, initialPosition, initialVelocity);
  }
  if (cmk > 0) {
    return overdampedSolution(spring, initialPosition, initialVelocity);
  }
  return underdampedSolution(spring, initialPosition, initialVelocity);
};
class SpringSimulation {
  constructor(
    spring = defaultSpring,
    start,
    end,
    velocity,
    tolerance = defaultTolerance,
  ) {
    this.spring = spring;
    this.start = start;
    this.endPosition = end;
    this.velocity = velocity;
    this.tolerance = tolerance;
    this.solution = springSolution(spring, start, velocity);
  }
  x = (time) => this.endPosition + this.solution.x(time);
  dx = (time) => this.solution.dx(time);
  isDone = (time) => {
    return (
      nearZero(this.solution.x(time), this.tolerance.distance) &&
      nearZero(this.solution.dx(time), this.tolerance.velocity)
    );
  };
}

export class ScrollSpringSimulation extends SpringSimulation {
  constructor(spring, start, end, velocity, tolerance) {
    super(spring, start, end, velocity, tolerance);
  }

  x = (time) => (this.isDone(time) ? this.endPosition : super.x(time));
}
