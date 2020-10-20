class Particle {
    constructor(direction, speed, alpha, radius) {
        this.direction = direction;
        this.speed = speed;
        this.alpha = alpha;
        this.radius = radius;

        Object.seal(this);
    }
}