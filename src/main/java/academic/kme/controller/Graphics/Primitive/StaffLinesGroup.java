package academic.kme.controller.Graphics.Primitive;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StaffLinesGroup {
    private double x;
    private double y;
    private double lineHeight;
    private double spaceHeight;
    private double offset;

    private BracketType bracketType;
    private List<StaffLines> staffLines;
}
