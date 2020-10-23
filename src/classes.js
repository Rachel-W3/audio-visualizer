class Particle {
    constructor(x = 0, y = 0, radius = 3, direction = { x: -1, y: 0 }, speed = 0.1, alpha = 0.5) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.direction = direction;
        this.speed = speed;
        this.alpha = alpha;

        this.isActive = true; // will be used for filtering out the particles that are no longer visible
        Object.seal(this);
    }

    moveForward(percent) {
        // Default speed will be used if no audio is playing, i.e.: percent is 0
        if(percent == 0) {
            percent = 1;
        }
        this.x += this.direction.x * this.speed * percent;
        this.y += this.direction.y * this.speed * percent;
    }

    draw(ctx, percent) {
        ctx.save();
        ctx.fillStyle = `rgba(253, 254, ${255*percent}, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.shadowBlur = this.radius;
        ctx.shadowColor = `rgb(253, 254, ${255*percent})`;
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

export { Particle };