package academic.kme.controller.Graphics.Primitive;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Accidental {
    private double x;
    private int offset;

    private AccidentalType type;
}
