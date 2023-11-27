package academic.kme.controller.Graphics.Primitive;

import javafx.scene.shape.Rectangle;

public abstract class Primitive {
    public abstract Rectangle getBoundingBox();
    public final Rectangle intersection(Primitive primitive) {
        Rectangle a = getBoundingBox();
        Rectangle b = primitive.getBoundingBox();

        double x = Math.max(a.getX(), b.getX());
        double y = Math.max(a.getY(), b.getY());

        double width = Math.min(a.getX() + a.getWidth(), b.getX() + b.getWidth()) - x;
        double height = Math.min(a.getY() + a.getHeight(), b.getY() + b.getHeight()) - y;

        return (width > 0 && height > 0) ? new Rectangle(x, y, width, height) : null;
    }

    public final Rectangle union(Primitive primitive) {
        Rectangle a = getBoundingBox();
        Rectangle b = primitive.getBoundingBox();
        double x = Math.min(a.getX(), b.getX());
        double y = Math.min(a.getY(), b.getY());

        double maxWidth = Math.max(a.getX() + a.getWidth(), b.getX() + b.getWidth()) - x;
        double maxHeight = Math.max(a.getY() + a.getHeight(), b.getY() + b.getHeight()) - y;

        return new Rectangle(x, y, maxWidth, maxHeight);
    }
}
