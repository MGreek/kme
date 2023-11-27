package academic.kme.controller.Graphics.Primitive;

import javafx.scene.shape.Rectangle;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StaffLines extends Primitive {
    private double x;
    private double y;
    private double lineHeight;
    private double spaceHeight;
    private double length;

    @Override
    public Rectangle getBoundingBox() {
        return null;
    }
}
