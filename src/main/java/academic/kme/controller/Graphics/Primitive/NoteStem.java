package academic.kme.controller.Graphics.Primitive;

import javafx.scene.shape.Rectangle;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NoteStem extends Primitive {
    private double x;
    private double y;
    private double width;
    private double height;
    private boolean flipped;
    private NoteFlag noteFlag;
    private List<NoteHead> noteHeads;

    @Override
    public Rectangle getBoundingBox() {
        return null;
    }
}
