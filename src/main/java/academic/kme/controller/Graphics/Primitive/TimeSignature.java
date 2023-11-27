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
public class TimeSignature extends Primitive {
    private double x;
    private double y;
    private int count;
    private byte length;

    @Override
    public Rectangle getBoundingBox() {
        return null;
    }
}
