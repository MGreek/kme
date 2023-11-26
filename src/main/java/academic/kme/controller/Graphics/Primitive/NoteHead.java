package academic.kme.controller.Graphics.Primitive;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Optional;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NoteHead {
    private double x;
    private double y;
    private double width;
    private boolean filled;
    private int dotCount;
    private NoteStem noteStem;
}
